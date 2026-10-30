// 25-Section Perry Atlas AI Copilot What-If Router & Grounded White-Box Diagnostics.
import type { GenUiPayload } from '../../actions/define-action';
import type { WorkbenchMutationCommand } from '../../actions/view-screen';
import { getPerrySectionByNumber } from './perry-atlas-registry';

type Params = Record<string, number | string>;

const num = (s: string, re: RegExp): number | undefined =>
  re.exec(s)?.[1] !== undefined ? Number(re.exec(s)![1]) : undefined;

const KEYWORD_SECTIONS: ReadonlyArray<[RegExp, number, (p: string) => Partial<{ primaryVal: number; secondaryVal: number }>]> = [
  [/\b(?:lmtd|bowman|temperature\s+cross|shell[- ]and[- ]tube)\b/i, 11, (p) => ({
    primaryVal: num(p, /\bP\s*(?:=|to|of)?\s*(0\.\d+)/i) ?? (/cross/i.test(p) ? 0.72 : undefined),
    secondaryVal: num(p, /\bR\s*(?:=|to|of)?\s*(\d+(?:\.\d+)?)/i) ?? (/cross/i.test(p) ? 1.6 : undefined),
  })],
  [/\b(?:psychrometr|wet[- ]bulb|drying)\b/i, 12, (p) => ({
    primaryVal: num(p, /\b(\d+(?:\.\d+)?)\s*°?C\b/i),
    secondaryVal: num(p, /\bphi\s*(?:=|to)?\s*(0\.\d+)/i),
  })],
  [/\b(?:kremser|liquid[- ]liquid\s+extraction|raffinate)\b/i, 15, (p) => ({
    primaryVal: num(p, /\bE\s*(?:=|to|of)?\s*(\d+(?:\.\d+)?)/i),
    secondaryVal: num(p, /\bN\s*(?:=|to|of)?\s*(\d+)/i),
  })],
  [/\b(?:langmuir|adsorption|ion\s+exchange|lub\b)/i, 16, (p) => ({
    primaryVal: num(p, /\bC\s*(?:=|to|of)?\s*(\d+(?:\.\d+)?)/i),
    secondaryVal: num(p, /\bb\s*(?:=|to|of)?\s*(\d+(?:\.\d+)?)/i),
  })],
  [/\b(?:ergun|fluidiz|cyclone|packed[- ]bed)\b/i, 17, (p) => ({
    primaryVal: num(p, /\bu_?0?\s*(?:=|to|of)?\s*(\d+(?:\.\d+)?)/i),
    secondaryVal: num(p, /\b(\d{2,4})\s*(?:um|μm|micron)/i),
  })],
  [/\b(?:ruth|cake\s+filtration|filtrate)\b/i, 18, (p) => ({
    primaryVal: num(p, /\bV\/A\s*(?:=|to)?\s*(\d+(?:\.\d+)?)/i),
    secondaryVal: num(p, /\b(\d+(?:\.\d+)?)\s*kPa\b/i),
  })],
  [/\b(?:cstr|pfr|levenspiel|semenov|runaway)\b/i, 19, (p) => ({
    primaryVal: num(p, /\bX\s*(?:=|to|of)?\s*(0\.\d+)/i) ?? (/runaway/i.test(p) ? 0.88 : undefined),
    secondaryVal: num(p, /\bpsi\s*(?:=|to|of)?\s*(0\.\d+)/i) ?? (/runaway/i.test(p) ? 0.52 : undefined),
  })],
  [/\b(?:monod|chemostat|washout|bioreactor|otr\b)/i, 20, (p) => ({
    primaryVal: num(p, /\bD\s*(?:=|to|of)?\s*(0\.\d+)/i),
    secondaryVal: num(p, /\bK_?s\s*(?:=|to|of)?\s*(\d+(?:\.\d+)?)/i),
  })],
  [/\b(?:bond\s+work|comminution|grinding|ball\s+mill)\b/i, 21, (p) => ({
    primaryVal: num(p, /\b(\d{2,4})\s*(?:um|μm|micron)/i),
    secondaryVal: num(p, /\bW_?i\s*(?:=|to|of)?\s*(\d+(?:\.\d+)?)/i),
  })],
  [/\b(?:streeter[- ]phelps|dissolved\s+oxygen|bod\b|hypoxia)\b/i, 22, (p) => ({
    primaryVal: num(p, /\b(\d+(?:\.\d+)?)\s*(?:d|days)\b/i),
    secondaryVal: num(p, /\bL_?0?\s*(?:=|to|of)?\s*(\d+(?:\.\d+)?)/i),
  })],
  [/\b(?:relief\s+valve|psv\b|api\s*520|orifice\s+area)\b/i, 23, (p) => ({
    primaryVal: num(p, /\b(\d+(?:\.\d+)?)\s*psig\b/i),
    secondaryVal: num(p, /\b(\d+(?:\.\d+)?)\s*kg\/h\b/i),
  })],
  [/\b(?:rankine|carnot|exergy)\b/i, 24, (p) => ({
    primaryVal: num(p, /\b(\d{3}(?:\.\d+)?)\s*K\b/i),
    secondaryVal: num(p, /\beta\s*(?:=|to|of)?\s*(0\.\d+)/i),
  })],
  [/\b(?:corrosion|mpy\b|pren\b|pitting|hastelloy|duplex)\b/i, 25, (p) => ({
    primaryVal: num(p, /\b(\d+(?:\.\d+)?)\s*°?C\b/i),
    secondaryVal: num(p, /\bpren\s*(?:=|to|of)?\s*(\d+)/i),
  })],
];

export function extractAtlasScenario(prompt: string): { wb: 'wb5-handbook-atlas'; params: Params; note: string; secNum: number } | null {
  const explicitSec = /\bsec(?:tion)?\.?\s*(\d{1,2})\b/i.exec(prompt);
  let secNum = explicitSec ? Number(explicitSec[1]) : undefined;
  if (secNum !== undefined && (secNum < 1 || secNum > 25)) secNum = undefined;

  let primaryVal: number | undefined;
  let secondaryVal: number | undefined;

  for (const [re, targetSec, extractor] of KEYWORD_SECTIONS) {
    if (re.test(prompt) || secNum === targetSec) {
      secNum = secNum ?? targetSec;
      const ext = extractor(prompt);
      primaryVal = primaryVal ?? ext.primaryVal;
      secondaryVal = secondaryVal ?? ext.secondaryVal;
      break;
    }
  }

  if (secNum === undefined) return null;
  const desc = getPerrySectionByNumber(secNum);
  if (primaryVal === undefined) {
    const genericNum = num(prompt, /(?:at|=|to)\s*(-?\d+(?:\.\d+)?)/i);
    if (genericNum !== undefined && genericNum >= desc.primaryParam.min && genericNum <= desc.primaryParam.max) {
      primaryVal = genericNum;
    }
  }
  const pVal = primaryVal ?? desc.primaryParam.defaultVal;
  const sVal = secondaryVal ?? desc.secondaryParam.defaultVal;
  return {
    wb: 'wb5-handbook-atlas',
    secNum,
    params: { secNum, primaryVal: pVal, secondaryVal: sVal },
    note: `Sec ${secNum} (${desc.secTitle}) What-If`,
  };
}

export function buildAtlasScenarioDetails(secNum: number, primaryVal: number, secondaryVal: number): {
  diagnosis: string;
  citation: string;
  card: GenUiPayload;
  learnText: string;
  plantText: string;
} {
  const desc = getPerrySectionByNumber(secNum);
  const solved = desc.solve(primaryVal, secondaryVal);
  const eq = solved.equations[0];
  return {
    diagnosis: `Live WB5 Sec ${solved.secNum} (${solved.secTitle}) check: ${solved.readoutText} — ${solved.statusBanner}.`,
    citation: solved.citation,
    learnText: `${solved.learnCallout.title}: ${solved.learnCallout.plainEnglish}\nTrap to avoid: ${solved.learnCallout.commonTrap}`,
    plantText: `Check Sec ${solved.secNum} (${solved.secPage}): ${solved.statusBanner}\nReadout: ${solved.readoutText}`,
    card: {
      type: 'equation-proof-card',
      title: `Sec ${solved.secNum} — ${eq.title}`,
      data: {
        symbolic_latex: eq.symbolicLatex,
        substituted_latex: eq.substitutedLatex,
        result_latex: eq.resultLatex,
        citation: solved.citation,
      },
    },
  };
}

export function parseAtlasSectionScenario(prompt: string): WorkbenchMutationCommand | null {
  const match = extractAtlasScenario(prompt);
  if (!match) return null;
  return { targetWorkbench: 'wb5-handbook-atlas', params: match.params, reason: match.note };
}
