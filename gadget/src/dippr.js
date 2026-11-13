// DIPPR property lookup — JavaScript port of the perry-engine oracle.
// Ported from services/perry-engine/solvers/dippr_coeffs.py (DIPPR_COMPOUNDS,
// get_compound_dippr) and services/perry-engine/solvers/thermo_dippr.py
// (evaluate_dippr_eq101_vp, evaluate_dippr_eq106_hvap_t_c5,
//  evaluate_dippr_eq105_rhol, evaluate_all_dippr_properties).
// Source repo SHA at port time: e7b056541580f743c4dd400d75b9d48d357fbc66
// (2026-11-13). COMPOUNDS was transcribed programmatically from the Python
// dict (repr of each value), not re-typed.
//
// Perry's 9th Ed. Section 2 correlations (values are data, not text extracts):
// - Table 2-8  (pp. 2-53 ff.):  Vapor pressure Eq. 101,
//     P_vp = exp(C1 + C2/T + C3*ln(T) + C4*T^C5)  [Pa]
// - Table 2-69 (pp. 2-120 ff.): Heat of vaporization Eq. 106,
//     dH_vap = C1*(1-Tr)^(C2 + C3*Tr + C4*Tr^2 + C5*Tr^3)  [J/kmol]
// - Table 2-32 (pp. 2-93 ff.):  Liquid molar density Eq. 105,
//     rho_L = C1 / C2^(1 + (1 - T/C3)^C4)  [kmol/m^3]
//
// Port discipline (mirrors thermo_dippr.py exactly):
// - NO clamp of T into [Tmin, Tmax] — the engine only sets range_warning.
// - The ONLY clamp is Eq. 101's overflow guard exp(min(exponent, 60.0)).
// - Eq. 106 caps Tr at 0.9999; Eq. 105 floors tau at 1e-6.

// Transcribed verbatim (byte-identical doubles) from
// solvers/dippr_coeffs.py::DIPPR_COMPOUNDS.
export const COMPOUNDS = {
  'water': {
    name: 'Water',
    formula: 'H2O',
    cas: '7732-18-5',
    mw: 18.015,
    tc_k: 647.096,
    pc_pa: 22064000.0,
    omega: 0.3449,
    search_term: 'Water',
    vp_eq101: [73.649, -7258.2, -7.3037, 4.1653e-06, 2.0, 273.16, 647.096, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [52053000.0, 0.3199, -0.212, 0.25795, 0.0, 273.16, 647.096, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [17.863, 0.05861, 647.096, 0.081, 273.16, 353.15, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
  'benzene': {
    name: 'Benzene',
    formula: 'C6H6',
    cas: '71-43-2',
    mw: 78.114,
    tc_k: 562.05,
    pc_pa: 4895000.0,
    omega: 0.2103,
    search_term: 'Benzene',
    vp_eq101: [83.107, -6486.2, -9.2194, 6.9844e-06, 2.0, 278.68, 562.05, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [47500000.0, 0.45238, -0.0534, 0.0, 0.0, 278.68, 562.05, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [1.0259, 0.26666, 562.05, 0.28394, 278.68, 562.05, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
  'toluene': {
    name: 'Toluene',
    formula: 'C7H8',
    cas: '108-88-3',
    mw: 92.141,
    tc_k: 591.75,
    pc_pa: 4108000.0,
    omega: 0.264,
    search_term: 'Toluene',
    vp_eq101: [76.945, -6729.8, -8.179, 5.3017e-06, 2.0, 178.18, 591.75, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [50144000.0, 0.3859, 0.0, 0.0, 0.0, 178.18, 591.75, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [0.8792, 0.26465, 591.75, 0.2878, 178.18, 591.75, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
  'ethanol': {
    name: 'Ethanol',
    formula: 'C2H6O',
    cas: '64-17-5',
    mw: 46.069,
    tc_k: 514.0,
    pc_pa: 6137000.0,
    omega: 0.6436,
    search_term: 'Ethanol',
    vp_eq101: [73.304, -7122.3, -7.1424, 2.8853e-06, 2.0, 159.05, 514.0, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [56900000.0, 0.3359, 0.0, 0.0, 0.0, 159.05, 514.0, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [1.6288, 0.27469, 514.0, 0.23178, 159.05, 514.0, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
  'methanol': {
    name: 'Methanol',
    formula: 'CH4O',
    cas: '67-56-1',
    mw: 32.042,
    tc_k: 512.5,
    pc_pa: 8084000.0,
    omega: 0.5658,
    search_term: 'Methanol',
    vp_eq101: [82.718, -6904.5, -8.8622, 7.4664e-06, 2.0, 175.47, 512.5, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [52390000.0, 0.3682, 0.0, 0.0, 0.0, 175.47, 512.5, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [2.3267, 0.27073, 512.5, 0.24713, 175.47, 512.5, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
  'acetone': {
    name: 'Acetone',
    formula: 'C3H6O',
    cas: '67-64-1',
    mw: 58.08,
    tc_k: 508.2,
    pc_pa: 4701000.0,
    omega: 0.3071,
    search_term: 'Acetone',
    vp_eq101: [69.006, -5599.6, -7.0985, 6.2237e-06, 2.0, 178.45, 508.2, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [42150000.0, 0.3397, 0.0, 0.0, 0.0, 178.45, 508.2, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [1.2332, 0.25886, 508.2, 0.2913, 178.45, 508.2, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
  'n-hexane': {
    name: 'n-Hexane',
    formula: 'C6H14',
    cas: '110-54-3',
    mw: 86.177,
    tc_k: 507.6,
    pc_pa: 3025000.0,
    omega: 0.3013,
    search_term: 'Hexane',
    vp_eq101: [104.65, -6995.5, -12.702, 1.2381e-05, 2.0, 177.83, 507.6, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [44544000.0, 0.39002, 0.0, 0.0, 0.0, 177.83, 507.6, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [0.70824, 0.26411, 507.6, 0.27537, 177.83, 507.6, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
  'n-heptane': {
    name: 'n-Heptane',
    formula: 'C7H16',
    cas: '142-82-5',
    mw: 100.204,
    tc_k: 540.2,
    pc_pa: 2740000.0,
    omega: 0.3495,
    search_term: 'Heptane',
    vp_eq101: [87.829, -6996.4, -9.8802, 7.2099e-06, 2.0, 182.57, 540.2, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [49966000.0, 0.38795, 0.0, 0.0, 0.0, 182.57, 540.2, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [0.61259, 0.26211, 540.2, 0.28141, 182.57, 540.2, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
  'ammonia': {
    name: 'Ammonia',
    formula: 'NH3',
    cas: '7664-41-7',
    mw: 17.031,
    tc_k: 405.4,
    pc_pa: 11333000.0,
    omega: 0.256,
    search_term: 'Ammonia',
    vp_eq101: [90.483, -4669.7, -11.607, 0.017194, 1.0, 195.41, 405.4, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [31523000.0, 0.3914, -0.2289, 0.2309, 0.0, 195.41, 405.4, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [3.5383, 0.25443, 405.4, 0.2888, 195.41, 405.4, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
  'methane': {
    name: 'Methane',
    formula: 'CH4',
    cas: '74-82-8',
    mw: 16.043,
    tc_k: 190.564,
    pc_pa: 4599000.0,
    omega: 0.0115,
    search_term: 'Methane',
    vp_eq101: [39.205, -1324.4, -3.4366, 3.1019e-05, 2.0, 90.69, 190.564, '2-53'],   // (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    hvap_eq106: [10194000.0, 0.26087, -0.14694, 0.22154, 0.0, 90.69, 190.564, '2-120'],   // (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
    rhol_eq105: [2.9214, 0.28976, 190.564, 0.28881, 90.69, 190.564, '2-93'],   // (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
  },
};

// Port of dippr_coeffs.py::get_compound_dippr — case-insensitive lookup by
// key, name, formula, or CAS; raises (Python ValueError) when unknown.
export function getCompoundDippr(compound) {
  const key = String(compound).trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(COMPOUNDS, key)) {
    return COMPOUNDS[key];
  }
  for (const entry of Object.values(COMPOUNDS)) {
    if (
      key === entry.name.toLowerCase() ||
      key === entry.formula.toLowerCase() ||
      key === entry.cas.toLowerCase()
    ) {
      return entry;
    }
  }
  const supported = Object.keys(COMPOUNDS)
    .sort()
    .map((k) => `'${k}'`)
    .join(', ');
  throw new Error(
    `Unknown DIPPR compound '${String(compound)}'; supported: [${supported}]`,
  );
}

// Port of thermo_dippr.py::evaluate_all_dippr_properties (numerics only —
// the CoolProp cross-check and the 3-stage KaTeX step traces are
// engine-side artifacts, not part of this offline port).
// Returns the engine's field names so the Phase 3 golden battery can map
// 1:1 against evaluate_all_dippr_properties; `vp_pa` aliases
// `vapor_pressure_pa` (Task 2.1 smoke key).
export function dipprEvaluate(compound, tempK) {
  const data = getCompoundDippr(compound);
  const T = Number(tempK);
  if (!Number.isFinite(T)) {
    throw new Error(`Temperature must be a finite number, got ${String(tempK)}`);
  }

  // --- Eq. 101: vapor pressure (Pa) — thermo_dippr.py::evaluate_dippr_eq101_vp
  const [c1, c2, c3, c4, c5, vpTmin, vpTmax, vpPage] = data.vp_eq101;
  const vpWarning = !(vpTmin <= T && T <= vpTmax);
  const exponent = c1 + c2 / T + c3 * Math.log(T) + c4 * Math.pow(T, c5);
  const vpPa = Math.exp(Math.min(exponent, 60.0)); // overflow guard, mirrors the engine

  // --- Eq. 106: heat of vaporization (J/kmol) — evaluate_dippr_eq106_hvap_t_c5
  const [h1, h2, h3, h4, h5, hvTmin, hvTmax, hvPage] = data.hvap_eq106;
  const tc = Number(data.tc_k);
  const tr = Math.min(T / tc, 0.9999);
  const hvWarning = !(hvTmin <= T && T <= hvTmax);
  const poly = h2 + h3 * tr + h4 * Math.pow(tr, 2) + h5 * Math.pow(tr, 3);
  const hvapJKmol = h1 * Math.pow(1.0 - tr, poly);

  // --- Eq. 105: liquid molar density (kmol/m^3) — evaluate_dippr_eq105_rhol
  const [r1, r2, r3, r4, rlTmin, rlTmax, rlPage] = data.rhol_eq105;
  const rlWarning = !(rlTmin <= T && T <= rlTmax);
  const tau = Math.max(1.0 - T / r3, 1e-6);
  const rholKmolM3 = r1 / Math.pow(r2, 1.0 + Math.pow(tau, r4));
  const rhoKgM3 = rholKmolM3 * Number(data.mw);

  // evaluate_all_dippr_properties combines ONLY the vp and hvap warnings
  // into `range_warning` (thermo_dippr.py line 162); rhol's own warning is
  // reported per-equation below, exactly like the engine.
  const anyWarning = vpWarning || hvWarning;

  return {
    compound: data.name,
    formula: data.formula,
    cas: data.cas,
    mw: data.mw,
    tc_k: data.tc_k,
    pc_pa: data.pc_pa,
    temperature_k: T,
    vapor_pressure_pa: vpPa,
    vp_pa: vpPa,
    hvap_j_kmol: hvapJKmol,
    rhol_kmol_m3: rholKmolM3,
    rho_kg_m3: rhoKgM3,
    tr: tr,
    range_warning: anyWarning,
    range_bounds_k: [vpTmin, vpTmax],
    warnings: { vp: vpWarning, hvap: hvWarning, rhol: rlWarning },
    sec_pages: { vp: vpPage, hvap: hvPage, rhol: rlPage },
  };
}
