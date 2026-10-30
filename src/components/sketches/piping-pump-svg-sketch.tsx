// Calcpad-style parametric SVG sketch for WB3: Interactive Process PFD (Chart 7) + Pump vs. System Curve (Chart 8).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import {
  nextNpsInch,
  svgYToValveDpPsi,
  svgYToZSuctionM,
  valveDpPsiToSvgY,
  zSuctionMToSvgY,
} from '../../lib/hydraulics-curve-svg-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';
import { PumpSystemCurveSvg } from './pump-system-curve-svg';

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
  lengthM?: number;
  valveDpPsi?: number;
  onChangeFlowGpm?: (nextGpm: number) => void;
  onChangeZSuctionM?: (nextZ: number) => void;
  onChangeNpsInch?: (nextNps: number) => void;
  onChangeValveDpPsi?: (nextDp: number) => void;
}

const PFD_BOX: ViewBoxRect = { width: 500, height: 210, plotX: 20, plotY: 26, plotW: 460, plotH: 150 };

export const PipingPumpSvgSketch: React.FC<PipingPumpSvgSketchProps> = ({
  npsInch, schedule, dInnerM, flowGpm, pSuctionPsig, zSuctionM,
  npshaM, npshrM, cvNormal, isChoked, isFlashing,
  lengthM = 100, valveDpPsi = 30,
  onChangeFlowGpm, onChangeZSuctionM, onChangeNpsInch, onChangeValveDpPsi,
}) => {
  const dragModeRef = useRef<'level' | 'valve' | null>(null);
  const cavitationDanger = npshaM < npshrM + 1.0 || npshaM / Math.max(npshrM, 0.1) < 1.35;
  const pSuctionPsia = (pSuctionPsig + 14.6959).toFixed(2);
  const levelY = zSuctionMToSvgY(zSuctionM);
  const valveStemY = valveDpPsiToSvgY(valveDpPsi);

  const pipeSelect = useAgentSelectable(
    'equipment', 'pipe-L101',
    `Line L-101 (${npsInch}" Sch ${schedule}, D_i=${(dInnerM * 1000).toFixed(1)} mm)`,
    { npsInch, schedule, dInnerM, flowGpm },
  );
  const pumpSelect = useAgentSelectable(
    'equipment', 'pump-P101',
    `Centrifugal Pump P-101 (NPSHa=${npshaM.toFixed(2)} m vs NPSHr=${npshrM.toFixed(2)} m)`,
    { npshaM, npshrM, cavitationDanger },
  );
  const valveSelect = useAgentSelectable(
    'equipment', 'valve-FCV101',
    `Control Valve FCV-101 (Cv=${cvNormal.toFixed(1)})`,
    { cvNormal, isChoked, isFlashing },
  );

  const pumpStroke = cavitationDanger ? 'var(--status-danger)' : 'var(--status-pass)';
  const valveStroke = isChoked || isFlashing ? 'var(--status-warn)' : 'var(--accent-primary)';

  const handlePfdMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragModeRef.current) return;
    const pt = clientPointToViewBox(e, e.currentTarget, PFD_BOX);
    if (dragModeRef.current === 'level') onChangeZSuctionM?.(svgYToZSuctionM(pt.vy));
    else if (dragModeRef.current === 'valve') onChangeValveDpPsi?.(svgYToValveDpPsi(pt.vy));
  };

  return (
    <div className="wb-panel" data-testid="piping-pump-svg-sketch">
      <div className="wb-split">
        <svg
          viewBox="0 0 500 210" width="100%" height="210" role="img"
          aria-label="Parametric Piping, Pump and Control Valve Sketch"
          onPointerMove={handlePfdMove}
          onPointerUp={() => { dragModeRef.current = null; }}
        >
          {/* Suction Vessel V-101 with Draggable Liquid Level Line & Handle */}
          <rect x="20" y="26" width="104" height="146" rx="12" fill="var(--bg-canvas)" stroke="currentColor" strokeWidth="2" />
          <rect x="22" y={levelY} width="100" height={Math.max(170 - levelY, 4)} rx="6" fill="var(--accent-secondary)" fillOpacity="0.18" />
          <line
            x1="22" y1={levelY} x2="122" y2={levelY}
            stroke="var(--accent-secondary)" strokeWidth="4" strokeDasharray="4 2"
            style={{ cursor: 'ns-resize' }}
            onPointerDown={(e) => {
              e.stopPropagation();
              dragModeRef.current = 'level';
              safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
              const svgEl = e.currentTarget.ownerSVGElement;
              if (svgEl) onChangeZSuctionM?.(svgYToZSuctionM(clientPointToViewBox(e, svgEl, PFD_BOX).vy));
            }}
          />
          <circle
            cx="72" cy={levelY} r="7" fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.8"
            style={{ cursor: 'ns-resize' }} data-testid="wb3-liquid-level-handle"
            onPointerDown={(e) => {
              e.stopPropagation();
              dragModeRef.current = 'level';
              safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
              const svgEl = e.currentTarget.ownerSVGElement;
              if (svgEl) onChangeZSuctionM?.(svgYToZSuctionM(clientPointToViewBox(e, svgEl, PFD_BOX).vy));
            }}
          />
          <text x="28" y="46" fontSize="11.5" fontWeight="700" fill="currentColor">V-101 Suction</text>
          <text x="28" y="62" fontSize="9.8" fill="currentColor">{pSuctionPsig} psig ({pSuctionPsia} psia)</text>
          <text x="28" y="164" fontSize="10.2" fontWeight="700" fill="currentColor">z_s = {zSuctionM.toFixed(1)} m</text>

          {/* Suction & Discharge Line L-101 (Click to cycle NPS) */}
          <g
            {...pipeSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="wb3-pipe-nps-trigger"
            onClick={(e) => {
              pipeSelect.selectableProps.onClick?.(e);
              onChangeNpsInch?.(nextNpsInch(npsInch));
            }}
          >
            <line x1="124" y1="130" x2="244" y2="130" stroke="currentColor" strokeWidth="5" />
            <line x1="296" y1="130" x2="412" y2="130" stroke="currentColor" strokeWidth="5" />
            <text x="130" y="96" fontSize="10.2" fontWeight="700" fill="currentColor">
              L-101 · {npsInch}&quot; Sch {schedule} (D_i={(dInnerM * 1000).toFixed(1)} mm) · {flowGpm} gpm
            </text>
          </g>

          {/* Centrifugal Pump P-101 */}
          <g {...pumpSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="sketch-pump-node">
            <circle cx="270" cy="130" r="24" fill="var(--bg-canvas)" stroke={pumpStroke} strokeWidth="3" />
            <polygon points="262,118 284,130 262,142" fill={pumpStroke} />
            <text x="255" y="176" fontSize="10.2" fontWeight="700" textAnchor="middle" fill={pumpStroke}>
              P-101 · NPSHa={npshaM.toFixed(2)}m {cavitationDanger ? '⚠️ CAVITATION' : '✓ SAFE'}
            </text>
          </g>

          {/* Control Valve FCV-101 with Draggable Actuator Stem */}
          <g {...valveSelect.selectableProps} style={{ cursor: 'pointer' }} data-testid="sketch-valve-node">
            <polygon points="415,115 445,130 415,145" fill="var(--bg-canvas)" stroke={valveStroke} strokeWidth="2.5" />
            <polygon points="475,115 445,130 475,145" fill="var(--bg-canvas)" stroke={valveStroke} strokeWidth="2.5" />
            <line x1="445" y1="130" x2="445" y2={valveStemY} stroke={valveStroke} strokeWidth="2.5" />
            <circle
              cx="445" cy={valveStemY} r="7" fill="var(--maize)" stroke={valveStroke} strokeWidth="2"
              style={{ cursor: 'ns-resize' }} data-testid="wb3-valve-dp-handle"
              onPointerDown={(e) => {
                e.stopPropagation();
                dragModeRef.current = 'valve';
                safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
                const svgEl = e.currentTarget.ownerSVGElement;
                if (svgEl) onChangeValveDpPsi?.(svgYToValveDpPsi(clientPointToViewBox(e, svgEl, PFD_BOX).vy));
              }}
            />
            <text x="435" y="194" fontSize="10" fontWeight="700" textAnchor="middle" fill={valveStroke}>
              FCV-101 · Cv={cvNormal.toFixed(1)} (ΔP={valveDpPsi} psi) {isChoked ? '⚠️ CHOKED' : '✓ SUBCRIT'}
            </text>
          </g>
        </svg>

        <PumpSystemCurveSvg
          flowGpm={flowGpm} dInnerM={dInnerM} lengthM={lengthM}
          zSuctionM={zSuctionM} pSuctionPsig={pSuctionPsig}
          npshaM={npshaM} npshrM={npshrM} isChoked={isChoked}
          valveDpPsi={valveDpPsi}
          onChangeFlowGpm={onChangeFlowGpm}
        />
      </div>
    </div>
  );
};
