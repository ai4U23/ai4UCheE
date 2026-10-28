// Senior-Engineer QA/QC Calculation Sheet Preview Modal with editable Document Control Header,
// Print-to-PDF (`window.print()`), HTML download, and Markdown/LaTeX source view.
import React, { useEffect, useState } from 'react';
import { generateCalcSheetAction } from '../../actions/generate-calc-sheet';
import { KaTeXBlock } from '../ui/katex-block';

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
    "Perry's Intelligent Workbench — Process Design Package",
  );
  const [projectNo, setProjectNo] = useState<string>('AI4U-CHE-2026');
  const [equipmentTag, setEquipmentTag] = useState<string>('P-101A/B');
  const [revision, setRevision] = useState<string>('Rev 0 — Issued for Review');
  const [preparedBy, setPreparedBy] = useState<string>('N. A. Duc (Process Eng)');
  const [checkedBy, setCheckedBy] = useState<string>('Lead ChE / QA-QC');
  const [compiledHtml, setCompiledHtml] = useState<string>('');
  const [compiledMd, setCompiledMd] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    const out = (await generateCalcSheetAction.run({
      project_name: projectName,
      project_no: projectNo,
      equipment_tag: equipmentTag,
      service_description: `${workbenchType.toUpperCase()} Design Verification`,
      calc_no: `CALC-${equipmentTag}`,
      revision,
      prepared_by: preparedBy,
      checked_by: checkedBy,
      workbench_type: workbenchType,
      inputs_summary: {
        Workbench: workbenchType,
        'Equipment Tag': equipmentTag,
        'Pressure Datum': 'psig -> psia explicit',
        'Friction Factor': 'Darcy f_D = 4 * Fanning f_F',
      },
      equations: [
        {
          lhs_symbol: 'Re',
          symbolic_latex: 'Re = \\frac{\\rho \\cdot v \\cdot D}{\\mu}',
          substituted_latex: '= \\frac{998.2 \\cdot 2.0 \\cdot 0.1023}{0.001}',
          result_latex: '= 2.042 \\times 10^{5}',
          citation: "[Perry's 9th Ed., Fig. 6-9 caption, p. 6-10]",
        },
      ],
    })) as Record<string, unknown>;
    setCompiledHtml(String(out.html_document ?? ''));
    setCompiledMd(String(out.markdown_latex ?? ''));
  };

  return (
    <div className="modal-backdrop" data-testid="calc-sheet-backdrop" onClick={onClose}>
      <div
        className="wb-panel modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Senior-Engineer QA/QC Calculation Sheet Modal"
        data-testid="calc-sheet-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="wb-toolbar">
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

        <div className="wb-actions-row" style={{ marginTop: '0.6rem' }}>
          <button type="button" data-testid="compile-calc-sheet-btn" onClick={handleGenerate}>
            Compile &amp; Save QA/QC Calc Sheet
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
              <KaTeXBlock
                latex={'Re = \\frac{\\rho \\cdot v \\cdot D}{\\mu} = 2.042 \\times 10^{5}'}
                testId="katex-calc-sheet"
              />
            </div>
            <div>
              <h4>Markdown / LaTeX Archive</h4>
              <pre className="mono" data-testid="calc-sheet-markdown">{compiledMd}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
