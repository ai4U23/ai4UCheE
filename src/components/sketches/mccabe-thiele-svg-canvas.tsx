// Interactive 500x500 SVG McCabe-Thiele Canvas with draggable q-line handle & selectable stages.
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';

export interface McCabeThieleSvgCanvasProps {
  alpha: number;
  xf: number;
  xd: number;
  xb: number;
  q: number;
  rOp: number;
  onChangeQ?: (nextQ: number) => void;
}

const StagePointSelectable: React.FC<{
  stageNum: number;
  cx: number;
  cy: number;
  xEq: number;
  yIn: number;
}> = ({ stageNum, cx, cy, xEq, yIn }) => {
  const sel = useAgentSelectable('stage', `stage-${stageNum}`, `Theoretical Stage ${stageNum}`, {
    stage: stageNum,
    xEq,
    yIn,
  });
  return (
    <g {...sel.selectableProps} style={{ cursor: 'pointer' }} data-testid={`mt-stage-${stageNum}`}>
      <circle cx={cx} cy={cy} r={5} fill="var(--accent-primary)" />
      <text x={cx + 6} y={cy - 5} fontSize="9" fill="currentColor">
        {stageNum}
      </text>
    </g>
  );
};

export const McCabeThieleSvgCanvas: React.FC<McCabeThieleSvgCanvasProps> = ({
  alpha,
  xf,
  xd,
  xb,
  q,
  rOp,
  onChangeQ,
}) => {
  const draggingRef = useRef<boolean>(false);
  const PAD = 38;
  const SPAN = 424;
  const toSvgX = (x: number) => PAD + Math.min(Math.max(x, 0), 1) * SPAN;
  const toSvgY = (y: number) => PAD + (1 - Math.min(Math.max(y, 0), 1)) * SPAN;

  // Build VLE polyline
  const vlePts: string[] = [];
  for (let i = 0; i <= 50; i += 1) {
    const x = i / 50;
    const y = (alpha * x) / (1 + (alpha - 1) * x);
    vlePts.push(`${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`);
  }

  // q-line intersection with ROL
  const yInt =
    Math.abs(q - 1) < 1e-4
      ? (rOp / (rOp + 1)) * xf + xd / (rOp + 1)
      : (xf * (rOp + 1) + (q - 1) * xd) / Math.max(rOp + q, 0.1);
  const xInt = Math.min(Math.max(((rOp + 1) * yInt - xd) / Math.max(rOp, 0.05), 0.05), 0.95);

  // Step off stages for rendering
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
    if (!draggingRef.current || !onChangeQ) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const normX = (e.clientX - rect.left - PAD) / SPAN;
    const nextQ = Math.min(Math.max(Number((1.0 + (xf - normX) * 2.5).toFixed(2)), -0.5), 1.5);
    onChangeQ(nextQ);
  };

  return (
    <div className="wb-panel" data-testid="mccabe-thiele-canvas">
      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="340"
        onPointerMove={handlePointerMove}
        onPointerUp={() => {
          draggingRef.current = false;
        }}
      >
        <rect x={PAD} y={PAD} width={SPAN} height={SPAN} fill="none" stroke="currentColor" strokeOpacity="0.4" />
        {/* 45 deg diagonal y = x */}
        <line x1={toSvgX(0)} y1={toSvgY(0)} x2={toSvgX(1)} y2={toSvgY(1)} stroke="currentColor" strokeDasharray="3 3" />
        {/* VLE equilibrium curve */}
        <polyline points={vlePts.join(' ')} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" />
        {/* Rectifying & Stripping Operating Lines */}
        <line x1={toSvgX(xd)} y1={toSvgY(xd)} x2={toSvgX(xInt)} y2={toSvgY(yInt)} stroke="var(--accent-secondary)" strokeWidth="2" />
        <line x1={toSvgX(xInt)} y1={toSvgY(yInt)} x2={toSvgX(xb)} y2={toSvgY(xb)} stroke="var(--accent-secondary)" strokeWidth="2" />
        {/* Draggable q-line */}
        <line x1={toSvgX(xf)} y1={toSvgY(xf)} x2={toSvgX(xInt)} y2={toSvgY(yInt)} stroke="var(--status-warn)" strokeWidth="2" strokeDasharray="4 2" />
        <circle
          cx={toSvgX(xInt)}
          cy={toSvgY(yInt)}
          r={7}
          fill="var(--status-warn)"
          style={{ cursor: 'grab' }}
          data-testid="q-line-handle"
          onPointerDown={() => {
            draggingRef.current = true;
          }}
        />
        {/* Stage staircase */}
        <polyline points={stairPts.join(' ')} fill="none" stroke="currentColor" strokeWidth="1.6" />
        {stageCoords.slice(0, 14).map((st) => (
          <StagePointSelectable
            key={st.stage}
            stageNum={st.stage}
            cx={toSvgX(st.xEq)}
            cy={toSvgY(st.yIn)}
            xEq={st.xEq}
            yIn={st.yIn}
          />
        ))}
        <text x={PAD + 8} y={PAD + 18} fontSize="11" fill="currentColor">
          McCabe-Thiele · α={alpha} · q={q.toFixed(2)} · N={stageCoords.length} stages [Perry Sec 13, p. 13-14]
        </text>
      </svg>
    </div>
  );
};
