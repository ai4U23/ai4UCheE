// Zod-typed shared action for Senior-Engineer QA/QC Calculation Sheet export.
// Browser-safe (zero top-level better-sqlite3 import) with setCalcSheetPersister hook
// for Node/SQLite persistence and deterministic local fallback when :8001 is offline.
import { z } from 'zod';
import { agentNative, defineAction } from './define-action';

const SIDECAR =
  typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? ''
    : 'http://127.0.0.1:8001';

export interface SavedCalculationRecord {
  id: string;
  projectCode: string;
  equipmentTag: string;
  workbenchType: string;
  revision: string;
  inputsJson: string;
  outputsJson: string;
  equationsJson: string;
  createdAt: number;
}

type CalcSheetPersister = (record: SavedCalculationRecord) => void;
let persister: CalcSheetPersister | null = null;
const memoryStore: SavedCalculationRecord[] = [];

export function setCalcSheetPersister(fn: CalcSheetPersister | null): void {
  persister = fn;
}

export function getSavedCalculationsMemory(): SavedCalculationRecord[] {
  return [...memoryStore];
}

function buildLocalCalcSheetFallback(input: {
  project_name: string;
  project_no: string;
  equipment_tag: string;
  service_description: string;
  calc_no: string;
  revision: string;
  prepared_by: string;
  checked_by: string;
  workbench_type: string;
  inputs_summary: Record<string, unknown>;
  equations: Array<Record<string, unknown>>;
}) {
  const html_document = `<!DOCTYPE html><html><head><style>@media print { .sheet { page-break-after: always; } }</style></head><body><div class="sheet"><h2>SENIOR-ENGINEER QA/QC CALCULATION SHEET (${input.workbench_type.toUpperCase()})</h2><p>Project: ${input.project_name} (${input.project_no}) | Tag: <strong>${input.equipment_tag}</strong> | Calc: ${input.calc_no} (${input.revision})</p><p>Prepared By: ${input.prepared_by} | Checked By: ${input.checked_by}</p></div></body></html>`;
  const markdown_latex = `# Senior-Engineer QA/QC Calculation Note — ${input.equipment_tag}\n\n- **Project**: ${input.project_name} (\`${input.project_no}\`)\n- **Revision**: ${input.revision}\n`;
  return {
    metadata: {
      project_name: input.project_name,
      project_no: input.project_no,
      equipment_tag: input.equipment_tag,
      service_description: input.service_description,
      calc_no: input.calc_no,
      revision: input.revision,
      prepared_by: input.prepared_by,
      checked_by: input.checked_by,
    },
    workbench_type: input.workbench_type,
    html_document,
    markdown_latex,
    equation_count: input.equations.length,
  };
}

export const generateCalcSheetAction = defineAction({
  name: 'generate-calc-sheet',
  description:
    'Compile a Senior-Engineer QA/QC Calculation Sheet (Print-to-PDF HTML + Markdown/LaTeX), save to SQLite saved_calculations, and emit an inline calc-sheet-card.',
  schema: z.object({
    project_name: z.string().default("Perry's Intelligent Workbench — Process Package"),
    project_no: z.string().default('AI4U-CHE-2026'),
    equipment_tag: z.string().default('P-101A/B'),
    service_description: z.string().default('Process Fluid Transfer / Separation Unit'),
    calc_no: z.string().default('CALC-CHE-001'),
    revision: z.string().default('Rev 0 — Issued for Review'),
    prepared_by: z.string().default('Process Engineer'),
    checked_by: z.string().default('Lead ChE QA/QC'),
    workbench_type: z.string().default('hydraulics'),
    inputs_summary: z.record(z.unknown()).default({ Flow: '250 gpm', Pipe: '4-in Sch 40' }),
    equations: z.array(z.record(z.unknown())).default([]),
  }),
  async handler(input) {
    let result: Record<string, unknown>;
    try {
      const res = await fetch(`${SIDECAR}/api/v1/export/calc-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metadata: {
            project_name: input.project_name,
            project_no: input.project_no,
            equipment_tag: input.equipment_tag,
            service_description: input.service_description,
            calc_no: input.calc_no,
            revision: input.revision,
            prepared_by: input.prepared_by,
            checked_by: input.checked_by,
          },
          workbench_type: input.workbench_type,
          inputs_summary: input.inputs_summary,
          equations: input.equations,
        }),
      });
      result = res.ok ? ((await res.json()) as Record<string, unknown>) : buildLocalCalcSheetFallback(input);
    } catch {
      result = buildLocalCalcSheetFallback(input);
    }

    const record: SavedCalculationRecord = {
      id: `calc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      projectCode: input.project_no,
      equipmentTag: input.equipment_tag,
      workbenchType: input.workbench_type,
      revision: input.revision,
      inputsJson: JSON.stringify(input.inputs_summary),
      outputsJson: JSON.stringify({ htmlLength: String(result.html_document ?? '').length }),
      equationsJson: JSON.stringify(input.equations),
      createdAt: Date.now(),
    };
    memoryStore.push(record);
    persister?.(record);

    agentNative.ui.output({
      type: 'calc-sheet-card',
      title: `QA/QC Calculation Sheet — ${input.equipment_tag} (${input.revision})`,
      data: { ...result, recordId: record.id, equipmentTag: input.equipment_tag, revision: input.revision },
    });

    return { ...result, record };
  },
});
