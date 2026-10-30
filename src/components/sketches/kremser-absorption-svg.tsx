// Subject 3 (WB4) Interactive Companion Diagram 1:
// Kremser Absorption / Stripping Operating vs. Equilibrium Diagram & N_OG(A) Curve
// (Seader, Henley & Roper 4th Ed. Ch. 6 · Perry's 9th Ed. Sec. 14, Fig. 14-15, p. 14-19).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveKremserAbsorption } from '../../lib/separations-kremser-lle-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface KremserAbsorptionSvgProps {
  absorptionA: number;
  recoveryFrac: number;
  onChangeKremser: (nextA: number, nextRecovery: number) => void;
}

const OP_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 46, plotY: 28, plotW: 225, plotH: 150 };
const NOG_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 320, plotY: 28, plotW: 224, plotH: 150 };

export const KremserAbsorptionSvg: React.FC<KremserAbsorptionSvgProps> = ({
  absorptionA,
  recoveryFrac,
  onChangeKremser,
}) => {
  const draggingRef = useRef<boolean>(false);
  const kr = solveKremserAbsorption(absorptionA, recoveryFrac);

  const kremserSelect = useAgentSelectable(
    'figure',
    'seader-kremser-absorption-nog',
    `Seader Ch. 6 / Perry Fig. 14-15 Kremser Absorber (A=${kr.absorptionA.toFixed(2)}, Rec=${(kr.recoveryFrac * 100).toFixed(1)}%, N_OG=${kr.nogStages.toFixed(2)})`,
    {
      absorptionA: kr.absorptionA,
      recoveryFrac: kr.recoveryFrac,
      nogStages: kr.nogStages,
      isPinched: kr.isPinched,
    },
  );

  const toOpX = (x: number) => OP_BOX.plotX + Math.min(Math.max(x, 0), 1) * OP_BOX.plotW;
  const toOpY = (y: number) => OP_BOX.plotY + (1 - Math.min(Math.max(y, 0), 1)) * OP_BOX.plotH;
  const stairPoly = kr.stairPoints.map((pt) => `${toOpX(pt.xLiq).toFixed(1)},${toOpY(pt.yVap).toFixed(1)}`).join(' ');

  const toAX = (a: number) => NOG_BOX.plotX + ((a - 0.55) / 2.05) * NOG_BOX.plotW;
  const toNogY = (nog: number) => NOG_BOX.plotY + (1 - Math.min(Math.max(nog / 35, 0), 1)) * NOG_BOX.plotH;
  const nogPoly = kr.nogCurve.map((pt) => `${toAX(pt.aVal).toFixed(1)},${toNogY(pt.nog).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, box: ViewBoxRect) => {
    const pt = clientPointToViewBox(e, e.currentTarget, box);
    const nextA = Number((0.55 + pt.u * 2.05).toFixed(2));
    const nextRec = Number((0.55 + (1 - pt.v) * 0.44).toFixed(3));
    onChangeKremser(nextA, nextRec);
  };

  return (
    <div className="wb-panel" {...kremserSelect.selectableProps} data-testid="wb4-kremser-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>🧪 Seader Ch. 6 / Perry Sec. 14 Kremser Absorption Diagram &amp; N_OG(A) Chart</strong>
        <span className="mono" data-testid="wb4-kremser-readout">
          A = L/(mV) = {kr.absorptionA.toFixed(2)} (S={kr.strippingS.toFixed(2)}) · Recovery={(kr.recoveryFrac * 100).toFixed(1)}% → N_OG={kr.nogStages.toFixed(2)} stages ·{' '}
          {kr.isPinched ? '⚠️ PINCHED (A < 1)' : '✅ OPTIMAL (A ≈ 1.4)'}
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="Kremser Absorption Operating Diagram and N_OG Chart"
        data-testid="wb4-kremser-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, NOG_BOX);
          const box = probe.vx < 295 ? OP_BOX : NOG_BOX;
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, box);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) {
            const probe = clientPointToViewBox(e, e.currentTarget, NOG_BOX);
            scrubFromPointer(e, probe.vx < 295 ? OP_BOX : NOG_BOX);
          }
        }}
        onPointerUp={() => { draggingRef.current = false; }}
      >
        {/* Left Panel: Absorber Operating Line vs. Equilibrium Line Y = mX */}
        <rect x={OP_BOX.plotX} y={OP_BOX.plotY} width={OP_BOX.plotW} height={OP_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={OP_BOX.plotX + 6} y={OP_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Operating (Slope L/V) vs. Equilibrium (Slope m) [Seader Ch. 6]
        </text>
        {/* Equilibrium line y* = m x */}
        <line
          x1={toOpX(0)} y1={toOpY(0)} x2={toOpX(0.87)} y2={toOpY(1.0)}
          stroke="var(--accent-primary)" strokeWidth="2.4"
        />
        {/* Operating line y = (L/V) x + y_out */}
        <line
          x1={toOpX(0)} y1={toOpY(1 - kr.recoveryFrac)}
          x2={toOpX(Math.min(0.95, kr.recoveryFrac / Math.max(kr.absorptionA * 1.15, 0.35)))} y2={toOpY(1.0)}
          stroke="var(--accent-secondary)" strokeWidth="2.4"
        />
        <polyline points={stairPoly} fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
        <text x={OP_BOX.plotX + 8} y={OP_BOX.plotY + 18} fontSize="9" fill="currentColor">
          y_out/y_in = {(1 - kr.recoveryFrac).toFixed(3)} · Stages ≈ {Math.round(kr.nogStages)}
        </text>
        <text x={OP_BOX.plotX + OP_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Liquid Solute Ratio X → Vapor Y
        </text>

        {/* Right Panel: Kremser N_OG(A) Curve */}
        <rect x={NOG_BOX.plotX} y={NOG_BOX.plotY} width={NOG_BOX.plotW} height={NOG_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={NOG_BOX.plotX + 6} y={NOG_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Kremser N_OG vs. Absorption Factor A [Perry Fig. 14-15]
        </text>
        <line x1={toAX(1.4)} y1={NOG_BOX.plotY} x2={toAX(1.4)} y2={NOG_BOX.plotY + NOG_BOX.plotH} stroke="var(--status-pass)" strokeDasharray="3 3" />
        <polyline points={nogPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.6" />
        <circle
          cx={toAX(kr.absorptionA)} cy={toNogY(kr.nogStages)} r="7"
          fill={kr.isPinched ? 'var(--status-danger)' : 'var(--maize)'}
          stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb4-kremser-handle"
        />
        <text x={NOG_BOX.plotX + 8} y={NOG_BOX.plotY + 18} fontSize="9" fill="currentColor">
          N_OG = {kr.nogStages.toFixed(2)} (Economic A ≈ 1.25–2.0)
        </text>
        <text x={NOG_BOX.plotX + NOG_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Absorption Factor A = L/(mV) (drag X=A, Y=Recovery) →
        </text>
      </svg>
    </div>
  );
};
