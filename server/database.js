/* ═══════════════════════════════════════════════════════════════
   database.js — SQLite Connection & Schema Initialization
   Uses sql.js (pure JavaScript SQLite — no native compilation).
   The DB is persisted to disk on every write operation.
   ═══════════════════════════════════════════════════════════════ */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'cybersec_portal.db');

/** @type {import('sql.js').Database} */
let db = null;

/**
 * Initialize the database connection and create tables if they
 * don't already exist. Must be awaited before using the DB.
 * @returns {Promise<import('sql.js').Database>}
 */
async function initializeDatabase() {
  const SQL = await initSqlJs();

  // Load existing DB file if present, otherwise create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('[DB] Loaded existing database from', DB_PATH);
  } else {
    db = new SQL.Database();
    console.log('[DB] Created new database');
  }

  // ── Create `articles` table ──────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      content     TEXT    NOT NULL,
      category    TEXT    NOT NULL DEFAULT 'general',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ── Create `cheat_sheets` table ──────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS cheat_sheets (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           TEXT    NOT NULL,
      file_url        TEXT    NOT NULL,
      downloads_count INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Create indexes for frequently queried columns
  db.run(`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);`);

  // Persist the schema creation
  saveDatabase();

  console.log('[DB] Schema initialized successfully');
  return db;
}

/**
 * Persist the in-memory database to disk.
 * Call this after any write operation (INSERT, UPDATE, DELETE).
 */
function saveDatabase() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Get the current database instance.
 * @returns {import('sql.js').Database}
 */
function getDatabase() {
  if (!db) throw new Error('Database not initialized. Call initializeDatabase() first.');
  return db;
}

/**
 * Close the database connection.
 */
function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    console.log('[DB] Database connection closed');
  }
}

module.exports = { initializeDatabase, saveDatabase, getDatabase, closeDatabase };
