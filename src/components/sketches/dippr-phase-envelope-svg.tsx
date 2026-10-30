// Interactive DIPPR Eq. 101 & Eq. 106 dual phase envelope: log-scaled P_sat(T) + ΔH_vap(T_r) curves,
// clickable 1 atm NBP and Critical Point snap markers, and a draggable operating crosshair.
import React, { useMemo, useRef } from 'react';
import { clientPointToViewBox, clampDomainValue, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';
import { DIPPR_COMPOUNDS, dippr101, dippr106, type DipprCompound } from '../workbenches/thermo-solver-math';

export interface DipprPhaseEnvelopeSvgProps {
  compound: string;
  tempK: number;
  onChangeTempK?: (nextTempK: number) => void;
}

const W = 600;
const H = 240;
const ML = 56;
const MR = 14;
const MT = 16;
const MB = 30;
const P_ATM_KPA = 101.325;
const VIEW_BOX: ViewBoxRect = { width: W, height: H, plotX: ML, plotY: MT, plotW: W - ML - MR, plotH: H - MT - MB };

/** Solve 1 atm (101,325 Pa) normal boiling temperature via 24-step bisection on DIPPR Eq. 101. */
function solveNormalBoilingTempK(fluid: DipprCompound): number {
  if (fluid.key === 'water') return 373.15;
  let lo = 240;
  let hi = fluid.tcK - 0.5;
  for (let i = 0; i < 24; i += 1) {
    const mid = 0.5 * (lo + hi);
    if (dippr101(fluid, mid) < 101325) lo = mid;
    else hi = mid;
  }
  return Number((0.5 * (lo + hi)).toFixed(2));
}

export const DipprPhaseEnvelopeSvg: React.FC<DipprPhaseEnvelopeSvgProps> = ({
  compound,
  tempK,
  onChangeTempK,
}) => {
  const draggingRef = useRef<boolean>(false);
  const fluid = DIPPR_COMPOUNDS[compound] ?? DIPPR_COMPOUNDS.water;

  const env = useMemo(() => {
    const tMin = 270;
    const tMax = fluid.tcK;
    const pSatKpa = (t: number) => dippr101(fluid, t) / 1000;
    const hVapKjMol = (t: number) => dippr106(fluid, t) / 1e6;
    const pMaxKpa = fluid.pcPa / 1000;
    const hMaxKj = Math.max(hVapKjMol(tMin), 1);
    const x = (t: number) => ML + ((t - tMin) / (tMax - tMin)) * (W - ML - MR);
    const y = (p: number) => H - MB - (Math.log10(Math.max(p, 0.8)) / Math.log10(pMaxKpa)) * (H - MT - MB);
    const yHvap = (hKj: number) => H - MB - Math.min(Math.max(hKj / hMaxKj, 0), 1) * (H - MT - MB);
    const points: string[] = [];
    const hvapPoints: string[] = [];
    for (let i = 0; i <= 100; i += 1) {
      const t = tMin + ((tMax - tMin) * i) / 100;
      points.push(`${x(t).toFixed(1)},${y(pSatKpa(t)).toFixed(1)}`);
      hvapPoints.push(`${x(t).toFixed(1)},${yHvap(hVapKjMol(t)).toFixed(1)}`);
    }
    const tNbp = solveNormalBoilingTempK(fluid);
    return { pSatKpa, hVapKjMol, x, y, yHvap, tMin, tMax, tNbp, points: points.join(' '), hvapPoints: hvapPoints.join(' ') };
  }, [fluid]);

  const clampedT = Math.min(Math.max(tempK, env.tMin), env.tMax - 0.5);
  const pSat = env.pSatKpa(clampedT);
  const pPsia = (pSat * 1000) / 6894.757;
  const pPsig = pPsia - 14.6959;
  const hVapKj = env.hVapKjMol(clampedT);
  const opX = env.x(clampedT);
  const opY = env.y(pSat);
  const isBoiling = Math.abs(pSat - P_ATM_KPA) / P_ATM_KPA < 0.05;
  const phaseBadge = isBoiling
    ? 'NORMAL BOILING POINT (1 atm)'
    : pSat < P_ATM_KPA
      ? 'SUBCOOLED LIQUID (< 1 atm P_sat)'
      : 'PRESSURIZED SATURATION (> 1 atm P_sat)';

  const scrubTempFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!onChangeTempK) return;
    const pt = clientPointToViewBox(e, e.currentTarget, VIEW_BOX);
    const rawT = env.tMin + pt.u * (env.tMax - 0.5 - env.tMin);
    onChangeTempK(Number(clampDomainValue(rawT, env.tMin, env.tMax - 0.5, 0.05).toFixed(2)));
  };

  return (
    <figure className="dippr-envelope" data-testid="dippr-phase-envelope-svg" style={{ margin: '0.65rem 0' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`DIPPR Eq. 101 saturation curve for ${fluid.label}`}
        style={{ width: '100%', height: 'auto', display: 'block', cursor: 'ew-resize', touchAction: 'none' }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubTempFromEvent(e);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) scrubTempFromEvent(e);
        }}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
      >
        <rect x={ML} y={MT} width={W - ML - MR} height={H - MT - MB} fill="none" stroke="var(--border-grid)" />
        {/* 1 atm normal-boiling reference */}
        <line x1={ML} y1={env.y(P_ATM_KPA)} x2={W - MR} y2={env.y(P_ATM_KPA)} stroke="var(--accent-secondary)" strokeDasharray="5 4" />
        <text x={ML + 6} y={env.y(P_ATM_KPA) - 4} fontSize="10" fill="var(--accent-secondary)" fontWeight="700">1 atm (101.325 kPa)</text>
        {/* Secondary DIPPR Eq. 106 ΔH_vap(T_r) curve */}
        <polyline points={env.hvapPoints} fill="none" stroke="var(--status-warn)" strokeWidth="1.8" strokeDasharray="4 3" data-testid="dippr-hvap-curve" />
        {/* Primary DIPPR Eq. 101 P_sat(T) curve */}
        <polyline points={env.points} fill="none" stroke="var(--accent-primary)" strokeWidth="2.2" />
        {/* Clickable 1 atm NBP landmark marker */}
        <circle
          cx={env.x(env.tNbp)} cy={env.y(P_ATM_KPA)} r="5"
          fill="var(--accent-secondary)" stroke="var(--ink-primary)" strokeWidth="1.4"
          style={{ cursor: 'pointer' }} data-testid="wb2-nbp-marker"
          onPointerDown={(e) => { e.stopPropagation(); onChangeTempK?.(env.tNbp); }}
          onClick={(e) => { e.stopPropagation(); onChangeTempK?.(env.tNbp); }}
        />
        {/* Clickable Critical Point landmark marker */}
        <circle
          cx={env.x(fluid.tcK)} cy={env.y(fluid.pcPa / 1000)} r="5"
          fill="var(--status-danger)" stroke="var(--ink-primary)" strokeWidth="1.4"
          style={{ cursor: 'pointer' }} data-testid="wb2-critical-marker"
          onPointerDown={(e) => { e.stopPropagation(); onChangeTempK?.(Number((fluid.tcK - 0.5).toFixed(2))); }}
          onClick={(e) => { e.stopPropagation(); onChangeTempK?.(Number((fluid.tcK - 0.5).toFixed(2))); }}
        />
        <text x={env.x(fluid.tcK) - 42} y={env.y(fluid.pcPa / 1000) + 14} fontSize="10" fill="var(--status-danger)" fontWeight="700">C.P. ({fluid.tcK.toFixed(1)} K)</text>
        {/*Draggables: vertical T line, horizontal P_sat line, H_vap marker & main operating handle*/}
        <line x1={opX} y1={MT} x2={opX} y2={H - MB} stroke="var(--maize)" strokeWidth="1.6" strokeDasharray="3 3" />
        <line x1={ML} y1={opY} x2={opX} y2={opY} stroke="var(--accent-primary)" strokeWidth="1.4" strokeDasharray="3 3" />
        <circle cx={opX} cy={env.yHvap(hVapKj)} r="4.5" fill="var(--status-warn)" stroke="var(--ink-primary)" strokeWidth="1.2" />
        <circle
          cx={opX} cy={opY} r="7" fill="var(--maize)" stroke="var(--navy-deep)" strokeWidth="1.8"
          style={{ cursor: 'grab' }} data-testid="wb2-operating-handle"
          onPointerDown={(e) => {
            draggingRef.current = true;
            safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
          }}
        />
        <text x={opX + 6 < W - 210 ? opX + 6 : opX - 205} y={opY - 8} fontSize="9.8" fill="var(--ink-primary)" fontWeight="700" data-testid="wb2-hover-tooltip">
          T={clampedT.toFixed(1)}K ({(clampedT - 273.15).toFixed(1)}°C) · P_sat={pSat.toFixed(1)}kPa ({pPsia.toFixed(1)}psia/{pPsig.toFixed(1)}psig) · ΔH_vap={hVapKj.toFixed(1)}kJ/mol
        </text>
        <text x={ML / 2} y={MT + 10} fontSize="10" fill="var(--ink-muted)">log P / ΔH</text>
        <text x={W - MR - 6} y={H - 10} fontSize="10" textAnchor="end" fill="var(--ink-muted)">T (K) →</text>
      </svg>
      <figcaption className="wb-subtitle" data-testid="dippr-phase-badge">
        {fluid.label} · {phaseBadge} · [Perry&apos;s 9th Ed., Table 2-8, p. 2-53]
      </figcaption>
    </figure>
  );
};
