// Subject 2 (WB3) Interactive Companion Diagram 4:
// Crowl & Louvar Process Safety: Ternary Flammability Triangle (Fuel-O2-N2 LOC/Purge Path)
// & Pasquill-Gifford Downwind Plume Dispersion C(x) (Crowl & Louvar 4th Ed. Ch. 5 & 6 · Perry's Sec. 23).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveProcessSafetyFlammabilityAndPlume } from '../../lib/hydraulics-heat-safety-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface ProcessSafetyFlammabilityPlumeSvgProps {
  fuelMolPct: number;
  o2MolPct: number;
  downwindDistM: number;
  windSpeedMs: number;
  onChangeFlammability: (nextFuelPct: number, nextO2Pct: number) => void;
  onChangePlume: (nextDistM: number, nextWindMs: number) => void;
}

const FLAM_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 46, plotY: 28, plotW: 225, plotH: 150 };
const PLUME_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 320, plotY: 28, plotW: 224, plotH: 150 };

export const ProcessSafetyFlammabilityPlumeSvg: React.FC<ProcessSafetyFlammabilityPlumeSvgProps> = ({
  fuelMolPct,
  o2MolPct,
  downwindDistM,
  windSpeedMs,
  onChangeFlammability,
  onChangePlume,
}) => {
  const dragSideRef = useRef<'flam' | 'plume' | null>(null);
  const ps = solveProcessSafetyFlammabilityAndPlume(fuelMolPct, o2MolPct, downwindDistM, windSpeedMs);

  const safetySelect = useAgentSelectable(
    'figure',
    'crowl-louvar-flammability-plume',
    `Crowl & Louvar Ch. 5/6 Flammability Triangle (Fuel=${ps.fuelMolPct}%, O₂=${ps.o2MolPct}%, ${ps.flammabilityZone}) & Plume C(${ps.downwindDistM}m)=${ps.centerlineConcPpm} ppm`,
    {
      fuelMolPct: ps.fuelMolPct,
      o2MolPct: ps.o2MolPct,
      n2MolPct: ps.n2MolPct,
      flammabilityZone: ps.flammabilityZone,
      downwindDistM: ps.downwindDistM,
      windSpeedMs: ps.windSpeedMs,
      centerlineConcPpm: ps.centerlineConcPpm,
      exceedsErpg2: ps.exceedsErpg2,
    },
  );

  const toO2X = (o2: number) => FLAM_BOX.plotX + (o2 / 21.0) * FLAM_BOX.plotW;
  const toFuelY = (fuel: number) => FLAM_BOX.plotY + (1 - Math.min(Math.max(fuel / 45.0, 0), 1)) * FLAM_BOX.plotH;
  const flammablePoly = `${toO2X(12)},${toFuelY(6.2)} ${toO2X(21)},${toFuelY(5.0)} ${toO2X(21)},${toFuelY(15.0)}`;

  const toDistX = (xM: number) => PLUME_BOX.plotX + ((xM - 50) / 1950) * PLUME_BOX.plotW;
  const toConcY = (ppm: number) =>
    PLUME_BOX.plotY + (1 - Math.min(Math.max(Math.log10(Math.max(ppm, 0.2)) / 3.1, 0), 1)) * PLUME_BOX.plotH;
  const plumePoly = ps.plumePts.map((pt) => `${toDistX(pt.xM).toFixed(1)},${toConcY(pt.concPpm).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, side: 'flam' | 'plume') => {
    if (side === 'flam') {
      const pt = clientPointToViewBox(e, e.currentTarget, FLAM_BOX);
      const nextO2 = Number((1.0 + pt.u * 20.0).toFixed(1));
      const nextFuel = Number((0.5 + (1 - pt.v) * 44.5).toFixed(1));
      onChangeFlammability(nextFuel, nextO2);
    } else {
      const pt = clientPointToViewBox(e, e.currentTarget, PLUME_BOX);
      const nextDist = Number((50 + pt.u * 1950).toFixed(0));
      const nextWind = Number((1.0 + (1 - pt.v) * 11.0).toFixed(1));
      onChangePlume(nextDist, nextWind);
    }
  };

  return (
    <div className="wb-panel" {...safetySelect.selectableProps} data-testid="wb3-safety-flam-plume-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>🛡️ Crowl &amp; Louvar Ch. 5/6 Flammability Triangle (LOC) &amp; Pasquill-Gifford Plume C(x)</strong>
        <span className="mono" data-testid="wb3-safety-flam-plume-readout">
          Fuel={ps.fuelMolPct}%, O₂={ps.o2MolPct}%, N₂={ps.n2MolPct}% (LOC={ps.locO2Pct}% O₂) → {ps.flammabilityZone} · x={ps.downwindDistM} m (u={ps.windSpeedMs} m/s) → C={ps.centerlineConcPpm} ppm{' '}
          {ps.exceedsErpg2 ? '⚠️ > ERPG-2 (50 ppm)' : '✅ < ERPG-2'}
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="Crowl and Louvar Flammability Diagram and Pasquill-Gifford Plume Dispersion"
        data-testid="wb3-safety-flam-plume-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, FLAM_BOX);
          const side = probe.vx < 295 ? 'flam' : 'plume';
          dragSideRef.current = side;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, side);
        }}
        onPointerMove={(e) => {
          if (dragSideRef.current) {
            const probe = clientPointToViewBox(e, e.currentTarget, FLAM_BOX);
            scrubFromPointer(e, probe.vx < 295 ? 'flam' : 'plume');
          }
        }}
        onPointerUp={() => { dragSideRef.current = null; }}
        onPointerCancel={() => { dragSideRef.current = null; }}
      >
        {/* Left Panel: Flammability Envelope (Fuel vs O2 with LOC = 12% O2) */}
        <rect x={FLAM_BOX.plotX} y={FLAM_BOX.plotY} width={FLAM_BOX.plotW} height={FLAM_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={FLAM_BOX.plotX + 6} y={FLAM_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Flammability Envelope &amp; LOC (12% O₂) [Crowl Ch. 6]
        </text>
        <line x1={toO2X(ps.locO2Pct)} y1={FLAM_BOX.plotY} x2={toO2X(ps.locO2Pct)} y2={FLAM_BOX.plotY + FLAM_BOX.plotH} stroke="var(--status-warn)" strokeDasharray="3 3" />
        <polygon points={flammablePoly} fill="rgba(220, 38, 38, 0.22)" stroke="var(--status-danger)" strokeWidth="2.2" />
        <circle
          cx={toO2X(ps.o2MolPct)} cy={toFuelY(ps.fuelMolPct)} r="6.5"
          fill={ps.flammabilityZone === 'FLAMMABLE_EXPLOSIVE' ? 'var(--status-danger)' : 'var(--status-pass)'}
          stroke="#fff" strokeWidth="1.8"
          data-testid="wb3-flammability-handle"
        />
        <text x={FLAM_BOX.plotX + 8} y={FLAM_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          {ps.flammabilityZone === 'FLAMMABLE_EXPLOSIVE' ? '🔥 EXPLOSIVE ZONE' : `✅ ${ps.flammabilityZone}`}
        </text>
        <text x={FLAM_BOX.plotX + FLAM_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          O₂ mol% (drag X=O₂%, Y=Fuel% · LOC=12%) →
        </text>

        {/* Right Panel: Pasquill-Gifford Gaussian Plume Downwind C(x) */}
        <rect x={PLUME_BOX.plotX} y={PLUME_BOX.plotY} width={PLUME_BOX.plotW} height={PLUME_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={PLUME_BOX.plotX + 6} y={PLUME_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Pasquill-Gifford Plume C(x) [Crowl Ch. 5 · Perry Sec. 23]
        </text>
        <line
          x1={PLUME_BOX.plotX} y1={toConcY(ps.erpg2ThresholdPpm)}
          x2={PLUME_BOX.plotX + PLUME_BOX.plotW} y2={toConcY(ps.erpg2ThresholdPpm)}
          stroke="var(--status-danger)" strokeDasharray="3 3"
        />
        <polyline points={plumePoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.6" />
        <circle
          cx={toDistX(ps.downwindDistM)} cy={toConcY(ps.centerlineConcPpm)} r="6.5"
          fill={ps.exceedsErpg2 ? 'var(--status-danger)' : 'var(--maize)'}
          stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb3-plume-handle"
        />
        <text x={PLUME_BOX.plotX + 8} y={PLUME_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          σ_y={ps.sigmaYM}m, σ_z={ps.sigmaZM}m · ERPG-2 = 50 ppm
        </text>
        <text x={PLUME_BOX.plotX + PLUME_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Downwind Distance x (m — drag X=x, Y=wind u) →
        </text>
      </svg>
    </div>
  );
};
