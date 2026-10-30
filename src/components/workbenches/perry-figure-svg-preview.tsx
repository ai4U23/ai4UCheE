// Interactive vector SVG chart preview for WB1's 10 calibrated multi-book nomographs/charts
// with live pointer scrubbing, secondary regime curves, and hover readout.
import React, { useRef } from 'react';
import { PERRY_CHART_META } from '../../lib/perry-figure-chart-meta';
import { samplePerryCurveAtPct, type PerryCurveSampleResult } from '../../lib/perry-figure-curve-sampler';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface PerryFigureSvgPreviewProps {
  secPage: string;
  exactValue: number;
  showCrosshair: boolean;
  crosshair?: { xPct: number; yPct: number };
  onScrubCrosshair?: (sample: PerryCurveSampleResult, nextCrosshair: { xPct: number; yPct: number }) => void;
}

const VIEW_BOX: ViewBoxRect = { width: 520, height: 260, plotX: 55, plotY: 28, plotW: 425, plotH: 192 };
const GRID_25 = Array.from({ length: 25 }, (_, i) => (i / 24) * 100);

function buildWb1CurvePaths(secPage: string, secondaryOffsetPct?: number): { primaryD: string; secondaryD?: string } {
  const toSvg = (xPct: number, yPct: number) =>
    `${(VIEW_BOX.plotX + (xPct / 100) * VIEW_BOX.plotW).toFixed(1)} ${(VIEW_BOX.plotY + (yPct / 100) * VIEW_BOX.plotH).toFixed(1)}`;
  const primaryPts = GRID_25.map((xPct, idx) => {
    const s = samplePerryCurveAtPct(secPage, xPct, 50);
    return `${idx === 0 ? 'M' : 'L'} ${toSvg(xPct, s.yCurvePct)}`;
  });
  let secondaryD: string | undefined;
  if (secondaryOffsetPct !== undefined) {
    secondaryD = GRID_25.map((xPct, idx) => {
      const s = samplePerryCurveAtPct(secPage, xPct, 50);
      const y2 = Math.min(Math.max(s.yCurvePct + secondaryOffsetPct, 4), 96);
      return `${idx === 0 ? 'M' : 'L'} ${toSvg(xPct, y2)}`;
    }).join(' ');
  }
  return { primaryD: primaryPts.join(' '), secondaryD };
}

export const PerryFigureSvgPreview: React.FC<PerryFigureSvgPreviewProps> = ({
  secPage,
  exactValue,
  showCrosshair,
  crosshair = { xPct: 50, yPct: 49.8 },
  onScrubCrosshair,
}) => {
  const draggingRef = useRef<boolean>(false);
  const meta = PERRY_CHART_META[secPage] ?? {
    title: `Perry's 9th Ed. Calibrated Vector Chart — Section Page ${secPage}`,
    xAxisLabel: 'Dimensionless Operating Group X',
    yAxisLabel: 'Response Parameter Y',
    xTargetLabel: 'Operating X_op',
    yTargetLabel: `Y_exact = ${exactValue}`,
  };
  const { primaryD, secondaryD } = buildWb1CurvePaths(secPage, meta.secondaryOffsetPct);

  const sample = samplePerryCurveAtPct(secPage, crosshair.xPct, crosshair.yPct);
  const markerX = VIEW_BOX.plotX + (crosshair.xPct / 100) * VIEW_BOX.plotW;
  const markerY = VIEW_BOX.plotY + (crosshair.yPct / 100) * VIEW_BOX.plotH;
  const curveMarkerY = VIEW_BOX.plotY + (sample.yCurvePct / 100) * VIEW_BOX.plotH;

  const scrubAtEvent = (e: React.PointerEvent<SVGSVGElement>, snapToCurve = true) => {
    if (!onScrubCrosshair) return;
    const pt = clientPointToViewBox(e, e.currentTarget, VIEW_BOX);
    const rawSample = samplePerryCurveAtPct(secPage, pt.xPct, pt.yPct);
    const nextY = snapToCurve ? rawSample.yCurvePct : pt.yPct;
    const finalSample = snapToCurve
      ? { ...rawSample, yCursor: rawSample.yCurve }
      : rawSample;
    onScrubCrosshair(finalSample, { xPct: pt.xPct, yPct: nextY });
  };

  return (
    <svg
      viewBox="0 0 520 260" width="100%" height="260" role="img" aria-label={meta.title}
      data-testid="perry-svg-interactive-surface" style={{ cursor: 'crosshair', touchAction: 'none' }}
      onPointerDown={(e) => {
        e.stopPropagation();
        draggingRef.current = true;
        safeSetPointerCapture(e.currentTarget, e.pointerId);
        scrubAtEvent(e, !e.altKey);
      }}
      onPointerMove={(e) => { if (draggingRef.current) scrubAtEvent(e, !e.altKey); }}
      onPointerUp={() => { draggingRef.current = false; }}
      onDoubleClick={(e) => {
        if (!onScrubCrosshair) return;
        const pt = clientPointToViewBox(e, e.currentTarget, VIEW_BOX);
        const s = samplePerryCurveAtPct(secPage, pt.xPct, pt.yPct);
        onScrubCrosshair({ ...s, yCursor: s.yCurve }, { xPct: pt.xPct, yPct: s.yCurvePct });
      }}
    >
      <rect x="55" y="28" width="425" height="192" rx="4" fill="var(--bg-canvas)" stroke="var(--border-grid)" />
      {[115, 185, 260, 335, 410].map((gx) => (
        <line key={`gx-${gx}`} x1={gx} y1="28" x2={gx} y2="220" stroke="var(--border-grid)" strokeDasharray="2 3" />
      ))}
      {[65, 98, 130, 165, 195].map((gy) => (
        <line key={`gy-${gy}`} x1="55" y1={gy} x2="480" y2={gy} stroke="var(--border-grid)" strokeDasharray="2 3" />
      ))}

      <text x="62" y="19" fontSize="11.2" fontWeight="700" fill="currentColor">
        {meta.title} [p. {secPage}]
      </text>

      {secondaryD && (
        <>
          <path d={secondaryD} fill="none" stroke="var(--status-warn)" strokeWidth="2.4" strokeDasharray="5 3" style={{ cursor: 'pointer' }} />
          <text x="268" y="54" fontSize="9.5" fontWeight="600" fill="var(--status-warn)">
            {meta.secondaryLabel}
          </text>
        </>
      )}

      <path d={primaryD} fill="none" stroke="var(--accent-primary)" strokeWidth="3.2" style={{ cursor: 'pointer' }} />

      {/* Interactive vertical & horizontal projection lines moving live with the scrubbed point */}
      <line x1={markerX} y1="28" x2={markerX} y2="220" stroke="var(--maize)" strokeWidth="1.6" strokeDasharray="4 3" />
      <line x1="55" y1={markerY} x2="480" y2={markerY} stroke="var(--maize)" strokeWidth="1.6" strokeDasharray="4 3" />
      <circle cx={markerX} cy={curveMarkerY} r="4.5" fill="var(--accent-primary)" stroke="var(--bg-canvas)" strokeWidth="1.5" />

      <circle
        cx={markerX} cy={markerY} r="7" fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="2"
        style={{ cursor: 'grab' }} data-testid="wb1-crosshair-handle"
      />
      <rect x="60" y="196" width="414" height="20" rx="4" fill="var(--bg-elevated)" stroke="var(--border-grid)" />
      <text x="66" y="210" fontSize="9.2" fontWeight="700" fill="currentColor" data-testid="wb1-hover-readout">
        {showCrosshair ? sample.readoutText : `${meta.xTargetLabel} → ${sample.readoutText}`}
      </text>

      <text x="268" y="242" fontSize="10.5" fontWeight="600" textAnchor="middle" fill="currentColor">
        {meta.xAxisLabel}
      </text>
      <text x="18" y="128" fontSize="10" fontWeight="600" textAnchor="middle" fill="currentColor" transform="rotate(-90 18 128)">
        {meta.yAxisLabel}
      </text>
    </svg>
  );
};
