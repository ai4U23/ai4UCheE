// WB2: Perry's Sec 1, 2 & 4 DIPPR Thermophysical Property Engine & Carlson Decision Tree.
import React, { useEffect, useState } from 'react';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { useWorkbenchMutations } from '../../hooks/use-workbench-mutations';
import { syncWorkbenchPayload } from '../../actions/view-screen';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { ScrubbableNumberInput } from '../ui/scrubbable-number-input';
import { WhiteBoxEquationCard } from '../ui/white-box-equation-card';
import { DipprPhaseEnvelopeSvg } from '../sketches/dippr-phase-envelope-svg';
import { CarlsonAdvisorCard } from './carlson-advisor-card';
import { DIPPR_COMPOUNDS, solveThermo } from './thermo-solver-math';

export const ThermoDipprWorkbench: React.FC = () => {
  const { personaMode } = usePersonaTheme();
  const [compound, setCompound] = useState<string>('water');
  const [tempK, setTempK] = useState<number>(373.15);
  const [tempUnit, setTempUnit] = useState<'K' | 'degC' | 'degF' | 'degR'>('K');
  const [pressureUnit, setPressureUnit] = useState<'psig' | 'psia' | 'bar' | 'kPa'>('psia');
  const [polarity, setPolarity] = useState<'nonpolar' | 'polar_non_electrolyte'>('polar_non_electrolyte');
  const [hasLle, setHasLle] = useState<boolean>(true);
  const [hasAssoc, setHasAssoc] = useState<boolean>(false);

  const tKelvin =
    tempUnit === 'degC'
      ? tempK + 273.15
      : tempUnit === 'degF'
        ? (tempK - 32) * (5 / 9) + 273.15
        : tempUnit === 'degR'
          ? tempK * (5 / 9)
          : tempK;
  const solved = solveThermo({ compound, tempK: tKelvin });
  const { pSatPa, pSatPsia, hVapJkmol } = solved;
  const vpDisplay =
    pressureUnit === 'psig'
      ? `${(pSatPsia - 14.6959).toFixed(2)} psig (${pSatPsia.toFixed(2)} psia)`
      : pressureUnit === 'psia'
        ? `${pSatPsia.toFixed(2)} psia`
        : pressureUnit === 'bar'
          ? `${(pSatPa / 1e5).toFixed(4)} bar`
          : `${(pSatPa / 1e3).toFixed(2)} kPa`;

  useWorkbenchMutations('wb2-thermo-dippr', (p) => {
    if (p.compound !== undefined) setCompound(String(p.compound));
    if (p.tempK !== undefined) setTempK(Number(p.tempK));
  });

  useEffect(() => {
    syncWorkbenchPayload('wb2-thermo-dippr', {
      summary: `WB2 DIPPR: ${solved.label} @ ${tKelvin.toFixed(2)} K → P_sat ${solved.pSatKpa.toFixed(2)} kPa`,
      inputs: { compound, tempK: tKelvin, tempUnit, pressureUnit },
      metrics: {
        tempC: solved.tempC, tr: solved.tr, pSatPa: Math.round(pSatPa),
        pSatKpa: solved.pSatKpa, pSatPsia, hVapKjMol: solved.hVapKjMol,
      },
      equations: solved.equations,
      statusBanner: Math.abs(solved.pSatKpa - 101.325) < 5 ? '💧 At the 1 atm normal boiling point' : `P_sat ${solved.pSatKpa.toFixed(2)} kPa`,
    });
  });

  const eq101Select = useAgentSelectable(
    'equation',
    'dippr-eq-101',
    `DIPPR Eq. 101 Vapor Pressure (${solved.label})`,
    { compound, tempK: tKelvin, tempUnit, pressureUnit, pSatPa: Math.round(pSatPa), vpDisplay, citation: "[Perry's 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53]" },
  );
  const eq106Select = useAgentSelectable(
    'equation',
    'dippr-eq-106',
    `DIPPR Eq. 106 ΔH_vap with T_r^C5 (${solved.label})`,
    { compound, tempK: tKelvin, tempUnit, hVapJkmol, citation: "[Perry's 9th Ed., Table 2-69 (DIPPR Eq. 106), p. 2-120]" },
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
              {Object.values(DIPPR_COMPOUNDS).map((f) => (
                <option key={f.key} value={f.key}>{f.label}</option>
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

          <DipprPhaseEnvelopeSvg compound={compound} tempK={tKelvin} />

          <div className="wb-panel" {...eq101Select.selectableProps}>
            <WhiteBoxEquationCard
              equation={solved.equations[0]}
              personaMode={personaMode}
              katexTestIds={{ symbolic: 'katex-dippr-101' }}
            />
            <div className="mono" data-testid="dippr-vp-result">
              Result at T = {tKelvin.toFixed(2)} K: <strong>{Math.round(pSatPa).toLocaleString()} Pa</strong> ({vpDisplay}) · 1 atm = 101,325 Pa ·{' '}
              <code>[Perry&apos;s 9th Ed., Table 2-8 (DIPPR Eq. 101), p. 2-53]</code>
            </div>
          </div>

          <div className="wb-panel" {...eq106Select.selectableProps}>
            <WhiteBoxEquationCard equation={solved.equations[1]} personaMode={personaMode} katexTestIds={{ symbolic: 'katex-dippr-106' }} />
            <div className="mono">
              T_r = {solved.tr.toFixed(4)} → <strong>{hVapJkmol.toExponential(3)} J/kmol</strong> ·{' '}
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
