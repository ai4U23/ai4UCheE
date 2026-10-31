// AppShell: Minimalist 3-Zone AI-Native Studio (1 Top Bar · 1 Canvas · 1 Agent).
// Unifies Brand + Lab Switcher + GuidedMissionBar + Utility Pills into a single 48px dark studio bar.
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { dispatchWorkbenchMutation } from '../../actions/view-screen';
import { usePersonaTheme, type PersonaMode, type WorkbenchId } from '../../context/persona-theme-context';
import { FRAMER_LAYOUT_SPRING } from '../../lib/framer-motion-tokens';
import { useVietnameseDomTranslator } from '../../lib/i18n/vi-dom-translator';
import { getShellCopy, getWorkbenchTabs, SUBJECT_DEFAULT_FIGURE } from '../../lib/i18n/vi-shell-dictionary';
import { SwarmPulseDot } from '../ui/framer-motion-primitives';
import { VisualVerifierWorkbench } from '../workbenches/visual-verifier-workbench';
import { AgentChatDrawer } from './agent-chat-drawer';
import { GuidedMissionBar } from './guided-mission-bar';
import { LocaleSwitcherPill } from './locale-switcher-pill';
import { PageAxShareMenu } from './page-ax-share-menu';
import { ShowcaseVideoModal } from './showcase-video-modal';

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
  const { personaMode, setPersonaMode, locale, activeWorkbench, setActiveWorkbench } = usePersonaTheme();
  useVietnameseDomTranslator(locale);
  const [showLabs, setShowLabs] = useState<boolean>(false);
  const [showTourModal, setShowTourModal] = useState<boolean>(false);
  const lastSubjectRef = React.useRef<WorkbenchId>('wb3-hydraulics');
  if (activeWorkbench !== 'wb1-visual-verifier') lastSubjectRef.current = activeWorkbench;

  const tabs = getWorkbenchTabs(locale);
  const t = getShellCopy(locale);
  const activeSubjectLabel = tabs.find((tab) => tab.id === activeWorkbench)?.label ?? t.defaultVerifierLabel;

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
        <h2>{tabs.find((tab) => tab.id === wb)?.label}</h2>
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
        {active && <motion.span layoutId="active-persona-pill" className="motion-pill framer-pill-glow" transition={FRAMER_LAYOUT_SPRING} />}
        <span>{label}</span>
      </button>
    );
  };

  const isVerifierActive = activeWorkbench === 'wb1-visual-verifier';

  return (
    <div className="app-shell" data-testid="app-shell">
      <header className="shell-header">
        <div className="brand-identity">
          <img src="/ai4u-logo.png" alt="AI4U.now" className="brand-logo" data-testid="ai4u-logo" />
          <div className="brand-title-group">
            <h1>ai4UCheE</h1>
            <span className="brand-eyebrow">{t.brandEyebrow}</span>
          </div>
          <button
            type="button"
            className="lab-switcher-pill"
            data-testid="toggle-lab-switcher-btn"
            onClick={() => setShowLabs(!showLabs)}
            title="Switch Engineering Subject Lab (5 Subject Labs + Charts Verifier)"
          >
            🔧 {activeSubjectLabel} · {t.labsSuffix} {showLabs ? '▴' : '▾'}
          </button>
          <span
            className="dof-badge studio-drawer-collapsed"
            data-testid="dof-badge"
            title="Degrees of Freedom = 0: Every required input variable is specified so the solver has a unique physical answer."
          >
            <SwarmPulseDot tone="emerald" />
            {dofStatus}
          </span>
        </div>

        <GuidedMissionBar />

        <div className="wb-actions-row">
          <LocaleSwitcherPill />
          <div className="wb-actions-row" role="tablist" aria-label="Persona Lens Switcher">
            {renderPersonaButton('learn', t.learnLabel)}
            {renderPersonaButton('plant', t.plantLabel)}
          </div>
          <button
            type="button"
            data-testid="tab-wb1-visual-verifier"
            aria-pressed={isVerifierActive}
            className={`persona-btn ${isVerifierActive ? 'active' : ''}`}
            title="Cross-subject utility tool: inspect calibrated Perry's/BSL/Seader charts & high-DPI PDF page crops for any subject"
            onClick={openVisualVerifierTool}
          >
            {isVerifierActive && <motion.span layoutId="active-verifier-pill" className="motion-pill framer-pill-glow" transition={FRAMER_LAYOUT_SPRING} />}
            <span>{t.chartsBtn}</span>
          </button>
          <button type="button" data-testid="export-calc-sheet-btn" onClick={onExportCalcSheet}>
            {t.calcSheetBtn}
          </button>
          <button
            type="button"
            data-testid="open-showcase-guide-btn"
            title="Watch the Remotion Video Guide & explore the ai4UCheE Feature Showcase"
            onClick={() => setShowTourModal(true)}
          >
            {t.guideBtn}
          </button>
          <PageAxShareMenu />
        </div>
      </header>
      <ShowcaseVideoModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        onSelectWorkbench={(wb) => setActiveWorkbench(wb)}
      />

      <nav
        className={`wb-toolbar ${showLabs ? 'wb-labs-open' : 'studio-drawer-collapsed'}`}
        role="tablist"
        aria-label="Engineering Subject Workbenches"
      >
        {tabs.map((tab) => {
          const isActive = activeWorkbench === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-testid={`tab-${tab.id}`}
              className={`wb-tab ${isActive ? 'active' : ''}`}
              onClick={() => {
                setActiveWorkbench(tab.id);
                setShowLabs(false);
              }}
            >
              {isActive && <motion.span layoutId="active-workbench-tab" className="motion-pill framer-pill-glow" transition={FRAMER_LAYOUT_SPRING} />}
              <span className="wb-tab-title">{tab.label}</span>
              <small className="wb-tab-sub">{tab.short}</small>
            </button>
          );
        })}
      </nav>

      <main className="shell-workspace wb-split">
        <div>{(renderWorkbench ?? defaultRenderWorkbench)(activeWorkbench)}</div>
        {chatDrawer ?? <AgentChatDrawer />}
      </main>
    </div>
  );
};
