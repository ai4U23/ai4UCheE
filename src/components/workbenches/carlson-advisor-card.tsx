// WB2 right-hand tutor card: Carlson (1996) / Perry Sec 4 property-package decision tree & LLE trap.
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
      <strong>Proof Crop · Perry&apos;s Table 2-8 (p. 2-53) &amp; Table 2-69 (p. 2-120)</strong>
      <span>Mode: {personaMode.toUpperCase()}</span>
    </div>
  </aside>
);
