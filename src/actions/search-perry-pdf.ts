// Zod-typed shared actions for WB1: Perry's PDF resolve, search, crop, and chart verification.
import { z } from 'zod';
import { defineAction } from './define-action';

const SIDECAR =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? ''
    : 'http://127.0.0.1:8001';

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

export interface PerryIndexHit {
  index_pdf_page: number;
  line: string;
  sec_page_refs: string[];
}

const OFFLINE_INDEX_HITS: ReadonlyArray<PerryIndexHit> = [
  { index_pdf_page: 2249, line: 'Conversion factors, pressure psig/psia, 1-4; DIPPR vapor pressure, 2-53', sec_page_refs: ['1-4', '2-53'] },
  { index_pdf_page: 2253, line: 'Fanning and Darcy friction factors, Moody chart, 6-10; NPSHa cavitation, 10-24', sec_page_refs: ['6-10', '10-24'] },
  { index_pdf_page: 2258, line: 'Log-mean temperature difference (LMTD) Bowman F_T correction, 11-4; Psychrometry, 12-4', sec_page_refs: ['11-4', '12-4'] },
  { index_pdf_page: 2261, line: 'Fenske-Underwood-Gilliland distillation, 13-17; Fair flooding C_sb, 14-37; Kremser LLE, 15-7', sec_page_refs: ['13-17', '14-37', '15-7'] },
  { index_pdf_page: 2264, line: 'Langmuir adsorption LUB, 16-8; Fluidized bed Ergun u_mf, 17-3; Cake filtration, 18-3', sec_page_refs: ['16-8', '17-3', '18-3'] },
  { index_pdf_page: 2268, line: 'Reactors CSTR/PFR Levenspiel & Semenov runaway, 19-3; Monod bioreactor washout, 20-83', sec_page_refs: ['19-3', '20-83'] },
  { index_pdf_page: 2271, line: 'Bond Work Index comminution, 21-34; Streeter-Phelps BOD, 22-3; Relief valve API 520, 23-30, 23-57', sec_page_refs: ['21-34', '22-3', '23-30', '23-57'] },
  { index_pdf_page: 2273, line: 'Rankine cycle & Carnot exergy, 24-21; Corrosion rate mpy & alloy PREN, 25-3', sec_page_refs: ['24-21', '25-3'] },
];

export async function searchPerryIndexWithFallback(query: string): Promise<PerryIndexHit[]> {
  const q = query.trim().toLowerCase();
  try {
    const res = await getJson<{ results: PerryIndexHit[] }>(
      `/api/v1/pdf/search-index?q=${encodeURIComponent(query)}&max_results=12`,
    );
    if (res.results && res.results.length > 0) return res.results;
  } catch {
    // Offline/JSDOM fallback to curated 25-section Index entries
  }
  if (!q) return [...OFFLINE_INDEX_HITS];
  const filtered = OFFLINE_INDEX_HITS.filter(
    (h) => h.line.toLowerCase().includes(q) || h.sec_page_refs.some((r) => r.includes(q)),
  );
  return filtered.length > 0 ? filtered : [...OFFLINE_INDEX_HITS];
}

export interface MultiBookSearchHit {
  book_id: string;
  short_title: string;
  citation: string;
  snippet?: string;
  title?: string;
}

const OFFLINE_CORPUS_HITS: ReadonlyArray<MultiBookSearchHit> = [
  { book_id: 'fogler-7e', short_title: 'Fogler 7th Ed.', citation: '[Fogler 7th Ed., Ch. 2 (Conversion and Reactor Sizing)]', snippet: 'Levenspiel CSTR rectangle vs PFR integral sizing for isothermal and gas-phase reactors' },
  { book_id: 'fogler-7e', short_title: 'Fogler 7th Ed.', citation: '[Fogler 7th Ed., Ch. 15 (Internal Diffusion and Reaction)]', snippet: 'Spherical porous catalyst Thiele modulus phi and internal effectiveness factor eta' },
  { book_id: 'bsl-2e', short_title: 'BSL Transport 2nd Ed.', citation: "[BSL Transport 2nd Ed., 'Ch. 6 Friction Factors & Macroscopic Balances', PDF p. 199]", title: 'Friction Factors f_F vs Darcy f_D = 4*f_F & Packed-Bed Ergun Equation' },
  { book_id: 'svna-9e', short_title: 'Smith-Van Ness-Abbott 9th Ed.', citation: "[Smith-Van Ness-Abbott 9th Ed., 'Ch. 10 & 12 VLE & Excess Gibbs G^E', PDF p. 18]", title: 'Modified Raoult Law, Wilson vs NRTL/UNIQUAC LLE Phase Split' },
  { book_id: 'seader-4e', short_title: 'Seader 4th Ed.', citation: "[Seader 4th Ed., 'Ch. 7 & 9 McCabe-Thiele & Fenske-Underwood-Gilliland', PDF p. 260]", title: 'Multistage Binary Distillation, q-Line & Fair Tray Flooding' },
  { book_id: 'crowl-4e', short_title: 'Crowl & Louvar 4th Ed.', citation: "[Crowl & Louvar 4th Ed., 'Ch. 8–9 Thermal Runaway & API 520 Relief Sizing', PDF p. 382]", title: 'Semenov Thermal Runaway Criterion psi_crit = 1/e & Relief Valve psig->psia' },
];

export async function searchMultiBookCorpusWithFallback(query: string, bookId: string = 'all'): Promise<MultiBookSearchHit[]> {
  const q = query.trim().toLowerCase();
  try {
    const res = await getJson<{ results: MultiBookSearchHit[] }>(
      `/api/v1/textbooks/search?q=${encodeURIComponent(query)}&book_id=${encodeURIComponent(bookId)}&max_results=8`,
    );
    if (res.results && res.results.length > 0) return res.results;
  } catch {
    // Offline fallback
  }
  return OFFLINE_CORPUS_HITS.filter(
    (h) => (bookId === 'all' || h.book_id === bookId) && (!q || `${h.citation} ${h.snippet ?? ''} ${h.title ?? ''}`.toLowerCase().includes(q)),
  );
}

