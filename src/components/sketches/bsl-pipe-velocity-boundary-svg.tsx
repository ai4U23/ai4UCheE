// Subject 2 (WB3) Interactive Companion Diagram 1:
// BSL Non-Newtonian & Laminar/Turbulent Pipe Velocity Profile v_z(r)/v_max + Boundary Layer δ_v, δ_T, δ_c Sketch
// (Bird-Stewart-Lightfoot 2nd Ed., Ch. 2, 8, 10, 18).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveBslVelocityAndBoundaryLayer } from '../../lib/hydraulics-transport-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface BslPipeVelocityBoundarySvgProps {
  powerLawN: number;
  prandtlPr: number;
  reynolds: number;
  onChangeRheologyAndPr: (nextN: number, nextPr: number) => void;
}

const PIPE_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 46, plotY: 28, plotW: 230, plotH: 150 };
const BL_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 320, plotY: 28, plotW: 224, plotH: 150 };

export const BslPipeVelocityBoundarySvg: React.FC<BslPipeVelocityBoundarySvgProps> = ({
  powerLawN,
  prandtlPr,
  reynolds,
  onChangeRheologyAndPr,
}) => {
  const draggingRef = useRef<boolean>(false);
  const bsl = solveBslVelocityAndBoundaryLayer(powerLawN, prandtlPr, reynolds);

  const bslSelect = useAgentSelectable(
    'figure',
    'bsl-pipe-velocity-boundary',
    `BSL Ch. 2/8/10/18 Pipe Velocity v_z(r) & Boundary Layer (n=${bsl.powerLawN.toFixed(2)}, Pr=${bsl.prandtlPr.toFixed(1)})`,
    {
      powerLawN: bsl.powerLawN,
      prandtlPr: bsl.prandtlPr,
      vAvgOverVmax: bsl.vAvgOverVmax,
      deltaRatioThermal: bsl.deltaRatioThermal,
      deltaRatioMass: bsl.deltaRatioMass,
    },
  );

  const toPipeX = (vNorm: number) => PIPE_BOX.plotX + 18 + vNorm * (PIPE_BOX.plotW - 32);
  const toPipeY = (rOverR: number) => PIPE_BOX.plotY + ((rOverR + 1) / 2) * PIPE_BOX.plotH;

  const powerLawPoly = bsl.profilePts.map((pt) => `${toPipeX(pt.vOverVmax).toFixed(1)},${toPipeY(pt.rOverR).toFixed(1)}`).join(' ');
  const turbPoly = bsl.profilePts.map((pt) => `${toPipeX(pt.vTurbulent).toFixed(1)},${toPipeY(pt.rOverR).toFixed(1)}`).join(' ');

  const buildBlCurve = (scale: number) =>
    Array.from({ length: 16 }, (_, i) => {
      const u = i / 15;
      const bx = BL_BOX.plotX + u * BL_BOX.plotW;
      const thickness = Math.min(1, 0.85 * scale * Math.sqrt(u)) * (BL_BOX.plotH - 22);
      const by = BL_BOX.plotY + BL_BOX.plotH - thickness;
      return `${bx.toFixed(1)},${by.toFixed(1)}`;
    }).join(' ');

  const deltaVPoly = buildBlCurve(1.0);
  const deltaTPoly = buildBlCurve(bsl.deltaRatioThermal);
  const deltaCPoly = buildBlCurve(bsl.deltaRatioMass);

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, box: ViewBoxRect) => {
    const pt = clientPointToViewBox(e, e.currentTarget, box);
    const nextN = Number((0.25 + pt.u * 1.6).toFixed(2));
    const nextPr = Number((0.7 + (1 - pt.v) * 49.3).toFixed(1));
    onChangeRheologyAndPr(nextN, nextPr);
  };

  return (
    <div className="wb-panel" {...bslSelect.selectableProps} data-testid="wb3-bsl-velocity-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>🌊 BSL Ch. 2/8/10/18 Pipe Velocity Profile v_z(r)/v_max &amp; Boundary Layers δ_v, δ_T, δ_c</strong>
        <span className="mono" data-testid="wb3-bsl-velocity-readout">
          n={bsl.powerLawN.toFixed(2)} ({bsl.rheologyLabel}) · ⟨v⟩/v_max={bsl.vAvgOverVmax.toFixed(3)} · Pr={bsl.prandtlPr.toFixed(1)} → δ_T/δ_v={bsl.deltaRatioThermal.toFixed(2)}, δ_c/δ_v={bsl.deltaRatioMass.toFixed(2)}
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="BSL Pipe Velocity Profile and Boundary Layer Comparison"
        data-testid="wb3-bsl-velocity-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, PIPE_BOX);
          const box = probe.vx >= 295 ? BL_BOX : PIPE_BOX;
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, box);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) {
            const probe = clientPointToViewBox(e, e.currentTarget, PIPE_BOX);
            scrubFromPointer(e, probe.vx >= 295 ? BL_BOX : PIPE_BOX);
          }
        }}
        onPointerUp={() => { draggingRef.current = false; }}
      >
        {/* Left Panel: Pipe Radial Velocity Profile v_z(r)/v_max */}
        <rect x={PIPE_BOX.plotX} y={PIPE_BOX.plotY} width={PIPE_BOX.plotW} height={PIPE_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={PIPE_BOX.plotX + 6} y={PIPE_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Pipe Velocity v_z(r)/v_max (Power-Law n vs. 1/7th Turb) [BSL Ch. 8]
        </text>
        <line
          x1={PIPE_BOX.plotX} y1={toPipeY(0)} x2={PIPE_BOX.plotX + PIPE_BOX.plotW} y2={toPipeY(0)}
          stroke="var(--border-grid)" strokeDasharray="3 3"
        />
        <polyline points={turbPoly} fill="none" stroke="var(--status-warn)" strokeWidth="1.9" strokeDasharray="4 2" />
        <polyline points={powerLawPoly} fill="rgba(2, 132, 199, 0.14)" stroke="var(--accent-primary)" strokeWidth="2.6" />
        <circle
          cx={toPipeX(bsl.vAvgOverVmax)} cy={toPipeY(0)} r="6.5"
          fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb3-bsl-rheology-handle"
        />
        <text x={PIPE_BOX.plotX + 8} y={PIPE_BOX.plotY + 16} fontSize="9" fill="currentColor">
          n = {bsl.powerLawN.toFixed(2)} · ⟨v_z⟩/v_max = {bsl.vAvgOverVmax.toFixed(3)}
        </text>
        <text x={PIPE_BOX.plotX + PIPE_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Drag X → Power-Law Index n · Drag Y → Prandtl Pr
        </text>

        {/* Right Panel: Momentum (δ_v), Thermal (δ_T), and Mass (δ_c) Boundary Layers */}
        <rect x={BL_BOX.plotX} y={BL_BOX.plotY} width={BL_BOX.plotW} height={BL_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={BL_BOX.plotX + 6} y={BL_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Boundary Layers δ_v(x), δ_T(x), δ_c(x) [BSL Ch. 10 &amp; 18]
        </text>
        <polyline points={deltaVPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" />
        <polyline points={deltaTPoly} fill="none" stroke="var(--status-warn)" strokeWidth="2.2" strokeDasharray="4 2" />
        <polyline points={deltaCPoly} fill="none" stroke="var(--status-pass)" strokeWidth="2" strokeDasharray="2 2" />
        <text x={BL_BOX.plotX + 10} y={BL_BOX.plotY + 18} fontSize="9" fill="var(--accent-primary)" fontWeight="700">
          δ_v (Momentum Re={bsl.reynolds.toExponential(1)})
        </text>
        <text x={BL_BOX.plotX + 10} y={BL_BOX.plotY + 33} fontSize="9" fill="var(--status-warn)" fontWeight="700">
          δ_T/δ_v = Pr^(-1/3) = {bsl.deltaRatioThermal.toFixed(2)} (Pr={bsl.prandtlPr.toFixed(1)})
        </text>
        <text x={BL_BOX.plotX + 10} y={BL_BOX.plotY + 48} fontSize="9" fill="var(--status-pass)" fontWeight="700">
          δ_c/δ_v = Sc^(-1/3) = {bsl.deltaRatioMass.toFixed(2)} (Sc={bsl.schmidtSc})
        </text>
        <text x={BL_BOX.plotX + BL_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Flat-Plate Distance x along Wall →
        </text>
      </svg>
    </div>
  );
};
