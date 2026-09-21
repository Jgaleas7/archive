'use client';

import { useState, useEffect, useCallback } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [hasTape, setHasTape] = useState(false);
  const [year, setYear] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // Reset to first page on new search
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [hasTape, year]);

  const fetchResults = useCallback(async () => {
    if (!debouncedQuery) {
      setResults([]);
      setTotal(0);
      setTotalPages(0);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: debouncedQuery,
        page: page.toString(),
      });
      if (hasTape) params.set('hasTape', 'true');
      if (year) params.set('year', year);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, page, hasTape, year]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (selectedRecord) {
    return (
      <div className="vbg-section">
        <button 
          className="vbg-button" 
          onClick={() => setSelectedRecord(null)}
          style={{ marginBottom: 'var(--vbg-space-6)' }}
        >
          ← Back to Results
        </button>
        <div className="vbg-opening">
          <h1 className="vbg-title">{selectedRecord.slug || 'Untitled Record'}</h1>
          <p className="vbg-lede">Tape No. / Time Code: <span className="vbg-mono">{selectedRecord.tape_time_code || 'None'}</span></p>
        </div>
        
        <div className="vbg-stack">
          <h2 className="vbg-heading-20">Metadata</h2>
          <div className="vbg-table-wrap">
            <table>
              <tbody>
                <tr><th scope="row" style={{ width: '200px' }}>Date Aired</th><td>{selectedRecord.date_aired || '-'}</td></tr>
                <tr><th scope="row">Time Aired</th><td>{selectedRecord.time_aired || '-'}</td></tr>
                <tr><th scope="row">Show</th><td>{selectedRecord.show || '-'}</td></tr>
                <tr><th scope="row">Reported By</th><td>{selectedRecord.reported_by || '-'}</td></tr>
                <tr><th scope="row">Edited By</th><td>{selectedRecord.edited_by || '-'}</td></tr>
                <tr><th scope="row">Camera</th><td>{selectedRecord.camera || '-'}</td></tr>
                <tr><th scope="row">Source</th><td>{selectedRecord.source || '-'}</td></tr>
                <tr><th scope="row">Time</th><td>{selectedRecord.time || '-'}</td></tr>
                <tr><th scope="row">Original File Path</th><td className="vbg-mono">{selectedRecord.original_file_path || '-'}</td></tr>
              </tbody>
            </table>
          </div>

          <h2 className="vbg-heading-20" style={{ marginTop: 'var(--vbg-space-8)' }}>Script Content</h2>
          <div className="vbg-band" data-tone="contrast" style={{ padding: 'var(--vbg-space-6)', borderRadius: 'var(--vbg-radius)' }}>
            <p className="vbg-body" style={{ whiteSpace: 'pre-wrap' }}>
              {selectedRecord.script_content || 'No script available.'}
            </p>
          </div>

          {selectedRecord.keywords && (
            <>
              <h2 className="vbg-heading-20" style={{ marginTop: 'var(--vbg-space-8)' }}>Keywords</h2>
              <p className="vbg-body">{selectedRecord.keywords}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="vbg-section">
      <div className="vbg-opening" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="vbg-title">Archive Search</h1>
          <p className="vbg-lede">Search over 30 years of newsroom tape records and scripts.</p>
        </div>
        <button 
          className="vbg-button" 
          onClick={() => authClient.signOut({ fetchOptions: { onSuccess: () => router.push('/login') } })}
        >
          Sign Out
        </button>
      </div>

      <div className="vbg-calculator">
        <div className="vbg-calculator-inputs">
          <div className="vbg-field">
            <label className="vbg-label" htmlFor="searchQuery">Search query</label>
            <input 
              id="searchQuery" 
              type="text" 
              placeholder="Enter slug, reporter, or keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="vbg-cluster" style={{ marginTop: 'var(--vbg-space-4)', gap: 'var(--vbg-space-6)' }}>
            <div className="vbg-field" style={{ display: 'flex', alignItems: 'center', gap: 'var(--vbg-space-2)' }}>
              <input 
                id="hasTape" 
                type="checkbox" 
                checked={hasTape}
                onChange={(e) => setHasTape(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <label className="vbg-label" htmlFor="hasTape" style={{ margin: 0 }}>Has Tape Number</label>
            </div>
            
            <div className="vbg-field" style={{ display: 'flex', alignItems: 'center', gap: 'var(--vbg-space-2)' }}>
              <label className="vbg-label" htmlFor="yearFilter" style={{ margin: 0 }}>Year:</label>
              <input 
                id="yearFilter"
                type="text" 
                placeholder="e.g. 1998"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{ width: '100px', padding: '0.2rem 0.5rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="vbg-section">
        {loading && <p className="vbg-meta">Searching archives...</p>}
        
        {!loading && debouncedQuery && results.length === 0 && (
          <p className="vbg-meta">No records found for "{debouncedQuery}".</p>
        )}

        {!loading && results.length > 0 && (
          <div className="vbg-stack">
            <p className="vbg-meta">Found {total.toLocaleString()} results</p>
            
            <div className="vbg-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Slug</th>
                    <th scope="col">Tape No. / Time Code</th>
                    <th scope="col">Date Aired</th>
                    <th scope="col">Show</th>
                    <th scope="col">Reported By</th>
                    <th scope="col">Snippet</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr 
                      key={i} 
                      onClick={() => setSelectedRecord(r)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{r.slug || '-'}</td>
                      <td>
                        <span className="vbg-mono" style={{ color: r.tape_time_code && r.tape_time_code !== '/' ? 'var(--vbg-color-success)' : 'inherit' }}>
                          {r.tape_time_code && r.tape_time_code !== '/' ? r.tape_time_code : '-'}
                        </span>
                      </td>
                      <td>{r.date_aired || '-'}</td>
                      <td>{r.show || '-'}</td>
                      <td>{r.reported_by || '-'}</td>
                      <td>
                         <span dangerouslySetInnerHTML={{ __html: r.snippet }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="vbg-cluster" style={{ marginTop: 'var(--vbg-space-8)' }}>
                <button 
                  className="vbg-button" 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <span className="vbg-meta">Page {page} of {totalPages}</span>
                <button 
                  className="vbg-button" 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
