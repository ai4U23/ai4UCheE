// Senior-Engineer QA/QC Calculation Sheet Preview Modal: live per-workbench inputs & 3-stage
// white-box equations from the <current-screen> payload bus, safety audit badge, Markdown copy,
// and the existing Document Control Header / Print-to-PDF / compile-and-persist flow.
import React, { useEffect, useState } from 'react';
import { getClientAppState } from '../../actions/view-screen';
import { generateCalcSheetAction } from '../../actions/generate-calc-sheet';
import {
  buildCalcSheetActionInput,
  buildLiveCalcSheet,
  type LiveCalcSheetDocument,
} from './calc-sheet-builder';
import { FramerModalShell, SwarmPulseDot } from '../ui/framer-motion-primitives';
import { WhiteBoxEquationCard } from '../ui/white-box-equation-card';

export interface CalcSheetPreviewModalProps {
  isOpen: boolean;
  workbenchType: string;
  onClose: () => void;
}

export const CalcSheetPreviewModal: React.FC<CalcSheetPreviewModalProps> = ({
  isOpen,
  workbenchType,
  onClose,
}) => {
  const [projectName, setProjectName] = useState<string>(
    "ChemEng's Intelligent Workbench — Process Design Package",
  );
  const [projectNo, setProjectNo] = useState<string>('AI4U-CHE-2026');
  const [equipmentTag, setEquipmentTag] = useState<string>('P-101A/B');
  const [revision, setRevision] = useState<string>('Rev 0 — Issued for Review');
  const [preparedBy, setPreparedBy] = useState<string>('N. A. Duc (Process Eng)');
  const [checkedBy, setCheckedBy] = useState<string>('Lead ChE / QA-QC');
  const [compiledHtml, setCompiledHtml] = useState<string>('');
  const [compiledMd, setCompiledMd] = useState<string>('');
  const [copyState, setCopyState] = useState<string>('Copy Markdown QA/QC');

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sheet: LiveCalcSheetDocument = buildLiveCalcSheet(getClientAppState());

  const handleCopyMarkdown = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(sheet.markdownReport);
      else throw new Error('clipboard unavailable');
      setCopyState('Copied Markdown!');
    } catch {
      setCopyState('Clipboard blocked — see Markdown pane');
    } finally {
      window.setTimeout(() => setCopyState('Copy Markdown QA/QC'), 2200);
    }
  };

  const handleGenerate = async () => {
    const out = (await generateCalcSheetAction.run(
      buildCalcSheetActionInput(sheet, {
        projectName, projectNo, equipmentTag, revision, preparedBy, checkedBy, workbenchType,
      }),
    )) as Record<string, unknown>;
    setCompiledHtml(String(out.html_document ?? ''));
    setCompiledMd(String(out.markdown_latex ?? ''));
    window.setTimeout(() => {
      const el = document.querySelector('[data-testid="compiled-calc-sheet-output"]');
      if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 0);
  };

  return (
    <FramerModalShell
      backdropTestId="calc-sheet-backdrop"
      dialogTestId="calc-sheet-modal"
      ariaLabel="Senior-Engineer QA/QC Calculation Sheet Modal"
      onClose={onClose}
    >
        <header className="wb-toolbar modal-sticky-header" data-testid="calc-sheet-sticky-header">
          <h3>📋 Senior-Engineer QA/QC Calculation Sheet Exporter</h3>
          <button type="button" onClick={onClose} data-testid="close-calc-sheet-modal">
            Close
          </button>
        </header>

        <div className="wb-actions-row" data-testid="qaqc-header-form">
          <label>
            Project:
            <input aria-label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
          </label>
          <label>
            Project No:
            <input aria-label="Project No" value={projectNo} onChange={(e) => setProjectNo(e.target.value)} />
          </label>
          <label>
            Equipment Tag:
            <input aria-label="Equipment Tag" value={equipmentTag} onChange={(e) => setEquipmentTag(e.target.value)} />
          </label>
          <label>
            Revision:
            <input aria-label="Revision" value={revision} onChange={(e) => setRevision(e.target.value)} />
          </label>
          <label>
            Prepared By:
            <input aria-label="Prepared By" value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} />
          </label>
          <label>
            Checked By:
            <input aria-label="Checked By" value={checkedBy} onChange={(e) => setCheckedBy(e.target.value)} />
          </label>
        </div>

        <div className={`wb-verdict ${sheet.safetyStatus === 'PASS' ? 'pass' : 'fail'}`} data-testid="calc-sheet-safety-badge">
          <SwarmPulseDot tone={sheet.safetyStatus === 'PASS' ? 'emerald' : 'danger'} />
          {sheet.safetyStatus === 'PASS' ? '✅ SAFETY AUDIT: PASS' : '⛔ SAFETY AUDIT: ACTION REQUIRED'} — {sheet.safetyDetail}
        </div>

        <table className="mono" style={{ width: '100%', fontSize: '0.8rem' }} data-testid="calc-sheet-rows">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Symbol</th>
              <th>Value</th>
              <th>Units</th>
              <th>Basis</th>
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((r) => (
              <tr key={`${r.parameter}-${r.symbol}`}>
                <td>{r.parameter}</td>
                <td>{r.symbol}</td>
                <td>{r.value}</td>
                <td>{r.units}</td>
                <td style={{ textAlign: 'left', whiteSpace: 'normal' }}>{r.basis}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {sheet.equations.map((eq) => (
          <WhiteBoxEquationCard key={eq.id} equation={eq} />
        ))}

        <div className="wb-actions-row" style={{ marginTop: '0.6rem' }}>
          <button type="button" data-testid="compile-calc-sheet-btn" onClick={handleGenerate}>
            Compile &amp; Save QA/QC Calc Sheet
          </button>
          <button type="button" data-testid="copy-calc-sheet-md" onClick={() => void handleCopyMarkdown()}>
            {copyState}
          </button>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.print) window.print();
            }}
          >
            Print-to-PDF (@media print)
          </button>
        </div>

        {compiledHtml && (
          <div className="wb-split" data-testid="compiled-calc-sheet-output">
            <div>
              <h4>EPC Print-Ready Sheet Preview</h4>
              <div className="mono" data-testid="calc-sheet-summary">
                {projectName} · Tag: {equipmentTag} · {revision} · Prepared: {preparedBy} · Checked: {checkedBy}
              </div>
              <div className="mono" data-testid="calc-sheet-citation">
                {sheet.citationHeader}
              </div>
            </div>
            <div>
              <h4>Markdown / LaTeX Archive</h4>
              <pre className="mono" data-testid="calc-sheet-markdown">{compiledMd}</pre>
            </div>
          </div>
        )}
    </FramerModalShell>
  );
};
