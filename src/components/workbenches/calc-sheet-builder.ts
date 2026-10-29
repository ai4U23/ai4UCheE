// Live multi-workbench QA/QC calculation sheet compiler: converts the active <current-screen>
// payload (inputs, metrics, 3-stage white-box equations, safety status) into preview rows, a
// Markdown sign-off report, and the inputs_summary/equations shape generateCalcSheetAction consumes.
import type { ClientScreenState, WhiteBoxStageEquation } from '../../actions/view-screen';
import { solveHydraulics, type HydraulicsInputs } from './hydraulics-solver-math';
import { solveThermo } from './thermo-solver-math';
import { solveDistillation, type DistillationInputs } from './distillation-solver-math';

export interface CalcSheetRow {
  parameter: string;
  symbol: string;
  value: string;
  units: string;
  basis: string;
}

export interface LiveCalcSheetDocument {
  docId: string;
  workbenchTitle: string;
  citationHeader: string;
  safetyStatus: 'PASS' | 'ACTION REQUIRED';
  safetyDetail: string;
  rows: CalcSheetRow[];
  equations: WhiteBoxStageEquation[];
  markdownReport: string;
}

const WB_TITLES: Record<string, string> = {
  'wb1-visual-verifier': "WB1 · Perry's Visual Crop & Chart Verifier",
  'wb2-thermo-dippr': 'WB2 · DIPPR Thermophysical Property Engine',
  'wb3-hydraulics': 'WB3 · Fluid Hydraulics, Pipe Sizing & Pump NPSH',
  'wb4-distillation': 'WB4 · Distillation: McCabe-Thiele & Fair Flooding',
};

function rowsFromInputs(inputs: Record<string, unknown>, labels: Record<string, [string, string]>): CalcSheetRow[] {
  return Object.entries(labels).map(([key, [symbol, units]]) => ({
    parameter: key,
    symbol,
    value: String(inputs[key] ?? '—'),
    units,
    basis: 'live workbench input',
  }));
}

export function buildLiveCalcSheet(state: ClientScreenState): LiveCalcSheetDocument {
  const payload = (state.payload ?? {}) as {
    inputs?: Record<string, unknown>;
    metrics?: Record<string, unknown>;
    equations?: WhiteBoxStageEquation[];
    statusBanner?: string;
  };
  const inputs = payload.inputs ?? {};
  const wb = state.activeWorkbench;
  const title = WB_TITLES[wb] ?? wb;
  let rows: CalcSheetRow[] = [];
  let equations: WhiteBoxStageEquation[] = payload.equations ?? [];
  let safetyStatus: 'PASS' | 'ACTION REQUIRED' = 'PASS';
  let safetyDetail = payload.statusBanner ?? 'No live hazard signals for the active workbench.';
  let citationHeader = "[Perry's 9th Ed., 9th Edition — Live Workbench Calculation Sheet]";

  if (wb === 'wb3-hydraulics') {
    const npshr = Number(inputs.npshrM ?? 3);
    const s = solveHydraulics({
      flowGpm: Number(inputs.flowGpm ?? 250), npsInch: Number(inputs.npsInch ?? 4),
      schedule: String(inputs.schedule ?? '40'), lengthM: Number(inputs.lengthM ?? 100),
      pSuctionPsig: Number(inputs.pSuctionPsig ?? 2), zSuctionM: Number(inputs.zSuctionM ?? 2),
      npshrM: npshr, valveDpPsi: Number(inputs.valveDpPsi ?? 30),
    } satisfies HydraulicsInputs);
    equations = s.equations;
    rows = [
      ...rowsFromInputs(inputs, { flowGpm: ['Q', 'gpm'], npsInch: ['NPS', 'in'], schedule: ['Sch', '-'], pSuctionPsig: ['P_suc,gauge', 'psig'] }),
      { parameter: 'pSuctionAbs', symbol: 'P_suc,abs', value: (s.pAbsPa / 6894.757).toFixed(2), units: 'psia = psig + 14.696', basis: 'explicit gauge→absolute conversion' },
      { parameter: 'fFanning', symbol: 'f_F', value: s.caseNorm.fFanning.toFixed(5), units: '-', basis: "Perry Fig. 6-9 (p. 6-10) Fanning convention" },
      { parameter: 'fDarcy', symbol: 'f_D = 4·f_F', value: s.caseNorm.fDarcy.toFixed(5), units: '-', basis: 'Darcy-Weisbach head loss (Eqs. 6-37..6-39, p. 6-11)' },
      { parameter: 'npshAvailableM', symbol: 'NPSH_A', value: s.npshAvailableM.toFixed(2), units: 'm', basis: 'Sec. 10, pp. 10-24..25 (unnumbered NPSH)' },
      { parameter: 'npshrM', symbol: 'NPSH_r', value: npshr.toFixed(1), units: 'm', basis: 'pump datasheet' },
    ];
    if (s.isCavitating) { safetyStatus = 'ACTION REQUIRED'; safetyDetail = `CAVITATION — NPSH_A ${s.npshAvailableM.toFixed(2)} m < NPSH_r ${npshr.toFixed(1)} m.`; }
    citationHeader = "[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11; Sec. 10, pp. 10-24..25]";
  } else if (wb === 'wb2-thermo-dippr') {
    const s = solveThermo({ compound: String(inputs.compound ?? 'water'), tempK: Number(inputs.tempK ?? 373.15) });
    equations = s.equations;
    rows = [
      { parameter: 'compound', symbol: 'fluid', value: String(inputs.compound ?? 'water'), units: '-', basis: 'selected process fluid' },
      { parameter: 'tempK', symbol: 'T', value: Number(inputs.tempK ?? 373.15).toFixed(2), units: 'K', basis: 'live workbench input' },
      { parameter: 'tempC', symbol: 'T', value: s.tempC.toFixed(2), units: '°C', basis: 'unit conversion' },
      { parameter: 'pSatPa', symbol: 'P^sat', value: Math.round(s.pSatPa).toLocaleString('en-US'), units: 'Pa', basis: 'DIPPR Eq. 101, Table 2-8, p. 2-53' },
      { parameter: 'pSatKpa', symbol: 'P^sat', value: s.pSatKpa.toFixed(2), units: 'kPa (1 atm = 101.325)', basis: 'DIPPR Eq. 101, Table 2-8, p. 2-53' },
      { parameter: 'hVapKjMol', symbol: 'ΔH_vap', value: s.hVapKjMol.toFixed(2), units: 'MJ/kmol', basis: 'DIPPR Eq. 106, Table 2-69, p. 2-120' },
    ];
    citationHeader = "[Perry's 9th Ed., Table 2-8, p. 2-53; Table 2-69, p. 2-120]";
  } else if (wb === 'wb4-distillation') {
    const s = solveDistillation({
      alpha: Number(inputs.alpha ?? 2.45), xf: Number(inputs.xf ?? 0.5), xd: Number(inputs.xd ?? 0.95),
      xb: Number(inputs.xb ?? 0.05), q: Number(inputs.q ?? 1), rMult: Number(inputs.rMult ?? 1.3),
      traySpacingM: Number(inputs.traySpacingM ?? 0.61), colDiamM: Number(inputs.colDiamM ?? 0.85),
    } satisfies DistillationInputs);
    equations = s.equations;
    rows = [
      ...rowsFromInputs(inputs, { alpha: ['α_AB', '-'], xf: ['x_F', 'mol/mol'], xd: ['x_D', 'mol/mol'], xb: ['x_B', 'mol/mol'], rMult: ['R/R_min', '×'], colDiamM: ['D_c', 'm'] }),
      { parameter: 'rMin', symbol: 'R_min', value: s.rMin.toFixed(3), units: '-', basis: 'Underwood pinch, Sec. 13, p. 13-36' },
      { parameter: 'nMin', symbol: 'N_min', value: s.nMin.toFixed(2), units: 'stages', basis: 'Fenske, Sec. 13, p. 13-36' },
      { parameter: 'floodPercent', symbol: '%flood', value: s.floodPercent.toFixed(1), units: '%', basis: "Fair's Souders-Brown, Fig. 14-32, p. 14-37" },
    ];
    if (s.isFlooding) { safetyStatus = 'ACTION REQUIRED'; safetyDetail = `FLOODING at ${s.floodPercent.toFixed(1)}% of Fair flood velocity.`; }
    citationHeader = "[Perry's 9th Ed., Sec. 13, p. 13-36; Fig. 14-32, p. 14-37]";
  } else {
    rows = [
      ...rowsFromInputs(inputs, { secPage: ['Sec-Page', '-'], userReading: ['student reading', '-'], exactValue: ['Perry-exact', '-'] }),
      { parameter: 'errPct', symbol: 'ε_read', value: String(payload.metrics?.errPct ?? '—'), units: '%', basis: 'Fig. 6-9 (p. 6-10) Fanning convention' },
    ];
    if (payload.metrics?.pass === false) { safetyStatus = 'ACTION REQUIRED'; safetyDetail = 'Chart reading outside the 5% verification tolerance.'; }
    citationHeader = "[Perry's 9th Ed., Fig. 6-9, p. 6-10]";
  }

  const table = rows.map((r) => `| ${r.parameter} | ${r.symbol} | ${r.value} | ${r.units} | ${r.basis} |`).join('\n');
  const markdownReport = [
    `# QA/QC Calculation Sheet — ${title}`,
    '',
    `- **Doc**: ${`CALC-${wb.toUpperCase()}`}`,
    `- **Safety audit**: ${safetyStatus === 'PASS' ? '✅ PASS' : '⛔ ACTION REQUIRED'} — ${safetyDetail}`,
    `- **Citations**: ${citationHeader}`,
    '',
    '| Parameter | Symbol | Value | Units | Basis |',
    '| --- | --- | --- | --- | --- |',
    table,
    '',
    '## White-Box Derivations',
    ...equations.map((e) => `1. **${e.title}** ${e.citation}\n   - Symbolic: \\(${e.symbolicLatex}\\)\n   - Substituted: \\(${e.substitutedLatex}\\)\n   - Result: \\(${e.resultLatex}\\)`),
    '',
    '---',
    'Prepared by: ____________  |  Checked by: ____________  |  Date: ____________',
  ].join('\n');

  return {
    docId: `CALC-${wb.toUpperCase()}`,
    workbenchTitle: title,
    citationHeader,
    safetyStatus,
    safetyDetail,
    rows,
    equations,
    markdownReport,
  };
}

/** Shape `generateCalcSheetAction.run()` expects — feeds the existing compile/persist flow. */
export function buildCalcSheetActionInput(sheet: LiveCalcSheetDocument, header: {
  projectName: string; projectNo: string; equipmentTag: string; revision: string;
  preparedBy: string; checkedBy: string; workbenchType: string;
}): Record<string, unknown> {
  return {
    project_name: header.projectName,
    project_no: header.projectNo,
    equipment_tag: header.equipmentTag,
    service_description: `${sheet.workbenchTitle} Design Verification`,
    calc_no: `CALC-${header.equipmentTag}`,
    revision: header.revision,
    prepared_by: header.preparedBy,
    checked_by: header.checkedBy,
    workbench_type: header.workbenchType,
    inputs_summary: Object.fromEntries(sheet.rows.map((r) => [`${r.parameter} (${r.symbol})`, `${r.value} ${r.units}`])),
    equations: sheet.equations.map((e) => ({
      lhs_symbol: e.id,
      symbolic_latex: e.symbolicLatex,
      substituted_latex: e.substitutedLatex,
      result_latex: e.resultLatex,
      citation: e.citation,
    })),
  };
}
