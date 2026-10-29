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
      <svg viewBox="0 0 495 270" width="100%" height="310" role="img" aria-label="Distillation Column Flooding Hydraulics Sketch">
        {/* Column Shell T-201 */}
        <g {...colSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="sketch-column-node">
          <rect x="34" y="22" width="96" height="218" rx="30" fill="var(--bg-canvas)" stroke={statusColor} strokeWidth="3" />
          {[62, 96, 130, 164, 198].map((y, idx) => (
            <line key={y} x1="38" y1={y} x2="126" y2={y} stroke="currentColor" strokeDasharray={idx === 2 ? 'none' : '4 2'} />
          ))}
          <text x="82" y="45" fontSize="10.5" fontWeight="700" textAnchor="middle" fill="currentColor">T-201 ({totalStages} stg)</text>
          <text x="82" y="122" fontSize="10" fontWeight="600" textAnchor="middle" fill="currentColor">Feed #{feedStage}</text>
          <text x="82" y="224" fontSize="10" fontWeight="600" textAnchor="middle" fill="currentColor">D_c = {columnDiameterM.toFixed(2)} m</text>
        </g>

        {/* Hydraulic Operating Window Gauge Bar */}
        <g transform="translate(154, 28)">
          <text x="0" y="14" fontSize="11.5" fontWeight="700" fill="currentColor">
            Sec 14 Fair&apos;s Entrainment Flooding (Fig. 14-32, p. 14-37)
          </text>
          <text x="0" y="36" fontSize="10.5" fill="currentColor">
            F_LV = {fLv.toFixed(3)} · C_sb = {cSbMs.toFixed(3)} m/s · h_t = {(traySpacingM * 1000).toFixed(0)} mm
          </text>

          {/* Zones: 0-50 Weeping, 50-85 Normal, 85-120 Flooding */}
          <rect x="0" y="54" width="285" height="26" rx="5" fill="var(--bg-canvas)" stroke="currentColor" />
          <rect x="118" y="55" width="84" height="24" fill="var(--status-pass)" fillOpacity="0.22" />
          <rect x="0" y="55" width={(barPct / 120) * 285} height="24" rx="4" fill={statusColor} fillOpacity="0.72" />

          <text x="4" y="96" fontSize="9.5" fontWeight="600" fill="currentColor">Weeping (&lt;50%)</text>
          <text x="112" y="96" fontSize="9.5" fontWeight="600" fill="currentColor">Normal (50–85%)</text>
          <text x="214" y="96" fontSize="9.5" fontWeight="600" fill="currentColor">Jet Flood (&gt;85%)</text>

          <text x="0" y="128" fontSize="13" fontWeight="700" fill={statusColor} data-testid="column-flood-status">
            % Flood = {percentFlood.toFixed(1)}% · {status}
          </text>
          <text x="0" y="156" fontSize="10.5" fill="currentColor">
            Eckert GPDC ΔP/Z = {dpPackingMmH2oM.toFixed(1)} mmH₂O/m [Fig. 14-55, p. 14-57]
          </text>
          <text x="0" y="182" fontSize="10" fill="currentColor">
            Target Window: 65–82% of C_sb flood (Active Area = 88% A_col)
          </text>
        </g>
      </svg>
    </div>
  );
};
