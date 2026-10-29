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

  const pumpStroke = cavitationDanger ? 'var(--status-danger)' : 'var(--status-pass)';
  const valveStroke = isChoked || isFlashing ? 'var(--status-warn)' : 'var(--accent-primary)';

  return (
    <div className="wb-panel" data-testid="piping-pump-svg-sketch">
      <svg viewBox="0 0 680 210" width="100%" height="210" role="img" aria-label="Parametric Piping, Pump and Control Valve Sketch">
        {/* Suction Vessel V-101 */}
        <rect x="20" y="26" width="104" height="146" rx="12" fill="var(--bg-canvas)" stroke="currentColor" strokeWidth="2" />
        <line x1="22" y1="95" x2="122" y2="95" stroke="var(--accent-secondary)" strokeDasharray="4 2" />
        <text x="28" y="48" fontSize="11.5" fontWeight="700" fill="currentColor">V-101 Suction</text>
        <text x="28" y="66" fontSize="10" fill="currentColor">{pSuctionPsig} psig ({pSuctionPsia} psia)</text>
        <text x="28" y="116" fontSize="10.5" fontWeight="600" fill="currentColor">z_s = {zSuctionM.toFixed(1)} m</text>

        {/* Suction & Discharge Line L-101 */}
        <g {...pipeSelect.selectableProps} style={{ cursor: 'pointer' }}>
          <line x1="124" y1="130" x2="244" y2="130" stroke="currentColor" strokeWidth="5" />
          <line x1="296" y1="130" x2="412" y2="130" stroke="currentColor" strokeWidth="5" />
          <text x="130" y="96" fontSize="10.5" fontWeight="700" fill="currentColor">
            L-101 · {npsInch}&quot; Sch {schedule} (D_i={(dInnerM * 1000).toFixed(1)} mm) · {flowGpm} gpm
          </text>
        </g>

        {/* Centrifugal Pump P-101 */}
        <g {...pumpSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="sketch-pump-node">
          <circle cx="270" cy="130" r="24" fill="var(--bg-canvas)" stroke={pumpStroke} strokeWidth="3" />
          <polygon points="262,118 284,130 262,142" fill={pumpStroke} />
          <text x="242" y="176" fontSize="10.5" fontWeight="700" textAnchor="middle" fill={pumpStroke}>
            P-101 · NPSHa={npshaM.toFixed(2)}m {cavitationDanger ? '⚠️ CAVITATION' : '✓ SAFE'}
          </text>
        </g>

        {/* Control Valve FCV-101 */}
        <g {...valveSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="sketch-valve-node">
          <polygon points="415,115 445,130 415,145" fill="var(--bg-canvas)" stroke={valveStroke} strokeWidth="2.5" />
          <polygon points="475,115 445,130 475,145" fill="var(--bg-canvas)" stroke={valveStroke} strokeWidth="2.5" />
          <line x1="445" y1="130" x2="445" y2="98" stroke={valveStroke} strokeWidth="2.5" />
          <path d="M430,98 Q445,84 460,98 Z" fill="var(--bg-canvas)" stroke={valveStroke} strokeWidth="2" />
          <text x="435" y="194" fontSize="10.5" fontWeight="700" textAnchor="middle" fill={valveStroke}>
            FCV-101 · Cv={cvNormal.toFixed(1)} {isChoked ? '⚠️ CHOKED' : '✓ SUBCRIT'}
          </text>
        </g>

        {/* Mini Pump Curve vs System Curve */}
        <g transform="translate(510, 22)">
          <rect x="0" y="0" width="154" height="156" rx="6" fill="var(--bg-canvas)" stroke="var(--border-grid)" />
          <path d="M 14 34 Q 80 46 140 128" fill="none" stroke="var(--accent-secondary)" strokeWidth="2.5" />
          <path d="M 14 128 Q 75 112 140 38" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" />
          <circle cx="84" cy="78" r="5" fill="var(--accent-maize)" stroke="var(--ink-primary)" strokeWidth="1.5" />
          <text x="10" y="18" fontSize="10.5" fontWeight="700" fill="currentColor">Pump vs. System Curve</text>
          <text x="42" y="98" fontSize="9.5" fontWeight="600" fill="currentColor">Duty ({flowGpm} gpm)</text>
        </g>
      </svg>
    </div>
  );
};
