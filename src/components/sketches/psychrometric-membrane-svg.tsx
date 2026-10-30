// Subject 3 (WB4) Interactive Companion Diagram 3:
// Interactive Psychrometric Humidification / Cooling-Tower Chart (Dry-Bulb T_db, Wet-Bulb T_wb, RH phi)
// & Membrane Gas Permeation Stage Cut theta vs. Enrichment y_P(theta) (Perry's Sec. 12 & 20 · Seader 4th Ed. Ch. 14 & 18).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solvePsychrometricAndMembrane } from '../../lib/separations-psychrometry-membrane-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface PsychrometricMembraneSvgProps {
  tDryBulbC: number;
  relHumidityPct: number;
  stageCutTheta: number;
  selectivityAlpha: number;
  onChangePsychrometry: (nextTdbC: number, nextRhPct: number) => void;
  onChangeMembrane: (nextTheta: number, nextAlpha: number) => void;
}

const PSYCH_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 46, plotY: 28, plotW: 225, plotH: 150 };
const MEM_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 320, plotY: 28, plotW: 224, plotH: 150 };

export const PsychrometricMembraneSvg: React.FC<PsychrometricMembraneSvgProps> = ({
  tDryBulbC,
  relHumidityPct,
  stageCutTheta,
  selectivityAlpha,
  onChangePsychrometry,
  onChangeMembrane,
}) => {
  const dragSideRef = useRef<'psych' | 'mem' | null>(null);
  const pm = solvePsychrometricAndMembrane(tDryBulbC, relHumidityPct, stageCutTheta, selectivityAlpha);

  const psychSelect = useAgentSelectable(
    'figure',
    'perry-psychrometric-membrane',
    `Perry Sec. 12/20 & Seader Ch. 14/18 Psychrometric Chart (T_db=${pm.tDryBulbC}°C, T_wb=${pm.tWetBulbC}°C, RH=${pm.relHumidityPct}%) & Membrane Permeation (θ=${pm.stageCutTheta.toFixed(2)}, y_P=${pm.permeateYp.toFixed(3)})`,
    {
      tDryBulbC: pm.tDryBulbC,
      relHumidityPct: pm.relHumidityPct,
      absHumidityY: pm.absHumidityY,
      tWetBulbC: pm.tWetBulbC,
      humidEnthalpyKjKg: pm.humidEnthalpyKjKg,
      stageCutTheta: pm.stageCutTheta,
      selectivityAlpha: pm.selectivityAlpha,
      permeateYp: pm.permeateYp,
      retentateXr: pm.retentateXr,
    },
  );

  const toTdbX = (tC: number) => PSYCH_BOX.plotX + ((tC - 10) / 45) * PSYCH_BOX.plotW;
  const toHumY = (y: number) => PSYCH_BOX.plotY + (1 - Math.min(Math.max(y / 0.10, 0), 1)) * PSYCH_BOX.plotH;
  const satPoly = pm.satCurvePts.map((pt) => `${toTdbX(pt.tC).toFixed(1)},${toHumY(pt.ySat).toFixed(1)}`).join(' ');
  const rh50Poly = pm.satCurvePts.map((pt) => `${toTdbX(pt.tC).toFixed(1)},${toHumY(pt.y50Pct).toFixed(1)}`).join(' ');

  const toThetaX = (th: number) => MEM_BOX.plotX + ((th - 0.05) / 0.87) * MEM_BOX.plotW;
  const toMolY = (m: number) => MEM_BOX.plotY + (1 - Math.min(Math.max(m, 0), 1)) * MEM_BOX.plotH;
  const ypPoly = pm.membranePts.map((pt) => `${toThetaX(pt.theta).toFixed(1)},${toMolY(pt.yPermeate).toFixed(1)}`).join(' ');
  const xrPoly = pm.membranePts.map((pt) => `${toThetaX(pt.theta).toFixed(1)},${toMolY(pt.xRetentate).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, side: 'psych' | 'mem') => {
    if (side === 'psych') {
      const pt = clientPointToViewBox(e, e.currentTarget, PSYCH_BOX);
      const nextTdb = Number((10 + pt.u * 45).toFixed(1));
      const nextRh = Number((10 + (1 - pt.v) * 90).toFixed(0));
      onChangePsychrometry(nextTdb, nextRh);
    } else {
      const pt = clientPointToViewBox(e, e.currentTarget, MEM_BOX);
      const nextTheta = Number((0.05 + pt.u * 0.87).toFixed(2));
      const nextAlpha = Number((2.0 + (1 - pt.v) * 23.0).toFixed(1));
      onChangeMembrane(nextTheta, nextAlpha);
    }
  };

  return (
    <div className="wb-panel" {...psychSelect.selectableProps} data-testid="wb4-psychrometry-membrane-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>💨 Perry Sec. 12 Psychrometric Chart (T_db, T_wb, Y) &amp; Seader Ch. 14 Membrane Permeation</strong>
        <span className="mono" data-testid="wb4-psychrometry-membrane-readout">
          T_db={pm.tDryBulbC}°C, φ={pm.relHumidityPct}% → T_wb={pm.tWetBulbC}°C, T_dp={pm.tDewPointC}°C, Y={pm.absHumidityY.toFixed(4)} kg/kg, H={pm.humidEnthalpyKjKg} kJ/kg · θ={pm.stageCutTheta.toFixed(2)}, α_AB={pm.selectivityAlpha} → y_P={pm.permeateYp.toFixed(3)}, x_R={pm.retentateXr.toFixed(3)}
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="Psychrometric Humidification Chart and Membrane Gas Permeation Stage Cut Curve"
        data-testid="wb4-psychrometry-membrane-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, PSYCH_BOX);
          const side = probe.vx < 295 ? 'psych' : 'mem';
          dragSideRef.current = side;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, side);
        }}
        onPointerMove={(e) => {
          if (dragSideRef.current) {
            const probe = clientPointToViewBox(e, e.currentTarget, PSYCH_BOX);
            scrubFromPointer(e, probe.vx < 295 ? 'psych' : 'mem');
          }
        }}
        onPointerUp={() => { dragSideRef.current = null; }}
        onPointerCancel={() => { dragSideRef.current = null; }}
      >
        {/* Left Panel: Air-Water Psychrometric Chart */}
        <rect x={PSYCH_BOX.plotX} y={PSYCH_BOX.plotY} width={PSYCH_BOX.plotW} height={PSYCH_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={PSYCH_BOX.plotX + 6} y={PSYCH_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Psychrometric Chart Y(T_db, φ) [Perry Fig. 12-3]
        </text>
        <polyline points={satPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.6" />
        <polyline points={rh50Poly} fill="none" stroke="var(--border-grid)" strokeWidth="1.8" strokeDasharray="4 2" />
        {/* Adiabatic saturation / wet-bulb tie line */}
        <line
          x1={toTdbX(pm.tDryBulbC)} y1={toHumY(pm.absHumidityY)}
          x2={toTdbX(pm.tWetBulbC)} y2={toHumY(pm.absHumidityY + (pm.tDryBulbC - pm.tWetBulbC) * (1.006 / 2501))}
          stroke="var(--status-warn)" strokeWidth="1.8" strokeDasharray="3 2"
        />
        <circle
          cx={toTdbX(pm.tDryBulbC)} cy={toHumY(pm.absHumidityY)} r="6.5"
          fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb4-psychrometry-handle"
        />
        <text x={PSYCH_BOX.plotX + 8} y={PSYCH_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          T_wb={pm.tWetBulbC}°C · H={pm.humidEnthalpyKjKg} kJ/kg dry air
        </text>
        <text x={PSYCH_BOX.plotX + PSYCH_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Dry-Bulb T_db (°C — drag X=T_db, Y=RH φ%) →
        </text>

        {/* Right Panel: Membrane Gas Permeation Stage Cut theta vs. Purity y_P */}
        <rect x={MEM_BOX.plotX} y={MEM_BOX.plotY} width={MEM_BOX.plotW} height={MEM_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={MEM_BOX.plotX + 6} y={MEM_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Membrane Stage Cut θ vs. y_P, x_R [Seader Ch. 14]
        </text>
        <line x1={MEM_BOX.plotX} y1={toMolY(pm.feedZ)} x2={MEM_BOX.plotX + MEM_BOX.plotW} y2={toMolY(pm.feedZ)} stroke="var(--border-grid)" strokeDasharray="3 3" />
        <polyline points={ypPoly} fill="none" stroke="var(--accent-secondary)" strokeWidth="2.6" />
        <polyline points={xrPoly} fill="none" stroke="var(--status-warn)" strokeWidth="2.1" strokeDasharray="4 2" />
        <circle
          cx={toThetaX(pm.stageCutTheta)} cy={toMolY(pm.permeateYp)} r="6.5"
          fill={pm.isPressureRatioPinched ? 'var(--status-warn)' : 'var(--status-pass)'}
          stroke="#fff" strokeWidth="1.8"
          data-testid="wb4-membrane-handle"
        />
        <text x={MEM_BOX.plotX + 8} y={MEM_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          y_P={pm.permeateYp.toFixed(3)} · x_R={pm.retentateXr.toFixed(3)} · {pm.isPressureRatioPinched ? '⚠️ Pressure-Ratio Limited' : '✅ Selectivity Controlled'}
        </text>
        <text x={MEM_BOX.plotX + MEM_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Stage Cut θ = F_P/F_F (drag X=θ, Y=α_AB) →
        </text>
      </svg>
    </div>
  );
};
