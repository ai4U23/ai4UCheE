// Interactive Levenspiel CSTR vs. PFR Reciprocal-Rate SVG Canvas + PBR Ergun & Thiele/Semenov Badges.
// Blends Fogler 7th Ed. (Ch. 2, 5, 12, 15), BSL Transport 2nd Ed. (Ch. 18), and Perry's Sec 19.
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { clientPointToViewBox, safeSetPointerCapture } from '../../lib/svg-drag-math';
import {
  inverseLevenspielSvgDrag,
  LEVENSPIEL_VIEW_BOX,
  solveKineticsReactor,
  type KineticsReactorSolution,
} from '../workbenches/kinetics-solver-math';

export interface LevenspielReactorSvgCanvasProps {
  solved: KineticsReactorSolution;
  onScrubConversionAndPhi: (nextX: number, nextPhi: number) => void;
}

export const LevenspielReactorSvgCanvas: React.FC<LevenspielReactorSvgCanvasProps> = ({
  solved,
  onScrubConversionAndPhi,
}) => {
  const draggingRef = useRef<boolean>(false);

  const canvasSelect = useAgentSelectable(
    'figure',
    'fogler-levenspiel-plot',
    `Fogler Ch. 2 Levenspiel CSTR/PFR Sizing (X=${solved.conversionX.toFixed(2)}, V_CSTR/V_PFR=${solved.vRatioCstrPfr.toFixed(2)}×)`,
    {
      conversionX: solved.conversionX,
      vRatioCstrPfr: solved.vRatioCstrPfr,
      yPressureRatio: solved.yPressureRatio,
      effectivenessEta: solved.effectivenessEta,
      semenovPsi: solved.semenovPsi,
    },
  );

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = clientPointToViewBox(e, e.currentTarget, LEVENSPIEL_VIEW_BOX);
    const next = inverseLevenspielSvgDrag(pt.u, pt.v);
    onScrubConversionAndPhi(next.conversionX, next.thielePhi);
  };

  const { plotX, plotY, plotW, plotH, width, height } = LEVENSPIEL_VIEW_BOX;
  const baselineY = plotY + plotH;
  const op = solved.operatingPoint;

  const polylinePoints = solved.curvePoints.map((pt) => `${pt.sx},${pt.sy}`).join(' ');
  const ghostBaseline = solveKineticsReactor({
    conversionX: solved.conversionX, tempK: solved.tempK, pInletPsig: -5,
    epsilonA: solved.epsilonA, alphaErgun: solved.alphaErgun, thielePhi: 5.5, semenovPsi: 0.52,
  });
  const ghostPolylinePoints = ghostBaseline.curvePoints.map((pt) => `${pt.sx},${pt.sy}`).join(' ');
  const pfrAreaPoints = [
    `${plotX},${baselineY}`,
    ...solved.curvePoints.filter((pt) => pt.x <= solved.conversionX + 0.01).map((pt) => `${pt.sx},${pt.sy}`),
    `${op.sx},${op.sy}`,
    `${op.sx},${baselineY}`,
  ].join(' ');

  return (
    <div className="wb-panel" {...canvasSelect.selectableProps} data-testid="levenspiel-svg-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.35rem' }}>
        <strong>📈 Interactive Levenspiel Plot: CSTR Rectangle vs. PFR Shaded Integral</strong>
        <span className="mono" data-testid="levenspiel-hover-readout">
          X={solved.conversionX.toFixed(2)} · V_CSTR/V_PFR={solved.vRatioCstrPfr.toFixed(2)}× · P/P₀={solved.yPressureRatio.toFixed(3)} · η={solved.effectivenessEta.toFixed(3)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', cursor: 'grab', touchAction: 'none' }}
        data-testid="levenspiel-reactor-svg"
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
        <rect
          x={plotX}
          y={plotY}
          width={plotW}
          height={plotH}
          fill="var(--surface-elevated, rgba(15, 23, 42, 0.04))"
          stroke="var(--border-grid, #94a3b8)"
          strokeWidth={1}
        />

        {/* CSTR Volume Rectangle: width = X, height = FA0 / (-rA)(X) */}
        <rect
          x={plotX}
          y={op.sy}
          width={Math.max(2, op.sx - plotX)}
          height={Math.max(2, baselineY - op.sy)}
          fill="rgba(234, 88, 12, 0.16)"
          stroke="#ea580c"
          strokeDasharray="4 3"
          strokeWidth={1.5}
          data-testid="levenspiel-cstr-rect"
        />

        {/* PFR Volume Integral Area under curve from 0 to X */}
        <polygon
          points={pfrAreaPoints}
          fill="rgba(14, 116, 144, 0.24)"
          stroke="#0e7490"
          strokeWidth={1.2}
          data-testid="levenspiel-pfr-area"
        />

        {/* PhET-Style Before (Broken φ=5.5 Pore-Starved / -5 psig Baseline) Ghost Curve */}
        <g data-testid="wb6-ghost-baseline-line" opacity={0.42}>
          <polyline fill="none" stroke="#dc2626" strokeWidth={1.8} strokeDasharray="3 3" points={ghostPolylinePoints} />
          <circle cx={ghostBaseline.operatingPoint.sx} cy={ghostBaseline.operatingPoint.sy} r={5} fill="none" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="2 2" />
          <text x={plotX + plotW - 6} y={plotY + 16} fontSize={8.8} textAnchor="end" fill="#dc2626">
            Before Baseline (φ=5.5 Pore-Starved)
          </text>
        </g>

        {/* Reciprocal Rate Curve FA0 / (-rA) vs Conversion X */}
        <polyline
          fill="none"
          stroke="var(--accent-primary, #0284c7)"
          strokeWidth={2.5}
          points={polylinePoints}
          data-testid="levenspiel-rate-curve"
        />

        {/* Draggable Operating Point Handle */}
        <circle
          cx={op.sx}
          cy={op.sy}
          r={7}
          fill={solved.isRunaway ? '#dc2626' : '#0284c7'}
          stroke="#ffffff"
          strokeWidth={2}
          data-testid="levenspiel-operating-handle"
        />

        <text x={plotX + 8} y={plotY + 16} fontSize={10.5} fill="currentColor">
          CSTR Da = {solved.daCstr.toFixed(2)} (orange rect) vs. PFR Da = {solved.daPfrErgun.toFixed(2)} (teal area)
        </text>
        <text x={plotX + 8} y={plotY + 31} fontSize={10} fill="currentColor">
          Inlet P_abs = {solved.pInletPsia.toFixed(2)} psia ({solved.pInletPsig.toFixed(1)} psig) · Ergun P/P₀ = {solved.yPressureRatio.toFixed(3)} · Thiele η = {(solved.effectivenessEta * 100).toFixed(1)}%
        </text>
        <text x={plotX + plotW / 2 - 60} y={height - 6} fontSize={10.5} fill="currentColor">
          Conversion X (mol/mol) →
        </text>
        <text
          x={14}
          y={plotY + plotH / 2 + 30}
          fontSize={10.5}
          fill="currentColor"
          transform={`rotate(-90, 14, ${plotY + plotH / 2 + 30})`}
        >
          F_A0 / (-r_A) →
        </text>
      </svg>
    </div>
  );
};
