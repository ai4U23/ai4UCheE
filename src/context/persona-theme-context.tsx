// Persona ('learn' | 'plant'), Locale ('en' | 'vi'), + Institutional Ivory ('paper' #FBF6EC) context.
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { writeClientAppState } from '../actions/view-screen';
import { getBrand } from '../lib/brand';
import {
  resolveInitialLocale,
  setActiveLocale,
  type LocaleCode,
} from '../lib/i18n/locale-types';

export type PersonaMode = 'learn' | 'plant';
export type ThemeMode = 'paper' | 'pvu';
export type { LocaleCode };
export type WorkbenchId =
  | 'wb1-visual-verifier'
  | 'wb2-thermo-dippr'
  | 'wb3-hydraulics'
  | 'wb4-distillation'
  | 'wb6-kinetics-reactors'
  | 'wb5-handbook-atlas';

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
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
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
  initialLocale?: LocaleCode;
  initialWorkbench?: WorkbenchId;
}> = ({
  children,
  initialPersona,
  initialTheme,
  initialLocale,
  initialWorkbench,
}) => {
  const resolvedInitialPersona = React.useMemo<PersonaMode>(() => {
    if (initialPersona) return initialPersona;
    if (typeof window !== 'undefined') {
      const pParam = new URLSearchParams(window.location.search).get('persona');
      if (pParam === 'plant' || pParam === 'learn') return pParam;
    }
    return 'learn';
  }, [initialPersona]);
  const resolvedInitialWb = React.useMemo<WorkbenchId>(() => {
    if (initialWorkbench) return initialWorkbench;
    if (typeof window !== 'undefined') {
      const wbParam = new URLSearchParams(window.location.search).get('wb') as WorkbenchId | null;
      if (wbParam && [
        'wb1-visual-verifier',
        'wb2-thermo-dippr',
        'wb3-hydraulics',
        'wb4-distillation',
        'wb6-kinetics-reactors',
        'wb5-handbook-atlas',
      ].includes(wbParam)) {
        return wbParam;
      }
    }
    return 'wb2-thermo-dippr';
  }, [initialWorkbench]);
  const [personaMode, setPersonaMode] = useState<PersonaMode>(resolvedInitialPersona);
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme ?? getBrand().defaultTheme);
  const [locale, setLocaleState] = useState<LocaleCode>(() => {
    const resolved = resolveInitialLocale(initialLocale);
    setActiveLocale(resolved, { persist: false });
    return resolved;
  });
  const [activeWorkbench, setActiveWorkbench] = useState<WorkbenchId>(resolvedInitialWb);
  const [selectedChips, setSelectedChips] = useState<SelectedChip[]>([]);

  const setLocale = useCallback((next: LocaleCode) => {
    const valid = setActiveLocale(next, { persist: true });
    setLocaleState(valid);
  }, []);

  useEffect(() => {
    setActiveLocale(locale, { persist: false });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', themeMode);
      document.documentElement.setAttribute('data-persona', personaMode);
    }
    writeClientAppState({
      activeWorkbench,
      personaMode,
      themeMode,
      locale,
      selectedChips: selectedChips.map((c) => c.chipId),
    });
  }, [activeWorkbench, themeMode, personaMode, locale, selectedChips]);

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
        locale,
        setLocale,
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
