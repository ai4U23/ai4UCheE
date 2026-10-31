// Subject 4 (WB6): Kinetics, Catalysis & Chemical Reactor Design Workbench.
// Blends Fogler 7th Ed. (Ch. 1–19), Perry's 9th Ed. (Sec. 7 & 19),
// Bird-Stewart-Lightfoot 2nd Ed. (Ch. 6 & 18), and Crowl & Louvar 4th Ed. (Ch. 8).
import React, { useEffect, useState } from 'react';
import { syncWorkbenchPayload } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { useWorkbenchMutations } from '../../hooks/use-workbench-mutations';
import { SUBJECT_WORKBENCH_BLENDS } from '../../lib/textbook-corpus-registry';
import { LevenspielReactorSvgCanvas } from '../sketches/levenspiel-reactor-svg-canvas';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { ScrubbableNumberInput } from '../ui/scrubbable-number-input';
import { WhiteBoxEquationCard } from '../ui/white-box-equation-card';
import { KineticsDiagramGallery } from './kinetics-diagram-gallery';
import { solveKineticsReactor } from './kinetics-solver-math';

export const KineticsReactorWorkbench: React.FC = () => {
  const { personaMode } = usePersonaTheme();
  const [conversionX, setConversionX] = useState<number>(0.80);
  const [tempK, setTempK] = useState<number>(450);
  const [pInletPsig, setPInletPsig] = useState<number>(45);
  const [epsilonA, setEpsilonA] = useState<number>(0.25);
  const [alphaErgun, setAlphaErgun] = useState<number>(0.015);
  const [thielePhi, setThielePhi] = useState<number>(1.4);
  const [semenovPsi, setSemenovPsi] = useState<number>(0.28);
  const [coolantTcK, setCoolantTcK] = useState<number>(345);
  const [seriesTauMin, setSeriesTauMin] = useState<number>(3.39);
  const [rtdTanksN, setRtdTanksN] = useState<number>(5);
  const [overpotentialV, setOverpotentialV] = useState<number>(0.28);
  const [iLimMaCm2, setILimMaCm2] = useState<number>(85);

  useWorkbenchMutations('wb6-kinetics-reactors', (p) => {
    if (p.conversionX !== undefined) setConversionX(Number(p.conversionX));
    if (p.tempK !== undefined) setTempK(Number(p.tempK));
    if (p.pInletPsig !== undefined) setPInletPsig(Number(p.pInletPsig));
    if (p.epsilonA !== undefined) setEpsilonA(Number(p.epsilonA));
    if (p.alphaErgun !== undefined) setAlphaErgun(Number(p.alphaErgun));
    if (p.thielePhi !== undefined) setThielePhi(Number(p.thielePhi));
    if (p.semenovPsi !== undefined) setSemenovPsi(Number(p.semenovPsi));
    if (p.coolantTcK !== undefined) setCoolantTcK(Number(p.coolantTcK));
    if (p.seriesTauMin !== undefined) setSeriesTauMin(Number(p.seriesTauMin));
    if (p.rtdTanksN !== undefined) setRtdTanksN(Number(p.rtdTanksN));
    if (p.overpotentialV !== undefined) setOverpotentialV(Number(p.overpotentialV));
    if (p.iLimMaCm2 !== undefined) setILimMaCm2(Number(p.iLimMaCm2));
  });

  const solved = solveKineticsReactor({
    conversionX, tempK, pInletPsig, epsilonA, alphaErgun, thielePhi, semenovPsi,
  });

  const statusBanner = solved.isRunaway
    ? `🔥 SEMENOV RUNAWAY HAZARD: ψ = ${solved.semenovPsi.toFixed(3)} > ψ_crit (0.368) [Fogler Ch. 12; Crowl & Louvar Ch. 8]`
    : solved.isDiffusionLimited
      ? `⚠️ PORE DIFFUSION LIMITED: Thiele φ = ${solved.thielePhi.toFixed(2)} → η = ${(solved.effectivenessEta * 100).toFixed(1)}% [Fogler Ch. 15; BSL Ch. 18]`
      : `✅ STABLE REACTOR OPERATION: V_CSTR/V_PFR = ${solved.vRatioCstrPfr.toFixed(2)}× · η = ${(solved.effectivenessEta * 100).toFixed(1)}% · ψ = ${solved.semenovPsi.toFixed(3)}`;

  useEffect(() => {
    syncWorkbenchPayload('wb6-kinetics-reactors', {
      summary: `WB6 Kinetics & Reactors: X=${solved.conversionX.toFixed(2)}, V_CSTR/V_PFR=${solved.vRatioCstrPfr.toFixed(2)}×, η=${solved.effectivenessEta.toFixed(3)}, ψ=${solved.semenovPsi.toFixed(3)}`,
      inputs: {
        conversionX: solved.conversionX, tempK: solved.tempK, pInletPsig: solved.pInletPsig,
        epsilonA: solved.epsilonA, alphaErgun: solved.alphaErgun, thielePhi: solved.thielePhi,
        semenovPsi: solved.semenovPsi, coolantTcK, seriesTauMin, rtdTanksN, overpotentialV, iLimMaCm2,
      },
      metrics: {
        pInletPsia: solved.pInletPsia, yPressureRatio: solved.yPressureRatio,
        vRatioCstrPfr: solved.vRatioCstrPfr, effectivenessEta: solved.effectivenessEta,
        semenovPsi: solved.semenovPsi, isRunaway: solved.isRunaway, isDiffusionLimited: solved.isDiffusionLimited,
      },
      equations: solved.equations,
      statusBanner,
    });
  });

  const eqSelect = useAgentSelectable(
    'equation', 'fogler-cre-reactor-sizing',
    `Fogler Ch. 2/5/12/15 & Perry Sec 7/19 Reactor Sizing (X=${solved.conversionX.toFixed(2)})`,
    {
      conversionX: solved.conversionX, vRatioCstrPfr: solved.vRatioCstrPfr,
      effectivenessEta: solved.effectivenessEta, semenovPsi: solved.semenovPsi,
    },
  );

  const blend = SUBJECT_WORKBENCH_BLENDS['wb6-kinetics-reactors'];
  const [showProofs, setShowProofs] = useState<boolean>(false);
  const [showMoreDiagrams, setShowMoreDiagrams] = useState<boolean>(false);
  const [showInvestigation, setShowInvestigation] = useState<boolean>(false);

  return (
    <section className="wb-panel" data-testid="wb6-kinetics-reactors">
      <header className="wb-toolbar">
        <div>
          <h2>⚗️ Reactor R-401 Levenspiel Sizing &amp; Runaway Safety</h2>
          <p className="wb-subtitle studio-drawer-collapsed" data-testid="wb6-blended-sources-badge">
            📚 Blended Sources: <code>{blend.blendedSourcesBadge}</code>
          </p>
        </div>
        <div className="wb-actions-row">
          <button
            type="button" data-testid="wb6-trap-runaway"
            onClick={() => { setConversionX(0.88); setSemenovPsi(0.52); }}
          >
            🔥 Runaway Trap (ψ=0.52)
          </button>
          <button
            type="button" data-testid="wb6-trap-thiele"
            onClick={() => { setThielePhi(6.5); setSemenovPsi(0.25); }}
          >
            🧱 Pore Trap (φ=6.5)
          </button>
          <button
            type="button" data-testid="wb6-rescue-safe"
            onClick={() => { setConversionX(0.80); setThielePhi(1.1); setSemenovPsi(0.24); setPInletPsig(60); }}
          >
            ✅ Rescue Safe Design
          </button>
        </div>
      </header>

      <div className="wb-split">
        <div>
          <LevenspielReactorSvgCanvas
            solved={solved}
            onScrubConversionAndPhi={(nextX, nextPhi) => { setConversionX(nextX); setThielePhi(nextPhi); }}
          />
          <div className="wb-panel" data-testid="wb6-status-banner">
            <strong>{solved.isRunaway || solved.isDiffusionLimited ? '⚠️ Reactor Guardrail: ' : '✅ Reactor Verdict: '}</strong>
            <span className="mono">{statusBanner}</span>
          </div>
        </div>

        <div>
          <ScrubbableNumberInput paramId="kin-conv-x" label="Target Conversion X" value={conversionX} unit="mol/mol" min={0.05} max={0.96} step={0.02} onChange={setConversionX} />
          <ScrubbableNumberInput paramId="kin-temp-k" label="Reactor Temperature T" value={tempK} unit="K" min={300} max={750} step={5} onChange={setTempK} />
          <ScrubbableNumberInput paramId="kin-pin-psig" label="Inlet Gauge Pressure P_in" value={pInletPsig} unit="psig" min={-10} max={500} step={5} onChange={setPInletPsig} />
          <ScrubbableNumberInput paramId="kin-eps-a" label="Gas Expansion Factor ε_A" value={epsilonA} unit="-" min={-0.5} max={1.5} step={0.05} onChange={setEpsilonA} />
          <ScrubbableNumberInput paramId="kin-alpha-ergun" label="Ergun PBR Pressure Parameter α" value={alphaErgun} unit="kg⁻¹" min={0} max={0.04} step={0.002} onChange={setAlphaErgun} />
          <ScrubbableNumberInput paramId="kin-thiele-phi" label="Thiele Modulus φ (Spherical Pellet)" value={thielePhi} unit="-" min={0.1} max={15.0} step={0.1} onChange={setThielePhi} />
          <ScrubbableNumberInput paramId="kin-semenov-psi" label="Semenov Heat-Release Number ψ" value={semenovPsi} unit="-" min={0.05} max={0.95} step={0.02} onChange={setSemenovPsi} />
        </div>
      </div>

      <div className="studio-disclosure-bar">
        <button type="button" onClick={() => setShowProofs(!showProofs)}>
          {showProofs ? '▾' : '▸'} 📐 Show Math Proofs ({solved.equations.length})
        </button>
        <button type="button" onClick={() => setShowMoreDiagrams(!showMoreDiagrams)}>
          {showMoreDiagrams ? '▾' : '▸'} 📊 More Diagrams (Semenov, Selectivity/RTD, LHHW, Electro)
        </button>
        <button type="button" onClick={() => setShowInvestigation(!showInvestigation)}>
          {showInvestigation ? '▾' : '▸'} 🕵️ 6-Stage Investigation
        </button>
      </div>

      <div className={showProofs ? '' : 'studio-drawer-collapsed'} {...eqSelect.selectableProps}>
        {solved.equations.map((eq) => (
          <WhiteBoxEquationCard key={eq.id} equation={eq} personaMode={personaMode} />
        ))}
      </div>

      <div className={showMoreDiagrams ? '' : 'studio-drawer-collapsed'}>
        <KineticsDiagramGallery
          coolantTcK={coolantTcK} semenovPsi={semenovPsi} seriesTauMin={seriesTauMin}
          rtdTanksN={rtdTanksN} overpotentialV={overpotentialV} iLimMaCm2={iLimMaCm2}
          onChangeSemenov={(ntc, npsi) => { setCoolantTcK(ntc); setSemenovPsi(npsi); }}
          onChangeTauAndTanks={(ntau, nn) => { setSeriesTauMin(ntau); setRtdTanksN(nn); }}
          onChangeElectro={(neta, nilim) => { setOverpotentialV(neta); setILimMaCm2(nilim); }}
        />
      </div>

      <div className={showInvestigation ? '' : 'studio-drawer-collapsed'}>
        <LearnModeCallout
          workbenchId="wb6"
          title="Levenspiel CSTR/PFR, Thiele η, Semenov Runaway, Selectivity/RTD, LHHW/Bioreactor & Electro-Catalysis"
          plainEnglish="Drag the Levenspiel plot, Semenov G(T)/R(T) S-curve, Series selectivity / RTD, LHHW rate roof / Monod chemostat, or Butler-Volmer polarization curve."
          commonTrap="Three classic traps: (1) forgetting psig → psia (+14.696) before computing gas concentration C_A0 = P_abs/(RT), (2) mixing open-pipe Fanning f_F / Darcy f_D = 4·f_F with packed-bed Ergun friction, and (3) operating above Semenov ψ_crit = 1/e ≈ 0.368."
          perryAnchor="[Fogler 7th Ed., Ch. 2, 5, 8–12, 15, 16–19; BSL 2nd Ed., Ch. 18; Crowl & Louvar 4th Ed., Ch. 8; Perry's 9th Ed., Sec. 7 & 19]"
        />
      </div>
    </section>
  );
};
