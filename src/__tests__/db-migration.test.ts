// @vitest-environment node
// Synthetic old-schema migration probe (kongming 261111 A4): a real pre-phase DB created WITHOUT
// client_id must gain the column + composite index on initDb, keep its rows at the legacy ''
// bucket, and be idempotent on a second initDb. (The repo's own perry_workbench.sqlite has WAL
// sidecars so it is NOT a deterministic probe — this synthetic DB is the primary gate.)
import Database from 'better-sqlite3';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closeDb, getConn, initDb } from '../db/client';

const OLD_SCHEMA = `
CREATE TABLE saved_calculations (
  id TEXT PRIMARY KEY,
  project_code TEXT NOT NULL DEFAULT '',
  equipment_tag TEXT NOT NULL DEFAULT '',
  workbench_type TEXT NOT NULL DEFAULT '',
  revision TEXT NOT NULL DEFAULT '',
  inputs_json TEXT NOT NULL DEFAULT '{}',
  outputs_json TEXT NOT NULL DEFAULT '{}',
  equations_json TEXT NOT NULL DEFAULT '[]',
  created_at INTEGER NOT NULL
)`;

let dir = '';
let dbPath = '';

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'che-mig-'));
  dbPath = path.join(dir, 'old.sqlite');
  const old = new Database(dbPath);
  old.exec(OLD_SCHEMA);
  old.prepare("INSERT INTO saved_calculations (id, created_at) VALUES ('legacy-1', 123)").run();
  old.close();
});

afterAll(() => {
  closeDb();
  fs.rmSync(dir, { recursive: true, force: true });
});

describe('saved_calculations client_id migration', () => {
  it('adds the column + composite index to an old DB and preserves legacy rows at bucket ""', () => {
    initDb(dbPath);
    const cols = getConn().prepare('PRAGMA table_info(saved_calculations)').all() as Array<{ name: string }>;
    expect(cols.map((c) => c.name)).toContain('client_id');
    const row = getConn().prepare("SELECT client_id FROM saved_calculations WHERE id = 'legacy-1'").get() as { client_id: string };
    expect(row.client_id).toBe('');
    const idx = getConn()
      .prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name = 'idx_saved_calcs_client_created'")
      .get();
    expect(idx).toBeTruthy();
  });

  it('is idempotent on a second initDb', () => {
    closeDb();
    expect(() => initDb(dbPath)).not.toThrow();
    const row = getConn().prepare("SELECT client_id FROM saved_calculations WHERE id = 'legacy-1'").get() as { client_id: string };
    expect(row.client_id).toBe('');
    const count = getConn().prepare('SELECT COUNT(*) AS n FROM saved_calculations').get() as { n: number };
    expect(count.n).toBe(1);
  });

  it('creates the column directly on a fresh DB (CREATE_SQL path)', () => {
    const fresh = path.join(dir, 'fresh.sqlite');
    initDb(fresh);
    const cols = getConn().prepare('PRAGMA table_info(saved_calculations)').all() as Array<{ name: string }>;
    expect(cols.map((c) => c.name)).toContain('client_id');
  });
});
