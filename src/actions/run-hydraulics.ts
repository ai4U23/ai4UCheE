// Zod-typed shared action for WB3: Sec 6, 8 & 10 Hydraulics, Pipe Sizing, Pump NPSHa & Valve Cv.
import { z } from 'zod';
import { defineAction } from './define-action';
import { authedFetch } from '../lib/api-fetch';

const SIDECAR =
  typeof window !== 'undefined'
    ? '' // Browser: same-origin relative — the Express host proxies /api/v1/* to the sidecar.
    // Bug fix 261111 (phase-02): the previous port-truthy test fell through to the loopback default
    // on default-port HTTPS origins (chemeng.pvu.ai4u.now, chemeng.ai4u.now) → student's 127.0.0.1:8001.
    : typeof process !== 'undefined' && process.env?.PERRY_SIDECAR_URL
      ? process.env.PERRY_SIDECAR_URL
      : 'http://127.0.0.1:8001';

export const runHydraulicsAction = defineAction({
  name: 'run-hydraulics',
  description:
    'Evaluate ASME B36.10M 3-case pipe hydraulics (Darcy f_D = 4*f_F), Pump NPSHa cavitation check (psig/psia), and ISA-75.01 Control Valve Cv choked flow.',
  schema: z.object({
    nps_inch: z.number().default(4),
    schedule: z.string().default('40'),
    flow_gpm: z.number().positive().default(250),
    length_m: z.number().positive().default(100),
    roughness_mm: z.number().nonnegative().default(0.045),
    rho_kg_m3: z.number().positive().default(998.2),
    mu_cp: z.number().positive().default(1.0),
    k_fittings: z.number().nonnegative().default(4.5),
    elev_m: z.number().default(5.0),
    p_suction_val: z.number().default(2.0),
    p_suction_unit: z.enum(['psig', 'psia', 'bar', 'kPa']).default('psig'),
    z_suction_m: z.number().default(2.0),
    hf_suction_m: z.number().nonnegative().default(0.8),
    p_vapor_pa: z.number().nonnegative().default(3169.0),
    p_crit_pa: z.number().positive().default(22064000.0),
    npshr_m: z.number().positive().default(3.0),
    valve_p1_val: z.number().default(65.0),
    valve_p1_unit: z.enum(['psig', 'psia', 'bar', 'kPa']).default('psig'),
    valve_p2_val: z.number().default(35.0),
    valve_p2_unit: z.enum(['psig', 'psia', 'bar', 'kPa']).default('psig'),
    fl_factor: z.number().min(0.3).max(1.0).default(0.9),
  }),
  async handler(input) {
    const res = await authedFetch(`${SIDECAR}/api/v1/hydraulics/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      throw new Error(`PerryEngine hydraulics failed (${res.status}): ${await res.text()}`);
    }
    return await res.json();
  },
});
