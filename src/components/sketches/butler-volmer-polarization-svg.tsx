// Subject 4 (WB6) Interactive Companion Diagram 3:
// Electrochemical Butler-Volmer / Tafel / Koutecky-Levich Polarization Curve i(eta)
// (Fogler 7th Ed. Ch. 19, Eqs. 19-6..19-11, pp. 1007-1015).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveButlerVolmerCurve } from '../../lib/kinetics-safety-electro-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface ButlerVolmerPolarizationSvgProps {
  overpotentialV: number;
  iLimMaCm2: number;
  onChangeElectro: (nextEtaV: number, nextILim: number) => void;
}

const BV_BOX: ViewBoxRect = { width: 580, height: 210, plotX: 54, plotY: 28, plotW: 486, plotH: 146 };

export const ButlerVolmerPolarizationSvg: React.FC<ButlerVolmerPolarizationSvgProps> = ({
  overpotentialV,
  iLimMaCm2,
  onChangeElectro,
}) => {
  const draggingRef = useRef<boolean>(false);
  const bv = solveButlerVolmerCurve(overpotentialV, iLimMaCm2);

  const bvSelect = useAgentSelectable(
    'figure',
    'fogler-butler-volmer-curve',
    `Fogler Ch. 19 Butler-Volmer / Koutecký-Levich Polarization (η=${bv.overpotentialV.toFixed(2)} V, i=${bv.iActualMaCm2.toFixed(1)} mA/cm², i_L=${bv.iLimMaCm2} mA/cm²)`,
    {
      overpotentialV: bv.overpotentialV,
      iLimMaCm2: bv.iLimMaCm2,
      iActualMaCm2: bv.iActualMaCm2,
      massTransferLimited: bv.massTransferLimited,
    },
  );

  const iMaxPlot = 180;
  const toEtaX = (eta: number) => BV_BOX.plotX + ((eta + 0.5) / 1.3) * BV_BOX.plotW;
  const toIY = (iVal: number) =>
    BV_BOX.plotY + (1 - Math.min(Math.max((iVal + iMaxPlot) / (2 * iMaxPlot), 0), 1)) * BV_BOX.plotH;

  const kinPoly = bv.curvePts.map((pt) => `${toEtaX(pt.etaV).toFixed(1)},${toIY(pt.iKin).toFixed(1)}`).join(' ');
  const klPoly = bv.curvePts.map((pt) => `${toEtaX(pt.etaV).toFixed(1)},${toIY(pt.iKl).toFixed(1)}`).join(' ');
  const zeroY = toIY(0);
  const iLimY = toIY(bv.iLimMaCm2);

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const pt = clientPointToViewBox(e, e.currentTarget, BV_BOX);
    const nextEta = Number((-0.5 + pt.u * 1.3).toFixed(2));
    const nextILim = Math.round(15 + (1 - pt.v) * 145);
    onChangeElectro(nextEta, nextILim);
  };

  return (
    <div className="wb-panel" {...bvSelect.selectableProps} data-testid="wb6-butler-volmer-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>⚡ Fogler Ch. 19 Butler-Volmer / Tafel / Koutecký-Levich Polarization Curve i(η)</strong>
        <span className="mono" data-testid="wb6-butler-volmer-readout">
          η={bv.overpotentialV.toFixed(2)} V · i={bv.iActualMaCm2.toFixed(1)} mA/cm² (i_kin={bv.iKineticMaCm2.toFixed(1)}, i_L={bv.iLimMaCm2} mA/cm²) ·{' '}
          {bv.massTransferLimited ? '⚠️ MASS-TRANSFER PLATEAU (i → i_L)' : '✅ KINETIC / TAFEL REGIME'}
        </span>
      </div>
      <svg
        viewBox="0 0 580 210" width="100%" height="205" role="img"
        aria-label="Butler-Volmer and Koutecky-Levich Polarization Curve"
        data-testid="wb6-butler-volmer-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e);
        }}
        onPointerMove={(e) => {
          if (draggingRef.current) scrubFromPointer(e);
        }}
        onPointerUp={() => { draggingRef.current = false; }}
      >
        <rect x={BV_BOX.plotX} y={BV_BOX.plotY} width={BV_BOX.plotW} height={BV_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        {/* Zero-current reference & Anodic Mass-Transfer Limiting Current Plateau i_L */}
        <line x1={BV_BOX.plotX} y1={zeroY} x2={BV_BOX.plotX + BV_BOX.plotW} y2={zeroY} stroke="var(--border-grid)" strokeDasharray="3 3" />
        <line x1={BV_BOX.plotX} y1={iLimY} x2={BV_BOX.plotX + BV_BOX.plotW} y2={iLimY} stroke="var(--status-warn)" strokeWidth="1.6" strokeDasharray="4 2" />
        <text x={BV_BOX.plotX + 8} y={Math.max(iLimY - 4, BV_BOX.plotY + 12)} fontSize="8.8" fontWeight="700" fill="var(--status-warn)">
          Limiting Current Plateau i_L = {bv.iLimMaCm2} mA/cm² (1/i = 1/i_kin + 1/i_L)
        </text>

        {/* Pure Kinetic Butler-Volmer Curve vs. Koutecky-Levich Mass-Transfer-Corrected Curve */}
        <polyline points={kinPoly} fill="none" stroke="var(--border-grid)" strokeWidth="1.8" strokeDasharray="3 3" />
        <polyline points={klPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.8" />

        <circle
          cx={toEtaX(bv.overpotentialV)} cy={toIY(bv.iActualMaCm2)} r="7"
          fill={bv.massTransferLimited ? 'var(--status-warn)' : 'var(--maize)'}
          stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb6-butler-volmer-handle"
        />
        <text x={BV_BOX.plotX + BV_BOX.plotW / 2} y="198" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Overpotential η = E − E_eq (V — drag X=η, drag Y=limiting current i_L) [Fogler Eqs. 19-6..19-11] →
        </text>
      </svg>
    </div>
  );
};
