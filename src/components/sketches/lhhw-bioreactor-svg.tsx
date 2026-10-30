// Subject 4 (WB6) Interactive Companion Diagram 4:
// Langmuir-Hinshelwood (LHHW) Dual-Site Catalytic Rate Roof -r'_A(P_A) with Catalyst Decay a(t)
// & Bioreactor Monod Chemostat Productivity D*C_X(D) with Washout Cliff D_wash (Fogler 7th Ed. Ch. 9 & 10 · Perry's Sec. 7 & 19).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveLhhwAndBioreactor } from '../../lib/kinetics-lhhw-bioreactor-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface LhhwBioreactorSvgProps {
  pReactantBar: number;
  catalystTimeHr: number;
  dilutionRateHr: number;
  feedSubstrateGPerL: number;
  onChangeLhhw: (nextPBar: number, nextTimeHr: number) => void;
  onChangeBioreactor: (nextDilutionHr: number, nextSubstrateGPerL: number) => void;
}

const LHHW_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 46, plotY: 28, plotW: 225, plotH: 150 };
const BIO_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 320, plotY: 28, plotW: 224, plotH: 150 };

export const LhhwBioreactorSvg: React.FC<LhhwBioreactorSvgProps> = ({
  pReactantBar,
  catalystTimeHr,
  dilutionRateHr,
  feedSubstrateGPerL,
  onChangeLhhw,
  onChangeBioreactor,
}) => {
  const dragSideRef = useRef<'lhhw' | 'bio' | null>(null);
  const lb = solveLhhwAndBioreactor(pReactantBar, catalystTimeHr, dilutionRateHr, feedSubstrateGPerL);

  const lhhwSelect = useAgentSelectable(
    'figure',
    'fogler-lhhw-catalysis-monod-bioreactor',
    `Fogler Ch. 9/10 LHHW Catalytic Rate Roof (P_A=${lb.pReactantBar} bar, a(t)=${lb.catalystActivityA}) & Monod Chemostat (D=${lb.dilutionRateHr} h⁻¹, D·C_X=${lb.productivityDCx} g/L·h)`,
    {
      pReactantBar: lb.pReactantBar,
      catalystTimeHr: lb.catalystTimeHr,
      catalystActivityA: lb.catalystActivityA,
      rateDecayedMolKgS: lb.rateDecayedMolKgS,
      isSelfInhibitedRegime: lb.isSelfInhibitedRegime,
      dilutionRateHr: lb.dilutionRateHr,
      dOptHr: lb.dOptHr,
      dWashoutHr: lb.dWashoutHr,
      productivityDCx: lb.productivityDCx,
      isWashedOut: lb.isWashedOut,
    },
  );

  const toPX = (pBar: number) => LHHW_BOX.plotX + ((pBar - 0.2) / 11.8) * LHHW_BOX.plotW;
  const toRateY = (r: number) => LHHW_BOX.plotY + (1 - Math.min(Math.max(r / 4.0, 0), 1)) * LHHW_BOX.plotH;
  const freshPoly = lb.lhhwPts.map((pt) => `${toPX(pt.pBar).toFixed(1)},${toRateY(pt.rFresh).toFixed(1)}`).join(' ');
  const decayedPoly = lb.lhhwPts.map((pt) => `${toPX(pt.pBar).toFixed(1)},${toRateY(pt.rDecayed).toFixed(1)}`).join(' ');

  const toDX = (dHr: number) => BIO_BOX.plotX + ((dHr - 0.02) / 0.83) * BIO_BOX.plotW;
  const toProdY = (prod: number) => BIO_BOX.plotY + (1 - Math.min(Math.max(prod / 4.2, 0), 1)) * BIO_BOX.plotH;
  const prodPoly = lb.chemostatPts.map((pt) => `${toDX(pt.dHr).toFixed(1)},${toProdY(pt.prodGLHr).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, side: 'lhhw' | 'bio') => {
    if (side === 'lhhw') {
      const pt = clientPointToViewBox(e, e.currentTarget, LHHW_BOX);
      const nextP = Number((0.2 + pt.u * 11.8).toFixed(1));
      const nextTime = Number(((1 - pt.v) * 120).toFixed(0));
      onChangeLhhw(nextP, nextTime);
    } else {
      const pt = clientPointToViewBox(e, e.currentTarget, BIO_BOX);
      const nextD = Number((0.04 + pt.u * 0.81).toFixed(2));
      const nextS0 = Number((4.0 + (1 - pt.v) * 26.0).toFixed(0));
      onChangeBioreactor(nextD, nextS0);
    }
  };

  return (
    <div className="wb-panel" {...lhhwSelect.selectableProps} data-testid="wb6-lhhw-bioreactor-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>🧬 Fogler Ch. 10 LHHW Catalytic Rate Roof &amp; Decay a(t) + Ch. 9 Monod Chemostat Washout</strong>
        <span className="mono" data-testid="wb6-lhhw-bioreactor-readout">
          P_A={lb.pReactantBar} bar (P_opt={lb.pOptBar} bar), t={lb.catalystTimeHr} h (a={lb.catalystActivityA}) → -r&prime;_A={lb.rateDecayedMolKgS} mol/kg·s · D={lb.dilutionRateHr.toFixed(2)} h⁻¹ (D_opt={lb.dOptHr}, D_wash={lb.dWashoutHr}) → D·C_X={lb.productivityDCx.toFixed(2)} g/L·h{' '}
          {lb.isWashedOut ? '⚠️ WASHOUT CLIFF' : '✅ ACTIVE BIOMASS'}
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="Langmuir-Hinshelwood Catalytic Rate Roof and Monod Bioreactor Washout Curve"
        data-testid="wb6-lhhw-bioreactor-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, LHHW_BOX);
          const side = probe.vx < 295 ? 'lhhw' : 'bio';
          dragSideRef.current = side;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, side);
        }}
        onPointerMove={(e) => {
          if (dragSideRef.current) {
            const probe = clientPointToViewBox(e, e.currentTarget, LHHW_BOX);
            scrubFromPointer(e, probe.vx < 295 ? 'lhhw' : 'bio');
          }
        }}
        onPointerUp={() => { dragSideRef.current = null; }}
        onPointerCancel={() => { dragSideRef.current = null; }}
      >
        {/* Left Panel: LHHW Dual-Site Rate Roof -r'_A(P_A) & Sintering Decay a(t) */}
        <rect x={LHHW_BOX.plotX} y={LHHW_BOX.plotY} width={LHHW_BOX.plotW} height={LHHW_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={LHHW_BOX.plotX + 6} y={LHHW_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          LHHW Dual-Site Rate -r&prime;_A(P_A) &amp; Decay [Fogler Ch. 10]
        </text>
        <line x1={toPX(lb.pOptBar)} y1={LHHW_BOX.plotY} x2={toPX(lb.pOptBar)} y2={LHHW_BOX.plotY + LHHW_BOX.plotH} stroke="var(--status-pass)" strokeDasharray="3 3" />
        <polyline points={freshPoly} fill="none" stroke="var(--border-grid)" strokeWidth="1.9" strokeDasharray="4 2" />
        <polyline points={decayedPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.6" />
        <circle
          cx={toPX(lb.pReactantBar)} cy={toRateY(lb.rateDecayedMolKgS)} r="6.5"
          fill={lb.isSelfInhibitedRegime ? 'var(--status-warn)' : 'var(--maize)'}
          stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb6-lhhw-handle"
        />
        <text x={LHHW_BOX.plotX + 8} y={LHHW_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          {lb.isSelfInhibitedRegime ? '⚠️ Self-Inhibited (K_A·P_A > 1)' : '✅ 1st-Order / Peak Regime'} · a(t)={lb.catalystActivityA}
        </text>
        <text x={LHHW_BOX.plotX + LHHW_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Reactant Pressure P_A (bar — drag X=P_A, Y=time t) →
        </text>

        {/* Right Panel: Monod Chemostat Productivity D*C_X(D) & Washout Cliff */}
        <rect x={BIO_BOX.plotX} y={BIO_BOX.plotY} width={BIO_BOX.plotW} height={BIO_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={BIO_BOX.plotX + 6} y={BIO_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Monod Chemostat D·C_X(D) &amp; Washout [Fogler Ch. 9]
        </text>
        <line x1={toDX(lb.dOptHr)} y1={BIO_BOX.plotY} x2={toDX(lb.dOptHr)} y2={BIO_BOX.plotY + BIO_BOX.plotH} stroke="var(--status-pass)" strokeDasharray="3 3" />
        <line x1={toDX(lb.dWashoutHr)} y1={BIO_BOX.plotY} x2={toDX(lb.dWashoutHr)} y2={BIO_BOX.plotY + BIO_BOX.plotH} stroke="var(--status-danger)" strokeDasharray="3 3" />
        <polyline points={prodPoly} fill="rgba(16, 185, 129, 0.14)" stroke="var(--accent-secondary)" strokeWidth="2.6" />
        <circle
          cx={toDX(lb.dilutionRateHr)} cy={toProdY(lb.productivityDCx)} r="6.5"
          fill={lb.isWashedOut ? 'var(--status-danger)' : 'var(--status-pass)'}
          stroke="#fff" strokeWidth="1.8"
          data-testid="wb6-bioreactor-handle"
        />
        <text x={BIO_BOX.plotX + 8} y={BIO_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          C_X={lb.cellBiomassCx} g/L · S={lb.effluentSubstrateS} g/L (S₀={lb.feedSubstrateGPerL})
        </text>
        <text x={BIO_BOX.plotX + BIO_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Dilution Rate D (h⁻¹ — drag X=D, Y=S₀) →
        </text>
      </svg>
    </div>
  );
};
