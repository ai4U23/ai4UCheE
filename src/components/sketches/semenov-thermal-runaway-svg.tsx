// Subject 4 (WB6) Interactive Companion Diagram 1:
// Semenov Thermal Runaway S-Curve (G(T) Heat Generation vs. R(T) Linear Heat Removal)
// (Fogler 7th Ed. Ch. 12, Eqs. 12-30..12-33, pp. 637-639 · Crowl & Louvar 4th Ed. Ch. 8).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveSemenovThermalCurve } from '../../lib/kinetics-safety-electro-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface SemenovThermalRunawaySvgProps {
  tcK: number;
  semenovPsi: number;
  onChangeSemenov: (nextTcK: number, nextPsi: number) => void;
}

const SEMENOV_BOX: ViewBoxRect = { width: 580, height: 210, plotX: 52, plotY: 28, plotW: 488, plotH: 146 };

export const SemenovThermalRunawaySvg: React.FC<SemenovThermalRunawaySvgProps> = ({
  tcK,
  semenovPsi,
  onChangeSemenov,
}) => {
  const draggingRef = useRef<boolean>(false);
  const sem = solveSemenovThermalCurve(tcK, semenovPsi);

  const semSelect = useAgentSelectable(
    'figure',
    'fogler-semenov-g-r-curve',
    `Fogler Ch. 12 / Crowl Ch. 8 Semenov G(T) vs R(T) Energy Balance (T_c=${sem.tcK.toFixed(1)} K, ψ=${sem.semenovPsi.toFixed(3)})`,
    {
      tcK: sem.tcK,
      semenovPsi: sem.semenovPsi,
      isRunaway: sem.isRunaway,
      steadyStatesK: sem.steadyStatesK,
    },
  );

  const toTX = (tK: number) => SEMENOV_BOX.plotX + ((tK - 310) / 170) * SEMENOV_BOX.plotW;
  const toHeatY = (h: number) => SEMENOV_BOX.plotY + (1 - Math.min(Math.max(h / 1.15, 0), 1)) * SEMENOV_BOX.plotH;

  const gPoly = sem.curvePts.map((pt) => `${toTX(pt.tK).toFixed(1)},${toHeatY(pt.gHeat).toFixed(1)}`).join(' ');
  const rPoly = sem.curvePts.map((pt) => `${toTX(pt.tK).toFixed(1)},${toHeatY(pt.rHeat).toFixed(1)}`).join(' ');
  const tcHandleX = toTX(sem.tcK);
  const tcHandleY = SEMENOV_BOX.plotY + SEMENOV_BOX.plotH;

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = clientPointToViewBox(e, e.currentTarget, SEMENOV_BOX);
    const nextTcK = Math.round(310 + pt.u * 110);
    const nextPsi = Number((0.05 + (1 - pt.v) * 0.90).toFixed(2));
    onChangeSemenov(nextTcK, nextPsi);
  };

  return (
    <div className="wb-panel" {...semSelect.selectableProps} data-testid="wb6-semenov-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>🔥 Fogler Ch. 12 / Crowl Ch. 8 Semenov G(T) Heat Generation vs. R(T) Removal S-Curve</strong>
        <span className="mono" data-testid="wb6-semenov-readout">
          T_c={sem.tcK.toFixed(0)} K · ψ={sem.semenovPsi.toFixed(3)} (ψ_crit=1/e≈0.368) · Roots={sem.steadyStatesK.length} ·{' '}
          {sem.isRunaway ? '🔥 THERMAL RUNAWAY / IGNITION' : '✅ STABLE LOWER ROOT'}
        </span>
      </div>
      <svg
        viewBox="0 0 580 210" width="100%" height="205" role="img"
        aria-label="Semenov G(T) Heat Generation vs R(T) Linear Heat Removal Curve"
        data-testid="wb6-semenov-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) scrubFromPointer(e);
        }}
        onPointerUp={() => { draggingRef.current = false; }}
      >
        <rect x={SEMENOV_BOX.plotX} y={SEMENOV_BOX.plotY} width={SEMENOV_BOX.plotW} height={SEMENOV_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        {/* Sigmoidal G(T) Heat Generation Curve */}
        <polyline points={gPoly} fill="none" stroke="var(--status-danger)" strokeWidth="2.8" />
        {/* Linear R(T) Heat Removal Line from (T_c, 0) */}
        <polyline points={rPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeDasharray="5 2" />

        {/* Steady-State Intersection Roots (Lower Stable, Middle Unstable, Upper Runaway) */}
        {sem.steadyStatesK.map((rootT, idx) => {
          const tauK = Math.exp((rootT - 395) / 18.5);
          const gVal = tauK / (1 + tauK);
          const isUnstableMiddle = sem.steadyStatesK.length === 3 && idx === 1;
          return (
            <circle
              key={`ss-${rootT}-${idx}`}
              cx={toTX(rootT)} cy={toHeatY(gVal)} r="5.5"
              fill={isUnstableMiddle ? '#fff' : idx === 0 ? 'var(--status-pass)' : 'var(--status-danger)'}
              stroke="var(--ink-primary)" strokeWidth="1.8"
            />
          );
        })}

        {/* Draggable Coolant Temperature T_c Handle on X-axis */}
        <circle
          cx={tcHandleX} cy={tcHandleY - 4} r="7"
          fill={sem.isRunaway ? 'var(--status-danger)' : 'var(--maize)'}
          stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb6-semenov-tc-handle"
        />
        <text x={SEMENOV_BOX.plotX + 8} y={SEMENOV_BOX.plotY + 18} fontSize="9.2" fontWeight="700" fill="currentColor">
          G(T) Sigmoidal Generation (red) vs. R(T) = Cp(1+κ)(T − T_c) Removal (blue) [Fogler Eqs. 12-30..12-33]
        </text>
        <text x={SEMENOV_BOX.plotX + SEMENOV_BOX.plotW / 2} y="198" fontSize="9.5" textAnchor="middle" fill="currentColor">
          Reactor Temperature T (K — drag X=T_c coolant intercept, drag Y=Semenov ψ) →
        </text>
      </svg>
    </div>
  );
};
