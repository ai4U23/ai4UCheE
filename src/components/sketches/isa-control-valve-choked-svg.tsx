// Subject 2 (WB3) Interactive Companion Diagram 2:
// ISA-75.01 Control Valve Choked Flow m_dot(sqrt(dP)) & Flashing Curve
// (Perry's 9th Ed., Sec. 8, p. 8-71 · Crowl & Louvar 4th Ed., Ch. 9).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveIsaValveChokedCurve } from '../../lib/hydraulics-transport-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface IsaControlValveChokedSvgProps {
  valveDpPsi: number;
  pSuctionPsig: number;
  cvRated: number;
  onChangeValveDpPsi: (nextDpPsi: number) => void;
}

const VALVE_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 54, plotY: 28, plotW: 486, plotH: 148 };

export const IsaControlValveChokedSvg: React.FC<IsaControlValveChokedSvgProps> = ({
  valveDpPsi,
  pSuctionPsig,
  cvRated,
  onChangeValveDpPsi,
}) => {
  const draggingRef = useRef<boolean>(false);
  const isa = solveIsaValveChokedCurve(valveDpPsi, pSuctionPsig, Math.max(cvRated, 35));

  const valveSelect = useAgentSelectable(
    'figure',
    'isa-7501-choked-valve-curve',
    `ISA-75.01 Control Valve Choked Flow Curve (ΔP=${isa.valveDpPsi.toFixed(1)} psi vs ΔP_choked=${isa.dpChokedPsi.toFixed(1)} psi)`,
    {
      valveDpPsi: isa.valveDpPsi,
      dpChokedPsi: isa.dpChokedPsi,
      p1Psia: isa.p1Psia,
      qActualGpm: isa.qActualGpm,
      isChoked: isa.isChoked,
    },
  );

  const qMaxPlot = Math.max(isa.qChokedMaxGpm * 1.35, 100);
  const toDpX = (dp: number) => VALVE_BOX.plotX + ((dp - 2) / 88) * VALVE_BOX.plotW;
  const toQY = (q: number) => VALVE_BOX.plotY + (1 - Math.min(Math.max(q / qMaxPlot, 0), 1)) * VALVE_BOX.plotH;

  const actualPoly = isa.curvePts.map((pt) => `${toDpX(pt.dpPsi).toFixed(1)},${toQY(pt.qGpm).toFixed(1)}`).join(' ');
  const idealPoly = isa.curvePts.map((pt) => `${toDpX(pt.dpPsi).toFixed(1)},${toQY(pt.qIdealGpm).toFixed(1)}`).join(' ');
  const chokedX = toDpX(Math.min(isa.dpChokedPsi, 90));
  const opX = toDpX(isa.valveDpPsi);
  const opY = toQY(isa.qActualGpm);

  const scrubDpFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = clientPointToViewBox(e, e.currentTarget, VALVE_BOX);
    const nextDp = Math.round(2 + pt.u * 88);
    onChangeValveDpPsi(nextDp);
  };

  return (
    <div className="wb-panel" {...valveSelect.selectableProps} data-testid="wb3-isa-valve-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>🎛️ ISA-75.01 Control Valve Choked Flow Q(√ΔP) &amp; Cavitation/Flashing Plateau</strong>
        <span className="mono" data-testid="wb3-isa-valve-readout">
          ΔP={isa.valveDpPsi.toFixed(0)} psi vs ΔP_choked={isa.dpChokedPsi.toFixed(1)} psi (P₁={isa.p1Psia.toFixed(1)} psia, F_F={isa.ffFactor.toFixed(3)}) → Q={isa.qActualGpm.toFixed(1)} gpm ·{' '}
          {isa.isChoked ? '⚠️ CHOKED PLATEAU' : '✅ SUBCRITICAL'}
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="ISA-75.01 Control Valve Choked Flow Curve"
        data-testid="wb3-isa-valve-svg"
        style={{ cursor: 'ew-resize', touchAction: 'none' }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubDpFromPointer(e);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) scrubDpFromPointer(e);
        }}
        onPointerUp={() => { draggingRef.current = false; }}
      >
        <rect x={VALVE_BOX.plotX} y={VALVE_BOX.plotY} width={VALVE_BOX.plotW} height={VALVE_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        {/* Shaded Choked Flow Regime Right of dP_choked */}
        {isa.dpChokedPsi < 90 && (
          <rect
            x={chokedX} y={VALVE_BOX.plotY}
            width={Math.max(0, VALVE_BOX.plotX + VALVE_BOX.plotW - chokedX)} height={VALVE_BOX.plotH}
            fill="rgba(220, 38, 38, 0.10)"
          />
        )}
        <line x1={chokedX} y1={VALVE_BOX.plotY} x2={chokedX} y2={VALVE_BOX.plotY + VALVE_BOX.plotH} stroke="var(--status-danger)" strokeWidth="1.8" strokeDasharray="4 2" />
        <text
          x={Math.min(chokedX + 6, 410)} y={VALVE_BOX.plotY + 16} fontSize="9.2" fontWeight="700"
          fill="var(--status-danger)" style={{ cursor: 'pointer' }}
          data-testid="wb3-isa-choked-snap"
          onClick={(e) => { e.stopPropagation(); onChangeValveDpPsi(Math.ceil(isa.dpChokedPsi + 8)); }}
        >
          ΔP_choked = F_L²(P₁ − F_F·P_v) = {isa.dpChokedPsi.toFixed(1)} psi
        </text>

        {/* Unchoked Ideal sqrt(dP) Curve vs. Actual Choked Plateau Curve */}
        <polyline points={idealPoly} fill="none" stroke="var(--border-grid)" strokeWidth="1.8" strokeDasharray="3 3" />
        <polyline points={actualPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.8" />

        <line x1={opX} y1={VALVE_BOX.plotY} x2={opX} y2={VALVE_BOX.plotY + VALVE_BOX.plotH} stroke="var(--maize)" strokeDasharray="3 2" />
        <circle
          cx={opX} cy={opY} r="7"
          fill={isa.isChoked ? 'var(--status-danger)' : 'var(--maize)'}
          stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb3-isa-choked-handle"
          onPointerDown={(e) => {
            e.stopPropagation();
            draggingRef.current = true;
            safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
          }}
        />
        <text x={VALVE_BOX.plotX + 8} y={VALVE_BOX.plotY + 18} fontSize="9.5" fontWeight="700" fill="currentColor">
          [Perry Sec. 8, Eqs. 8-77..8-81, p. 8-71 · Crowl &amp; Louvar Ch. 9] · Q_max = {isa.qChokedMaxGpm.toFixed(1)} gpm
        </text>
        <text x={VALVE_BOX.plotX + VALVE_BOX.plotW / 2} y="202" fontSize="9.5" textAnchor="middle" fill="currentColor">
          Control Valve Pressure Drop ΔP = P₁ − P₂ (psi — drag to test choked-flow plateau) →
        </text>
      </svg>
    </div>
  );
};
