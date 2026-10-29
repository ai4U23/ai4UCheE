// Interactive DIPPR Eq. 101 phase envelope: log-scaled P_sat(T) curve (270 K → Tc), 1 atm
// normal-boiling reference, critical point, and a live operating crosshair with phase badge.
import React, { useMemo } from 'react';
import { DIPPR_COMPOUNDS, dippr101 } from '../workbenches/thermo-solver-math';

export interface DipprPhaseEnvelopeSvgProps {
  compound: string;
  tempK: number;
}

const W = 600;
const H = 240;
const ML = 56;
const MR = 14;
const MT = 16;
const MB = 30;
const P_ATM_KPA = 101.325;

export const DipprPhaseEnvelopeSvg: React.FC<DipprPhaseEnvelopeSvgProps> = ({ compound, tempK }) => {
  const fluid = DIPPR_COMPOUNDS[compound] ?? DIPPR_COMPOUNDS.water;
  const env = useMemo(() => {
    const tMin = 270;
    const tMax = fluid.tcK;
    const pSatKpa = (t: number) => dippr101(fluid, t) / 1000;
    const pMaxKpa = fluid.pcPa / 1000;
    const x = (t: number) => ML + ((t - tMin) / (tMax - tMin)) * (W - ML - MR);
    const y = (p: number) => H - MB - ((Math.log10(Math.max(p, 0.8)) - 0) / Math.log10(pMaxKpa)) * (H - MT - MB);
    const points: string[] = [];
    for (let i = 0; i <= 120; i += 1) {
      const t = tMin + ((tMax - tMin) * i) / 120;
      points.push(`${x(t).toFixed(1)},${y(pSatKpa(t)).toFixed(1)}`);
    }
    return { pSatKpa, x, y, tMin, tMax, points: points.join(' ') };
  }, [fluid]);

  const pSat = env.pSatKpa(tempK);
  const opX = env.x(Math.min(Math.max(tempK, env.tMin), env.tMax));
  const opY = env.y(pSat);
  const isBoiling = Math.abs(pSat - P_ATM_KPA) / P_ATM_KPA < 0.05;
  const phaseBadge = isBoiling
    ? 'NORMAL BOILING POINT (1 atm)'
    : pSat < P_ATM_KPA
      ? 'SUBCOOLED LIQUID (< 1 atm P_sat)'
      : 'PRESSURIZED SATURATION (> 1 atm P_sat)';

  return (
    <figure className="dippr-envelope" data-testid="dippr-phase-envelope-svg" style={{ margin: '0.65rem 0' }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`DIPPR Eq. 101 saturation curve for ${fluid.label}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <rect x={ML} y={MT} width={W - ML - MR} height={H - MT - MB} fill="none" stroke="var(--border-grid)" />
        {/* 1 atm normal-boiling reference */}
        <line x1={ML} y1={env.y(P_ATM_KPA)} x2={W - MR} y2={env.y(P_ATM_KPA)} stroke="var(--accent-secondary)" strokeDasharray="5 4" />
        <text x={ML + 6} y={env.y(P_ATM_KPA) - 4} fontSize="10" fill="var(--accent-secondary)" fontWeight="700">1 atm (101.325 kPa)</text>
        {/* saturation curve */}
        <polyline points={env.points} fill="none" stroke="var(--accent-primary)" strokeWidth="2" />
        {/* critical point */}
        <circle cx={env.x(fluid.tcK)} cy={env.y(fluid.pcPa / 1000)} r="3.5" fill="var(--status-danger)" />
        <text x={env.x(fluid.tcK) - 34} y={env.y(fluid.pcPa / 1000) + 14} fontSize="10" fill="var(--status-danger)" fontWeight="700">C.P. ({fluid.tcK.toFixed(1)} K)</text>
        {/* operating crosshair */}
        <line x1={opX} y1={MT} x2={opX} y2={H - MB} stroke="var(--maize)" strokeDasharray="3 3" />
        <circle cx={opX} cy={opY} r="4.5" fill="var(--maize)" stroke="var(--navy-deep)" strokeWidth="1.5" />
        <text x={opX + 6 < W - 130 ? opX + 6 : opX - 128} y={opY - 8} fontSize="10.5" fill="var(--ink-primary)" fontWeight="700">
          T = {tempK.toFixed(1)} K, P_sat = {pSat.toFixed(2)} kPa
        </text>
        {/* axes */}
        <text x={ML / 2} y={MT + 10} fontSize="10" fill="var(--ink-muted)">log P</text>
        <text x={W - MR - 6} y={H - 10} fontSize="10" textAnchor="end" fill="var(--ink-muted)">T (K) →</text>
        <text x={ML - 8} y={env.y(P_ATM_KPA) + 3} fontSize="9" textAnchor="end" fill="var(--ink-muted)">101.3</text>
        <text x={ML - 8} y={MT + 10} fontSize="9" textAnchor="end" fill="var(--ink-muted)">{(fluid.pcPa / 1000).toFixed(0)}</text>
      </svg>
      <figcaption className="wb-subtitle" data-testid="dippr-phase-badge">
        {fluid.label} · {phaseBadge} · [Perry&apos;s 9th Ed., Table 2-8, p. 2-53]
      </figcaption>
    </figure>
  );
};
