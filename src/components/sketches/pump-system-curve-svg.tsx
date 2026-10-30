// Chart 8: Interactive Pump Head H_pump(Q) vs. System Curve H_sys(Q) + NPSHa(Q) vs. NPSHr
// with 70%/100%/120% operating markers and a draggable 100% duty-point handle.
import React, { useRef } from 'react';
import { buildHydraulicsCurveGeometry } from '../../lib/hydraulics-curve-svg-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface PumpSystemCurveSvgProps {
  flowGpm: number;
  dInnerM: number;
  lengthM: number;
  zSuctionM: number;
  pSuctionPsig: number;
  npshaM: number;
  npshrM: number;
  isChoked: boolean;
  valveDpPsi?: number;
  onChangeFlowGpm?: (nextGpm: number) => void;
}

const VIEW_BOX: ViewBoxRect = {
  width: 320,
  height: 185,
  plotX: 44,
  plotY: 22,
  plotW: 252,
  plotH: 126,
};

export const PumpSystemCurveSvg: React.FC<PumpSystemCurveSvgProps> = ({
  flowGpm,
  dInnerM,
  lengthM,
  zSuctionM,
  pSuctionPsig,
  npshaM,
  npshrM,
  isChoked,
  valveDpPsi = 30,
  onChangeFlowGpm,
}) => {
  const draggingRef = useRef<boolean>(false);
  const geom = buildHydraulicsCurveGeometry({
    flowGpm,
    dInnerM,
    lengthM,
    zSuctionM,
    pSuctionPsig,
    npshrM,
    valveDpPsi,
  });

  const scrubFlowFromEvent = (e: React.PointerEvent<SVGSVGElement | SVGCircleElement>) => {
    if (!onChangeFlowGpm) return;
    const svgEl = e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
    const pt = clientPointToViewBox(e, svgEl, VIEW_BOX);
    onChangeFlowGpm(geom.svgXToFlowGpm(pt.vx));
  };

  return (
    <svg
      viewBox="0 0 320 185"
      width="100%"
      height="195"
      role="img"
      aria-label="Interactive Pump vs. System Curve and NPSHa Chart"
      data-testid="wb3-pump-system-curve-svg"
      style={{ cursor: 'ew-resize', touchAction: 'none' }}
      onPointerDown={(e) => {
        draggingRef.current = true;
        safeSetPointerCapture(e.currentTarget, e.pointerId);
        scrubFlowFromEvent(e);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) scrubFlowFromEvent(e);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
      }}
    >
      <rect x="44" y="22" width="252" height="126" rx="5" fill="var(--bg-canvas)" stroke="var(--border-grid)" />
      <text x="48" y="15" fontSize="10.5" fontWeight="700" fill="currentColor">
        Pump vs. System Curve &amp; NPSHa(Q) [Perry p. 10-25]
      </text>

      {/* NPSHr Cavitation Threshold Line */}
      <line
        x1="44"
        y1={geom.npshrY}
        x2="296"
        y2={geom.npshrY}
        stroke="var(--status-danger)"
        strokeDasharray="3 3"
      />
      <text x="292" y={geom.npshrY - 3} fontSize="8.5" textAnchor="end" fill="var(--status-danger)" fontWeight="700">
        NPSHr = {npshrM.toFixed(1)} m
      </text>

      {/* NPSHa(Q) Curve */}
      <polyline points={geom.npshaPoints} fill="none" stroke="var(--status-pass)" strokeWidth="1.8" strokeDasharray="4 2" />
      {/* Pump Head Curve H_pump(Q) */}
      <polyline points={geom.pumpHeadPoints} fill="none" stroke="var(--accent-secondary)" strokeWidth="2.4" />
      {/* System Curve H_sys(Q) */}
      <polyline points={geom.sysHeadPoints} fill="none" stroke="var(--accent-primary)" strokeWidth="2.4" />

      {/* 70% Min & 120% Rated Operating Markers */}
      <circle cx={geom.case70.x} cy={geom.case70.ySys} r="4" fill="var(--bg-elevated)" stroke="var(--accent-primary)" strokeWidth="1.5" />
      <text x={geom.case70.x} y={geom.case70.ySys - 6} fontSize="8" textAnchor="middle" fill="currentColor">70%</text>

      <circle cx={geom.case120.x} cy={geom.case120.ySys} r="4" fill="var(--bg-elevated)" stroke="var(--status-warn)" strokeWidth="1.5" />
      <text x={geom.case120.x} y={geom.case120.ySys - 6} fontSize="8" textAnchor="middle" fill="currentColor">120%</text>

      {/* Live vertical & horizontal duty-point projection lines */}
      <line x1={geom.case100.x} y1="22" x2={geom.case100.x} y2="148" stroke="var(--maize)" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="44" y1={geom.case100.ySys} x2={geom.case100.x} y2={geom.case100.ySys} stroke="var(--accent-primary)" strokeWidth="1.3" strokeDasharray="3 3" />

      {/* Draggable 100% Duty Point Handle */}
      <circle
        cx={geom.case100.x}
        cy={geom.case100.ySys}
        r="7"
        fill="var(--maize)"
        stroke="var(--ink-primary)"
        strokeWidth="1.8"
        style={{ cursor: 'grab' }}
        data-testid="wb3-duty-point-handle"
        onPointerDown={(e) => {
          e.stopPropagation();
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
          scrubFlowFromEvent(e);
        }}
      />

      {/* Live Hover / Operating Readout */}
      <text x="48" y="164" fontSize="9.2" fontWeight="700" fill="currentColor" data-testid="wb3-curve-hover-tooltip">
        Duty ({flowGpm} gpm) · H_sys={geom.case100.hSysM} m · NPSHa={npshaM.toFixed(2)} m vs NPSHr={npshrM.toFixed(1)} m · {isChoked ? 'VALVE CHOKED' : 'SUBCRIT'}
      </text>
      <text x="170" y="179" fontSize="9.2" fontWeight="600" textAnchor="middle" fill="var(--ink-muted)">
        Flow Q (gpm: 70% Min / 100% Duty / 120% Rated) →
      </text>
    </svg>
  );
};
