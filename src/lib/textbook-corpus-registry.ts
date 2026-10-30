// Subject-First 6-Textbook Corpus Registry & Cross-Book Citation/Search Catalog.
import type { WorkbenchId } from '../actions/view-screen';

export type TextbookId =
  | 'perry-9e'
  | 'fogler-7e'
  | 'bsl-2e'
  | 'svna-9e'
  | 'seader-4e'
  | 'crowl-4e';

export type CheSubjectId =
  | 'thermo'
  | 'transport'
  | 'separations'
  | 'kinetics'
  | 'safety'
  | 'atlas';

export interface TextbookMetadata {
  bookId: TextbookId;
  shortTitle: string;
  fullTitle: string;
  authors: string;
  year: number;
  format: 'PDF' | 'EPUB';
  subjects: readonly CheSubjectId[];
  primaryWorkbench: WorkbenchId;
  signatureTopics: readonly string[];
}

export const TEXTBOOK_CORPUS_CATALOG: ReadonlyArray<TextbookMetadata> = [
  {
    bookId: 'perry-9e',
    shortTitle: "Perry's 9th Ed.",
    fullTitle: "Perry's Chemical Engineers' Handbook, 9th Edition",
    authors: 'D. W. Green & M. Z. Southard',
    year: 2019,
    format: 'PDF',
    subjects: ['thermo', 'transport', 'separations', 'kinetics', 'safety', 'atlas'],
    primaryWorkbench: 'wb5-handbook-atlas',
    signatureTopics: ['Sec 1–25 Reference', 'DIPPR Tables 2-8/2-69', 'Fig. 6-9 Fanning f_F', 'Fair Flooding Fig. 14-32'],
  },
  {
    bookId: 'fogler-7e',
    shortTitle: 'Fogler 7th Ed.',
    fullTitle: 'Elements of Chemical Reaction Engineering, 7th Edition',
    authors: 'H. S. Fogler, B. R. Goldsmith & E. Nikolla',
    year: 2025,
    format: 'EPUB',
    subjects: ['kinetics', 'transport', 'safety'],
    primaryWorkbench: 'wb6-kinetics-reactors',
    signatureTopics: ['Levenspiel CSTR/PFR Sizing (Ch. 1–2)', 'Ergun PBR Pressure Drop (Ch. 5)', 'Thiele Effectiveness η (Ch. 15)', 'Semenov Thermal Runaway (Ch. 12–13)'],
  },
  {
    bookId: 'bsl-2e',
    shortTitle: 'BSL Transport 2nd Ed.',
    fullTitle: 'Transport Phenomena, Revised 2nd Edition',
    authors: 'R. B. Bird, W. E. Stewart & E. N. Lightfoot',
    year: 2006,
    format: 'PDF',
    subjects: ['transport', 'kinetics'],
    primaryWorkbench: 'wb3-hydraulics',
    signatureTopics: ['Shell Momentum Balances (Ch. 2)', 'Friction Factors f_F vs f_D (Ch. 6)', 'Heat Conduction & Convection (Ch. 10–14)', 'Diffusion & Porous Catalyst Reaction (Ch. 18)'],
  },
  {
    bookId: 'svna-9e',
    shortTitle: 'Smith-Van Ness-Abbott 9th Ed.',
    fullTitle: 'Introduction to Chemical Engineering Thermodynamics, 9th Edition',
    authors: 'J. M. Smith, H. C. Van Ness, M. M. Abbott & M. T. Swihart',
    year: 2021,
    format: 'PDF',
    subjects: ['thermo', 'separations'],
    primaryWorkbench: 'wb2-thermo-dippr',
    signatureTopics: ['Cubic EOS PR/SRK (Ch. 3)', 'VLE Raoult & Modified Raoult (Ch. 10)', 'Excess Gibbs G^E: Wilson, NRTL, UNIQUAC (Ch. 12)', 'Reaction Equilibrium K_a (Ch. 14)'],
  },
  {
    bookId: 'seader-4e',
    shortTitle: 'Seader 4th Ed.',
    fullTitle: 'Separation Process Principles, 4th Edition',
    authors: 'J. D. Seader, E. J. Henley & D. K. Roper',
    year: 2016,
    format: 'PDF',
    subjects: ['separations', 'thermo'],
    primaryWorkbench: 'wb4-distillation',
    signatureTopics: ['McCabe-Thiele & q-Line (Ch. 7)', 'Fenske-Underwood-Gilliland Shortcut (Ch. 9)', 'Tray Efficiency & Fair Entrainment Flooding (Ch. 6)', 'Kremser Absorption & Extraction (Ch. 6 & 8)'],
  },
  {
    bookId: 'crowl-4e',
    shortTitle: 'Crowl & Louvar 4th Ed.',
    fullTitle: 'Chemical Process Safety: Fundamentals with Applications, 4th Edition',
    authors: 'D. A. Crowl & J. F. Louvar',
    year: 2019,
    format: 'PDF',
    subjects: ['safety', 'kinetics', 'transport'],
    primaryWorkbench: 'wb6-kinetics-reactors',
    signatureTopics: ['Toxicology & Source Models (Ch. 2–4)', 'Flammability & Explosions (Ch. 6)', 'Semenov Thermal Runaway & DIERS (Ch. 8)', 'API 520 Relief Sizing psig → psia (Ch. 9–10)'],
  },
];

export interface SubjectTextbookBlend {
  workbenchId: WorkbenchId;
  subjectLabel: string;
  blendedSourcesBadge: string;
  books: readonly TextbookId[];
  crossBookNote: string;
}

export const SUBJECT_WORKBENCH_BLENDS: Record<WorkbenchId, SubjectTextbookBlend> = {
  'wb1-visual-verifier': {
    workbenchId: 'wb1-visual-verifier',
    subjectLabel: 'Cross-Subject Utility · Charts, Nomographs & Visual Verification',
    blendedSourcesBadge: "Perry's 9th Ed. Sec 2/6/14 · BSL Transport Ch. 6 · Seader Ch. 6",
    books: ['perry-9e', 'bsl-2e', 'seader-4e'],
    crossBookNote: "Cross-subject utility tool blending Perry's Fig. 6-9 Fanning f_F chart with Bird-Stewart-Lightfoot Ch. 6 friction factor definitions (f_D = 4·f_F) and Seader Ch. 6 flooding curves.",
  },
  'wb2-thermo-dippr': {
    workbenchId: 'wb2-thermo-dippr',
    subjectLabel: 'Subject 1 · Thermodynamics & Phase Equilibria',
    blendedSourcesBadge: "Perry's Sec 1/2/4 · Smith-Van Ness-Abbott 9th Ed. Ch. 3/10/12 · Seader Ch. 2",
    books: ['perry-9e', 'svna-9e', 'seader-4e'],
    crossBookNote: "Blends Perry's DIPPR Eq. 101/106 tables with Smith-Van Ness-Abbott 9th Ed. excess-Gibbs G^E theory (why Wilson fails for LLE vs. NRTL/UNIQUAC) and Carlson's decision tree.",
  },
  'wb3-hydraulics': {
    workbenchId: 'wb3-hydraulics',
    subjectLabel: 'Subject 2 · Fluid Mechanics, Transport & Piping Hydraulics',
    blendedSourcesBadge: "Perry's Sec 6/8/10 · BSL Transport 2nd Ed. Ch. 2/6/7 · Crowl & Louvar Ch. 4",
    books: ['perry-9e', 'bsl-2e', 'crowl-4e'],
    crossBookNote: "Blends Bird-Stewart-Lightfoot Ch. 6 macroscopic mechanical energy balance (Bernoulli + friction head loss) with Perry's Sec. 10 pump NPSHa cavitation and Sec. 8 ISA-75.01 choked valve Cv.",
  },
  'wb4-distillation': {
    workbenchId: 'wb4-distillation',
    subjectLabel: 'Subject 3 · Separation Processes & Staged Columns',
    blendedSourcesBadge: "Perry's Sec 13–16 · Seader 4th Ed. Ch. 6/7/9 · SVNA 9th Ed. Ch. 10",
    books: ['perry-9e', 'seader-4e', 'svna-9e'],
    crossBookNote: "Blends Seader, Henley & Roper Ch. 7 McCabe-Thiele stage stepping and Ch. 9 Fenske-Underwood-Gilliland shortcuts with Perry's Sec. 14 Fair tray flooding and Eckert GPDC.",
  },
  'wb6-kinetics-reactors': {
    workbenchId: 'wb6-kinetics-reactors',
    subjectLabel: 'Subject 4 · Kinetics, Catalysis & Chemical Reactor Design',
    blendedSourcesBadge: "Fogler 7th Ed. Ch. 1–18 · Perry's Sec 7/19 · BSL Ch. 18 · Crowl & Louvar Ch. 8",
    books: ['fogler-7e', 'perry-9e', 'bsl-2e', 'crowl-4e'],
    crossBookNote: "Blends Fogler 7th Ed. CRE Mole Balances, Levenspiel CSTR/PFR sizing, Ergun PBR ΔP, and Thiele effectiveness η with BSL Ch. 18 porous diffusion and Crowl & Louvar Ch. 8 Semenov thermal runaway.",
  },
  'wb5-handbook-atlas': {
    workbenchId: 'wb5-handbook-atlas',
    subjectLabel: 'Subject 5 · Cross-Textbook 25-Section ChE Atlas & Corpus Explorer',
    blendedSourcesBadge: "All 6 Textbooks Blended · Perry's Sec 1–25 · Fogler · BSL · SVNA · Seader · Crowl",
    books: ['perry-9e', 'fogler-7e', 'bsl-2e', 'svna-9e', 'seader-4e', 'crowl-4e'],
    crossBookNote: "Unified 25-Section Chemical Engineering Atlas cross-referencing Perry's 9th Ed. (pp. 1-1..2274) with Fogler 7th Ed., BSL Transport, Smith-Van Ness-Abbott, Seader, and Crowl & Louvar.",
  },
};
