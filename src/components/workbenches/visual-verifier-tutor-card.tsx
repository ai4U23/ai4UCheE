// WB1 right-hand DeepTutor card: chart-reading challenge, verdict & Khan Perseus-style error-signature coaching.
import React from 'react';
import type { PersonaMode } from '../../context/persona-theme-context';
import { detectNumericErrorSignature } from '../../lib/che-error-signature-detector';

export interface VisualVerifierTutorCardProps {
  personaMode: PersonaMode;
  secPage: string;
  exactValue: number;
  showCrosshair: boolean;
  revealed: boolean;
  userReading: string;
  onReadingChange: (next: string) => void;
  errPct: number;
  pass: boolean;
  fanning4xDetected: boolean;
  numReading: number;
  onVerify: () => void;
  onLoadCrop: () => void;
  onResetCrop: () => void;
}

export const VisualVerifierTutorCard: React.FC<VisualVerifierTutorCardProps> = ({
  personaMode,
  secPage,
  exactValue,
  showCrosshair,
  revealed,
  userReading,
  onReadingChange,
  errPct,
  pass,
  fanning4xDetected,
  numReading,
  onVerify,
  onLoadCrop,
  onResetCrop,
}) => {
  const signatureMatch = detectNumericErrorSignature(numReading, exactValue);
  return (
    <aside className="wb-tutor-card">
      <h3>
        {personaMode === 'learn'
          ? '🎓 DeepTutor Chart-Reading Challenge'
          : '🏭 Plant Mode — Calibrated Operating Point'}
      </h3>
      <p>
        Target anchor: <code>[Perry&apos;s 9th Ed., p. {secPage}]</code> · Exact value ={' '}
        <strong>{showCrosshair ? exactValue : '🔒 hidden until verified'}</strong>
      </p>
      <label>
        Your visually read value:
        <input
          aria-label="Chart reading value"
          type="number"
          step="any"
          value={userReading}
          onChange={(e) => onReadingChange(e.target.value)}
        />
      </label>
      <div className="wb-actions-row">
        <button type="button" onClick={onVerify}>
          Verify &amp; Reveal Crosshair
        </button>
        <button type="button" data-testid="load-pdf-crop-btn" onClick={onLoadCrop}>
          Load High-DPI Crop
        </button>
        <button type="button" onClick={onResetCrop}>
          Reset Crop
        </button>
      </div>
      {revealed && (
        <div className={`wb-verdict ${pass ? 'pass' : 'fail'}`} data-testid="chart-verdict">
          <strong>{pass ? 'PASS' : 'REVIEW'}</strong> — Error: {errPct.toFixed(2)}% (exact = {exactValue})
          {fanning4xDetected && (
            <p className="wb-coaching" data-testid="fanning-4x-coaching">
              ⚠️ <strong>Fanning vs. Darcy 4× trap detected:</strong> Perry&apos;s Fig. 6-9 (p. 6-10) plots{' '}
              <em>Fanning</em> friction factor f_F. Your reading ({numReading}) is ~4× f_F — i.e. the Moody{' '}
              <em>Darcy</em> factor f_D = 4·f_F. Divide by 4 when reading Fig. 6-9, or use f_D = 4·f_F in
              Darcy-Weisbach.
            </p>
          )}
          {!pass && signatureMatch && (
            <p className="wb-coaching" data-testid="numeric-error-signature-callout">
              <strong>{signatureMatch.badgeTitle}:</strong> {signatureMatch.plainExplanation} (
              <code>{signatureMatch.mathSignature}</code> · {signatureMatch.citation})
            </p>
          )}
        </div>
      )}
    </aside>
  );
};
