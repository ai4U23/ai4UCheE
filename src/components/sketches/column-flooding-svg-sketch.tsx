// Parametric Distillation Column Vessel & Flooding Hydraulic Window Sketch (Fair Fig. 14-32, p. 14-37).
import React from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';

export interface ColumnFloodingSvgSketchProps {
  columnDiameterM: number;
  traySpacingM: number;
  totalStages: number;
  feedStage: number;
  fLv: number;
  cSbMs: number;
  percentFlood: number;
  dpPackingMmH2oM: number;
}

export const ColumnFloodingSvgSketch: React.FC<ColumnFloodingSvgSketchProps> = ({
  columnDiameterM,
  traySpacingM,
  totalStages,
  feedStage,
  fLv,
  cSbMs,
  percentFlood,
  dpPackingMmH2oM,
}) => {
  const status =
    percentFlood < 50 ? 'WEEPING_RISK' : percentFlood <= 85 ? 'NORMAL_WINDOW' : 'JET_FLOOD_DANGER';
  const statusColor =
    status === 'NORMAL_WINDOW'
      ? 'var(--status-pass)'
      : status === 'WEEPING_RISK'
        ? 'var(--status-warn)'
        : 'var(--status-danger)';

  const colSelect = useAgentSelectable(
    'equipment',
    'column-T201',
    `Distillation Column T-201 (D_c=${columnDiameterM.toFixed(2)} m, %Flood=${percentFlood.toFixed(1)}%)`,
    { columnDiameterM, traySpacingM, totalStages, percentFlood, status },
  );

  const barPct = Math.min(Math.max(percentFlood, 5), 115);

  return (
    <div className="wb-panel" data-testid="column-flooding-svg-sketch">
      <svg viewBox="0 0 460 220" width="100%" height="210" role="img" aria-label="Distillation Column Flooding Hydraulics Sketch">
        {/* Column Shell T-201 */}
        <g {...colSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="sketch-column-node">
          <rect x="45" y="20" width="90" height="175" rx="28" fill="none" stroke={statusColor} strokeWidth="3" />
          {[55, 85, 115, 145, 170].map((y, idx) => (
            <line key={y} x1="48" y1={y} x2="132" y2={y} stroke="currentColor" strokeDasharray={idx === 2 ? 'none' : '4 2'} />
          ))}
          <text x="56" y="42" fontSize="10" fill="currentColor">T-201 ({totalStages} stg)</text>
          <text x="52" y="108" fontSize="9" fill="currentColor">Feed #{feedStage}</text>
          <text x="52" y="190" fontSize="9" fill="currentColor">D_c={columnDiameterM.toFixed(2)}m</text>
        </g>

        {/* Hydraulic Operating Window Gauge Bar */}
        <g transform="translate(175, 28)">
          <text x="0" y="14" fontSize="11" fill="currentColor">
            Sec 14 Fair&apos;s Entrainment Flooding (Fig. 14-32, p. 14-37)
          </text>
          <text x="0" y="34" fontSize="10" fill="currentColor">
            F_LV = {fLv.toFixed(3)} · C_sb = {cSbMs.toFixed(3)} m/s · h_t = {(traySpacingM * 1000).toFixed(0)} mm
          </text>

          {/* Zones: 0-50 Weeping, 50-85 Normal, 85-120 Flooding */}
          <rect x="0" y="50" width="250" height="22" rx="4" fill="none" stroke="currentColor" />
          <rect x="104" y="51" width="73" height="20" fill="var(--status-pass)" fillOpacity="0.22" />
          <rect x="0" y="51" width={(barPct / 120) * 250} height="20" fill={statusColor} fillOpacity="0.65" />

          <text x="4" y="88" fontSize="9" fill="currentColor">Weeping (&lt;50%)</text>
          <text x="95" y="88" fontSize="9" fill="currentColor">Normal (50–85%)</text>
          <text x="188" y="88" fontSize="9" fill="currentColor">Jet Flood (&gt;85%)</text>

          <text x="0" y="116" fontSize="12" fill={statusColor} data-testid="column-flood-status">
            % Flood = {percentFlood.toFixed(1)}% · {status}
          </text>
          <text x="0" y="142" fontSize="10" fill="currentColor">
            Eckert GPDC ΔP/Z = {dpPackingMmH2oM.toFixed(1)} mmH₂O/m [Fig. 14-55, p. 14-57]
          </text>
        </g>
      </svg>
    </div>
  );
};
