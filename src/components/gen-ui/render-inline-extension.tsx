// Inline Generative UI extension renderer for agentNative.ui.output() payloads.
import React from 'react';
import type { GenUiPayload } from '../../actions/define-action';
import { KaTeXBlock } from '../ui/katex-block';

export interface RenderInlineExtensionProps {
  payload: GenUiPayload;
  onOpenCalcSheet?: (data: Record<string, unknown>) => void;
}

export const RenderInlineExtension: React.FC<RenderInlineExtensionProps> = ({
  payload,
  onOpenCalcSheet,
}) => {
  const { type, title, data } = payload;

  if (type === 'equation-proof-card') {
    const substituted = String(data.substituted_latex ?? '');
    return (
      <div className="wb-panel" data-testid="genui-equation-proof-card">
        <strong>📐 {title ?? '3-Stage White-Box Equation Proof'}</strong>
        <KaTeXBlock latex={String(data.symbolic_latex ?? 'Re = \\frac{\\rho \\cdot v \\cdot D}{\\mu}')} />
        {substituted && <KaTeXBlock latex={substituted} />}
        <div className="mono">
          <strong>Result: </strong>
          <strong>
            <KaTeXBlock latex={String(data.result_latex ?? '')} displayMode={false} />
          </strong>{' '}
          <code className="mono">{String(data.citation ?? "[Perry's 9th Ed., p. 6-10]")}</code>
        </div>
      </div>
    );
  }

  if (type === 'hydraulics-summary-card') {
    return (
      <div className="wb-panel" data-testid="genui-hydraulics-summary-card">
        <strong>🔧 {title ?? '3-Case Hydraulics & NPSHa Summary'}</strong>
        <p className="mono">
          70% / 100% / 120% Flow · NPSHa Status:{' '}
          <strong>{String(data.cavitation_status ?? 'SAFE')}</strong> · Valve:{' '}
          <strong>{data.is_choked ? 'CHOKED' : 'SUBCRITICAL'}</strong>
        </p>
      </div>
    );
  }

  // Default / 'calc-sheet-card'
  return (
    <div className="wb-panel" data-testid="genui-calc-sheet-card">
      <strong>📋 {title ?? 'Senior-Engineer QA/QC Calculation Sheet'}</strong>
      <p className="mono">
        Tag: <strong>{String(data.equipmentTag ?? 'P-101A/B')}</strong> · Rev:{' '}
        <code>{String(data.revision ?? 'Rev 0 — Issued for Review')}</code>
      </p>
      <div className="wb-actions-row">
        <button
          type="button"
          data-testid="genui-open-print-sheet"
          onClick={() => onOpenCalcSheet?.(data)}
        >
          Open Print-to-PDF Sheet
        </button>
        <button
          type="button"
          data-testid="genui-copy-markdown"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(String(data.markdown_latex ?? ''));
            }
          }}
        >
          Copy Markdown/LaTeX
        </button>
      </div>
    </div>
  );
};
