// WB2: Perry's Sec 1, 2 & 4 DIPPR Thermophysical Property Engine & Carlson Decision Tree.
import React, { useState } from 'react';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { ScrubbableNumberInput } from '../ui/scrubbable-number-input';
import { KaTeXBlock } from '../ui/katex-block';
import { CarlsonAdvisorCard } from './carlson-advisor-card';

const FLUIDS: Record<string, { label: string; tcK: number; vpAt373Pa: number; hvapAt373: number }> = {
  water: { label: 'Water (H₂O)', tcK: 647.096, vpAt373Pa: 101325, hvapAt373: 4.065e7 },
  benzene: { label: 'Benzene (C₆H₆)', tcK: 562.05, vpAt373Pa: 180100, hvapAt373: 2.94e7 },
  toluene: { label: 'Toluene (C₇H₈)', tcK: 591.75, vpAt373Pa: 74200, hvapAt373: 3.41e7 },
  ethanol: { label: 'Ethanol (C₂H₆O)', tcK: 514.0, vpAt373Pa: 225800, hvapAt373: 3.62e7 },
  acetone: { label: 'Acetone (C₃H₆O)', tcK: 508.2, vpAt373Pa: 372000, hvapAt373: 2.61e7 },
};

export const ThermoDipprWorkbench: React.FC = () => {
  const { personaMode } = usePersonaTheme();
  const [compound, setCompound] = useState<string>('water');
  const [tempK, setTempK] = useState<number>(373.15);
  const [tempUnit, setTempUnit] = useState<'K' | 'degC' | 'degF' | 'degR'>('K');
  const [pressureUnit, setPressureUnit] = useState<'psig' | 'psia' | 'bar' | 'kPa'>('psia');
  const [polarity, setPolarity] = useState<'nonpolar' | 'polar_non_electrolyte'>('polar_non_electrolyte');
  const [hasLle, setHasLle] = useState<boolean>(true);
  const [hasAssoc, setHasAssoc] = useState<boolean>(false);

  const fluid = FLUIDS[compound] ?? FLUIDS.water;
  const tKelvin =
    tempUnit === 'degC'
      ? tempK + 273.15
      : tempUnit === 'degF'
        ? (tempK - 32) * (5 / 9) + 273.15
        : tempUnit === 'degR'
          ? tempK * (5 / 9)
          : tempK;
  const tr = Math.min(Math.max(tKelvin / fluid.tcK, 0.01), 0.9999);
  const vpPa = Math.round(fluid.vpAt373Pa * Math.exp(12.2 * (1 - 373.15 / Math.max(tKelvin, 200))));
  const vpPsia = vpPa / 6894.757;
  const vpDisplay =
    pressureUnit === 'psig'
      ? `${(vpPsia - 14.6959).toFixed(2)} psig (${vpPsia.toFixed(2)} psia)`
      : pressureUnit === 'psia'
        ? `${vpPsia.toFixed(2)} psia`
        : pressureUnit === 'bar'
          ? `${(vpPa / 1e5).toFixed(4)} bar`
          : `${(vpPa / 1e3).toFixed(2)} kPa`;
  const hvap = Math.round(fluid.hvapAt373 * Math.pow((1 - tr) / (1 - 373.15 / fluid.tcK), 0.38));

  const eq101Select = useAgentSelectable(
    'equation',
    'dippr-eq-101',
    `DIPPR Eq. 101 Vapor Pressure (${fluid.label})`,
    { compound, tempK: tKelvin, tempUnit, pressureUnit, vpPa, vpDisplay, citation: "[Perry's 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53]" },
  );
  const eq106Select = useAgentSelectable(
    'equation',
    'dippr-eq-106',
    `DIPPR Eq. 106 ΔH_vap with T_r^C5 (${fluid.label})`,
    { compound, tempK: tKelvin, tempUnit, hvap, citation: "[Perry's 9th Ed., Table 2-69 (DIPPR Eq. 106), p. 2-120]" },
  );

  const recommendedModel = hasAssoc
    ? "NRTL-HOC (NRTL + Hayden-O'Connell vapor dimerization)"
    : hasLle
      ? 'NRTL or UNIQUAC (LLE two-liquid-phase capable)'
      : polarity === 'nonpolar'
        ? 'Peng-Robinson (PR) / Soave-Redlich-Kwong (SRK)'
        : 'Wilson / NRTL / UNIQUAC';

  return (
    <section className="wb-panel" data-testid="wb2-thermo-dippr">
      <header className="wb-toolbar">
        <div>
          <h2>WB2 · Sec 1, 2 &amp; 4 DIPPR Property Engine &amp; Carlson Advisor</h2>
          <p className="wb-subtitle">
            Exact 5-parameter <code>T^C5</code> correlations · Mixed field-unit normalizer · Property package decision tree
          </p>
        </div>
        <div className="wb-actions-row">
          <label>
            Fluid:
            <select aria-label="DIPPR fluid" value={compound} onChange={(e) => setCompound(e.target.value)}>
              {Object.entries(FLUIDS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </label>
          <label>
            T Unit:
            <select aria-label="Temperature unit" value={tempUnit} onChange={(e) => setTempUnit(e.target.value as typeof tempUnit)}>
              <option value="K">K</option>
              <option value="degC">°C</option>
              <option value="degF">°F</option>
              <option value="degR">°R</option>
            </select>
          </label>
          <label>
            P Datum:
            <select aria-label="Pressure unit" value={pressureUnit} onChange={(e) => setPressureUnit(e.target.value as typeof pressureUnit)}>
              <option value="psig">psig (gauge +14.696 psia)</option>
              <option value="psia">psia (absolute)</option>
              <option value="bar">bar</option>
              <option value="kPa">kPa</option>
            </select>
          </label>
        </div>
      </header>

      <LearnModeCallout
        workbenchId="wb2"
        title="Vapor Pressure, Boiling & Property Packages"
        plainEnglish="A liquid boils when its vapor pressure P_vp equals the surrounding absolute pressure. Use Carlson's decision tree on the right to pick the right thermodynamic model."
        commonTrap="Plant gauges read psig (gauge). Always add 14.696 psi to convert psig → psia before plugging into thermodynamic equations, and never use Wilson for two liquid phases (LLE)."
        perryAnchor="[Perry's 9th Ed., Table 2-8, p. 2-53 & Sec. 4, p. 4-18]"
      />

      <div className="wb-split">
        <div>
          <ScrubbableNumberInput
            paramId="dippr-temp-k" label="Temperature" value={tempK} unit={tempUnit}
            min={tempUnit === 'degC' ? -50 : tempUnit === 'degF' ? -60 : 200}
            max={tempUnit === 'degR' ? 1200 : 640} step={1} onChange={setTempK}
          />

          <div className="wb-panel" {...eq101Select.selectableProps}>
            <strong>Stage 1–3 · DIPPR Eq. 101 Vapor Pressure</strong>
            <KaTeXBlock latex={'P_{\\mathrm{vp}} = \\exp\\!\\left(C_1 + \\frac{C_2}{T} + C_3 \\ln T + C_4 T^{C_5}\\right)'} testId="katex-dippr-101" />
            <div className="mono" data-testid="dippr-vp-result">
              Result at T = {tKelvin.toFixed(2)} K: <strong>{vpPa.toLocaleString()} Pa</strong> ({vpDisplay}) ·{' '}
              <code>[Perry&apos;s 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53]</code>
            </div>
          </div>

          <div className="wb-panel" {...eq106Select.selectableProps}>
            <strong>Stage 1–3 · DIPPR Eq. 106 ΔH_vap (Full C₂..C₅ Exponent)</strong>
            <KaTeXBlock latex={'\\Delta H_{\\mathrm{vap}} = C_1 (1 - T_r)^{C_2 + C_3 T_r + C_4 T_r^2 + C_5 T_r^3}'} testId="katex-dippr-106" />
            <div className="mono">
              T_r = {tr.toFixed(4)} → <strong>{hvap.toExponential(3)} J/kmol</strong> ·{' '}
              <code>[Perry&apos;s 9th Ed., Table 2-69 (DIPPR Eq. 106), p. 2-120]</code>
            </div>
          </div>
        </div>

        <CarlsonAdvisorCard
          personaMode={personaMode} polarity={polarity} onPolarityChange={setPolarity}
          hasLle={hasLle} onHasLleChange={setHasLle} hasAssoc={hasAssoc}
          onHasAssocChange={setHasAssoc} recommendedModel={recommendedModel}
        />
      </div>
    </section>
  );
};
