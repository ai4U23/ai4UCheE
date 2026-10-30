// Parametric Distillation Column Vessel (Chart 10) & Fair Entrainment Flooding Window (Chart 11)
// [Perry's 9th Ed., Fig. 14-32, p. 14-37 & Fig. 14-55, p. 14-57].
import React, { useRef, useState } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import {
  buildFairCsbCurvePoints,
  colDiamMToShellWidth,
  nextTraySpacingM,
  solveColDiamFromTargetFloodPct,
  solveRMultFromTargetFloodPct,
  svgWallXToColDiamM,
} from '../../lib/column-flooding-inverse-math';
import { clientPointToViewBox, clampDomainValue, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface ColumnFloodingSvgSketchProps {
  columnDiameterM: number;
  traySpacingM: number;
  totalStages: number;
  feedStage: number;
  fLv: number;
  cSbMs: number;
  percentFlood: number;
  dpPackingMmH2oM: number;
  rMult?: number;
  onChangeColDiamM?: (nextDiamM: number) => void;
  onChangeTraySpacingM?: (nextSpacingM: number) => void;
  onChangeRMult?: (nextRMult: number) => void;
}

const COL_BOX: ViewBoxRect = { width: 495, height: 270, plotX: 154, plotY: 82, plotW: 285, plotH: 26 };

export const ColumnFloodingSvgSketch: React.FC<ColumnFloodingSvgSketchProps> = ({
  columnDiameterM, traySpacingM, totalStages, feedStage,
  fLv, cSbMs, percentFlood, dpPackingMmH2oM, rMult = 1.3,
  onChangeColDiamM, onChangeTraySpacingM, onChangeRMult,
}) => {
  const dragModeRef = useRef<'wall' | 'flood' | null>(null);
  const [selectedTray, setSelectedTray] = useState<number>(3);
  const status = percentFlood < 50 ? 'WEEPING_RISK' : percentFlood <= 85 ? 'NORMAL_WINDOW' : 'JET_FLOOD_DANGER';
  const statusColor = status === 'NORMAL_WINDOW' ? 'var(--status-pass)' : status === 'WEEPING_RISK' ? 'var(--status-warn)' : 'var(--status-danger)';
  const colSelect = useAgentSelectable(
    'equipment', 'column-T201',
    `Distillation Column T-201 (D_c=${columnDiameterM.toFixed(2)} m, %Flood=${percentFlood.toFixed(1)}%)`,
    { columnDiameterM, traySpacingM, totalStages, percentFlood, status },
  );

  const shellW = colDiamMToShellWidth(columnDiameterM);
  const shellX = 82 - shellW / 2;
  const rightWallX = 82 + shellW / 2;
  const barPct = Math.min(Math.max(percentFlood, 5), 115);
  const barHandleX = (barPct / 120) * 285;
  const fairCurve = buildFairCsbCurvePoints(traySpacingM, fLv, cSbMs);

  const applyFloodDrag = (e: React.PointerEvent<SVGSVGElement | SVGCircleElement>) => {
    const svgEl = e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
    const pt = clientPointToViewBox(e, svgEl, COL_BOX);
    const targetPct = clampDomainValue(pt.u * 120, 20, 115);
    if (e.shiftKey && onChangeRMult) {
      onChangeRMult(solveRMultFromTargetFloodPct(rMult, percentFlood, targetPct));
    } else {
      onChangeColDiamM?.(solveColDiamFromTargetFloodPct(columnDiameterM, percentFlood, targetPct));
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragModeRef.current) return;
    if (dragModeRef.current === 'wall') {
      const pt = clientPointToViewBox(e, e.currentTarget, COL_BOX);
      onChangeColDiamM?.(svgWallXToColDiamM(pt.vx));
    } else if (dragModeRef.current === 'flood') {
      applyFloodDrag(e);
    }
  };

  const trayStageNum = Math.max(1, Math.round(((selectedTray - 0.5) / 5) * totalStages));
  const traySection = trayStageNum <= feedStage ? 'Rectifying' : 'Stripping';

  return (
    <div className="wb-panel" data-testid="column-flooding-svg-sketch">
      <svg
        viewBox="0 0 495 270" width="100%" height="310" role="img"
        aria-label="Distillation Column Flooding Hydraulics Sketch"
        style={{ touchAction: 'none' }}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={() => { dragModeRef.current = null; }}
      >
        {/* Chart 10: Column Shell T-201 with Draggable Wall & Interactive Trays 1..5 */}
        <g {...colSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="sketch-column-node">
          <rect x={shellX} y="22" width={shellW} height="218" rx="28" fill="var(--bg-canvas)" stroke={statusColor} strokeWidth="3" />
          {[62, 96, 130, 164, 198].map((y, idx) => {
            const trayIdx = idx + 1;
            const isSel = selectedTray === trayIdx;
            return (
              <g
                key={y}
                data-testid={`wb4-tray-hit-${trayIdx}`}
                style={{ cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); setSelectedTray(trayIdx); }}
              >
                <line x1={shellX + 5} y1={y} x2={rightWallX - 5} y2={y} stroke={isSel ? 'var(--accent-maize)' : 'currentColor'} strokeWidth={isSel ? '3' : '1.6'} strokeDasharray={idx === 2 ? 'none' : '4 2'} />
              </g>
            );
          })}
          {/* Draggable Right Shell Wall Handle for D_c */}
          <circle
            cx={rightWallX} cy="130" r="6.5" fill="var(--accent-maize)" stroke="var(--ink-primary)" strokeWidth="1.5"
            style={{ cursor: 'ew-resize' }} data-testid="wb4-col-diam-handle"
            onPointerDown={(e) => {
              e.stopPropagation();
              dragModeRef.current = 'wall';
              safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
              const svgEl = e.currentTarget.ownerSVGElement;
              if (svgEl) onChangeColDiamM?.(svgWallXToColDiamM(clientPointToViewBox(e, svgEl, COL_BOX).vx));
            }}
          />
          <text x="82" y="45" fontSize="10.5" fontWeight="700" textAnchor="middle" fill="currentColor">T-201 ({totalStages} stg)</text>
          <text x="82" y="122" fontSize="9.8" fontWeight="600" textAnchor="middle" fill="currentColor">Feed #{feedStage}</text>
          <text x="82" y="224" fontSize="10" fontWeight="700" textAnchor="middle" fill="currentColor">D_c = {columnDiameterM.toFixed(2)} m</text>
        </g>

        <text x="82" y="256" fontSize="9" fontWeight="700" textAnchor="middle" fill="currentColor" data-testid="wb4-tray-tooltip">
          Tray #{selectedTray} (Stage {trayStageNum} · {traySection}) · F_LV={fLv.toFixed(3)} · {percentFlood.toFixed(1)}% Flood
        </text>

        {/* Chart 11: Fair's Entrainment Flooding C_sb(F_LV) Curve & Inverse-Solving Window Bar */}
        <g transform="translate(154, 18)">
          <text x="0" y="12" fontSize="11" fontWeight="700" fill="currentColor">
            Sec 14 Fair&apos;s Entrainment Flooding (Fig. 14-32, p. 14-37)
          </text>
          <g
            role="button" tabIndex={0} style={{ cursor: 'pointer' }} data-testid="wb4-tray-spacing-trigger"
            onClick={() => onChangeTraySpacingM?.(nextTraySpacingM(traySpacingM))}
          >
            <text x="0" y="30" fontSize="10" fontWeight="700" fill="var(--accent-secondary)">
              F_LV = {fLv.toFixed(3)} · C_sb = {cSbMs.toFixed(3)} m/s · h_t = {(traySpacingM * 1000).toFixed(0)} mm (click to cycle)
            </text>
          </g>

          {/* Draggable % Flood Bar (0-120%) */}
          <rect
            x="0" y="42" width="285" height="24" rx="5" fill="var(--bg-canvas)" stroke="currentColor" style={{ cursor: 'ew-resize' }}
            onPointerDown={(e) => {
              e.stopPropagation(); dragModeRef.current = 'flood';
              safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
              applyFloodDrag(e as unknown as React.PointerEvent<SVGSVGElement>);
            }}
          />
          <rect x="118" y="43" width="84" height="22" fill="var(--status-pass)" fillOpacity="0.22" pointerEvents="none" />
          <rect x="0" y="43" width={barHandleX} height="22" rx="4" fill={statusColor} fillOpacity="0.72" pointerEvents="none" />
          <circle
            cx={barHandleX} cy="54" r="7" fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.8"
            style={{ cursor: 'ew-resize' }} data-testid="wb4-flood-bar-handle"
            onPointerDown={(e) => {
              e.stopPropagation(); dragModeRef.current = 'flood';
              safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
              applyFloodDrag(e);
            }}
          />
          <text x="4" y="80" fontSize="9" fontWeight="600" fill="currentColor">Weeping (&lt;50%)</text>
          <text x="112" y="80" fontSize="9" fontWeight="600" fill="currentColor">Normal (50–85%)</text>
          <text x="214" y="80" fontSize="9" fontWeight="600" fill="currentColor">Jet Flood (&gt;85%)</text>

          {/* Live Interactive Fair C_sb(F_LV) Mini Curve */}
          <rect
            x="0" y="112" width="285" height="48" rx="4" fill="var(--bg-canvas)" stroke="var(--border-grid)" style={{ cursor: 'ew-resize' }}
            onPointerDown={(e) => {
              e.stopPropagation(); dragModeRef.current = 'flood';
              safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
              applyFloodDrag(e as unknown as React.PointerEvent<SVGSVGElement>);
            }}
          />
          <polyline points={fairCurve.points} fill="none" stroke="var(--accent-primary)" strokeWidth="2.4" pointerEvents="none" data-testid="wb4-fair-csb-curve" />
          <line x1={fairCurve.opX} y1="112" x2={fairCurve.opX} y2="160" stroke="var(--maize)" strokeDasharray="3 2" pointerEvents="none" />
          <circle cx={fairCurve.opX} cy={fairCurve.opY} r="5.5" fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.6" pointerEvents="none" />
          <text x="6" y="124" fontSize="8.5" fontWeight="700" fill="currentColor" pointerEvents="none">Fair C_sb(F_LV) Locus (drag)</text>

          <text x="0" y="178" fontSize="12.5" fontWeight="700" fill={statusColor} data-testid="column-flood-status">
            % Flood = {percentFlood.toFixed(1)}% · {status}
          </text>
          <text x="0" y="198" fontSize="10" fill="currentColor">
            Eckert GPDC ΔP/Z = {dpPackingMmH2oM.toFixed(1)} mmH₂O/m [Fig. 14-55, p. 14-57]
          </text>
          <text x="0" y="216" fontSize="9.5" fill="currentColor">
            Target Window: 65–82% of C_sb flood (Active Area = 88% A_col)
          </text>
        </g>
      </svg>
    </div>
  );
};
