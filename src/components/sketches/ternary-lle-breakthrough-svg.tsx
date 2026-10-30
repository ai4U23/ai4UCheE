// Subject 3 (WB4) Interactive Companion Diagram 2:
// Ternary Liquid-Liquid Extraction (LLE) Equilateral Triangular Phase Diagram & Adsorption Breakthrough C/C0(t/tau)
// (Seader, Henley & Roper 4th Ed. Ch. 8 & 15 · Perry's 9th Ed. Sec. 15 & 16).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveTernaryLleAndBreakthrough } from '../../lib/separations-kremser-lle-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface TernaryLleBreakthroughSvgProps {
  soluteFeedZ: number;
  peNumber: number;
  onChangeLleAndPe: (nextSoluteZ: number, nextPe: number) => void;
}

const LLE_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 38, plotY: 28, plotW: 230, plotH: 150 };
const ADS_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 320, plotY: 28, plotW: 224, plotH: 150 };

export const TernaryLleBreakthroughSvg: React.FC<TernaryLleBreakthroughSvgProps> = ({
  soluteFeedZ,
  peNumber,
  onChangeLleAndPe,
}) => {
  const draggingRef = useRef<boolean>(false);
  const sol = solveTernaryLleAndBreakthrough(soluteFeedZ, peNumber);

  const lleSelect = useAgentSelectable(
    'figure',
    'seader-ternary-lle-adsorption',
    `Seader Ch. 8/15 & Perry Sec 15/16 Ternary LLE & Adsorption Breakthrough (z_C=${sol.soluteFeedZ.toFixed(2)}, β=${sol.selectivityBeta.toFixed(1)}, Pe=${sol.peNumber})`,
    {
      soluteFeedZ: sol.soluteFeedZ,
      selectivityBeta: sol.selectivityBeta,
      peNumber: sol.peNumber,
      tBreakthroughRatio: sol.tBreakthroughRatio,
    },
  );

  // Equilateral triangle coordinates inside LLE_BOX
  const toTriX = (u: number) => LLE_BOX.plotX + u * LLE_BOX.plotW;
  const toTriY = (v: number) => LLE_BOX.plotY + (1 - v) * LLE_BOX.plotH;
  const triPoints = `${toTriX(0.05)},${toTriY(0)} ${toTriX(0.5)},${toTriY(0.92)} ${toTriX(0.95)},${toTriY(0)}`;
  const binodalPoly = sol.binodalPts.map((pt) => `${toTriX(pt.u).toFixed(1)},${toTriY(pt.v).toFixed(1)}`).join(' ');

  const rafX = toTriX(sol.raffinateX);
  const rafY = toTriY(sol.soluteFeedZ * 0.72);
  const extX = toTriX(sol.extractY);
  const extY = toTriY(sol.soluteFeedZ * 0.85);
  const mixX = 0.5 * (rafX + extX);
  const mixY = 0.5 * (rafY + extY);

  // Adsorption breakthrough coordinates inside ADS_BOX
  const toThetaX = (theta: number) => ADS_BOX.plotX + ((theta - 0.3) / 1.4) * ADS_BOX.plotW;
  const toCY = (cRatio: number) => ADS_BOX.plotY + (1 - Math.min(Math.max(cRatio, 0), 1)) * ADS_BOX.plotH;
  const adsPoly = sol.breakthroughPts.map((pt) => `${toThetaX(pt.tOverTau).toFixed(1)},${toCY(pt.cOverC0).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, box: ViewBoxRect) => {
    const pt = clientPointToViewBox(e, e.currentTarget, box);
    const nextZ = Number((0.08 + (1 - pt.v) * 0.44).toFixed(2));
    const nextPe = Math.round(8 + pt.u * 112);
    onChangeLleAndPe(nextZ, nextPe);
  };

  return (
    <div className="wb-panel" {...lleSelect.selectableProps} data-testid="wb4-ternary-lle-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>🔺 Seader Ch. 8 &amp; 15 · Ternary LLE Tie-Line Triangle &amp; Adsorption Breakthrough C/C₀(t/τ)</strong>
        <span className="mono" data-testid="wb4-lle-ads-readout">
          z_C={sol.soluteFeedZ.toFixed(2)} → β={sol.selectivityBeta.toFixed(2)} (x_R={sol.raffinateX.toFixed(2)}, y_E={sol.extractY.toFixed(2)}) · Pe={sol.peNumber} → t_b/τ={sol.tBreakthroughRatio.toFixed(2)} (LUB={sol.lubFraction.toFixed(2)})
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="Ternary LLE Equilateral Triangle and Adsorption Breakthrough Curve"
        data-testid="wb4-lle-ads-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, LLE_BOX);
          const box = probe.vx >= 295 ? ADS_BOX : LLE_BOX;
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, box);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) {
            const probe = clientPointToViewBox(e, e.currentTarget, LLE_BOX);
            scrubFromPointer(e, probe.vx >= 295 ? ADS_BOX : LLE_BOX);
          }
        }}
        onPointerUp={() => { draggingRef.current = false; }}
      >
        {/* Left Panel: Type I Ternary LLE Equilateral Triangle, Binodal Dome & Tie Line */}
        <rect x={LLE_BOX.plotX} y={LLE_BOX.plotY} width={LLE_BOX.plotW} height={LLE_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={LLE_BOX.plotX + 6} y={LLE_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Type I Ternary LLE Tie-Line &amp; Plait Point [Perry Fig. 15-7]
        </text>
        <polygon points={triPoints} fill="none" stroke="currentColor" strokeWidth="1.6" />
        <polyline points={binodalPoly} fill="rgba(14, 116, 144, 0.14)" stroke="var(--accent-primary)" strokeWidth="2.4" />
        {/* Plait Point Marker */}
        <circle cx={toTriX(0.5)} cy={toTriY(0.55)} r="4.5" fill="var(--status-danger)" stroke="#fff" strokeWidth="1.2" />
        {/* Conjugate Tie Line between Raffinate and Extract */}
        <line x1={rafX} y1={rafY} x2={extX} y2={extY} stroke="var(--status-warn)" strokeWidth="2.2" strokeDasharray="4 2" />
        <circle cx={rafX} cy={rafY} r="4.5" fill="var(--accent-primary)" />
        <circle cx={extX} cy={extY} r="4.5" fill="var(--accent-secondary)" />
        <circle
          cx={mixX} cy={mixY} r="6.5"
          fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb4-lle-tieline-handle"
        />
        <text x={LLE_BOX.plotX + 8} y={LLE_BOX.plotY + 16} fontSize="8.8" fill="currentColor">
          Selectivity β = {sol.selectivityBeta.toFixed(2)} (&gt; 1 required)
        </text>
        <text x={LLE_BOX.plotX + LLE_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Carrier A (left) ↔ Solvent S (right) · Solute C (apex)
        </text>

        {/* Right Panel: Fixed-Bed Adsorption Breakthrough Wavefront C/C0(t/tau) */}
        <rect x={ADS_BOX.plotX} y={ADS_BOX.plotY} width={ADS_BOX.plotW} height={ADS_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={ADS_BOX.plotX + 6} y={ADS_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Adsorption Breakthrough C/C₀(t/τ) &amp; MTZ [Perry Sec. 16]
        </text>
        <line x1={toThetaX(1.0)} y1={ADS_BOX.plotY} x2={toThetaX(1.0)} y2={ADS_BOX.plotY + ADS_BOX.plotH} stroke="var(--border-grid)" strokeDasharray="3 3" />
        <line x1={toThetaX(sol.tBreakthroughRatio)} y1={ADS_BOX.plotY} x2={toThetaX(sol.tBreakthroughRatio)} y2={ADS_BOX.plotY + ADS_BOX.plotH} stroke="var(--status-warn)" strokeDasharray="3 2" />
        <polyline points={adsPoly} fill="none" stroke="var(--accent-secondary)" strokeWidth="2.6" />
        <circle
          cx={toThetaX(sol.tBreakthroughRatio)} cy={toCY(0.05)} r="6"
          fill="var(--status-warn)" stroke="#fff" strokeWidth="1.6"
          data-testid="wb4-ads-breakthrough-handle"
        />
        <text x={ADS_BOX.plotX + 8} y={ADS_BOX.plotY + 18} fontSize="9" fill="currentColor">
          t_b/τ = {sol.tBreakthroughRatio.toFixed(2)} · LUB/L = {sol.lubFraction.toFixed(2)}
        </text>
        <text x={ADS_BOX.plotX + ADS_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Dimensionless Time t / τ (drag X=Pe, Y=Solute z_C) →
        </text>
      </svg>
    </div>
  );
};
