// WB1 right-hand DeepTutor card: chart-reading challenge, verdict & Khan Perseus-style error-signature coaching.
import React from 'react';
import type { PersonaMode } from '../../context/persona-theme-context';
import { detectNumericErrorSignature } from '../../lib/che-error-signature-detector';
import { getUiSubcomponentCopy } from '../../lib/i18n/vi-ui-subcomponents';

export interface VisualVerifierTutorCardProps {
  personaMode: PersonaMode;
  secPage: string;
  rawSecPage?: string;
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
  rawSecPage,
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
  const isEmptyReading = userReading.trim() === '';
  const isInvalidPage = Boolean(rawSecPage && rawSecPage.trim() !== secPage);
  const signatureMatch = isEmptyReading ? null : detectNumericErrorSignature(numReading, exactValue);
  const ui = getUiSubcomponentCopy();
  return (
    <aside className="wb-tutor-card">
      <h3>
        {personaMode === 'learn' ? ui.tutorHeaderLearn : ui.tutorHeaderPlant}
      </h3>
      <p>
        {ui.tutorTargetAnchor} <code>[Perry&apos;s 9th Ed., p. {secPage}]</code> · {ui.tutorExactValueLabel}{' '}
        <strong>{showCrosshair ? exactValue : ui.tutorHiddenLabel}</strong>
      </p>
      {isInvalidPage && (
        <p className="wb-coaching" data-testid="invalid-secpage-warning" style={{ marginTop: 0, marginBottom: '0.45rem' }}>
          {ui.tutorInvalidPagePrefix} <code>{rawSecPage}</code> {ui.tutorInvalidPageSuffix} <code>{secPage}</code>.
        </p>
      )}
      <label>
        {ui.tutorReadValueLabel}
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
          {ui.tutorVerifyBtn}
        </button>
        <button type="button" data-testid="load-pdf-crop-btn" onClick={onLoadCrop}>
          {ui.tutorLoadCropBtn}
        </button>
        <button type="button" onClick={onResetCrop}>
          {ui.tutorResetCropBtn}
        </button>
      </div>
      {revealed && (
        <div className={`wb-verdict ${pass ? 'pass' : 'fail'}`} data-testid="chart-verdict">
          {isEmptyReading ? (
            <span>
              <strong>REVIEW</strong> — {ui.tutorEmptyReviewMsg(exactValue)}
            </span>
          ) : (
            <span>
              <strong>{pass ? 'PASS' : 'REVIEW'}</strong> — {ui.tutorVerdictMsg(pass, errPct.toFixed(2), exactValue)}
            </span>
          )}
          {fanning4xDetected && (
            <p className="wb-coaching" data-testid="fanning-4x-coaching">
              ⚠️ <strong>Fanning vs. Darcy 4×:</strong> {ui.tutorFanningCoaching(numReading)}
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
