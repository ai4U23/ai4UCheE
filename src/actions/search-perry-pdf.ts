// Zod-typed shared actions for WB1: Perry's PDF resolve, search, crop, and chart verification.
import { z } from 'zod';
import { defineAction } from './define-action';

const SIDECAR = 'http://127.0.0.1:8001';

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${SIDECAR}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PerryEngine ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${SIDECAR}${path}`);
  if (!res.ok) throw new Error(`PerryEngine ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

export const searchPerryPdfAction = defineAction({
  name: 'search-perry-pdf',
  description: 'Resolve a Perry Sec-Page code (e.g. 6-10, 14-37) or search the back-of-book Index.',
  schema: z.object({
    sec_page: z.string().optional(),
    query: z.string().optional(),
    max_results: z.number().int().min(1).max(30).default(15),
  }),
  async handler(input) {
    if (input.sec_page) {
      return await getJson(`/api/v1/pdf/resolve?sec_page=${encodeURIComponent(input.sec_page)}`);
    }
    if (input.query) {
      return await getJson(
        `/api/v1/pdf/search-index?q=${encodeURIComponent(input.query)}&max_results=${input.max_results}`,
      );
    }
    throw new Error('Provide either sec_page or query');
  },
});

export const cropPerryPageAction = defineAction({
  name: 'crop-perry-page',
  description: 'Render a high-DPI PNG crop of a Perry page with optional calibrated crosshair or row highlight.',
  schema: z.object({
    sec_page: z.string().min(3),
    clip_rect_norm: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
    dpi: z.number().int().min(72).max(300).default(180),
    axis_calibration: z.record(z.unknown()).optional(),
    point_x: z.number().optional(),
    point_y: z.number().optional(),
    search_term: z.string().optional(),
  }),
  async handler(input) {
    return await postJson('/api/v1/pdf/crop', input);
  },
});

export const verifyChartReadingAction = defineAction({
  name: 'verify-chart-reading',
  description: 'DeepTutor chart-reading verification with Fanning/Darcy 4x coaching diagnostic.',
  schema: z.object({
    sec_page: z.string().default('6-10'),
    chart_label: z.string().default('FIG. 6-9'),
    user_value: z.number(),
    exact_value: z.number(),
    tolerance_pct: z.number().default(5.0),
    diagnostic: z.enum(['fanning_darcy']).optional(),
  }),
  async handler(input) {
    return await postJson('/api/v1/pdf/verify-chart-reading', input);
  },
});
