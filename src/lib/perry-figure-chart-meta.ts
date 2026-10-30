// Metadata & preset anchor catalog for WB1's 10 calibrated multi-book nomographs/charts
// across Perry's 9th Ed., BSL 2nd Ed., SVNAS 9th Ed., Seader 4th Ed., Fogler 7th Ed., and Crowl & Louvar 4th Ed.

export interface PerryPresetAnchor {
  secPage: string;
  label: string;
  exactVal: number;
  xVal: number;
  yVal: number;
  bookRef: string;
}

export interface PerryChartMeta {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  xTargetLabel: string;
  yTargetLabel: string;
  secondaryLabel?: string;
  secondaryOffsetPct?: number;
}

export const PRESET_ANCHORS: ReadonlyArray<PerryPresetAnchor> = [
  { secPage: '6-10', label: 'Fig. 6-9 — Fanning Friction Factor f_F(Re) (p. 6-10)', exactVal: 0.0045, xVal: 1e5, yVal: 0.0045, bookRef: "Perry's Fig. 6-9 · BSL Ch. 6" },
  { secPage: '14-37', label: "Fig. 14-32 — Fair's Entrainment Flooding C_sb (p. 14-37)", exactVal: 0.082, xVal: 0.1, yVal: 0.082, bookRef: "Perry's Fig. 14-32 · Seader Ch. 6" },
  { secPage: '14-57', label: 'Fig. 14-55 — Eckert GPDC Packing Flooding (p. 14-57)', exactVal: 0.065, xVal: 0.12, yVal: 0.065, bookRef: "Perry's Fig. 14-55 · Seader Ch. 6" },
  { secPage: '2-53', label: 'Table 2-8 — DIPPR Eq. 101 Vapor Pressure (p. 2-53)', exactVal: 101325, xVal: 373.15, yVal: 101325, bookRef: "Perry's Table 2-8 · SVNAS Ch. 6" },
  { secPage: '19-6', label: 'Sec. 19 / Fogler Ch. 2 — Levenspiel CSTR/PFR Ratio (p. 19-6)', exactVal: 2.45, xVal: 0.8, yVal: 2.45, bookRef: "Fogler Ch. 2 · Perry's Sec. 19" },
  { secPage: '6-52', label: 'Fig. 6-41 / BSL 6.3-1 — Sphere Drag C_D(Re_p) (p. 6-52)', exactVal: 0.44, xVal: 1000, yVal: 0.44, bookRef: "BSL Fig. 6.3-1 · Perry's Fig. 6-41" },
  { secPage: '4-18', label: 'SVNAS Fig. 3.14 / Sec. 4 — Lee-Kesler Compressibility Z⁰ (p. 4-18)', exactVal: 0.835, xVal: 1.5, yVal: 0.835, bookRef: "SVNAS Fig. 3.14 · Perry's p. 4-18" },
  { secPage: '15-10', label: 'Fogler Fig. 15-5 / BSL Ch. 18 — Thiele Effectiveness η(φ₁) (p. 15-10)', exactVal: 0.43, xVal: 5.0, yVal: 0.43, bookRef: 'Fogler Fig. 15-5 · BSL Ch. 18' },
  { secPage: '14-15', label: 'Seader Fig. 6.7 / Fig. 14-15 — Kremser Stages N_OG(A) (p. 14-15)', exactVal: 6.85, xVal: 1.4, yVal: 6.85, bookRef: "Seader Fig. 6.7 · Perry's Fig. 14-15" },
  { secPage: '23-42', label: 'Crowl Ch. 8 / Fogler Ch. 12 — Semenov Criticality ψ(T_c) (p. 23-42)', exactVal: 0.368, xVal: 360, yVal: 0.368, bookRef: "Crowl Ch. 8 · Fogler Ch. 12 · Perry's Sec. 23" },
];

export const PERRY_CHART_META: Record<string, PerryChartMeta> = {
  '6-10': {
    title: "Perry's Fig. 6-9 — Fanning Friction Factor f_F vs. Reynolds Number Re",
    xAxisLabel: 'Reynolds Number Re = ρvD/μ (log scale: 10³ → 10⁷)',
    yAxisLabel: 'Fanning f_F (NOT Darcy f_D)',
    xTargetLabel: 'Re = 1.0 × 10⁵',
    yTargetLabel: 'f_F = 0.0045 (f_D = 0.0180)',
    secondaryLabel: 'Darcy f_D = 4·f_F (4× higher trap)',
    secondaryOffsetPct: -24,
  },
  '14-37': {
    title: "Perry's Fig. 14-32 — Fair's Entrainment Flooding Capacity Parameter C_sb",
    xAxisLabel: 'Liquid-Vapor Flow Factor F_LV = (L/V)·√(ρ_G/ρ_L)',
    yAxisLabel: 'Capacity Parameter C_sb (m/s)',
    xTargetLabel: 'F_LV = 0.10',
    yTargetLabel: 'C_sb = 0.082 m/s (h_t = 24 in)',
    secondaryLabel: '12 in tray spacing (h_t = 0.305 m)',
    secondaryOffsetPct: 18,
  },
  '14-57': {
    title: "Perry's Fig. 14-55 — Eckert Generalized Pressure Drop Correlation (GPDC)",
    xAxisLabel: 'Flow Parameter F_LV = (L/G)·√(ρ_G/ρ_L)',
    yAxisLabel: 'Capacity Ordinate Y_flood',
    xTargetLabel: 'F_LV = 0.12',
    yTargetLabel: 'Y = 0.065 (Flood Limit)',
    secondaryLabel: 'ΔP/Z = 40 mmH₂O/m constant-ΔP curve',
    secondaryOffsetPct: 18,
  },
  '2-53': {
    title: "Perry's Table 2-8 — DIPPR Eq. 101 Pure-Component Vapor Pressure Curve",
    xAxisLabel: 'Absolute Temperature T (K: 273 K → 473 K)',
    yAxisLabel: 'Vapor Pressure P_vp (Pa)',
    xTargetLabel: 'T_nbp = 373.15 K (100°C)',
    yTargetLabel: 'P_vp = 101,325 Pa (14.70 psia / 0 psig)',
  },
  '19-6': {
    title: 'Fogler Ch. 2 & Perry Sec. 19 — Levenspiel CSTR/PFR Volume Ratio Curve',
    xAxisLabel: 'Fractional Conversion X (mol/mol: 0.05 → 0.95)',
    yAxisLabel: 'Volume Ratio V_CSTR / V_PFR (×)',
    xTargetLabel: 'X = 0.80',
    yTargetLabel: 'V_CSTR/V_PFR = 2.45×',
  },
  '6-52': {
    title: "BSL Fig. 6.3-1 & Perry's Fig. 6-41 — Sphere Drag Coefficient C_D(Re_p)",
    xAxisLabel: 'Particle Reynolds Number Re_p = ρvD_p/μ (log: 0.1 → 10⁵)',
    yAxisLabel: 'Drag Coefficient C_D (-)',
    xTargetLabel: 'Re_p = 1,000',
    yTargetLabel: 'C_D = 0.44 (Newton Law Plateau)',
    secondaryLabel: 'Stokes Regime C_D = 24 / Re_p',
    secondaryOffsetPct: 14,
  },
  '4-18': {
    title: "SVNAS Fig. 3.14 & Perry's Sec. 4 — Lee-Kesler Compressibility Factor Z⁰(P_r, T_r)",
    xAxisLabel: 'Reduced Pressure P_r = P / P_c (0.1 → 6.0)',
    yAxisLabel: 'Compressibility Factor Z⁰ = PV / RT',
    xTargetLabel: 'P_r = 1.50 (T_r = 1.15)',
    yTargetLabel: 'Z⁰ = 0.835',
    secondaryLabel: 'Supercritical Isotherm T_r = 1.50',
    secondaryOffsetPct: -16,
  },
  '15-10': {
    title: 'Fogler Fig. 15-5 & BSL Ch. 18 — Spherical Catalyst Thiele Effectiveness η(φ₁)',
    xAxisLabel: 'Thiele Modulus φ₁ = R·√(k / D_e) (log: 0.1 → 50)',
    yAxisLabel: 'Internal Effectiveness Factor η (-)',
    xTargetLabel: 'φ₁ = 5.0',
    yTargetLabel: 'η = 0.43 (Pore Diffusion Limited)',
    secondaryLabel: 'Strong-Diffusion Asymptote η ≈ 3/φ₁',
    secondaryOffsetPct: 12,
  },
  '14-15': {
    title: "Seader Fig. 6.7 & Perry's Fig. 14-15 — Kremser Absorption Stages N_OG(A)",
    xAxisLabel: 'Absorption Factor A = L / (m·V) (0.6 → 2.6)',
    yAxisLabel: 'Theoretical Stages N_OG (95% Solute Recovery)',
    xTargetLabel: 'A = 1.40',
    yTargetLabel: 'N_OG = 6.85 stages',
    secondaryLabel: '99% Solute Recovery Curve',
    secondaryOffsetPct: -18,
  },
  '23-42': {
    title: 'Crowl & Louvar Ch. 8 & Fogler Ch. 12 — Semenov Thermal Runaway Number ψ(T_c)',
    xAxisLabel: 'Coolant Temperature T_c (K: 300 K → 420 K)',
    yAxisLabel: 'Semenov Parameter ψ (Runaway > 1/e ≈ 0.368)',
    xTargetLabel: 'T_c,crit = 360 K',
    yTargetLabel: 'ψ_crit = 0.368 (1/e Ignition Limit)',
    secondaryLabel: 'Critical Threshold ψ_crit = 1/e = 0.368',
    secondaryOffsetPct: -10,
  },
};
