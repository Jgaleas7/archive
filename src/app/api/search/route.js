import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getAuth } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request) {
  // Use Cloudflare D1 database binding
  const db = getRequestContext().env.DB;

  const auth = getAuth(db);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  if (!q) {
    return NextResponse.json({ results: [], total: 0, page, totalPages: 0 });
  }

  try {
    // Sanitize query to prevent FTS syntax errors (strip special FTS characters if needed)
    const sanitizedQuery = q.replace(/["*()]/g, ' ').trim();
    if (!sanitizedQuery) {
      return NextResponse.json({ results: [], total: 0, page, totalPages: 0 });
    }

    const hasTape = searchParams.get('hasTape') === 'true';
    const year = searchParams.get('year');

    // Build the FTS query dynamically
    let ftsQuery = `"${sanitizedQuery}"*`;
    if (year) {
      ftsQuery += ` AND date_aired:${year}*`;
    }

    let whereClause = `archive MATCH ?`;
    if (hasTape) {
      whereClause += ` AND tape_time_code != '' AND tape_time_code != '/'`;
    }

    const countResult = await db.prepare(`
      SELECT count(*) as count FROM archive WHERE ${whereClause}
    `).bind(ftsQuery).first();
    const count = countResult.count || 0;

    const { results } = await db.prepare(`
      SELECT 
        *, 
        snippet(archive, -1, '<b>', '</b>', '...', 64) as snippet
      FROM archive 
      WHERE ${whereClause} 
      ORDER BY rank 
      LIMIT ? OFFSET ?
    `).bind(ftsQuery, limit, offset).all();

    return NextResponse.json({
      results,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 });
  }
}
