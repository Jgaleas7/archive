DROP TABLE IF EXISTS user;
CREATE TABLE user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL,
    image TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

DROP TABLE IF EXISTS session;
CREATE TABLE session (
    id TEXT PRIMARY KEY,
    expiresAt INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id)
);

DROP TABLE IF EXISTS account;
CREATE TABLE account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user(id)
);

DROP TABLE IF EXISTS verification;
CREATE TABLE verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- And the FTS5 archive table
CREATE VIRTUAL TABLE IF NOT EXISTS archive USING fts5(
  slug,
  tape_time_code,
  date_aired,
  show,
  reported_by,
  source,
  time,
  time_aired,
  camera,
  edited_by,
  modified_date,
  modified_by,
  date_created,
  time_created,
  keywords,
  script_content,
  original_file_path,
  content="archive_data" -- if we use content table, but we used standard fts5 previously.
);
-- We'll just create the standard fts5 table without content table for simplicity, as we did in ingest.js
DROP TABLE IF EXISTS archive;
CREATE VIRTUAL TABLE IF NOT EXISTS archive USING fts5(
  slug, tape_time_code, date_aired, show, reported_by, source, time, time_aired, camera, edited_by, modified_date, modified_by, date_created, time_created, keywords, script_content, original_file_path
);
