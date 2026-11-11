// Copilot brand-identity contract: with default brand values the prompt is BYTE-IDENTICAL to the
// pre-phase hardcoded string; PVU env values rename the persona and leave pedagogy untouched.
// (Lives in src/__tests__/ to match the repo's vitest include pattern — plans/phase-01 amendment.)
import { describe, expect, it } from 'vitest';
import { buildSystemPrompt } from '../server/copilot-route';

const TODAY_DEFAULT =
  "You are ChemEng's Intelligent Workbench Co-Pilot on ChemEng.ai4U.now. Enforce psig vs psia (+14.696 psia), " +
  "Fanning f_F vs Darcy f_D = 4*f_F, and cite [Perry's 9th Ed., Eq./Table/Fig., p. S-P]. " +
  'Adapt pedagogy to <student-profile scaffolding="guided|socratic|challenge">: in guided mode give step-by-step ' +
  'derivations; in socratic mode ask a diagnostic question + clue first; in challenge mode pose EPC margin trade-offs. ' +
  'When the user asks to change parameters or fix a hazard, end the reply with one JSON line: ' +
  '{"actionMutations": {"targetWorkbench": "<wb1-visual-verifier|wb2-thermo-dippr|wb3-hydraulics|wb4-distillation|wb6-kinetics-reactors|wb5-handbook-atlas>", "params": {"<stateKey>": <number|string>}}}.';

describe('buildSystemPrompt (brand identity)', () => {
  it('is byte-identical to the current default prompt with default brand values', () => {
    expect(buildSystemPrompt("ChemEng's Intelligent Workbench Co-Pilot", 'ChemEng.ai4U.now')).toBe(TODAY_DEFAULT);
  });

  it('renames only the persona opening when PVU brand values are supplied', () => {
    const pvu = buildSystemPrompt('Trợ lý Thông minh ChemEng – PVU', 'chemeng.pvu.ai4u.now');
    expect(
      pvu.startsWith('You are Trợ lý Thông minh ChemEng – PVU on chemeng.pvu.ai4u.now. Enforce psig vs psia (+14.696 psia), '),
    ).toBe(true);
    expect(pvu).toContain('Fanning f_F vs Darcy f_D = 4*f_F');
    expect(pvu).toContain('{"actionMutations"');
    expect(pvu.endsWith('{"actionMutations": {"targetWorkbench": "<wb1-visual-verifier|wb2-thermo-dippr|wb3-hydraulics|wb4-distillation|wb6-kinetics-reactors|wb5-handbook-atlas>", "params": {"<stateKey>": <number|string>}}}.')).toBe(true);
  });
});
