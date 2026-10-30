// AppShell: Dual-Lens header (Learn <-> Plant), Dual Theme toggle (Ivory #FBF6EC <-> Dark Navy #071A33),
// ai4U logo + motion/react layoutId shared-layout morphing, DoF badge, 5 ChE Subject tabs + Cross-Subject Charts & Page Verifier tool + Calc Sheet trigger.
import React from 'react';
import { motion } from 'motion/react';
import { dispatchWorkbenchMutation } from '../../actions/view-screen';
import {
  usePersonaTheme,
  type PersonaMode,
  type WorkbenchId,
} from '../../context/persona-theme-context';
import { VisualVerifierWorkbench } from '../workbenches/visual-verifier-workbench';
import { AgentChatDrawer } from './agent-chat-drawer';
import { GuidedMissionBar } from './guided-mission-bar';

const WORKBENCH_TABS: ReadonlyArray<{ id: WorkbenchId; label: string; short: string }> = [
  { id: 'wb2-thermo-dippr', label: 'Thermodynamics & Phase', short: "Perry's DIPPR · Smith-Van Ness-Abbott" },
  { id: 'wb3-hydraulics', label: 'Fluid & Transport Hydraulics', short: "BSL Transport · Perry's Sec 6/8/10" },
  { id: 'wb4-distillation', label: 'Separations & Distillation', short: "Seader 4th Ed. · Perry's Sec 13–16" },
  { id: 'wb6-kinetics-reactors', label: 'Kinetics & Reactor Design', short: "Fogler 7th Ed. · Perry's Sec 7/19 · Crowl" },
  { id: 'wb5-handbook-atlas', label: '6-Book & 25-Sec ChE Atlas', short: 'All 6 Textbooks & Perry Sec 1–25 Index' },
];

const SUBJECT_DEFAULT_FIGURE: Partial<Record<WorkbenchId, { secPage: string; exactValue: number }>> = {
  'wb2-thermo-dippr': { secPage: '2-53', exactValue: 101325 },
  'wb3-hydraulics': { secPage: '6-10', exactValue: 0.0045 },
  'wb4-distillation': { secPage: '14-37', exactValue: 0.082 },
  'wb6-kinetics-reactors': { secPage: '19-6', exactValue: 2.45 },
  'wb5-handbook-atlas': { secPage: '6-10', exactValue: 0.0045 },
};

export interface AppShellProps {
  renderWorkbench?: (active: WorkbenchId) => React.ReactNode;
  onExportCalcSheet?: () => void;
  chatDrawer?: React.ReactNode;
  dofStatus?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  renderWorkbench,
  onExportCalcSheet,
  chatDrawer,
  dofStatus = 'DoF = 0 · Fully Specified',
}) => {
  const {
    personaMode,
    setPersonaMode,
    themeMode,
    setThemeMode,
    activeWorkbench,
    setActiveWorkbench,
  } = usePersonaTheme();
  const lastSubjectRef = React.useRef<WorkbenchId>('wb3-hydraulics');
  if (activeWorkbench !== 'wb1-visual-verifier') {
    lastSubjectRef.current = activeWorkbench;
  }

  const openVisualVerifierTool = () => {
    if (activeWorkbench === 'wb1-visual-verifier') {
      setActiveWorkbench(lastSubjectRef.current);
      return;
    }
    const preset = SUBJECT_DEFAULT_FIGURE[activeWorkbench];
    if (preset) {
      dispatchWorkbenchMutation({
        targetWorkbench: 'wb1-visual-verifier',
        params: { secPage: preset.secPage, exactValue: preset.exactValue },
        reason: `Cross-subject Visual Verifier opened from ${activeWorkbench}`,
      });
    }
    setActiveWorkbench('wb1-visual-verifier');
  };

  const defaultRenderWorkbench = (wb: WorkbenchId) => {
    if (wb === 'wb1-visual-verifier') return <VisualVerifierWorkbench />;
    return (
      <section className="wb-panel" data-testid={`panel-${wb}`}>
        <h2>{WORKBENCH_TABS.find((t) => t.id === wb)?.label}</h2>
        <p className="wb-subtitle">Active workbench surface ({wb}) — ready for solver input.</p>
      </section>
    );
  };

  const renderPersonaButton = (mode: PersonaMode, label: string) => {
    const active = personaMode === mode;
    return (
      <button
        key={mode}
        type="button"
        role="tab"
        aria-selected={active}
        data-testid={`persona-${mode}`}
        className={`persona-btn ${active ? 'active' : ''}`}
        onClick={() => setPersonaMode(mode)}
      >
        {active && <motion.span layoutId="active-persona-pill" className="motion-pill" />}
        <span>{label}</span>
      </button>
    );
  };

  const isVerifierActive = activeWorkbench === 'wb1-visual-verifier';

  return (
    <div className="app-shell" data-testid="app-shell">
      <header className="shell-header">
        <div className="brand-identity">
          <img
            src="/ai4u-logo.png"
            alt="AI4U.now"
            className="brand-logo"
            data-testid="ai4u-logo"
          />
          <div className="brand-title-group">
            <h1>ChemEng&apos;s Intelligent Workbench</h1>
            <span className="brand-eyebrow">ai4UCheE · Chemical Engineering Intelligence</span>
          </div>
          <span
            className="dof-badge"
            data-testid="dof-badge"
            title="Degrees of Freedom = 0: Every required input variable is specified so the solver has a unique physical answer."
          >
            {dofStatus}
          </span>
        </div>

        <div className="wb-actions-row" role="tablist" aria-label="Persona Lens Switcher">
          {renderPersonaButton('learn', '🎓 Learn Mode')}
          {renderPersonaButton('plant', '🏭 Plant Mode')}
        </div>

        <div className="wb-actions-row">
          <button
            type="button"
            data-testid="tab-wb1-visual-verifier"
            aria-pressed={isVerifierActive}
            className={`persona-btn ${isVerifierActive ? 'active' : ''}`}
            title="Cross-subject utility tool: inspect calibrated Perry's/BSL/Seader charts & high-DPI PDF page crops for any subject"
            onClick={openVisualVerifierTool}
          >
            📐 Charts &amp; Page Verifier
          </button>
          <button
            type="button"
            data-testid="theme-toggle"
            onClick={() => setThemeMode(themeMode === 'paper' ? 'blueprint' : 'paper')}
          >
            {themeMode === 'paper' ? '☀️ Ivory #FBF6EC' : '🌙 Dark Navy #071A33'}
          </button>
          <button
            type="button"
            data-testid="export-calc-sheet-btn"
            onClick={onExportCalcSheet}
          >
            Export Senior Calc Sheet
          </button>
        </div>
      </header>

      <nav className="wb-toolbar" role="tablist" aria-label="Engineering Subject Workbenches">
        {WORKBENCH_TABS.map((tab) => {
          const isActive = activeWorkbench === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`tab-${tab.id}`}
              className={`wb-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveWorkbench(tab.id)}
            >
              {isActive && <motion.span layoutId="active-workbench-tab" className="motion-pill" />}
              <span className="wb-tab-title">{tab.label}</span>
              <small className="wb-tab-sub">{tab.short}</small>
            </button>
          );
        })}
      </nav>

      <GuidedMissionBar />

      <main className="shell-workspace wb-split">
        <div>{(renderWorkbench ?? defaultRenderWorkbench)(activeWorkbench)}</div>
        {chatDrawer ?? <AgentChatDrawer />}
      </main>
    </div>
  );
};
