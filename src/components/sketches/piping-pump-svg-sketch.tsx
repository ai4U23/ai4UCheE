// Calcpad-style parametric SVG sketch for WB3: Suction Vessel -> Pipe L-101 -> Pump P-101 -> Valve FCV-101 + Mini Pump Curve.
import React from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';

export interface PipingPumpSvgSketchProps {
  npsInch: number;
  schedule: string;
  dInnerM: number;
  flowGpm: number;
  pSuctionPsig: number;
  zSuctionM: number;
  npshaM: number;
  npshrM: number;
  cvNormal: number;
  isChoked: boolean;
  isFlashing: boolean;
}

export const PipingPumpSvgSketch: React.FC<PipingPumpSvgSketchProps> = ({
  npsInch,
  schedule,
  dInnerM,
  flowGpm,
  pSuctionPsig,
  zSuctionM,
  npshaM,
  npshrM,
  cvNormal,
  isChoked,
  isFlashing,
}) => {
  const cavitationDanger = npshaM < npshrM + 1.0 || npshaM / Math.max(npshrM, 0.1) < 1.35;
  const pSuctionPsia = (pSuctionPsig + 14.6959).toFixed(2);

  const pipeSelect = useAgentSelectable(
    'equipment',
    'pipe-L101',
    `Line L-101 (${npsInch}" Sch ${schedule}, D_i=${(dInnerM * 1000).toFixed(1)} mm)`,
    { npsInch, schedule, dInnerM, flowGpm },
  );
  const pumpSelect = useAgentSelectable(
    'equipment',
    'pump-P101',
    `Centrifugal Pump P-101 (NPSHa=${npshaM.toFixed(2)} m vs NPSHr=${npshrM.toFixed(2)} m)`,
    { npshaM, npshrM, cavitationDanger },
  );
  const valveSelect = useAgentSelectable(
    'equipment',
    'valve-FCV101',
    `Control Valve FCV-101 (Cv=${cvNormal.toFixed(1)})`,
    { cvNormal, isChoked, isFlashing },
  );

  const pumpStroke = cavitationDanger ? 'var(--status-danger)' : 'var(--accent-secondary)';
  const valveStroke = isChoked || isFlashing ? 'var(--status-warn)' : 'var(--accent-primary)';

  return (
    <div className="wb-panel" data-testid="piping-pump-svg-sketch">
      <svg viewBox="0 0 680 210" width="100%" height="210" role="img" aria-label="Parametric Piping, Pump and Control Valve Sketch">
        {/* Suction Vessel V-101 */}
        <rect x="20" y="30" width="95" height="140" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
        <line x1="22" y1="95" x2="113" y2="95" stroke="var(--accent-secondary)" strokeDasharray="4 2" />
        <text x="28" y="52" fontSize="11" fill="currentColor">V-101 Suction</text>
        <text x="28" y="68" fontSize="10" fill="currentColor">{pSuctionPsig} psig ({pSuctionPsia} psia)</text>
        <text x="28" y="115" fontSize="10" fill="currentColor">z = {zSuctionM.toFixed(1)} m</text>

        {/* Suction & Discharge Line L-101 */}
        <g {...pipeSelect.selectableProps} style={{ cursor: 'pointer' }}>
          <line x1="115" y1="135" x2="245" y2="135" stroke="currentColor" strokeWidth="5" />
          <line x1="295" y1="135" x2="415" y2="135" stroke="currentColor" strokeWidth="5" />
          <text x="122" y="122" fontSize="11" fill="currentColor">
            L-101 · {npsInch}&quot; Sch {schedule} (D_i={(dInnerM * 1000).toFixed(1)} mm) · {flowGpm} gpm
          </text>
        </g>

        {/* Centrifugal Pump P-101 */}
        <g {...pumpSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="sketch-pump-node">
          <circle cx="270" cy="135" r="24" fill="none" stroke={pumpStroke} strokeWidth="3" />
          <polygon points="262,123 284,135 262,147" fill={pumpStroke} />
          <text x="230" y="178" fontSize="11" fill={pumpStroke}>
            P-101 · NPSHa={npshaM.toFixed(2)}m {cavitationDanger ? '⚠️ CAVITATION' : '✓ SAFE'}
          </text>
        </g>

        {/* Control Valve FCV-101 */}
        <g {...valveSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="sketch-valve-node">
          <polygon points="415,120 445,135 415,150" fill="none" stroke={valveStroke} strokeWidth="2.5" />
          <polygon points="475,120 445,135 475,150" fill="none" stroke={valveStroke} strokeWidth="2.5" />
          <line x1="445" y1="135" x2="445" y2="102" stroke={valveStroke} strokeWidth="2.5" />
          <path d="M430,102 Q445,88 460,102 Z" fill="none" stroke={valveStroke} strokeWidth="2" />
          <text x="398" y="178" fontSize="11" fill={valveStroke}>
            FCV-101 · Cv={cvNormal.toFixed(1)} {isChoked ? '⚠️ CHOKED' : '✓ SUBCRIT'}
          </text>
        </g>

        {/* Mini Pump Curve vs System Curve */}
        <g transform="translate(510, 25)">
          <rect x="0" y="0" width="150" height="150" fill="none" stroke="currentColor" strokeOpacity="0.4" />
          <path d="M 12 30 Q 80 42 138 125" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" />
          <path d="M 12 125 Q 75 110 138 35" fill="none" stroke="var(--accent-primary)" strokeWidth="2" />
          <circle cx="84" cy="76" r="4" fill="currentColor" />
          <text x="8" y="16" fontSize="10" fill="currentColor">Pump vs. System Curve</text>
          <text x="48" y="94" fontSize="9" fill="currentColor">Duty ({flowGpm} gpm)</text>
        </g>
      </svg>
    </div>
  );
};
