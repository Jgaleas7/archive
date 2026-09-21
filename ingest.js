const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const Database = require('better-sqlite3');

const ARCHIVE_DIR = path.resolve(__dirname, '../from newsArchive');
const DB_PATH = path.resolve(__dirname, 'archive.db');

const db = new Database(DB_PATH);

db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS archive USING fts5(
    slug, source, time, date_aired, time_aired, camera,
    edited_by, reported_by, tape_time_code, modified_date, modified_by,
    show, date_created, time_created, script_content, keywords,
    original_file_path UNINDEXED
  );
`);

const insertStmt = db.prepare(`
  INSERT INTO archive (
    slug, source, time, date_aired, time_aired, camera,
    edited_by, reported_by, tape_time_code, modified_date, modified_by,
    show, date_created, time_created, script_content, keywords,
    original_file_path
  ) VALUES (
    @slug, @source, @time, @date_aired, @time_aired, @camera,
    @edited_by, @reported_by, @tape_time_code, @modified_date, @modified_by,
    @show, @date_created, @time_created, @script_content, @keywords,
    @original_file_path
  )
`);

function extractBetween(html, startTokens, endTokens) {
  let startIdx = -1;
  let endIdx = -1;
  
  for (const token of startTokens) {
    startIdx = html.indexOf(token);
    if (startIdx !== -1) {
      startIdx += token.length;
      break;
    }
  }
  
  if (startIdx === -1) return '';

  for (const token of endTokens) {
    endIdx = html.indexOf(token, startIdx);
    if (endIdx !== -1) break;
  }
  
  if (endIdx === -1) endIdx = html.length;
  
  const content = html.substring(startIdx, endIdx);
  return cheerio.load(content).text().replace(/\s+/g, ' ').trim();
}

function parseHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);
  
  const data = {
    slug: '', source: '', time: '', date_aired: '', time_aired: '', camera: '',
    edited_by: '', reported_by: '', tape_time_code: '', modified_date: '', modified_by: '',
    show: '', date_created: '', time_created: '', script_content: '', keywords: '',
    original_file_path: filePath
  };

  const fieldMapping = {
    'slug': 'slug',
    'source': 'source',
    'time': 'time',
    'date aired': 'date_aired',
    'time aired': 'time_aired',
    'camera': 'camera',
    'edited by': 'edited_by',
    'reported by': 'reported_by',
    'tape no./time code': 'tape_time_code',
    'modified date': 'modified_date',
    'modified by': 'modified_by',
    'show': 'show',
    'date created': 'date_created',
    'time created': 'time_created'
  };

  $('td').each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    if (fieldMapping[text]) {
      const nextTd = $(el).next('td');
      if (nextTd.length) {
        data[fieldMapping[text]] = nextTd.text().trim();
      }
    }
  });

  data.script_content = extractBetween(
    html, 
    ['<!-- Start Script -->', '<!-- START SCRIPT -->', 'SCRIPT'],
    ['<!-- End Script -->', '<!-- END SCRIPT -->', '<!-- START KEYWORD']
  );

  data.keywords = extractBetween(
    html,
    ['<!-- Start Keyword -->', '<!-- START KEYWORD -->', 'KEYWORDS'],
    ['<!-- End Keyword -->', '<!-- END KEYWORD -->', '<!-- START NOTES']
  );
  
  // Cleanup
  for (const key in data) {
    if (data[key] === '[NA]') data[key] = '';
  }

  return data;
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.html')) {
      try {
        const data = parseHtml(fullPath);
        insertStmt.run(data);
        filesProcessed++;
        if (filesProcessed % 1000 === 0) {
          console.log(`Processed ${filesProcessed} files...`);
        }
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err.message);
      }
    }
  }
}

let filesProcessed = 0;

console.log('Starting ingestion...');
db.exec('BEGIN TRANSACTION');
try {
  processDirectory(ARCHIVE_DIR);
  db.exec('COMMIT');
  console.log(`Ingestion complete! Total files processed: ${filesProcessed}`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('Ingestion failed:', err);
}
