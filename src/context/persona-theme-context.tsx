// Persona ('learn' | 'plant') + Dual Theme ('paper' #FAF8F5 | 'blueprint' #0B101B) context.
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { writeClientAppState } from '../actions/view-screen';

export type PersonaMode = 'learn' | 'plant';
export type ThemeMode = 'paper' | 'blueprint';
export type WorkbenchId =
  | 'wb1-visual-verifier'
  | 'wb2-thermo-dippr'
  | 'wb3-hydraulics'
  | 'wb4-distillation';

export interface SelectedChip {
  chipId: string;
  kind: string;
  id: string;
  label: string;
  payload?: Record<string, unknown>;
}

export interface PersonaThemeState {
  personaMode: PersonaMode;
  setPersonaMode: (mode: PersonaMode) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  activeWorkbench: WorkbenchId;
  setActiveWorkbench: (wb: WorkbenchId) => void;
  selectedChips: SelectedChip[];
  toggleChip: (chip: Omit<SelectedChip, 'chipId'>) => void;
  removeChip: (chipId: string) => void;
  clearChips: () => void;
}

const PersonaThemeContext = createContext<PersonaThemeState | null>(null);

export const PersonaThemeProvider: React.FC<{
  children: React.ReactNode;
  initialPersona?: PersonaMode;
  initialTheme?: ThemeMode;
  initialWorkbench?: WorkbenchId;
}> = ({
  children,
  initialPersona = 'plant',
  initialTheme = 'paper',
  initialWorkbench = 'wb1-visual-verifier',
}) => {
  const [personaMode, setPersonaMode] = useState<PersonaMode>(initialPersona);
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const [activeWorkbench, setActiveWorkbench] = useState<WorkbenchId>(initialWorkbench);
  const [selectedChips, setSelectedChips] = useState<SelectedChip[]>([]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeMode);
      document.documentElement.setAttribute('data-persona', personaMode);
    }
    writeClientAppState({
      activeWorkbench,
      personaMode,
      themeMode,
      selectedChips: selectedChips.map((c) => c.chipId),
    });
  }, [activeWorkbench, themeMode, personaMode, selectedChips]);

  const toggleChip = useCallback((chip: Omit<SelectedChip, 'chipId'>) => {
    const chipId = `agent-select:${chip.kind}:${chip.id}`;
    setSelectedChips((prev) =>
      prev.some((c) => c.chipId === chipId)
        ? prev.filter((c) => c.chipId !== chipId)
        : [...prev, { ...chip, chipId }],
    );
  }, []);

  const removeChip = useCallback((chipId: string) => {
    setSelectedChips((prev) => prev.filter((c) => c.chipId !== chipId));
  }, []);

  const clearChips = useCallback(() => setSelectedChips([]), []);

  return (
    <PersonaThemeContext.Provider
      value={{
        personaMode,
        setPersonaMode,
        themeMode,
        setThemeMode,
        activeWorkbench,
        setActiveWorkbench,
        selectedChips,
        toggleChip,
        removeChip,
        clearChips,
      }}
    >
      {children}
    </PersonaThemeContext.Provider>
  );
};

export function usePersonaTheme(): PersonaThemeState {
  const ctx = useContext(PersonaThemeContext);
  if (!ctx) {
    throw new Error('usePersonaTheme must be used inside <PersonaThemeProvider>');
  }
  return ctx;
}
