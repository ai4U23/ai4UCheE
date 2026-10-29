// WB2 right-hand tutor card: Carlson (1996) / Perry Sec 4 property-package decision tree,
// interactive decision flowchart, and live Vapor Pressure vs. Temperature SVG curve.
import React from 'react';
import type { PersonaMode } from '../../context/persona-theme-context';

export interface CarlsonAdvisorCardProps {
  personaMode: PersonaMode;
  polarity: 'nonpolar' | 'polar_non_electrolyte';
  onPolarityChange: (next: 'nonpolar' | 'polar_non_electrolyte') => void;
  hasLle: boolean;
  onHasLleChange: (next: boolean) => void;
  hasAssoc: boolean;
  onHasAssocChange: (next: boolean) => void;
  recommendedModel: string;
}

export const CarlsonAdvisorCard: React.FC<CarlsonAdvisorCardProps> = ({
  personaMode,
  polarity,
  onPolarityChange,
  hasLle,
  onHasLleChange,
  hasAssoc,
  onHasAssocChange,
  recommendedModel,
}) => (
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
        {/* Decision tree nodes */}
        <rect x="20" y="22" width="110" height="32" rx="5" fill="var(--bg-elevated)" stroke="var(--accent-primary)" />
        <text x="75" y="42" fontSize="10" fontWeight="700" textAnchor="middle" fill="currentColor">
          {polarity === 'nonpolar' ? 'Nonpolar Fluid' : 'Polar Mixture'}
        </text>
        <line x1="130" y1="38" x2="162" y2="38" stroke="currentColor" strokeWidth="1.8" />
        <rect x="162" y="22" width="108" height="32" rx="5" fill="var(--bg-elevated)" stroke={hasLle ? 'var(--status-warn)' : 'var(--border-grid)'} />
        <text x="216" y="42" fontSize="10" fontWeight="700" textAnchor="middle" fill="currentColor">
          {hasLle ? '2 Liquid Phases' : 'Single Liquid'}
        </text>
        <line x1="270" y1="38" x2="300" y2="38" stroke="currentColor" strokeWidth="1.8" />
        <rect x="300" y="18" width="98" height="40" rx="5" fill="rgba(232, 197, 71, 0.22)" stroke="var(--accent-secondary)" />
        <text x="349" y="36" fontSize="9.5" fontWeight="700" textAnchor="middle" fill="currentColor">
          {hasAssoc ? 'NRTL-HOC' : hasLle ? 'NRTL / UNIQUAC' : polarity === 'nonpolar' ? 'PR / SRK EOS' : 'Wilson / NRTL'}
        </text>
        <text x="349" y="50" fontSize="8.5" textAnchor="middle" fill="currentColor">
          Selected Model
        </text>
        {/* Vapor Pressure Exponential Curve Sketch */}
        <path d="M 30 116 Q 160 112 245 88 T 385 66" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" />
        <line x1="30" y1="88" x2="385" y2="88" stroke="var(--status-pass)" strokeDasharray="3 3" />
        <circle cx="245" cy="88" r="4.5" fill="var(--accent-maize)" stroke="var(--ink-primary)" strokeWidth="1.5" />
        <text x="34" y="82" fontSize="9.5" fontWeight="600" fill="var(--status-pass)">
          1 atm Normal Boiling Line (101.325 kPa = 14.696 psia = 0.00 psig) · {personaMode.toUpperCase()}
        </text>
      </svg>
    </div>
  </aside>
);
