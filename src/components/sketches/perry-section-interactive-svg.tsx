// Universal bi-directional interactive SVG chart for all 25 Perry's 9th Edition sections.
import React, { useRef } from 'react';
import { clientPointToViewBox, safeSetPointerCapture } from '../../lib/svg-drag-math';
import {
  PERRY_SECTION_VIEW_BOX,
  type PerryCurvePoint,
  type PerrySectionDescriptor,
  type PerrySectionSolverResult,
} from '../../lib/perry-sections/perry-section-types';

export interface PerrySectionInteractiveSvgProps {
  descriptor: PerrySectionDescriptor;
  result: PerrySectionSolverResult;
  onScrubParameters: (primaryVal: number, secondaryVal: number) => void;
}

function toPathD(pts: PerryCurvePoint[]): string {
  if (pts.length === 0) return 'M 56 120 L 488 120';
  return pts
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`)
    .join(' ');
}

export const PerrySectionInteractiveSvg: React.FC<PerrySectionInteractiveSvgProps> = ({
  descriptor,
  result,
  onScrubParameters,
}) => {
  const draggingRef = useRef<boolean>(false);

  const handlePointer = (e: React.PointerEvent<SVGSVGElement | SVGCircleElement>) => {
    const svgEl = e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
    const pt = clientPointToViewBox(e, svgEl, PERRY_SECTION_VIEW_BOX);
    const next = descriptor.inverseSvgDrag(pt.u, pt.v);
    onScrubParameters(next.primaryVal, next.secondaryVal);
  };

  const primaryPath = toPathD(result.curvePoints);
  const secondaryPath = result.secondaryCurvePoints ? toPathD(result.secondaryCurvePoints) : null;
  const op = result.operatingPoint ?? { sx: 270, sy: 110, x: result.primaryVal, y: result.responseVal };

  return (
    <svg
      viewBox="0 0 520 240"
      width="100%"
      height="240"
      role="img"
      aria-label={`Interactive Perry Section ${descriptor.secNum} Chart — ${descriptor.secTitle}`}
      data-testid={`perry-sec-${descriptor.secNum}-svg`}
      style={{
        display: 'block',
        background: 'var(--bg-canvas)',
        color: 'var(--ink-primary)',
        cursor: 'crosshair',
        touchAction: 'none',
        border: '1px solid var(--border-grid)',
        borderRadius: '6px',
      }}
      onPointerDown={(e) => {
        draggingRef.current = true;
        safeSetPointerCapture(e.currentTarget, e.pointerId);
        handlePointer(e);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) handlePointer(e);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
      }}
    >
      <rect x="56" y="26" width="432" height="174" fill="var(--bg-canvas)" stroke="var(--border-grid)" strokeWidth="1.3" />
      {[142, 228, 315, 401].map((gx) => (
        <line key={`gx-${gx}`} x1={gx} y1="26" x2={gx} y2="200" stroke="var(--border-grid)" strokeDasharray="2 3" />
      ))}
      {[60, 95, 130, 165].map((gy) => (
        <line key={`gy-${gy}`} x1="56" y1={gy} x2="488" y2={gy} stroke="var(--border-grid)" strokeDasharray="2 3" />
      ))}

      <text x="62" y="18" fontSize="11" fontWeight="700" fill="currentColor">
        Sec {descriptor.secNum}: {descriptor.secTitle} [p. {descriptor.secPage}]
      </text>

      {secondaryPath && (
        <>
          <path
            d={secondaryPath}
            fill="none"
            stroke="var(--status-warn)"
            strokeWidth="2.4"
            strokeDasharray="5 3"
            data-testid="perry-sec-secondary-curve"
          />
          {result.secondaryCurveLabel && (
            <text x="295" y="44" fontSize="9.2" fontWeight="600" fill="var(--status-warn)">
              {result.secondaryCurveLabel}
            </text>
          )}
        </>
      )}

      <path d={primaryPath} fill="none" stroke="var(--accent-primary)" strokeWidth="3" data-testid="perry-sec-primary-curve" />

      <line x1={op.sx} y1="26" x2={op.sx} y2="200" stroke="var(--maize)" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.9" />
      <line x1="56" y1={op.sy} x2="488" y2={op.sy} stroke="var(--maize)" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.9" />

      <circle
        cx={op.sx}
        cy={op.sy}
        r="7"
        fill={result.isAlert ? 'var(--status-danger)' : 'var(--maize)'}
        stroke="var(--ink-primary)"
        strokeWidth="2"
        style={{ cursor: 'grab' }}
        data-testid="perry-sec-drag-handle"
        onPointerDown={(e) => {
          e.stopPropagation();
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
          handlePointer(e);
        }}
      />

      <rect x="62" y="176" width="420" height="20" rx="4" fill="var(--bg-elevated)" stroke="var(--border-grid)" />
      <text x="68" y="190" fontSize="9" fontWeight="700" fill="currentColor" data-testid="perry-sec-hover-readout">
        {result.readoutText}
      </text>

      <text x="272" y="224" fontSize="10" fontWeight="600" textAnchor="middle" fill="currentColor">
        {descriptor.xAxisLabel}
      </text>
      <text x="18" y="114" fontSize="9.5" fontWeight="600" textAnchor="middle" fill="currentColor" transform="rotate(-90 18 114)">
        {descriptor.yAxisLabel}
      </text>
    </svg>
  );
};
