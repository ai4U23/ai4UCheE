// Per-student Adaptive Mastery, 7-Trap Misconception Tracker & Multi-Student Browser Scorecard.
// Persists in localStorage (`ai4uchee.student.scorecards.v1`) with an in-memory fallback for Node/Vitest,
// supports instant Student Name switching, and debounces continuous slider-scrub trap evaluation.
import type { WorkbenchId, WorkbenchLivePayload } from '../actions/view-screen';

export type ConceptId = 'chart-fanning-darcy' | 'thermo-pressure-lle' | 'hydraulics-npsha-choke' | 'distillation-fenske-flood' | 'kinetics-levenspiel-runaway' | 'atlas-multi-section';
export type ScaffoldingLevel = 'guided' | 'socratic' | 'challenge';
export type MisconceptionTrapId = 'fanning_4x_trap' | 'psig_psia_trap' | 'wilson_lle_trap' | 'npsha_cavitation_trap' | 'flooding_trap' | 'thiele_diffusion_trap' | 'semenov_runaway_trap';

export interface StudentProfileState {
  studentId: string; studentName: string; scaffoldingOverride: ScaffoldingLevel | 'auto';
  conceptMastery: Record<ConceptId, number>; trapCounts: Record<MisconceptionTrapId, number>;
  activeTraps: MisconceptionTrapId[]; solvedMissionIds: string[]; autoFixMissionIds: string[]; updatedAt: number;
}

interface ScorecardStore { activeStudentId: string; profiles: Record<string, StudentProfileState>; }

const STORAGE_KEY = 'ai4uchee.student.scorecards.v1';
export const WORKBENCH_CONCEPT: Record<WorkbenchId, ConceptId> = {
  'wb1-visual-verifier': 'chart-fanning-darcy', 'wb2-thermo-dippr': 'thermo-pressure-lle',
  'wb3-hydraulics': 'hydraulics-npsha-choke', 'wb4-distillation': 'distillation-fenske-flood',
  'wb6-kinetics-reactors': 'kinetics-levenspiel-runaway', 'wb5-handbook-atlas': 'atlas-multi-section',
};
export const MISSION_CONCEPT: Record<string, ConceptId> = {
  'mission-fanning-trap': 'chart-fanning-darcy', 'mission-boil-water': 'thermo-pressure-lle',
  'mission-pump-npsha': 'hydraulics-npsha-choke', 'mission-distillation': 'distillation-fenske-flood',
  'mission-kinetics-runaway': 'kinetics-levenspiel-runaway',
};

function makeDefaultProfile(studentId = 'alex', studentName = 'Alex (ChE Jr.)'): StudentProfileState {
  return {
    studentId, studentName, scaffoldingOverride: 'auto',
    conceptMastery: {
      'chart-fanning-darcy': 0.4, 'thermo-pressure-lle': 0.4, 'hydraulics-npsha-choke': 0.4,
      'distillation-fenske-flood': 0.4, 'kinetics-levenspiel-runaway': 0.4, 'atlas-multi-section': 0.4,
    },
    trapCounts: {
      fanning_4x_trap: 0, psig_psia_trap: 0, wilson_lle_trap: 0, npsha_cavitation_trap: 0,
      flooding_trap: 0, thiele_diffusion_trap: 0, semenov_runaway_trap: 0,
    },
    activeTraps: [], solvedMissionIds: [], autoFixMissionIds: [], updatedAt: Date.now(),
  };
}

function makeDefaultStore(): ScorecardStore {
  return {
    activeStudentId: 'alex',
    profiles: { alex: makeDefaultProfile('alex', 'Alex (ChE Jr.)'), maya: makeDefaultProfile('maya', 'Maya (ChE Sr.)') },
  };
}

let memoryStore: ScorecardStore = makeDefaultStore();
const listeners = new Set<(profile: StudentProfileState) => void>();
let settleTimer: ReturnType<typeof setTimeout> | null = null;

function readStore(): ScorecardStore {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (!raw) return memoryStore;
    const parsed = JSON.parse(raw) as ScorecardStore;
    if (parsed && parsed.activeStudentId && parsed.profiles?.[parsed.activeStudentId]) memoryStore = parsed;
  } catch { /* ignore storage errors in private/Node contexts */ }
  return memoryStore;
}

function writeStore(next: ScorecardStore): StudentProfileState {
  memoryStore = next;
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* ignore quota errors */ }
  const active = next.profiles[next.activeStudentId];
  listeners.forEach((fn) => fn(active));
  return active;
}

export function getStudentProfile(): StudentProfileState {
  const store = readStore();
  return store.profiles[store.activeStudentId] ?? makeDefaultProfile();
}

export function listStudentProfiles(): StudentProfileState[] {
  return Object.values(readStore().profiles);
}

export function switchStudentProfile(studentNameOrId: string): StudentProfileState {
  if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
  const clean = studentNameOrId.trim() || 'Alex (ChE Jr.)';
  const id = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'student';
  const store = readStore();
  const existing = store.profiles[id] ?? makeDefaultProfile(id, clean);
  return writeStore({ activeStudentId: id, profiles: { ...store.profiles, [id]: existing } });
}

export function subscribeStudentProfile(fn: (profile: StudentProfileState) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getEffectiveScaffoldingLevel(profile: StudentProfileState = getStudentProfile(), workbench?: WorkbenchId): ScaffoldingLevel {
  if (profile.scaffoldingOverride !== 'auto') return profile.scaffoldingOverride;
  const score = workbench ? profile.conceptMastery[WORKBENCH_CONCEPT[workbench]] ?? 0.4 : getAverageMastery(profile);
  if (score < 0.45) return 'guided';
  return score < 0.8 ? 'socratic' : 'challenge';
}

export function getAverageMastery(profile: StudentProfileState = getStudentProfile()): number {
  const vals = Object.values(profile.conceptMastery);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function detectLivePayloadTraps(workbench: WorkbenchId, payload: WorkbenchLivePayload): MisconceptionTrapId[] {
  const traps: MisconceptionTrapId[] = [];
  const inputs = (payload.inputs ?? {}) as Record<string, unknown>;
  const metrics = (payload.metrics ?? {}) as Record<string, unknown>;
  if (workbench === 'wb1-visual-verifier') {
    const reading = Number(inputs.userReading);
    const exact = Number(inputs.exactValue || 0.0045);
    if (reading > 0 && exact > 0 && Math.abs(reading / exact - 4) < 0.35) traps.push('fanning_4x_trap');
  }
  if (workbench === 'wb2-thermo-dippr' && String(inputs.activityModel ?? '').toLowerCase() === 'wilson' && inputs.hasLle) traps.push('wilson_lle_trap');
  if (workbench === 'wb3-hydraulics') {
    if (metrics.isCavitating === true) traps.push('npsha_cavitation_trap');
    if (Number(inputs.pSuctionPsig ?? 2) < 0) traps.push('psig_psia_trap');
  }
  if (workbench === 'wb4-distillation' && metrics.isFlooding === true) traps.push('flooding_trap');
  if (workbench === 'wb6-kinetics-reactors') {
    if (metrics.isRunaway === true) traps.push('semenov_runaway_trap');
    if (metrics.isDiffusionLimited === true || Number(inputs.thielePhi ?? 1) > 2.0) traps.push('thiele_diffusion_trap');
  }
  return traps;
}

export function recordPayloadObservation(workbench: WorkbenchId, payload: WorkbenchLivePayload, settleMs = 0): StudentProfileState {
  const apply = (): StudentProfileState => {
    const store = readStore();
    const cur = store.profiles[store.activeStudentId] ?? makeDefaultProfile();
    const traps = detectLivePayloadTraps(workbench, payload);
    const concept = WORKBENCH_CONCEPT[workbench];
    const nextCounts = { ...cur.trapCounts };
    traps.forEach((t) => { nextCounts[t] = (nextCounts[t] ?? 0) + 1; });
    const curScore = cur.conceptMastery[concept] ?? 0.4;
    const nextScore = traps.length > 0 ? Math.max(0.15, Math.min(curScore, 0.42)) : curScore;
    const next: StudentProfileState = {
      ...cur, conceptMastery: { ...cur.conceptMastery, [concept]: Number(nextScore.toFixed(2)) },
      trapCounts: nextCounts, activeTraps: traps, updatedAt: Date.now(),
    };
    return writeStore({ ...store, profiles: { ...store.profiles, [store.activeStudentId]: next } });
  };
  if (settleMs > 0) {
    if (settleTimer) clearTimeout(settleTimer);
    settleTimer = setTimeout(apply, settleMs);
    return getStudentProfile();
  }
  return apply();
}

export function recordMissionOutcome(missionId: string, usedAutoFix: boolean): StudentProfileState {
  const store = readStore();
  const cur = store.profiles[store.activeStudentId] ?? makeDefaultProfile();
  const concept = MISSION_CONCEPT[missionId] ?? 'chart-fanning-darcy';
  const nextScore = Math.min(1.0, Number(((cur.conceptMastery[concept] ?? 0.4) + (usedAutoFix ? 0.12 : 0.35)).toFixed(2)));
  const solved = cur.solvedMissionIds.includes(missionId) ? cur.solvedMissionIds : [...cur.solvedMissionIds, missionId];
  const autoFixed = usedAutoFix && !cur.autoFixMissionIds.includes(missionId)
    ? [...cur.autoFixMissionIds, missionId]
    : !usedAutoFix ? cur.autoFixMissionIds.filter((id) => id !== missionId) : cur.autoFixMissionIds;
  const next: StudentProfileState = {
    ...cur, conceptMastery: { ...cur.conceptMastery, [concept]: nextScore },
    activeTraps: [], solvedMissionIds: solved, autoFixMissionIds: autoFixed, updatedAt: Date.now(),
  };
  return writeStore({ ...store, profiles: { ...store.profiles, [store.activeStudentId]: next } });
}

export function setScaffoldingOverride(level: ScaffoldingLevel | 'auto'): StudentProfileState {
  const store = readStore();
  const cur = store.profiles[store.activeStudentId] ?? makeDefaultProfile();
  return writeStore({ ...store, profiles: { ...store.profiles, [store.activeStudentId]: { ...cur, scaffoldingOverride: level, updatedAt: Date.now() } } });
}

export function resetStudentProfile(): StudentProfileState {
  if (settleTimer) { clearTimeout(settleTimer); settleTimer = null; }
  memoryStore = makeDefaultStore();
  try { if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  return writeStore(memoryStore);
}

export function serializeStudentProfileXml(profile: StudentProfileState = getStudentProfile(), wb?: WorkbenchId): string {
  const level = getEffectiveScaffoldingLevel(profile, wb);
  const avg = Math.round(getAverageMastery(profile) * 100);
  return `<student-profile student="${profile.studentName}" mastery="${avg}%" scaffolding="${level}" activeTraps="${profile.activeTraps.join(',') || 'none'}" solvedMissions="${profile.solvedMissionIds.join(',') || 'none'}" />`;
}
