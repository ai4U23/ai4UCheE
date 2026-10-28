// Zod-typed shared action for WB4: Sec 13 & 14 McCabe-Thiele + Fair Tray Flooding + Eckert GPDC.
import { z } from 'zod';
import { defineAction } from './define-action';

const SIDECAR =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? ''
    : 'http://127.0.0.1:8001';

export const runDistillationAction = defineAction({
  name: 'run-distillation',
  description:
    "Evaluate binary McCabe-Thiele stage stepping (arbitrary q-line), Fair's entrainment flooding C_sb (Fig. 14-32, p. 14-37), and Eckert GPDC packing pressure drop (Fig. 14-55, p. 14-57).",
  schema: z.object({
    xf: z.number().min(0.01).max(0.99).default(0.5),
    xd: z.number().min(0.5).max(0.999).default(0.95),
    xb: z.number().min(0.001).max(0.49).default(0.05),
    q: z.number().min(-0.5).max(1.5).default(1.0),
    r_mult: z.number().min(1.05).max(5.0).default(1.3),
    alpha: z.number().min(1.1).max(10.0).default(2.45),
    feed_kmol_hr: z.number().positive().default(100.0),
    tray_spacing_m: z.number().positive().default(0.61),
    column_diameter_m: z.number().positive().default(1.2),
    packing_factor_fp_m_inv: z.number().positive().default(92.0),
  }),
  async handler(input) {
    const res = await fetch(`${SIDECAR}/api/v1/distillation/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error(`PerryEngine distillation failed (${res.status}): ${await res.text()}`);
    }
    return await res.json();
  },
});
