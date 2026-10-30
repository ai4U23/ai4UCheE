// Subject 1 (WB2) Interactive Companion Diagram 2:
// Peng-Robinson Cubic EOS Z(P_r, T_r) & P_r-V_r Isotherm Dome (SVNAS 9th Ed. Ch. 3 · Perry's Sec. 4).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';
import { solvePengRobinsonEos } from '../../lib/thermo-vle-eos-math';

export interface PengRobinsonEosSvgProps {
  pr: number;
  tr: number;
  onChangePrTr: (nextPr: number, nextTr: number) => void;
}

const EOS_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 46, plotY: 26, plotW: 230, plotH: 152 };
const DOME_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 322, plotY: 26, plotW: 224, plotH: 152 };

export const PengRobinsonEosSvg: React.FC<PengRobinsonEosSvgProps> = ({ pr, tr, onChangePrTr }) => {
  const dragBoxRef = useRef<ViewBoxRect | null>(null);
  const eos = solvePengRobinsonEos(pr, tr);

  const eosSelect = useAgentSelectable(
    'figure',
    'svnas-pr-cubic-eos',
    `SVNAS Ch. 3 Peng-Robinson Cubic EOS Z(P_r=${eos.pr.toFixed(2)}, T_r=${eos.tr.toFixed(2)}) = ${eos.zFactor.toFixed(3)}`,
    { pr: eos.pr, tr: eos.tr, zFactor: eos.zFactor, phiFugacity: eos.phiFugacity, regime: eos.regime },
  );

  const toPrX = (p: number) => EOS_BOX.plotX + ((p - 0.1) / 5.9) * EOS_BOX.plotW;
  const toZY = (z: number) => EOS_BOX.plotY + (1 - Math.min(Math.max((z - 0.2) / 1.25, 0), 1)) * EOS_BOX.plotH;
  const zPts = eos.zCurve.map((pt) => `${toPrX(pt.pr).toFixed(1)},${toZY(pt.z).toFixed(1)}`).join(' ');

  const toVrX = (vr: number) => DOME_BOX.plotX + Math.min(Math.max((vr - 0.3) / 2.4, 0), 1) * DOME_BOX.plotW;
  const toDomeY = (p: number) => DOME_BOX.plotY + (1 - Math.min(Math.max(p / 2.2, 0), 1)) * DOME_BOX.plotH;
  const domePts = eos.domeCurve.map((pt) => `${toVrX(pt.vr).toFixed(1)},${toDomeY(pt.prDome).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, box: ViewBoxRect) => {
    const pt = clientPointToViewBox(e, e.currentTarget, box);
    const nextPr = Number((0.1 + pt.u * 5.9).toFixed(2));
    const nextTr = Number((0.75 + (1 - pt.v) * 1.25).toFixed(2));
    onChangePrTr(nextPr, nextTr);
  };

  return (
    <div className="wb-panel" {...eosSelect.selectableProps} data-testid="wb2-pr-eos-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>📈 SVNAS Ch. 3 Peng-Robinson Cubic EOS Z(P_r, T_r) &amp; P-V Isotherm Dome</strong>
        <span className="mono" data-testid="wb2-pr-eos-readout">
          P_r={eos.pr.toFixed(2)}, T_r={eos.tr.toFixed(2)} → Z={eos.zFactor.toFixed(3)} · φ={eos.phiFugacity.toFixed(3)} · V_r={eos.vReduced.toFixed(2)} · {eos.regime}
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="Peng-Robinson Compressibility Z and P-V Isotherm Dome"
        data-testid="wb2-pr-eos-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, EOS_BOX);
          const box = probe.vx >= 295 ? DOME_BOX : EOS_BOX;
          dragBoxRef.current = box;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, box);
        }}
        onPointerMove={(e) => {
          if (dragBoxRef.current) scrubFromPointer(e, dragBoxRef.current);
        }}
        onPointerUp={() => { dragBoxRef.current = null; }}
      >
        {/* Left Panel: Compressibility Factor Z(P_r, T_r) */}
        <rect x={EOS_BOX.plotX} y={EOS_BOX.plotY} width={EOS_BOX.plotW} height={EOS_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={EOS_BOX.plotX + 6} y={EOS_BOX.plotY - 8} fontSize="10.2" fontWeight="700" fill="currentColor">
          Generalized Z(P_r, T_r) Chart [SVNAS Fig. 3.14 · Perry p. 4-18]
        </text>
        <line x1={EOS_BOX.plotX} y1={toZY(1.0)} x2={EOS_BOX.plotX + EOS_BOX.plotW} y2={toZY(1.0)} stroke="var(--border-grid)" strokeDasharray="3 3" />
        <text x={EOS_BOX.plotX + 6} y={toZY(1.0) - 4} fontSize="8.8" fill="var(--ink-muted)">Ideal Gas Z = 1.0</text>
        <polyline points={zPts} fill="none" stroke="var(--accent-primary)" strokeWidth="2.6" />
        <circle
          cx={toPrX(eos.pr)} cy={toZY(eos.zFactor)} r="6.5"
          fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb2-pr-eos-handle"
        />
        <text x={EOS_BOX.plotX + 8} y={EOS_BOX.plotY + 18} fontSize="9.2" fill="currentColor">
          Z = {eos.zFactor.toFixed(3)} · Fugacity φ = {eos.phiFugacity.toFixed(3)}
        </text>
        <text x={EOS_BOX.plotX + EOS_BOX.plotW / 2} y="202" fontSize="9.5" textAnchor="middle" fill="currentColor">
          Reduced Pressure P_r = P / P_c (drag X=P_r, Y=T_r) →
        </text>

        {/* Right Panel: P_r - V_r Two-Phase Saturation Dome & Isotherm */}
        <rect x={DOME_BOX.plotX} y={DOME_BOX.plotY} width={DOME_BOX.plotW} height={DOME_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={DOME_BOX.plotX + 6} y={DOME_BOX.plotY - 8} fontSize="10.2" fontWeight="700" fill="currentColor">
          P_r–V_r Two-Phase Dome &amp; Critical Point [SVNAS Fig. 3.3]
        </text>
        <polyline points={domePts} fill="rgba(14, 116, 144, 0.14)" stroke="var(--accent-secondary)" strokeWidth="2.2" />
        <circle cx={toVrX(1.0)} cy={toDomeY(1.0)} r="5" fill="var(--status-danger)" stroke="#fff" strokeWidth="1.4" />
        <text x={toVrX(1.0) + 6} y={toDomeY(1.0) - 4} fontSize="8.8" fontWeight="700" fill="var(--status-danger)">
          Critical (T_r=1, P_r=1)
        </text>
        <circle
          cx={toVrX(eos.vReduced)} cy={toDomeY(Math.min(eos.pr, 2.15))} r="6.5"
          fill="var(--accent-primary)" stroke="#fff" strokeWidth="1.8"
          data-testid="wb2-pr-dome-handle"
        />
        <text x={DOME_BOX.plotX + 8} y={DOME_BOX.plotY + 18} fontSize="9.2" fill="currentColor">
          T_r = {eos.tr.toFixed(2)} · {eos.regime}
        </text>
        <text x={DOME_BOX.plotX + DOME_BOX.plotW / 2} y="202" fontSize="9.5" textAnchor="middle" fill="currentColor">
          Reduced Molar Volume V_r = Z·T_r / P_r →
        </text>
      </svg>
    </div>
  );
};
