// Private per-browser saves (phase-03): pseudonymous X-Client-Id buckets in saved_calculations.
// BUCKET LAW: the header must be a UUID; anything else (missing, garbage, oversized) → legacy ''
// bucket, which is exactly the pre-phase behavior (AWS/dev parity).
// PK LAW: stored ids are namespaced `${clientId}::${rec.id}` — INSERT OR REPLACE stays safe:
// a client-supplied id can only clobber rows inside its OWN bucket, never another browser's.
// The client_id is stamped from the HEADER only; any client_id in the POST body is stripped by zod.
// Also registers the Node-side calc-sheet persister (used by the /api/actions route — tests and
// future callers; the BROWSER hop is the POST below via generate-calc-sheet's default persister).
import { z } from 'zod';
import type { Express, Request, Response } from 'express';
import { getConn } from '../db/client';
import { setCalcSheetPersister, type SavedCalculationRecord } from '../actions/generate-calc-sheet';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Sanitize the X-Client-Id header to a UUID bucket ('' = legacy). */
export function clientBucket(headerValue: unknown): string {
  const v = String(headerValue ?? '').trim();
  return UUID_RE.test(v) ? v : '';
}

function namespacedId(bucket: string, id: string): string {
  return bucket ? `${bucket}::${id}` : id;
}

/** Body-size caps: a client-writable INSERT is a new surface (express.json allows 10mb). */
const SaveCalculationSchema = z.object({
  id: z.string().min(1).max(80),
  projectCode: z.string().max(120),
  equipmentTag: z.string().max(120),
  workbenchType: z.string().max(80),
  revision: z.string().max(120),
  inputsJson: z.string().max(200_000),
  outputsJson: z.string().max(200_000),
  equationsJson: z.string().max(400_000),
  createdAt: z.number().int().nonnegative(),
});

/** Request-scoped bucket for the /api/actions persister path (cleared after each action). */
let currentActionClientId = '';

function insertRecord(rec: SavedCalculationRecord, bucket: string): void {
  getConn()
    .prepare(
      `INSERT OR REPLACE INTO saved_calculations
       (id, client_id, project_code, equipment_tag, workbench_type, revision, inputs_json, outputs_json, equations_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      namespacedId(bucket, rec.id),
      bucket,
      rec.projectCode,
      rec.equipmentTag,
      rec.workbenchType,
      rec.revision,
      rec.inputsJson,
      rec.outputsJson,
      rec.equationsJson,
      rec.createdAt,
    );
}

export function registerSavedCalculationsRoutes(app: Express): void {
  setCalcSheetPersister((rec) => insertRecord(rec, currentActionClientId));

  app.get('/api/saved-calculations', (req: Request, res: Response): void => {
    const rows = getConn()
      .prepare('SELECT * FROM saved_calculations WHERE client_id = ? ORDER BY created_at DESC LIMIT 50')
      .all(clientBucket(req.headers['x-client-id']));
    res.json({ calculations: rows });
  });

  app.delete('/api/saved-calculations', (req: Request, res: Response): void => {
    const info = getConn()
      .prepare('DELETE FROM saved_calculations WHERE client_id = ?')
      .run(clientBucket(req.headers['x-client-id']));
    res.json({ ok: true, deleted: info.changes });
  });

  app.post('/api/saved-calculations', (req: Request, res: Response): void => {
    const parsed = SaveCalculationSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: parsed.error.issues[0]?.message ?? 'invalid record' });
      return;
    }
    const bucket = clientBucket(req.headers['x-client-id']);
    const rec: SavedCalculationRecord = {
      ...parsed.data,
      inputsJson: parsed.data.inputsJson,
    };
    insertRecord(rec, bucket);
    res.json({ ok: true, id: namespacedId(bucket, rec.id) });
  });
}

/** Set the request-scoped bucket around an /api/actions handler call (cleared by the route). */
export function setActionClientId(headerValue: unknown): void {
  currentActionClientId = clientBucket(headerValue);
}
