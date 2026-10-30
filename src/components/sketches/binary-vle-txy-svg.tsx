// Subject 1 (WB2) Interactive Companion Diagram 1:
// Binary Non-Ideal VLE T-x-y / y-x Phase Lens & Azeotrope Explorer (SVNAS 9th Ed. Ch. 10 & 12 · Perry's Sec. 4).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';
import { solveBinaryVleLens } from '../../lib/thermo-vle-eos-math';

export interface BinaryVleTxySvgProps {
  x1: number;
  a12: number;
  onChangeVle: (nextX1: number, nextA12: number) => void;
}

const LEFT_BOX: ViewBoxRect = { width: 580, height: 220, plotX: 44, plotY: 28, plotW: 220, plotH: 156 };
const RIGHT_BOX: ViewBoxRect = { width: 580, height: 220, plotX: 318, plotY: 28, plotW: 220, plotH: 156 };

export const BinaryVleTxySvg: React.FC<BinaryVleTxySvgProps> = ({ x1, a12, onChangeVle }) => {
  const dragSideRef = useRef<'txy' | 'yx' | null>(null);
  const vle = solveBinaryVleLens(x1, a12);

  const vleSelect = useAgentSelectable(
    'figure',
    'svnas-binary-vle-txy',
    `SVNAS Ch. 10/12 Binary VLE T-x-y & Azeotrope Lens (x₁=${vle.x1.toFixed(2)}, A₁₂=${vle.a12.toFixed(2)})`,
    { x1: vle.x1, y1: vle.op.y1, a12: vle.a12, gamma1: vle.op.gamma1, gamma2: vle.op.gamma2, hasAzeotrope: vle.hasAzeotrope },
  );

  const tMin = 335;
  const tMax = 380;
  const toTxyX = (x: number) => LEFT_BOX.plotX + x * LEFT_BOX.plotW;
  const toTxyY = (tK: number) =>
    LEFT_BOX.plotY + (1 - Math.min(Math.max((tK - tMin) / (tMax - tMin), 0), 1)) * LEFT_BOX.plotH;
  const toYxX = (x: number) => RIGHT_BOX.plotX + x * RIGHT_BOX.plotW;
  const toYxY = (y: number) => RIGHT_BOX.plotY + (1 - y) * RIGHT_BOX.plotH;

  const bubblePts = vle.curve.map((p) => `${toTxyX(p.x1).toFixed(1)},${toTxyY(p.tBubbleK).toFixed(1)}`).join(' ');
  const dewPts = vle.curve.map((p) => `${toTxyX(p.y1).toFixed(1)},${toTxyY(p.tDewK).toFixed(1)}`).join(' ');
  const yxPts = vle.curve.map((p) => `${toYxX(p.x1).toFixed(1)},${toYxY(p.y1).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, side: 'txy' | 'yx') => {
    const box = side === 'txy' ? LEFT_BOX : RIGHT_BOX;
    const pt = clientPointToViewBox(e, e.currentTarget, box);
    const nextX1 = Number((0.01 + pt.u * 0.98).toFixed(2));
    const nextA12 = Number((-1.2 + (1 - pt.v) * 3.6).toFixed(2));
    onChangeVle(nextX1, nextA12);
  };

  return (
    <div className="wb-panel" {...vleSelect.selectableProps} data-testid="wb2-binary-vle-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>🧪 SVNAS Ch. 10/12 Binary Non-Ideal VLE T-x-y Lens &amp; y-x Azeotrope Explorer</strong>
        <span className="mono" data-testid="wb2-vle-readout">
          x₁={vle.x1.toFixed(2)} → y₁={vle.op.y1.toFixed(3)} · γ₁={vle.op.gamma1.toFixed(2)}, γ₂={vle.op.gamma2.toFixed(2)} · A₁₂={vle.a12.toFixed(2)}{' '}
          {vle.hasAzeotrope ? `· ⚠️ AZEOTROPE @ x_az≈${vle.xAzeo?.toFixed(2)}` : '· Zeotropic'}
        </span>
      </div>
      <svg
        viewBox="0 0 580 220" width="100%" height="215" role="img"
        aria-label="Binary VLE T-x-y and y-x Azeotrope Diagram"
        data-testid="wb2-vle-txy-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const cx = Number.isFinite(e.clientX) ? e.clientX : 0;
          const vx = rect.width > 0 ? ((cx - rect.left) / rect.width) * 580 : cx;
          const side = vx >= 290 ? 'yx' : 'txy';
          dragSideRef.current = side;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, side);
        }}
        onPointerMove={(e) => {
          if (dragSideRef.current) scrubFromPointer(e, dragSideRef.current);
        }}
        onPointerUp={() => { dragSideRef.current = null; }}
      >
        {/* Left Panel: T-x-y Bubble & Dew Phase Lens */}
        <rect x={LEFT_BOX.plotX} y={LEFT_BOX.plotY} width={LEFT_BOX.plotW} height={LEFT_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={LEFT_BOX.plotX + 6} y={LEFT_BOX.plotY - 8} fontSize="10.2" fontWeight="700" fill="currentColor">
          T-x-y Phase Lens (Bubble vs. Dew) [SVNAS Fig. 10.8]
        </text>
        <polyline points={dewPts} fill="none" stroke="var(--status-warn)" strokeWidth="2.2" strokeDasharray="4 2" />
        <polyline points={bubblePts} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" />
        {/* Horizontal tie-line connecting liquid x1 and vapor y1 at T_bubble */}
        <line
          x1={toTxyX(vle.op.x1)} y1={toTxyY(vle.op.tBubbleK)}
          x2={toTxyX(vle.op.y1)} y2={toTxyY(vle.op.tBubbleK)}
          stroke="var(--maize)" strokeWidth="2" strokeDasharray="3 2"
        />
        <circle
          cx={toTxyX(vle.op.x1)} cy={toTxyY(vle.op.tBubbleK)} r="6.5"
          fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb2-vle-txy-handle"
        />
        <text x={LEFT_BOX.plotX + 8} y={LEFT_BOX.plotY + 18} fontSize="9.2" fill="currentColor">
          T_bub = {vle.op.tBubbleK.toFixed(1)} K · γ₁ = {vle.op.gamma1.toFixed(2)}
        </text>
        <text x={LEFT_BOX.plotX + LEFT_BOX.plotW / 2} y="206" fontSize="9.5" textAnchor="middle" fill="currentColor">
          Mole Fraction x₁, y₁ (drag X=x₁, Y=A₁₂) →
        </text>

        {/* Right Panel: y-x Equilibrium & 45° Diagonal Azeotrope Crossing */}
        <rect x={RIGHT_BOX.plotX} y={RIGHT_BOX.plotY} width={RIGHT_BOX.plotW} height={RIGHT_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={RIGHT_BOX.plotX + 6} y={RIGHT_BOX.plotY - 8} fontSize="10.2" fontWeight="700" fill="currentColor">
          y-x Equilibrium &amp; Azeotrope Crossing [Perry Sec. 4]
        </text>
        <line
          x1={toYxX(0)} y1={toYxY(0)} x2={toYxX(1)} y2={toYxY(1)}
          stroke="var(--border-grid)" strokeWidth="1.5" strokeDasharray="3 3"
        />
        <polyline points={yxPts} fill="none" stroke="var(--accent-secondary)" strokeWidth="2.6" />
        {vle.hasAzeotrope && vle.xAzeo !== null && (
          <circle
            cx={toYxX(vle.xAzeo)} cy={toYxY(vle.xAzeo)} r="5.5"
            fill="var(--status-danger)" stroke="#fff" strokeWidth="1.5"
            data-testid="wb2-vle-azeotrope-marker"
          />
        )}
        <circle
          cx={toYxX(vle.op.x1)} cy={toYxY(vle.op.y1)} r="6.5"
          fill="var(--accent-primary)" stroke="#fff" strokeWidth="1.8"
          data-testid="wb2-vle-yx-handle"
        />
        <text x={RIGHT_BOX.plotX + 8} y={RIGHT_BOX.plotY + 18} fontSize="9.2" fill="currentColor">
          α_eff = {vle.op.alphaEff.toFixed(2)} · {vle.hasAzeotrope ? `Azeotrope x=${vle.xAzeo?.toFixed(2)}` : 'No Azeotrope'}
        </text>
        <text x={RIGHT_BOX.plotX + RIGHT_BOX.plotW / 2} y="206" fontSize="9.5" textAnchor="middle" fill="currentColor">
          Liquid x₁ → Vapor y₁ (Margules A₁₂ = {vle.a12.toFixed(2)})
        </text>
      </svg>
    </div>
  );
};
