// Zod-typed shared actions for WB2: DIPPR property evaluation & Carlson property advisor.
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

async function postSidecar<T>(path: string, body: unknown): Promise<T> {
  const res = await authedFetch(`${SIDECAR}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PerryEngine ${path} failed (${res.status}): ${await res.text()}`);
  return (await res.json()) as T;
}

export const queryDipprAction = defineAction({
  name: 'query-dippr',
  description: 'Evaluate Perry Sec 2 DIPPR Eq. 101 (VP), Eq. 106 (dH_vap w/ C5), and Eq. 105 (rho_L) with 3-stage KaTeX.',
  schema: z.object({
    compound: z.string().default('water'),
    temperature: z.number().default(373.15),
    temperature_unit: z.enum(['K', 'degC', 'degF', 'degR']).default('K'),
    include_pdf_crop: z.boolean().default(false),
  }),
  async handler(input) {
    return await postSidecar('/api/v1/thermo/dippr', input);
  },
});

export const queryCarlsonAdvisorAction = defineAction({
  name: 'query-carlson-advisor',
  description: "Evaluate Carlson's (1996) / Perry Sec 4 thermodynamic property package decision tree.",
  schema: z.object({
    is_pure_water: z.boolean().default(false),
    has_electrolytes: z.boolean().default(false),
    polarity: z.enum(['nonpolar', 'polar_non_electrolyte']).default('nonpolar'),
    pressure_bar: z.number().default(1.0),
    has_vapor_association: z.boolean().default(false),
    has_liquid_liquid_split: z.boolean().default(false),
    missing_bip: z.boolean().default(false),
  }),
  async handler(input) {
    return await postSidecar('/api/v1/thermo/carlson-advisor', input);
  },
});
