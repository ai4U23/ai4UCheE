// Subject 1 (WB2) Interactive Companion Diagram 3:
// Rankine / Vapor-Compression Refrigeration T-S Cycle Dome + Chemical Reaction Equilibrium X_eq(T) with Adiabatic Line
// (SVNAS 9th Ed. Ch. 8, 9, 14 · Fogler 7th Ed. Ch. 11 · Perry's Sec. 4 & 24).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';
import { solveRankineCycleDome, solveRxnEquilibriumCurve } from '../../lib/thermo-cycles-rxn-eq-math';

export interface RankineRxnEquilibriumSvgProps {
  etaIsentropic: number;
  pBoilerRatio: number;
  rxnTInletK: number;
  deltaHrxnKjMol: number;
  onChangeCycle: (nextEta: number, nextPRatio: number) => void;
  onChangeRxnEq: (nextTInletK: number, nextDeltaH: number) => void;
}

const LEFT_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 46, plotY: 28, plotW: 225, plotH: 150 };
const RIGHT_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 320, plotY: 28, plotW: 224, plotH: 150 };

export const RankineRxnEquilibriumSvg: React.FC<RankineRxnEquilibriumSvgProps> = ({
  etaIsentropic,
  pBoilerRatio,
  rxnTInletK,
  deltaHrxnKjMol,
  onChangeCycle,
  onChangeRxnEq,
}) => {
  const dragSideRef = useRef<'cycle' | 'rxn' | null>(null);
  const cyc = solveRankineCycleDome(etaIsentropic, pBoilerRatio);
  const rxn = solveRxnEquilibriumCurve(rxnTInletK, deltaHrxnKjMol);

  const cycleSelect = useAgentSelectable(
    'figure',
    'svnas-rankine-rxn-equilibrium',
    `SVNAS Ch. 8/9/14 Rankine T-S Dome (η_s=${(cyc.etaIsentropic * 100).toFixed(0)}%, η_th=${(cyc.thermalEffActual * 100).toFixed(1)}%) & Reaction X_eq(T) (X_ad=${rxn.xAdiabaticEq.toFixed(3)})`,
    {
      etaIsentropic: cyc.etaIsentropic,
      pBoilerRatio: cyc.pBoilerRatio,
      thermalEffActual: cyc.thermalEffActual,
      copRefrig: cyc.copRefrig,
      exitQualityX: cyc.exitQualityX,
      rxnTInletK: rxn.tInletK,
      deltaHrxnKjMol: rxn.deltaHrxnKjMol,
      xAdiabaticEq: rxn.xAdiabaticEq,
    },
  );

  const toSX = (s: number) => LEFT_BOX.plotX + ((s - 1.0) / 7.2) * LEFT_BOX.plotW;
  const toTY = (t: number) => LEFT_BOX.plotY + (1 - Math.min(Math.max((t - 290) / 380, 0), 1)) * LEFT_BOX.plotH;
  const domePoly = cyc.domePts.map((pt) => `${toSX(pt.sKjKgK).toFixed(1)},${toTY(pt.tK).toFixed(1)}`).join(' ');
  const cyclePoly = cyc.cyclePts.map((pt) => `${toSX(pt.sKjKgK).toFixed(1)},${toTY(pt.tK).toFixed(1)}`).join(' ');

  const toRxnTX = (t: number) => RIGHT_BOX.plotX + ((t - 300) / 320) * RIGHT_BOX.plotW;
  const toRxnXY = (x: number) => RIGHT_BOX.plotY + (1 - Math.min(Math.max(x, 0), 1)) * RIGHT_BOX.plotH;
  const xEqPoly = rxn.curvePts.map((pt) => `${toRxnTX(pt.tK).toFixed(1)},${toRxnXY(pt.xEq).toFixed(1)}`).join(' ');
  const xAdPoly = rxn.curvePts.map((pt) => `${toRxnTX(pt.tK).toFixed(1)},${toRxnXY(pt.xAdiabatic).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, side: 'cycle' | 'rxn') => {
    if (side === 'cycle') {
      const pt = clientPointToViewBox(e, e.currentTarget, LEFT_BOX);
      const nextEta = Number((0.50 + pt.u * 0.48).toFixed(2));
      const nextPRatio = Number((4.0 + (1 - pt.v) * 116.0).toFixed(0));
      onChangeCycle(nextEta, nextPRatio);
    } else {
      const pt = clientPointToViewBox(e, e.currentTarget, RIGHT_BOX);
      const nextT0 = Number((300 + pt.u * 260).toFixed(0));
      const nextDh = Number((-95 + (1 - pt.v) * 170).toFixed(0));
      onChangeRxnEq(nextT0, nextDh);
    }
  };

  return (
    <div className="wb-panel" {...cycleSelect.selectableProps} data-testid="wb2-rankine-rxn-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>⚡ SVNAS Ch. 8/9 Rankine T-S Power/Refrig Cycle &amp; Ch. 14 Reaction Equilibrium X_eq(T)</strong>
        <span className="mono" data-testid="wb2-rankine-rxn-readout">
          η_s={(cyc.etaIsentropic * 100).toFixed(0)}%, P_B/P_C={cyc.pBoilerRatio} → η_th={(cyc.thermalEffActual * 100).toFixed(1)}%, x_ex={cyc.exitQualityX.toFixed(2)}, COP_R={cyc.copRefrig.toFixed(2)} · ΔH_rxn={rxn.deltaHrxnKjMol} kJ/mol → X_ad,eq={rxn.xAdiabaticEq.toFixed(3)} @ {rxn.tAdiabaticEqK} K
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="Rankine T-S Saturation Dome and Chemical Reaction Equilibrium Diagram"
        data-testid="wb2-rankine-rxn-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, LEFT_BOX);
          const side = probe.vx < 295 ? 'cycle' : 'rxn';
          dragSideRef.current = side;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, side);
        }}
        onPointerMove={(e) => {
          if (dragSideRef.current) {
            const probe = clientPointToViewBox(e, e.currentTarget, LEFT_BOX);
            scrubFromPointer(e, probe.vx < 295 ? 'cycle' : 'rxn');
          }
        }}
        onPointerUp={() => { dragSideRef.current = null; }}
        onPointerCancel={() => { dragSideRef.current = null; }}
      >
        {/* Left Panel: Rankine / Vapor-Compression T-S Saturation Dome */}
        <rect x={LEFT_BOX.plotX} y={LEFT_BOX.plotY} width={LEFT_BOX.plotW} height={LEFT_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={LEFT_BOX.plotX + 6} y={LEFT_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Rankine T-S Dome &amp; Turbine η_s [SVNAS Ch. 8/9]
        </text>
        <polyline points={domePoly} fill="rgba(2, 132, 199, 0.1)" stroke="var(--border-grid)" strokeWidth="1.8" strokeDasharray="3 2" />
        <polyline points={cyclePoly} fill="rgba(234, 179, 8, 0.14)" stroke="var(--accent-primary)" strokeWidth="2.5" />
        <circle
          cx={toSX(cyc.cyclePts[3].sKjKgK)} cy={toTY(cyc.cyclePts[3].tK)} r="6.5"
          fill={cyc.isWetTurbineExhaust ? 'var(--status-danger)' : 'var(--maize)'}
          stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb2-rankine-turbine-handle"
        />
        <text x={LEFT_BOX.plotX + 8} y={LEFT_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          W_net={cyc.workActualKjKg} kJ/kg · {cyc.isWetTurbineExhaust ? '⚠️ Wet Exhaust (x<0.88)' : '✅ Safe Exhaust Quality'}
        </text>
        <text x={LEFT_BOX.plotX + LEFT_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Entropy S (kJ/kg·K — drag X=η_s, Y=P_boiler/P_cond) →
        </text>

        {/* Right Panel: Van 't Hoff Chemical Reaction Equilibrium X_eq(T) & Adiabatic Line */}
        <rect x={RIGHT_BOX.plotX} y={RIGHT_BOX.plotY} width={RIGHT_BOX.plotW} height={RIGHT_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={RIGHT_BOX.plotX + 6} y={RIGHT_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Van &apos;t Hoff X_eq(T) &amp; Adiabatic Line [SVNAS Ch. 14 · Fogler Ch. 11]
        </text>
        <polyline points={xEqPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.6" />
        <polyline points={xAdPoly} fill="none" stroke="var(--status-warn)" strokeWidth="2.1" strokeDasharray="4 2" />
        <circle
          cx={toRxnTX(rxn.tAdiabaticEqK)} cy={toRxnXY(rxn.xAdiabaticEq)} r="6.5"
          fill={rxn.isEquilibriumPinched ? 'var(--status-danger)' : 'var(--status-pass)'}
          stroke="#fff" strokeWidth="1.8"
          data-testid="wb2-rxn-eq-handle"
        />
        <text x={RIGHT_BOX.plotX + 8} y={RIGHT_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          {rxn.isExothermic ? 'Exothermic' : 'Endothermic'} · K_eq(T₀)={rxn.kEqAtInlet} · X_ad={rxn.xAdiabaticEq.toFixed(3)}
        </text>
        <text x={RIGHT_BOX.plotX + RIGHT_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Temperature T (K — drag X=T₀, Y=ΔH_rxn) →
        </text>
      </svg>
    </div>
  );
};
