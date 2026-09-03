-- ============================================================
-- THE AEGIS INSTITUTE
-- DATABASE SCHEMA
-- ============================================================


-- ============================================================
-- PUBLIC WEBSITE CONTENT
-- ============================================================

CREATE TABLE IF NOT EXISTS portal_content (
  id TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);


-- ============================================================
-- STAFF LOGIN CODES
-- ============================================================

CREATE TABLE IF NOT EXISTS login_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  name TEXT NOT NULL,

  code_hash TEXT NOT NULL,

  permissions TEXT NOT NULL DEFAULT '[]',

  active INTEGER NOT NULL DEFAULT 1,

  expires_at TEXT,

  created_at TEXT NOT NULL,

  last_used_at TEXT
);


CREATE INDEX IF NOT EXISTS idx_login_codes_hash
ON login_codes(code_hash);


-- ============================================================
-- STAFF DOCUMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS staff_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  title TEXT NOT NULL,

  description TEXT NOT NULL DEFAULT '',

  content TEXT NOT NULL DEFAULT '',

  permission TEXT NOT NULL,

  created_at TEXT NOT NULL,

  updated_at TEXT NOT NULL
);


CREATE INDEX IF NOT EXISTS idx_documents_permission
ON staff_documents(permission);


-- ============================================================
-- OPTIONAL SAFETY INDEX
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_documents_updated
ON staff_documents(updated_at);
