// JS side of the golden battery (phase 3, plan 261113-0638).
// Reads gadget/oracle/{input_grid,expected}.json, evaluates both ports on the
// grid, compares to rel 1e-6 (abs floor 1e-12), asserts the numeric field SET
// matches, prints per-case diffs on failure. Success = final line `ALL GREEN`.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { dipprEvaluate } from './dippr.js';
import { npshaEvaluate } from './npsha.js';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..', '..');
const oracleDir = join(repo, 'gadget', 'oracle');
const expected = JSON.parse(
  readFileSync(join(oracleDir, 'expected.json'), 'utf8'));

const REL_TOL = 1e-6;
const ABS_FLOOR = 1e-12;

const DIPPR_FIELDS = [
  'vapor_pressure_pa', 'hvap_j_kmol', 'rhol_kmol_m3', 'rho_kg_m3',
  'temperature_k', 'tr',
];
const NPSHA_FIELDS = [
  'p_suction_abs_pa', 'p_suction_psia', 'npsha_m', 'npshr_m',
  'margin_m', 'ratio',
];

let failures = 0;
let checks = 0;

function cmp(label, got, want) {
  checks += 1;
  const diff = Math.abs(got - want);
  const ok = diff <= ABS_FLOOR || diff <= REL_TOL * Math.abs(want);
  if (!ok) {
    failures += 1;
    console.log(`FAIL ${label}: got=${got} want=${want} diff=${diff}`);
  }
}

expected.dippr.forEach((rec, i) => {
  const { compound, temp_k } = rec.input;
  const js = dipprEvaluate(compound, temp_k);
  for (const f of DIPPR_FIELDS) {
    // Field-set guard: a missing JS export must fail loudly, not silently skip.
    if (typeof js[f] !== 'number') {
      failures += 1;
      console.log(`FAIL dippr[${i}] ${compound}@${temp_k}: field ${f} missing/not number`);
      continue;
    }
    cmp(`dippr[${i}] ${compound}@${temp_k}K ${f}`, js[f], rec[f]);
  }
  checks += 1;
  if (Boolean(js.range_warning) !== Boolean(rec.range_warning)) {
    failures += 1;
    console.log(`FAIL dippr[${i}] ${compound}@${temp_k}K range_warning: ` +
      `got=${js.range_warning} want=${rec.range_warning}`);
  }
});

expected.npsha.forEach((rec, i) => {
  const js = npshaEvaluate(rec.input);
  for (const f of NPSHA_FIELDS) {
    if (typeof js[f] !== 'number') {
      failures += 1;
      console.log(`FAIL npsha[${i}]: field ${f} missing/not number`);
      continue;
    }
    cmp(`npsha[${i}] ${rec.input.p_suction_val}${rec.input.p_suction_unit} ${f}`,
      js[f], rec[f]);
  }
  checks += 1;
  if (js.cavitation_status !== rec.cavitation_status) {
    failures += 1;
    console.log(`FAIL npsha[${i}] status: got=${js.cavitation_status} ` +
      `want=${rec.cavitation_status}`);
  }
  checks += 1;
  if (Boolean(js.is_gauge_converted) !== Boolean(rec.is_gauge_converted)) {
    failures += 1;
    console.log(`FAIL npsha[${i}] is_gauge_converted: ` +
      `got=${js.is_gauge_converted} want=${rec.is_gauge_converted}`);
  }
});

console.log(`battery: ${expected.dippr.length} dippr + ` +
  `${expected.npsha.length} npsha cases, ${checks} comparisons, ` +
  `${failures} failures`);
if (failures === 0) {
  console.log('ALL GREEN');
  process.exit(0);
}
process.exit(1);
