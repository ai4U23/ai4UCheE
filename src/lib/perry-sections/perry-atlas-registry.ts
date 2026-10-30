// 25-Section Perry's 9th Ed. Master Registry & Senior EPC QA/QC Calc-Sheet Builder.
import type { WhiteBoxStageEquation, WorkbenchLivePayload } from '../../actions/view-screen';
import type { CalcSheetRow } from '../../components/workbenches/calc-sheet-builder';
import type { PerryClusterId, PerrySectionDescriptor } from './perry-section-types';
import { SEC_01_05_DESCRIPTORS } from './sec-01-05-solvers';
import { SEC_06_10_DESCRIPTORS } from './sec-06-10-solvers';
import { SEC_11_15_DESCRIPTORS } from './sec-11-15-solvers';
import { SEC_16_20_DESCRIPTORS } from './sec-16-20-solvers';
import { SEC_21_25_DESCRIPTORS } from './sec-21-25-solvers';

export const PERRY_CLUSTERS: ReadonlyArray<{ id: PerryClusterId; label: string; secRange: [number, number] }> = [
  { id: 'cluster-a', label: 'Cluster A: Sec 1–5 (Foundations, DIPPR & Thermo)', secRange: [1, 5] },
  { id: 'cluster-b', label: 'Cluster B: Sec 6–10 (Fluid, Kinetics, Control & Econ)', secRange: [6, 10] },
  { id: 'cluster-c', label: 'Cluster C: Sec 11–15 (Heat Exchangers & Separations I)', secRange: [11, 15] },
  { id: 'cluster-d', label: 'Cluster D: Sec 16–20 (Separations II, Reactors & Bio)', secRange: [16, 20] },
  { id: 'cluster-e', label: 'Cluster E: Sec 21–25 (Solids, Waste, Safety, Energy & Materials)', secRange: [21, 25] },
];

export const ALL_25_PERRY_SECTIONS: ReadonlyArray<PerrySectionDescriptor> = [
  ...SEC_01_05_DESCRIPTORS,
  ...SEC_06_10_DESCRIPTORS,
  ...SEC_11_15_DESCRIPTORS,
  ...SEC_16_20_DESCRIPTORS,
  ...SEC_21_25_DESCRIPTORS,
];

export function getPerrySectionByNumber(secNum: number): PerrySectionDescriptor {
  return ALL_25_PERRY_SECTIONS.find((s) => s.secNum === secNum) ?? ALL_25_PERRY_SECTIONS[0];
}

export function buildAtlasCalcSheetSection(livePayload?: WorkbenchLivePayload): {
  docNoSuffix: string;
  title: string;
  section: string;
  service: string;
  citationHeader: string;
  safetyStatus: 'PASS' | 'ACTION REQUIRED';
  safetyDetail: string;
  inputs: CalcSheetRow[];
  equations: WhiteBoxStageEquation[];
  conclusion: string;
} {
  const rawInputs = (livePayload?.inputs ?? {}) as Record<string, unknown>;
  const secNum = Number(rawInputs.secNum ?? 1);
  const descriptor = getPerrySectionByNumber(secNum);
  const primaryVal = Number(rawInputs.primaryVal ?? descriptor.primaryParam.defaultVal);
  const secondaryVal = Number(rawInputs.secondaryVal ?? descriptor.secondaryParam.defaultVal);
  const solved = descriptor.solve(primaryVal, secondaryVal);
  return {
    docNoSuffix: `WB5-SEC${String(solved.secNum).padStart(2, '0')}`,
    title: `Perry's 9th Ed. Sec ${solved.secNum} — ${solved.secTitle}`,
    section: `Section ${solved.secNum} (p. ${solved.secPage} · PDF p. ${solved.pdfPage1Based})`,
    service: `TAG-SEC${String(solved.secNum).padStart(2, '0')} · ${solved.secTitle}`,
    citationHeader: solved.citation,
    safetyStatus: solved.isAlert ? 'ACTION REQUIRED' : 'PASS',
    safetyDetail: solved.statusBanner,
    inputs: [
      {
        parameter: descriptor.primaryParam.label,
        symbol: descriptor.primaryParam.symbol,
        value: String(solved.primaryVal),
        units: descriptor.primaryParam.unit,
        basis: solved.citation,
      },
      {
        parameter: descriptor.secondaryParam.label,
        symbol: descriptor.secondaryParam.symbol,
        value: String(solved.secondaryVal),
        units: descriptor.secondaryParam.unit,
        basis: solved.citation,
      },
      {
        parameter: `Evaluated Response (${solved.responseUnit})`,
        symbol: 'Y_{\\mathrm{eval}}',
        value: `${solved.responseVal} ${solved.responseUnit} · ${solved.secondaryResponseVal}`,
        units: solved.responseUnit,
        basis: solved.statusBanner,
      },
    ],
    equations: solved.equations,
    conclusion: `${solved.statusBanner} — ${solved.readoutText} ${solved.citation}`,
  };
}
