// Root App component assembling PersonaThemeProvider, AppShell, all 4 Workbenches (WB1..WB4),
// AgentChatDrawer with RenderInlineExtension, and CalcSheetPreviewModal.
import React, { useState } from 'react';
import { RenderInlineExtension } from './components/gen-ui/render-inline-extension';
import { AgentChatDrawer } from './components/shell/agent-chat-drawer';
import { AppShell } from './components/shell/app-shell';
import { FramerEntranceStage } from './components/ui/framer-motion-primitives';
import { CalcSheetPreviewModal } from './components/workbenches/calc-sheet-preview-modal';
import { DistillationWorkbench } from './components/workbenches/distillation-workbench';
import { HandbookAtlasWorkbench } from './components/workbenches/handbook-atlas-workbench';
import { HydraulicsWorkbench } from './components/workbenches/hydraulics-workbench';
import { KineticsReactorWorkbench } from './components/workbenches/kinetics-reactor-workbench';
import { ThermoDipprWorkbench } from './components/workbenches/thermo-dippr-workbench';
import { VisualVerifierWorkbench } from './components/workbenches/visual-verifier-workbench';
import {
  PersonaThemeProvider,
  usePersonaTheme,
  type PersonaMode,
  type WorkbenchId,
} from './context/persona-theme-context';

const WorkbenchSurface: React.FC = () => {
  const { activeWorkbench } = usePersonaTheme();
  const [calcSheetOpen, setCalcSheetOpen] = useState<boolean>(false);

  const renderWorkbench = (wb: WorkbenchId) => {
    const view = (() => {
      switch (wb) {
        case 'wb1-visual-verifier':
          return <VisualVerifierWorkbench />;
        case 'wb2-thermo-dippr':
          return <ThermoDipprWorkbench />;
        case 'wb3-hydraulics':
          return <HydraulicsWorkbench />;
        case 'wb4-distillation':
          return <DistillationWorkbench />;
        case 'wb6-kinetics-reactors':
          return <KineticsReactorWorkbench />;
        case 'wb5-handbook-atlas':
          return <HandbookAtlasWorkbench />;
      }
    })();
    return (
      <FramerEntranceStage key={wb} testId={`stage-${wb}`}>
        {view}
      </FramerEntranceStage>
    );
  };

  return (
    <>
      <AppShell
        renderWorkbench={renderWorkbench}
        onExportCalcSheet={() => setCalcSheetOpen(true)}
        chatDrawer={
          <AgentChatDrawer
            renderInlineExtension={(payload) => (
              <RenderInlineExtension
                key={payload.id}
                payload={payload}
                onOpenCalcSheet={() => setCalcSheetOpen(true)}
              />
            )}
            onOpenCalcSheet={() => setCalcSheetOpen(true)}
          />
        }
      />
      <CalcSheetPreviewModal
        isOpen={calcSheetOpen}
        workbenchType={activeWorkbench}
        onClose={() => setCalcSheetOpen(false)}
      />
    </>
  );
};

export const App: React.FC<{ initialPersona?: PersonaMode }> = ({ initialPersona }) => (
  <PersonaThemeProvider initialPersona={initialPersona}>
    <WorkbenchSurface />
  </PersonaThemeProvider>
);

export default App;
