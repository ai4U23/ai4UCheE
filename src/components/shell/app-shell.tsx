// AppShell: Dual-Lens header (Learn <-> Plant), Dual Theme toggle (#FAF8F5 <-> #0B101B),
// motion/react layoutId shared-layout morphing, DoF badge, 4 Workbench tabs + Calc Sheet trigger.
import React from 'react';
import { motion } from 'motion/react';
import {
  usePersonaTheme,
  type PersonaMode,
  type WorkbenchId,
} from '../../context/persona-theme-context';
import { VisualVerifierWorkbench } from '../workbenches/visual-verifier-workbench';
import { AgentChatDrawer } from './agent-chat-drawer';

const WORKBENCH_TABS: ReadonlyArray<{ id: WorkbenchId; label: string; short: string }> = [
  { id: 'wb1-visual-verifier', label: "WB1: Perry's Visual Verifier", short: 'Sec 1–25 Crops' },
  { id: 'wb2-thermo-dippr', label: 'WB2: Sec 1/2/4 DIPPR & Thermo', short: 'DIPPR + Carlson' },
  { id: 'wb3-hydraulics', label: 'WB3: Sec 6/8/10 Fluid Hydraulics', short: 'Pipe + NPSHa + Cv' },
  { id: 'wb4-distillation', label: 'WB4: Sec 13/14 Distillation', short: 'McCabe-Thiele + Flood' },
];

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

  return (
    <div className="app-shell" data-testid="app-shell">
      <header className="shell-header">
        <div>
          <h1>Perry&apos;s Intelligent Workbench</h1>
          <span className="dof-badge" data-testid="dof-badge">
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
            data-testid="theme-toggle"
            onClick={() => setThemeMode(themeMode === 'paper' ? 'blueprint' : 'paper')}
          >
            {themeMode === 'paper' ? '☀️ EPC Paper #FAF8F5' : '🌙 Blueprint #0B101B'}
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

      <nav className="wb-toolbar" role="tablist" aria-label="Engineering Workbenches">
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
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="wb-split">
        <div>{(renderWorkbench ?? defaultRenderWorkbench)(activeWorkbench)}</div>
        {chatDrawer ?? <AgentChatDrawer />}
      </main>
    </div>
  );
};
