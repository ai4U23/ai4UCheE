// 5-handle interactive SVG overlay and live stage/VLE hover readout for Chart 9 (McCabe-Thiele y-x canvas).
import React from 'react';
import type { ActiveMtHandle } from '../../lib/mccabe-thiele-svg-handles';
import { safeSetPointerCapture } from '../../lib/svg-drag-math';

export interface McCabeThieleHandlesOverlayProps {
  alpha: number;
  xf: number;
  xd: number;
  xb: number;
  rOp: number;
  xInt: number;
  yInt: number;
  hoverCoords: { x: number; y: number; stage?: number } | null;
  toSvgX: (x: number) => number;
  toSvgY: (y: number) => number;
  onStartDrag: (handle: ActiveMtHandle, e: React.PointerEvent<SVGCircleElement>) => void;
}

export const McCabeThieleHandlesOverlay: React.FC<McCabeThieleHandlesOverlayProps> = ({
  alpha,
  xf,
  xd,
  xb,
  rOp,
  xInt,
  yInt,
  hoverCoords,
  toSvgX,
  toSvgY,
  onStartDrag,
}) => {
  const yInterceptRol = xd / Math.max(rOp + 1, 1.05);
  const hX = hoverCoords?.x ?? xf;
  const hY = hoverCoords?.y ?? yInt;
  const yEqAtHover = (alpha * hX) / (1 + (alpha - 1) * hX);

  const bindHandle = (handle: ActiveMtHandle) => (e: React.PointerEvent<SVGCircleElement>) => {
    e.stopPropagation();
    safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
    onStartDrag(handle, e);
  };

  return (
    <g data-testid="mt-handles-overlay">
      {/* Handle 1: q-line pinch/intersection handle */}
      <circle
        cx={toSvgX(xInt)}
        cy={toSvgY(yInt)}
        r={7}
        fill="var(--status-warn)"
        stroke="var(--ink-primary)"
        strokeWidth="1.5"
        style={{ cursor: 'grab' }}
        data-testid="q-line-handle"
        onPointerDown={bindHandle('q')}
      />

      {/* Handle 2: Distillate purity x_D handle on y=x diagonal */}
      <circle
        cx={toSvgX(xd)}
        cy={toSvgY(xd)}
        r={6.5}
        fill="var(--status-pass)"
        stroke="var(--ink-primary)"
        strokeWidth="1.5"
        style={{ cursor: 'ew-resize' }}
        data-testid="mt-xd-handle"
        onPointerDown={bindHandle('xd')}
      />

      {/* Handle 3: Feed composition z_F handle on y=x diagonal */}
      <circle
        cx={toSvgX(xf)}
        cy={toSvgY(xf)}
        r={6.5}
        fill="var(--accent-maize)"
        stroke="var(--ink-primary)"
        strokeWidth="1.5"
        style={{ cursor: 'ew-resize' }}
        data-testid="mt-zf-handle"
        onPointerDown={bindHandle('zf')}
      />

      {/* Handle 4: Bottoms composition x_B handle on y=x diagonal */}
      <circle
        cx={toSvgX(xb)}
        cy={toSvgY(xb)}
        r={6.5}
        fill="var(--status-danger)"
        stroke="var(--ink-primary)"
        strokeWidth="1.5"
        style={{ cursor: 'ew-resize' }}
        data-testid="mt-xb-handle"
        onPointerDown={bindHandle('xb')}
      />

      {/* Handle 5: Rectifying Operating Line y-intercept (0, x_D / (R + 1)) handle */}
      <circle
        cx={toSvgX(0)}
        cy={toSvgY(yInterceptRol)}
        r={6.5}
        fill="var(--accent-secondary)"
        stroke="var(--ink-primary)"
        strokeWidth="1.5"
        style={{ cursor: 'ns-resize' }}
        data-testid="mt-rol-handle"
        onPointerDown={bindHandle('rol')}
      />

      {/* Live VLE & Stage Hover Readout */}
      <rect x="44" y="438" width="412" height="20" rx="4" fill="var(--bg-elevated)" stroke="var(--border-grid)" />
      <text x="50" y="452" fontSize="9.5" fontWeight="700" fill="currentColor" data-testid="mt-hover-tooltip">
        x={hX.toFixed(3)}, y={hY.toFixed(3)}, y*(x)={yEqAtHover.toFixed(3)} · ROL y₀={yInterceptRol.toFixed(3)} (R={rOp.toFixed(2)})
        {hoverCoords?.stage ? ` · Stage #${hoverCoords.stage}` : ''}
      </text>
    </g>
  );
};
