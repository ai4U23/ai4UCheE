// WB2 right-hand tutor card: Carlson (1996) / Perry Sec 4 property-package decision tree,
// interactive clickable SVG decision flowchart nodes, and scrubbable Vapor Pressure vs. T curve.
import React, { useRef } from 'react';
import type { PersonaMode } from '../../context/persona-theme-context';
import { clientPointToViewBox, clampDomainValue, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface CarlsonAdvisorCardProps {
  personaMode: PersonaMode;
  polarity: 'nonpolar' | 'polar_non_electrolyte';
  onPolarityChange: (next: 'nonpolar' | 'polar_non_electrolyte') => void;
  hasLle: boolean;
  onHasLleChange: (next: boolean) => void;
  hasAssoc: boolean;
  onHasAssocChange: (next: boolean) => void;
  recommendedModel: string;
  tempK?: number;
  onChangeTempK?: (nextTempK: number) => void;
}

const BOIL_BOX: ViewBoxRect = {
  width: 420,
  height: 140,
  plotX: 30,
  plotY: 64,
  plotW: 355,
  plotH: 54,
};

export const CarlsonAdvisorCard: React.FC<CarlsonAdvisorCardProps> = ({
  personaMode,
  polarity,
  onPolarityChange,
  hasLle,
  onHasLleChange,
  hasAssoc,
  onHasAssocChange,
  recommendedModel,
  tempK = 373.15,
  onChangeTempK,
}) => {
  const draggingRef = useRef<boolean>(false);
  const tFrac = clampDomainValue((tempK - 280) / (500 - 280), 0, 1);
  const dotX = 30 + tFrac * 355;
  const dotY = 116 - Math.pow(tFrac, 1.35) * 50;
  const boilPathD = Array.from({ length: 21 }, (_, i) => {
    const f = i / 20;
    const bx = (30 + f * 355).toFixed(1);
    const by = (116 - Math.pow(f, 1.35) * 50).toFixed(1);
    return `${i === 0 ? 'M' : 'L'} ${bx} ${by}`;
  }).join(' ');

  const scrubBoilingCurve = (e: React.PointerEvent<SVGElement>) => {
    if (!onChangeTempK) return;
    const svgEl = e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
    const pt = clientPointToViewBox(e, svgEl, BOIL_BOX);
    const nextT = clampDomainValue(280 + pt.u * 220, 280, 500, 0.25);
    onChangeTempK(Number(nextT.toFixed(2)));
  };

  return (
    <aside className="wb-tutor-card" data-testid="carlson-advisor-panel">
      <h3>🧭 Carlson&apos;s (1996) / Perry Sec 4 Property Package Advisor</h3>
      <div className="wb-actions-row">
        <label>
          Polarity:
          <select
            aria-label="Mixture polarity"
            value={polarity}
            onChange={(e) => onPolarityChange(e.target.value as typeof polarity)}
          >
            <option value="nonpolar">Nonpolar / Hydrocarbon</option>
            <option value="polar_non_electrolyte">Polar Non-Electrolyte</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={hasLle} onChange={(e) => onHasLleChange(e.target.checked)} /> Two Liquid Phases (LLE)
        </label>
        <label>
          <input type="checkbox" checked={hasAssoc} onChange={(e) => onHasAssocChange(e.target.checked)} /> Carboxylic Acid Vapor Dimerization
        </label>
      </div>
      <p>
        Recommended Package: <strong data-testid="carlson-recommended">{recommendedModel}</strong>{' '}
        <code>[Perry&apos;s 9th Ed., Sec. 4, p. 4-18]</code>
      </p>
      {hasLle && (
        <p className="wb-coaching" data-testid="carlson-lle-warning">
          ⚠️ <strong>LLE Trap:</strong> NEVER use <code>Wilson</code> for Liquid-Liquid Equilibrium — Wilson cannot
          predict two liquid phases.
        </p>
      )}
      <div className="wb-crop-placeholder">
        <svg viewBox="0 0 420 140" width="100%" height="140" role="img" aria-label="Carlson Property Package Decision Tree & Boiling Curve">
          <rect x="8" y="8" width="404" height="124" rx="6" fill="var(--bg-canvas)" stroke="var(--border-grid)" />
          {/* Interactive Node 1: Polarity toggle */}
          <g
            role="button"
            tabIndex={0}
            data-testid="carlson-node-polarity"
            style={{ cursor: 'pointer' }}
            onClick={() => onPolarityChange(polarity === 'nonpolar' ? 'polar_non_electrolyte' : 'nonpolar')}
          >
            <rect x="20" y="22" width="110" height="32" rx="5" fill="var(--bg-elevated)" stroke="var(--accent-primary)" />
            <text x="75" y="42" fontSize="10" fontWeight="700" textAnchor="middle" fill="currentColor">
              {polarity === 'nonpolar' ? 'Nonpolar Fluid' : 'Polar Mixture'}
            </text>
          </g>
          <line x1="130" y1="38" x2="162" y2="38" stroke="currentColor" strokeWidth="1.8" />
          {/* Interactive Node 2: Two Liquid Phases (LLE) toggle */}
          <g
            role="button"
            tabIndex={0}
            data-testid="carlson-node-lle"
            style={{ cursor: 'pointer' }}
            onClick={() => onHasLleChange(!hasLle)}
          >
            <rect x="162" y="22" width="108" height="32" rx="5" fill="var(--bg-elevated)" stroke={hasLle ? 'var(--status-warn)' : 'var(--border-grid)'} />
            <text x="216" y="42" fontSize="10" fontWeight="700" textAnchor="middle" fill="currentColor">
              {hasLle ? '2 Liquid Phases' : 'Single Liquid'}
            </text>
          </g>
          <line x1="270" y1="38" x2="300" y2="38" stroke="currentColor" strokeWidth="1.8" />
          {/* Interactive Node 3: Vapor Dimerization / Selected Model toggle */}
          <g
            role="button"
            tabIndex={0}
            data-testid="carlson-node-assoc"
            style={{ cursor: 'pointer' }}
            onClick={() => onHasAssocChange(!hasAssoc)}
          >
            <rect x="300" y="18" width="98" height="40" rx="5" fill="rgba(232, 197, 71, 0.22)" stroke="var(--accent-secondary)" />
            <text x="349" y="36" fontSize="9.5" fontWeight="700" textAnchor="middle" fill="currentColor">
              {hasAssoc ? 'NRTL-HOC' : hasLle ? 'NRTL / UNIQUAC' : polarity === 'nonpolar' ? 'PR / SRK EOS' : 'Wilson / NRTL'}
            </text>
            <text x="349" y="50" fontSize="8.5" textAnchor="middle" fill="currentColor">
              Selected Model
            </text>
          </g>
          {/* Interactive Vapor Pressure Boiling Curve Scrubber */}
          <g
            data-testid="carlson-boiling-curve"
            style={{ cursor: 'ew-resize', touchAction: 'none' }}
            onPointerDown={(e) => {
              draggingRef.current = true;
              safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
              scrubBoilingCurve(e);
            }}
            onPointerMove={(e) => {
              if (draggingRef.current) scrubBoilingCurve(e);
            }}
            onPointerUp={() => {
              draggingRef.current = false;
            }}
          >
            <rect x="26" y="62" width="368" height="62" fill="transparent" />
            <path d={boilPathD} fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" />
            <line x1="30" y1="88" x2="385" y2="88" stroke="var(--status-pass)" strokeDasharray="3 3" />
            <line x1={dotX} y1="64" x2={dotX} y2="118" stroke="var(--maize)" strokeWidth="1.6" strokeDasharray="3 2" />
            <line x1="30" y1={dotY} x2={dotX} y2={dotY} stroke="var(--accent-primary)" strokeWidth="1.4" strokeDasharray="2 2" />
            <circle cx={dotX} cy={dotY} r="6" fill="var(--maize)" stroke="var(--ink-primary)" strokeWidth="1.6" />
            <text x="34" y="82" fontSize="9.5" fontWeight="600" fill="var(--status-pass)">
              T = {tempK.toFixed(1)} K ({(tempK - 273.15).toFixed(1)}°C) · 1 atm = 101.325 kPa · {personaMode.toUpperCase()}
            </text>
          </g>
        </svg>
      </div>
    </aside>
  );
};
