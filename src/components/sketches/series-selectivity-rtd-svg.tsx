// Subject 4 (WB6) Interactive Companion Diagram 2:
// Multiple Reactions Series/Parallel Selectivity C_A, C_B, C_C(tau) & Non-Ideal RTD Tanks-in-Series E(Theta; N)
// (Fogler 7th Ed. Ch. 8 & Ch. 16-18).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveSeriesSelectivityAndRtd } from '../../lib/kinetics-safety-electro-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface SeriesSelectivityRtdSvgProps {
  tauMin: number;
  tanksN: number;
  onChangeTauAndTanks: (nextTauMin: number, nextTanksN: number) => void;
}

const SER_BOX: ViewBoxRect = { width: 580, height: 210, plotX: 46, plotY: 28, plotW: 226, plotH: 146 };
const RTD_BOX: ViewBoxRect = { width: 580, height: 210, plotX: 320, plotY: 28, plotW: 224, plotH: 146 };

export const SeriesSelectivityRtdSvg: React.FC<SeriesSelectivityRtdSvgProps> = ({
  tauMin,
  tanksN,
  onChangeTauAndTanks,
}) => {
  const draggingRef = useRef<boolean>(false);
  const sol = solveSeriesSelectivityAndRtd(tauMin, tanksN);

  const rtdSelect = useAgentSelectable(
    'figure',
    'fogler-series-selectivity-rtd',
    `Fogler Ch. 8/16-18 Series Selectivity & RTD (τ=${sol.tauMin.toFixed(2)} min, C_B/C_A0=${sol.cbNorm.toFixed(3)}, N=${sol.tanksN} tanks)`,
    {
      tauMin: sol.tauMin,
      tauOptMin: sol.tauOptMin,
      cbNorm: sol.cbNorm,
      selectivityBC: sol.selectivityBC,
      tanksN: sol.tanksN,
      varianceSigma2: sol.varianceSigma2,
    },
  );

  const toTauX = (t: number) => SER_BOX.plotX + (t / 12.0) * SER_BOX.plotW;
  const toCompY = (c: number) => SER_BOX.plotY + (1 - Math.min(Math.max(c, 0), 1)) * SER_BOX.plotH;
  const caPoly = sol.seriesPts.map((pt) => `${toTauX(pt.tau).toFixed(1)},${toCompY(pt.ca).toFixed(1)}`).join(' ');
  const cbPoly = sol.seriesPts.map((pt) => `${toTauX(pt.tau).toFixed(1)},${toCompY(pt.cb).toFixed(1)}`).join(' ');
  const ccPoly = sol.seriesPts.map((pt) => `${toTauX(pt.tau).toFixed(1)},${toCompY(pt.cc).toFixed(1)}`).join(' ');

  const toThetaX = (th: number) => RTD_BOX.plotX + (th / 2.5) * RTD_BOX.plotW;
  const toEY = (eVal: number) => RTD_BOX.plotY + (1 - Math.min(Math.max(eVal / 2.1, 0), 1)) * RTD_BOX.plotH;
  const rtdPoly = sol.rtdPts.map((pt) => `${toThetaX(pt.theta).toFixed(1)},${toEY(pt.eTheta).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, box: ViewBoxRect) => {
    const pt = clientPointToViewBox(e, e.currentTarget, box);
    let nextTau = Number((0.2 + pt.u * 11.8).toFixed(2));
    if (Math.abs(nextTau - sol.tauOptMin) < 0.35) nextTau = sol.tauOptMin;
    const nextN = Math.max(1, Math.min(25, Math.round(1 + (1 - pt.v) * 24)));
    onChangeTauAndTanks(nextTau, nextN);
  };

  return (
    <div className="wb-panel" {...rtdSelect.selectableProps} data-testid="wb6-series-rtd-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>⚗️ Fogler Ch. 8 Series Selectivity A → B → C &amp; Ch. 16–18 Tanks-in-Series RTD E(Θ; N)</strong>
        <span className="mono" data-testid="wb6-series-rtd-readout">
          τ={sol.tauMin.toFixed(2)} min (τ_opt={sol.tauOptMin} min) → C_B/C_A0={sol.cbNorm.toFixed(3)}, S_B/C={sol.selectivityBC.toFixed(2)} · N={sol.tanksN} tanks (σ²={sol.varianceSigma2.toFixed(3)})
        </span>
      </div>
      <svg
        viewBox="0 0 580 210" width="100%" height="205" role="img"
        aria-label="Series Reaction Selectivity and Tanks-in-Series RTD Curve"
        data-testid="wb6-series-rtd-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, SER_BOX);
          const box = probe.vx >= 295 ? RTD_BOX : SER_BOX;
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, box);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) {
            const probe = clientPointToViewBox(e, e.currentTarget, SER_BOX);
            scrubFromPointer(e, probe.vx >= 295 ? RTD_BOX : SER_BOX);
          }
        }}
        onPointerUp={() => { draggingRef.current = false; }}
      >
        {/* Left Panel: Series Reaction C_A, C_B, C_C vs. Space-Time tau */}
        <rect x={SER_BOX.plotX} y={SER_BOX.plotY} width={SER_BOX.plotW} height={SER_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={SER_BOX.plotX + 6} y={SER_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Series A → B → C Selectivity &amp; τ_opt [Fogler Ch. 8]
        </text>
        <line x1={toTauX(sol.tauOptMin)} y1={SER_BOX.plotY} x2={toTauX(sol.tauOptMin)} y2={SER_BOX.plotY + SER_BOX.plotH} stroke="var(--status-pass)" strokeDasharray="3 3" />
        <polyline points={caPoly} fill="none" stroke="var(--border-grid)" strokeWidth="1.8" strokeDasharray="3 2" />
        <polyline points={ccPoly} fill="none" stroke="var(--status-danger)" strokeWidth="2" strokeDasharray="4 2" />
        <polyline points={cbPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.8" />
        <circle
          cx={toTauX(sol.tauMin)} cy={toCompY(sol.cbNorm)} r="6.5"
          fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb6-series-tau-handle"
        />
        <text x={SER_BOX.plotX + 8} y={SER_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          C_B,max={sol.cbMaxNorm.toFixed(3)} @ τ_opt={sol.tauOptMin}m
        </text>
        <text x={SER_BOX.plotX + SER_BOX.plotW / 2} y="198" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Space-Time τ (min — snaps to τ_opt) →
        </text>

        {/* Right Panel: Non-Ideal RTD Tanks-in-Series E(Theta; N) */}
        <rect x={RTD_BOX.plotX} y={RTD_BOX.plotY} width={RTD_BOX.plotW} height={RTD_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={RTD_BOX.plotX + 6} y={RTD_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Tanks-in-Series RTD E(Θ; N={sol.tanksN}) [Fogler Ch. 16–18]
        </text>
        <line x1={toThetaX(1.0)} y1={RTD_BOX.plotY} x2={toThetaX(1.0)} y2={RTD_BOX.plotY + RTD_BOX.plotH} stroke="var(--border-grid)" strokeDasharray="3 3" />
        <polyline points={rtdPoly} fill="rgba(14, 116, 144, 0.16)" stroke="var(--accent-secondary)" strokeWidth="2.6" />
        <text x={RTD_BOX.plotX + 8} y={RTD_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          N = {sol.tanksN} (N=1 CSTR → N=25 PFR) · σ² = 1/N = {sol.varianceSigma2.toFixed(3)}
        </text>
        <text x={RTD_BOX.plotX + RTD_BOX.plotW / 2} y="198" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Dimensionless Residence Time Θ = t/τ (drag Y for N) →
        </text>
      </svg>
    </div>
  );
};
