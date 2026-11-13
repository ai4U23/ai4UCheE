// Pump NPSH_A — JavaScript port of the perry-engine oracle.
// Ported from services/perry-engine/solvers/hydraulics_pump_valve.py
// (evaluate_pump_npsha) and services/perry-engine/core/unit_registry.py
// (normalize_pressure_to_pa, DEFAULT_PATM_PSIA). Source repo SHA at port
// time: e7b056541580f743c4dd400d75b9d48d357fbc66 (2026-11-13).
//
// Port discipline:
// - Ports the REPAIRED gauge branch (unit_registry.py "261113 fix"): psig
//   passes through as psia; barg/kpag convert to psia via the pint-style
//   bar/kPa -> psi factors below; the datum P_abs = P_gauge + P_atm is then
//   added. Bare "psi" is rejected (ambiguous datum) exactly like the engine.
// - Absolute-unit -> Pa factors are pint's exact doubles, read from the
//   repo venv (services/perry-engine/.venv) at port time:
//     Quantity(1,'psi').to('pascal')      = 6894.7572931683635
//     Quantity(1,'pascal')                = 1
//     Quantity(1,'kilopascal')            = 1000
//     Quantity(1,'bar')                   = 100000
//     Quantity(1,'standard_atmosphere')   = 101325
//     Quantity(1,'mmHg')                  = 133.322387415
//     Quantity(1,'torr')                  = 133.32236842105263  (= atm/760)

export const G_STD = 9.80665; // m/s^2 — hydraulics_pump_valve.py:18
export const DEFAULT_PATM_PSIA = 14.6959; // 1 atm at sea level — unit_registry.py:30

// _PSI_TO_PA: unit_registry.py computes it as ureg.Quantity(1, "psi")
// .to("pascal").magnitude — the full-precision double is printed above.
export const PSI_TO_PA = 6894.7572931683635;

// bar/kPa -> psi factors derived from PSI_TO_PA (100000 Pa = 1 bar,
// 1000 Pa = 1 kPa), kept in full double precision.
export const BAR_TO_PSI = 100000 / PSI_TO_PA;
export const KPA_TO_PSI = 1000 / PSI_TO_PA;

// Absolute units: unit string (post strip().lower()) -> Pa factor, mirroring
// unit_registry.py::ABSOLUTE_PRESSURE_UNITS exactly.
export const ABSOLUTE_PRESSURE_UNITS = {
  psia: PSI_TO_PA,
  pa: 1,
  kpa: 1000,
  bar: 100000,
  atm: 101325,
  mmhg: 133.322387415,
  torr: 133.32236842105263,
};

// Gauge units, mirroring unit_registry.py::GAUGE_PRESSURE_UNITS.
export const GAUGE_PRESSURE_UNITS = ['psig', 'barg', 'kpag'];

// Selector-friendly union (stable order): gauge first, then absolute.
export const UNITS = [
  'psig',
  'barg',
  'kpag',
  'psia',
  'pa',
  'kpa',
  'bar',
  'atm',
  'mmhg',
  'torr',
];

// Minimal port of Python's "%g" formatting (6 significant digits, trailing
// zeros stripped, exponent form below 1e-4 / from 1e6 up) so datum_note
// strings render like the engine's.
function pyG(x) {
  if (!Number.isFinite(x)) return x > 0 ? 'inf' : x < 0 ? '-inf' : 'nan';
  if (x === 0) return '0';
  const neg = x < 0;
  const a = Math.abs(x);
  // Round to 6 significant digits first (Python %g rounds before deciding
  // the output form, e.g. 999999.5 -> "1e+06").
  const r = Number(a.toPrecision(6));
  const exp = Number(r.toExponential().split('e')[1]);
  let out;
  if (exp < -4 || exp >= 6) {
    out = r.toExponential(5);
  } else {
    out = r.toFixed(5 - exp);
  }
  if (out.includes('.')) {
    out = out.replace(/(\.\d*?)0+(?=e|$)/, '$1').replace(/\.$/, '');
  }
  out = out.replace(/e([+-])(\d)$/, 'e$10$2'); // Python pads exponent to 2 digits
  return (neg ? '-' : '') + out;
}

// Port of unit_registry.py::normalize_pressure_to_pa. Returns the same
// fields as the engine's UnitConversionResult (minus nothing): value_pa,
// value_psia, gauge_psia, patm_psia, is_gauge_converted, datum_note.
export function normalizePressureToPa(value, unitStr, patmPsia = DEFAULT_PATM_PSIA) {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`Pressure value must be a finite number, got ${String(value)}`);
  }
  const u = String(unitStr).trim().toLowerCase();
  if (u === 'psi') {
    throw new Error(
      "Ambiguous pressure unit 'psi': specify 'psig' (gauge) or " +
        "'psia' (absolute) per Perry's Sec 6/8 cavitation safety guardrail.",
    );
  }
  if (GAUGE_PRESSURE_UNITS.indexOf(u) !== -1) {
    // Gauge magnitudes are expressed IN psia before adding the datum
    // (261113 fix: the old line multiplied psig by a psi->Pa magnitude and
    // divided barg/kpag by it — an ~827x psig error and an erased gauge).
    const gaugePsia =
      u === 'psig' ? num : num * (u === 'barg' ? BAR_TO_PSI : KPA_TO_PSI);
    const absPsia = gaugePsia + patmPsia;
    return {
      value_pa: absPsia * PSI_TO_PA,
      value_psia: absPsia,
      gauge_psia: gaugePsia,
      patm_psia: patmPsia,
      is_gauge_converted: true,
      datum_note:
        `P_abs = ${pyG(num)} ${unitStr} + ${pyG(patmPsia)} psia ` +
        `= ${absPsia.toFixed(4)} psia (gauge-to-absolute datum conversion)`,
    };
  }
  if (Object.prototype.hasOwnProperty.call(ABSOLUTE_PRESSURE_UNITS, u)) {
    const pa = num * ABSOLUTE_PRESSURE_UNITS[u];
    const psia = pa / PSI_TO_PA;
    return {
      value_pa: pa,
      value_psia: psia,
      gauge_psia: null,
      patm_psia: patmPsia,
      is_gauge_converted: false,
      datum_note: `${pyG(num)} ${unitStr} is absolute: ${psia.toFixed(4)} psia`,
    };
  }
  throw new Error(`Unsupported pressure unit '${String(unitStr)}'`);
}

// Port of hydraulics_pump_valve.py::evaluate_pump_npsha. Input fields match
// the engine's keyword parameters (p_suction_val, p_suction_unit required;
// patm_psia, z_suction_m, hf_suction_m, p_vapor_pa, rho_kg_m3, npshr_m
// optional with the engine's defaults). Returns the engine's result fields
// minus the 3-stage KaTeX "step" trace (engine-side artifact).
export function npshaEvaluate(input) {
  const norm = normalizePressureToPa(
    input.p_suction_val,
    input.p_suction_unit,
    input.patm_psia != null ? input.patm_psia : DEFAULT_PATM_PSIA,
  );
  const pAbsPa = norm.value_pa;
  const pVaporPa = input.p_vapor_pa != null ? input.p_vapor_pa : 3169.0;
  const rhoKgM3 = input.rho_kg_m3 != null ? input.rho_kg_m3 : 998.2;
  const zSuctionM = input.z_suction_m != null ? input.z_suction_m : 2.0;
  const hfSuctionM = input.hf_suction_m != null ? input.hf_suction_m : 0.8;
  const npshrM = input.npshr_m != null ? input.npshr_m : 3.0;

  const npshaM =
    (pAbsPa - pVaporPa) / (rhoKgM3 * G_STD) + zSuctionM - hfSuctionM;
  const marginM = npshaM - npshrM;
  const ratio = npshaM / Math.max(npshrM, 1e-6);
  const status =
    marginM < 1.0 || ratio < 1.35 ? 'CAVITATION_DANGER' : 'SAFE';

  return {
    p_suction_abs_pa: pAbsPa,
    p_suction_psia: norm.value_psia,
    is_gauge_converted: norm.is_gauge_converted,
    datum_note: norm.datum_note,
    npsha_m: npshaM,
    npshr_m: npshrM,
    margin_m: marginM,
    ratio: ratio,
    cavitation_status: status,
    perry_margin_rule_note:
      "Perry's 9th Ed. p. 10-25 Eqs. (10-52)/(10-53): require " +
      '(NPSH)_A >= max[(NPSH)_R + 5 ft (~1.5 m), 1.35 * (NPSH)_R].',
    citation: "[Perry's 9th Ed., Sec. 10 NPSH, p. 10-24]",
  };
}
