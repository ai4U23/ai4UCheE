// SQLite client + idempotent bootstrap for ChemEng's Intelligent Workbench.
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

export type PerryDb = ReturnType<typeof drizzle<typeof schema>>;

let db: PerryDb | null = null;
let conn: Database.Database | null = null;
let currentDbPath: string | null = null;

const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS screen_states (
  id TEXT PRIMARY KEY,
  active_workbench TEXT NOT NULL DEFAULT 'wb1-visual-verifier',
  persona_mode TEXT NOT NULL DEFAULT 'plant',
  theme_mode TEXT NOT NULL DEFAULT 'paper',
  selected_chips_json TEXT NOT NULL DEFAULT '[]',
  payload_json TEXT NOT NULL DEFAULT '{}',
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS saved_calculations (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL DEFAULT '',
  project_code TEXT NOT NULL DEFAULT '',
  equipment_tag TEXT NOT NULL DEFAULT '',
  workbench_type TEXT NOT NULL DEFAULT '',
  revision TEXT NOT NULL DEFAULT 'Rev 0 — Issued for Review',
  inputs_json TEXT NOT NULL DEFAULT '{}',
  outputs_json TEXT NOT NULL DEFAULT '{}',
  equations_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS pdf_anchors (
  id TEXT PRIMARY KEY,
  section_num INTEGER NOT NULL,
  sec_page_code TEXT NOT NULL,
  pdf_page_number INTEGER NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  bbox_json TEXT NOT NULL DEFAULT '[]'
);
`;

/** Open (once per path) and initialize the SQLite backing store. */
export function initDb(dbPath = 'perry_workbench.sqlite'): PerryDb {
  if (db && currentDbPath === dbPath) return db;
  if (conn) conn.close();
  conn = new Database(dbPath);
  currentDbPath = dbPath;
  conn.pragma('journal_mode = WAL');
  conn.exec(CREATE_SQL);
  // phase-03 idempotent migration: old DBs lack client_id. The composite index is created
  // AFTER the ALTER only — an index inside CREATE_SQL would throw 'no such column' on old DBs
  // before the ALTER ever runs (kongming 261111).
  const cols = conn.prepare('PRAGMA table_info(saved_calculations)').all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === 'client_id')) {
    conn.exec("ALTER TABLE saved_calculations ADD COLUMN client_id TEXT NOT NULL DEFAULT ''");
  }
  conn.exec('CREATE INDEX IF NOT EXISTS idx_saved_calcs_client_created ON saved_calculations(client_id, created_at)');
  db = drizzle(conn, { schema });
  return db;
}

/** Raw connection for tests and maintenance. */
export function getConn(): Database.Database {
  if (!conn) initDb();
  return conn as Database.Database;
}

/** Close the shared connection (mainly for tests). */
export function closeDb(): void {
  if (conn) conn.close();
  conn = null;
  db = null;
  currentDbPath = null;
}
