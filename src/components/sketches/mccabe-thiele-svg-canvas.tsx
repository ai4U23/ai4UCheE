// Interactive 500x500 SVG McCabe-Thiele Canvas (Chart 9) with 5 draggable handles & selectable stages.
import React, { useRef, useState } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import {
  clampMcCabeComposition,
  solveQFromSvgNorm,
  solveRMultFromInterceptNormY,
  type ActiveMtHandle,
} from '../../lib/mccabe-thiele-svg-handles';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';
import { McCabeThieleHandlesOverlay } from './mccabe-thiele-handles-overlay';

export interface McCabeThieleSvgCanvasProps {
  alpha: number;
  xf: number;
  xd: number;
  xb: number;
  q: number;
  rOp: number;
  rMin?: number;
  onChangeQ?: (nextQ: number) => void;
  onChangeXd?: (nextXd: number) => void;
  onChangeXf?: (nextXf: number) => void;
  onChangeXb?: (nextXb: number) => void;
  onChangeRMult?: (nextRMult: number) => void;
}

const PAD = 38;
const SPAN = 424;
const MT_BOX: ViewBoxRect = { width: 500, height: 500, plotX: PAD, plotY: PAD, plotW: SPAN, plotH: SPAN };

const StagePointSelectable: React.FC<{
  stageNum: number;
  cx: number;
  cy: number;
  xEq: number;
  yIn: number;
  onHoverStage: (s: { x: number; y: number; stage: number }) => void;
}> = ({ stageNum, cx, cy, xEq, yIn, onHoverStage }) => {
  const sel = useAgentSelectable('stage', `stage-${stageNum}`, `Theoretical Stage ${stageNum}`, {
    stage: stageNum,
    xEq,
    yIn,
  });
  return (
    <g
      {...sel.selectableProps}
      style={{ cursor: 'pointer' }}
      data-testid={`mt-stage-${stageNum}`}
      onPointerEnter={() => onHoverStage({ x: xEq, y: yIn, stage: stageNum })}
    >
      <circle cx={cx} cy={cy} r={5} fill="var(--accent-primary)" />
      <text x={cx + 6} y={cy - 5} fontSize="9" fill="currentColor">{stageNum}</text>
    </g>
  );
};

export const McCabeThieleSvgCanvas: React.FC<McCabeThieleSvgCanvasProps> = ({
  alpha, xf, xd, xb, q, rOp, rMin = 1.15,
  onChangeQ, onChangeXd, onChangeXf, onChangeXb, onChangeRMult,
}) => {
  const activeHandleRef = useRef<ActiveMtHandle>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number; stage?: number } | null>(null);
  const toSvgX = (x: number) => PAD + Math.min(Math.max(x, 0), 1) * SPAN;
  const toSvgY = (y: number) => PAD + (1 - Math.min(Math.max(y, 0), 1)) * SPAN;

  const vlePts: string[] = [];
  for (let i = 0; i <= 50; i += 1) {
    const x = i / 50;
    const y = (alpha * x) / (1 + (alpha - 1) * x);
    vlePts.push(`${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`);
  }

  const yInt =
    Math.abs(q - 1) < 1e-4
      ? (rOp / (rOp + 1)) * xf + xd / (rOp + 1)
      : (xf * (rOp + 1) + (q - 1) * xd) / Math.max(rOp + q, 0.1);
  const xInt = Math.min(Math.max(((rOp + 1) * yInt - xd) / Math.max(rOp, 0.05), 0.05), 0.95);

  const stageCoords: Array<{ stage: number; xEq: number; yIn: number }> = [];
  const stairPts: string[] = [`${toSvgX(xd).toFixed(1)},${toSvgY(xd).toFixed(1)}`];
  let yCurr = xd;
  for (let s = 1; s <= 25; s += 1) {
    const xEq = yCurr / Math.max(alpha - (alpha - 1) * yCurr, 0.01);
    stairPts.push(`${toSvgX(xEq).toFixed(1)},${toSvgY(yCurr).toFixed(1)}`);
    stageCoords.push({ stage: s, xEq, yIn: yCurr });
    if (xEq <= xb) {
      stairPts.push(`${toSvgX(xEq).toFixed(1)},${toSvgY(xEq).toFixed(1)}`);
      break;
    }
    const yNext =
      xEq > xInt
        ? (rOp / (rOp + 1)) * xEq + xd / (rOp + 1)
        : ((yInt - xb) / Math.max(xInt - xb, 0.01)) * (xEq - xb) + xb;
    stairPts.push(`${toSvgX(xEq).toFixed(1)},${toSvgY(yNext).toFixed(1)}`);
    yCurr = yNext;
  }

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = clientPointToViewBox(e, e.currentTarget, MT_BOX);
    const normX = pt.u;
    const normY = 1 - pt.v;
    setHoverCoords({ x: normX, y: normY });
    const h = activeHandleRef.current;
    if (!h) return;
    if (h === 'q') onChangeQ?.(solveQFromSvgNorm(xf, normX));
    else if (h === 'xd') onChangeXd?.(clampMcCabeComposition('xd', normX, { xd, xf, xb }));
    else if (h === 'zf') onChangeXf?.(clampMcCabeComposition('zf', normX, { xd, xf, xb }));
    else if (h === 'xb') onChangeXb?.(clampMcCabeComposition('xb', normX, { xd, xf, xb }));
    else if (h === 'rol') onChangeRMult?.(solveRMultFromInterceptNormY(xd, rMin, normY));
  };

  return (
    <div className="wb-panel" data-testid="mccabe-thiele-canvas">
      <svg
        viewBox="0 0 500 500" width="100%" height="310"
        style={{ touchAction: 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={() => { activeHandleRef.current = null; }}
      >
        <rect x={PAD} y={PAD} width={SPAN} height={SPAN} fill="var(--bg-canvas)" stroke="currentColor" strokeOpacity="0.4" />
        <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(1)} y2={toSvgY(1)} stroke="currentColor" strokeDasharray="3 3" />
        {/* Interactive VLE Curve (drag to scrub z_F along equilibrium locus) */}
        <polyline
          points={vlePts.join(' ')} fill="none" stroke="var(--accent-primary)" strokeWidth="3.2"
          style={{ cursor: 'ew-resize' }}
          onPointerDown={(e) => {
            e.stopPropagation();
            activeHandleRef.current = 'zf';
            safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
          }}
        />
        {/* Interactive Rectifying Operating Line (drag to adjust R / R_min) */}
        <line
          x1={toSvgX(xd)} y1={toSvgY(xd)} x2={toSvgX(xInt)} y2={toSvgY(yInt)}
          stroke="var(--accent-secondary)" strokeWidth="3.2" style={{ cursor: 'ns-resize' }}
          onPointerDown={(e) => {
            e.stopPropagation();
            activeHandleRef.current = 'rol';
            safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
          }}
        />
        {/* Interactive Stripping Operating Line (drag to adjust bottoms x_B) */}
        <line
          x1={toSvgX(xInt)} y1={toSvgY(yInt)} x2={toSvgX(xb)} y2={toSvgY(xb)}
          stroke="var(--accent-secondary)" strokeWidth="3.2" style={{ cursor: 'ew-resize' }}
          onPointerDown={(e) => {
            e.stopPropagation();
            activeHandleRef.current = 'xb';
            safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
          }}
        />
        {/* Interactive Feed q-Line (drag directly on line to tilt q) */}
        <line
          x1={toSvgX(xf)} y1={toSvgY(xf)} x2={toSvgX(xInt)} y2={toSvgY(yInt)}
          stroke="var(--status-warn)" strokeWidth="3.2" strokeDasharray="4 2" style={{ cursor: 'grab' }}
          onPointerDown={(e) => {
            e.stopPropagation();
            activeHandleRef.current = 'q';
            safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
          }}
        />
        <polyline points={stairPts.join(' ')} fill="none" stroke="currentColor" strokeWidth="1.6" />
        {stageCoords.slice(0, 14).map((st) => (
          <StagePointSelectable
            key={st.stage} stageNum={st.stage} cx={toSvgX(st.xEq)} cy={toSvgY(st.yIn)}
            xEq={st.xEq} yIn={st.yIn} onHoverStage={setHoverCoords}
          />
        ))}
        <McCabeThieleHandlesOverlay
          alpha={alpha} xf={xf} xd={xd} xb={xb} rOp={rOp} xInt={xInt} yInt={yInt}
          hoverCoords={hoverCoords} toSvgX={toSvgX} toSvgY={toSvgY}
          onStartDrag={(handle) => { activeHandleRef.current = handle; }}
        />
        <text x={PAD + 8} y={PAD + 18} fontSize="11.5" fontWeight="700" fill="currentColor">
          McCabe-Thiele · α={alpha} · q={q.toFixed(2)} · N={stageCoords.length} stages [Perry Sec 13, p. 13-14]
        </text>
        <text x={PAD + SPAN / 2} y={488} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor">
          Liquid Mole Fraction x (Light Key) →
        </text>
        <text x={15} y={PAD + SPAN / 2} fontSize="11" fontWeight="600" textAnchor="middle" fill="currentColor" transform={`rotate(-90 15 ${PAD + SPAN / 2})`}>
          Vapor Mole Fraction y →
        </text>
      </svg>
    </div>
  );
};
