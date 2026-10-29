// Interactive vector SVG chart preview for WB1 (Perry's Fig. 6-9 Fanning Friction, Fig. 14-32 Fair Flooding,
// Fig. 14-55 Eckert GPDC, and Table 2-8 DIPPR Vapor Pressure) when the high-DPI PDF raster isn't loaded yet.
import React from 'react';

export interface PerryFigureSvgPreviewProps {
  secPage: string;
  exactValue: number;
  showCrosshair: boolean;
}

interface ChartMeta {
  title: string;
  xAxisLabel: string;
  yAxisLabel: string;
  xTargetLabel: string;
  yTargetLabel: string;
  curvePath: string;
  secondaryPath?: string;
  secondaryLabel?: string;
}

const CHART_META: Record<string, ChartMeta> = {
  '6-10': {
    title: "Perry's Fig. 6-9 — Fanning Friction Factor f_F vs. Reynolds Number Re",
    xAxisLabel: 'Reynolds Number Re = ρvD/μ (log scale: 10³ → 10⁷)',
    yAxisLabel: 'Fanning f_F (NOT Darcy f_D)',
    xTargetLabel: 'Re = 1.0 × 10⁵',
    yTargetLabel: 'f_F = 0.0045 (f_D = 0.0180)',
    curvePath: 'M 65 55 Q 190 112 260 130 T 465 162',
    secondaryPath: 'M 65 25 Q 190 68 260 82 T 465 104',
    secondaryLabel: 'Darcy f_D = 4·f_F (4× higher trap)',
  },
  '14-37': {
    title: "Perry's Fig. 14-32 — Fair's Entrainment Flooding Capacity Parameter C_sb",
    xAxisLabel: 'Liquid-Vapor Flow Factor F_LV = (L/V)·√(ρ_G/ρ_L)',
    yAxisLabel: 'Capacity Parameter C_sb (m/s)',
    xTargetLabel: 'F_LV = 0.10',
    yTargetLabel: 'C_sb = 0.082 m/s (h_t = 24 in)',
    curvePath: 'M 65 92 Q 195 105 260 130 T 465 190',
    secondaryPath: 'M 65 128 Q 195 142 260 162 T 465 212',
    secondaryLabel: '12 in tray spacing (h_t = 0.305 m)',
  },
  '14-57': {
    title: "Perry's Fig. 14-55 — Eckert Generalized Pressure Drop Correlation (GPDC)",
    xAxisLabel: 'Flow Parameter F_LV = (L/G)·√(ρ_G/ρ_L)',
    yAxisLabel: 'Capacity Ordinate Y_flood',
    xTargetLabel: 'F_LV = 0.12',
    yTargetLabel: 'Y = 0.065 (Flood Limit)',
    curvePath: 'M 65 82 Q 185 102 260 130 T 465 196',
    secondaryPath: 'M 65 125 Q 185 140 260 164 T 465 214',
    secondaryLabel: 'ΔP/Z = 40 mmH₂O/m constant-ΔP curve',
  },
  '2-53': {
    title: "Perry's Table 2-8 — DIPPR Eq. 101 Pure-Component Vapor Pressure Curve",
    xAxisLabel: 'Absolute Temperature T (K: 273 K → 473 K)',
    yAxisLabel: 'Vapor Pressure P_vp (Pa)',
    xTargetLabel: 'T_nbp = 373.15 K (100°C)',
    yTargetLabel: 'P_vp = 101,325 Pa (14.70 psia / 0 psig)',
    curvePath: 'M 65 202 Q 190 185 260 130 T 465 44',
  },
};

export const PerryFigureSvgPreview: React.FC<PerryFigureSvgPreviewProps> = ({
  secPage,
  exactValue,
  showCrosshair,
}) => {
  const meta = CHART_META[secPage] ?? {
    title: `Perry's 9th Ed. Calibrated Vector Chart — Section Page ${secPage}`,
    xAxisLabel: 'Dimensionless Operating Group X',
    yAxisLabel: 'Response Parameter Y',
    xTargetLabel: 'Operating X_op',
    yTargetLabel: `Y_exact = ${exactValue}`,
    curvePath: 'M 65 65 Q 200 110 260 130 T 465 178',
  };

  return (
    <svg viewBox="0 0 520 260" width="100%" height="260" role="img" aria-label={meta.title}>
      {/* Background & Log-Log Grid */}
      <rect x="55" y="28" width="425" height="192" rx="4" fill="var(--bg-canvas)" stroke="var(--border-grid)" />
      {[115, 185, 260, 335, 410].map((gx) => (
        <line key={`gx-${gx}`} x1={gx} y1="28" x2={gx} y2="220" stroke="var(--border-grid)" strokeDasharray="2 3" />
      ))}
      {[65, 98, 130, 165, 195].map((gy) => (
        <line key={`gy-${gy}`} x1="55" y1={gy} x2="480" y2={gy} stroke="var(--border-grid)" strokeDasharray="2 3" />
      ))}

      {/* Chart Header */}
      <text x="62" y="19" fontSize="11.5" fontWeight="700" fill="currentColor">
        {meta.title} [p. {secPage}]
      </text>

      {/* Secondary Comparison Curve (e.g. Darcy 4x trap or lower tray spacing) */}
      {meta.secondaryPath && (
        <>
          <path d={meta.secondaryPath} fill="none" stroke="var(--status-warn)" strokeWidth="2" strokeDasharray="5 3" />
          <text x="275" y="72" fontSize="9.5" fontWeight="600" fill="var(--status-warn)">
            {meta.secondaryLabel}
          </text>
        </>
      )}

      {/* Primary Calibrated Perry Curve */}
      <path d={meta.curvePath} fill="none" stroke="var(--accent-primary)" strokeWidth="3" />

      {/* Target Operating Point Marker at (260, 130) -> (50%, 50%) */}
      <circle cx="260" cy="130" r="5.5" fill="var(--accent-maize)" stroke="var(--ink-primary)" strokeWidth="2" />
      <rect x="270" y="114" width="198" height="24" rx="4" fill="var(--bg-elevated)" stroke="var(--border-grid)" />
      <text x="276" y="130" fontSize="10" fontWeight="700" fill="currentColor">
        {showCrosshair ? `${meta.xTargetLabel} → ${meta.yTargetLabel}` : `${meta.xTargetLabel} → Read Y & Verify`}
      </text>

      {/* Axis Titles */}
      <text x="268" y="242" fontSize="10.5" fontWeight="600" textAnchor="middle" fill="currentColor">
        {meta.xAxisLabel}
      </text>
      <text x="18" y="128" fontSize="10" fontWeight="600" textAnchor="middle" fill="currentColor" transform="rotate(-90 18 128)">
        {meta.yAxisLabel}
      </text>
    </svg>
  );
};
