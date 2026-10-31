// WB4: Perry's Sec 13–16 Separation Workbench — McCabe-Thiele, Fair Flooding, Kremser Absorption & Ternary LLE/Adsorption.
import React, { useEffect, useState } from 'react';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { useWorkbenchMutations } from '../../hooks/use-workbench-mutations';
import { syncWorkbenchPayload } from '../../actions/view-screen';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { ScrubbableNumberInput } from '../ui/scrubbable-number-input';
import { WhiteBoxEquationCard } from '../ui/white-box-equation-card';
import { DistillationDiagramGallery } from './distillation-diagram-gallery';
import { solveDistillation } from './distillation-solver-math';

export const DistillationWorkbench: React.FC = () => {
  const { personaMode } = usePersonaTheme();
  const [alpha, setAlpha] = useState<number>(2.45);
  const [xf, setXf] = useState<number>(0.5);
  const [xd, setXd] = useState<number>(0.95);
  const [xb, setXb] = useState<number>(0.05);
  const [q, setQ] = useState<number>(1.0);
  const [rMult, setRMult] = useState<number>(1.3);
  const [traySpacingM, setTraySpacingM] = useState<number>(0.61);
  const [colDiamM, setColDiamM] = useState<number>(0.85);
  const [absorptionA, setAbsorptionA] = useState<number>(1.4);
  const [recoveryFrac, setRecoveryFrac] = useState<number>(0.95);
  const [soluteFeedZ, setSoluteFeedZ] = useState<number>(0.26);
  const [peNumber, setPeNumber] = useState<number>(45);

  const solved = solveDistillation({ alpha, xf, xd, xb, q, rMult, traySpacingM, colDiamM });
  const { rMin, rOp, nMin, floodPercent, isFlooding } = solved;

  useWorkbenchMutations('wb4-distillation', (p) => {
    if (p.alpha !== undefined) setAlpha(Number(p.alpha));
    if (p.xf !== undefined) setXf(Number(p.xf));
    if (p.xd !== undefined) setXd(Number(p.xd));
    if (p.xb !== undefined) setXb(Number(p.xb));
    if (p.q !== undefined) setQ(Number(p.q));
    if (p.rMult !== undefined) setRMult(Number(p.rMult));
    if (p.colDiamM !== undefined) setColDiamM(Number(p.colDiamM));
    if (p.absorptionA !== undefined) setAbsorptionA(Number(p.absorptionA));
    if (p.recoveryFrac !== undefined) setRecoveryFrac(Number(p.recoveryFrac));
    if (p.soluteFeedZ !== undefined) setSoluteFeedZ(Number(p.soluteFeedZ));
    if (p.peNumber !== undefined) setPeNumber(Number(p.peNumber));
  });

  useEffect(() => {
    syncWorkbenchPayload('wb4-distillation', {
      summary: `WB4 distillation: α ${alpha.toFixed(2)}, R/R_min ${rMult.toFixed(2)} → ${floodPercent.toFixed(1)}% of Fair flood`,
      inputs: { alpha, xf, xd, xb, q, rMult, traySpacingM, colDiamM, absorptionA, recoveryFrac, soluteFeedZ, peNumber },
      metrics: {
        rMin, rOp, nMin, totalStages: solved.totalStages, floodPercent,
        isFlooding, vRectKmolHr: solved.vRectKmolHr,
      },
      equations: solved.equations,
      statusBanner: isFlooding ? `⚠️ FLOODING at ${floodPercent.toFixed(1)}%` : `✅ ${floodPercent.toFixed(1)}% of flood`,
    });
  });

  const fenskeSelect = useAgentSelectable(
    'equation', 'eq-13-fenske',
    'Fenske N_min & Underwood R_min (Perry Sec 13, p. 13-36)',
    { rMin, rOp, nMin, totalStages: solved.totalStages },
  );

  const [showProofs, setShowProofs] = useState<boolean>(false);
  const [showMoreDiagrams, setShowMoreDiagrams] = useState<boolean>(false);
  const [showInvestigation, setShowInvestigation] = useState<boolean>(false);

  return (
    <section className="wb-panel" data-testid="wb4-distillation">
      <header className="wb-toolbar">
        <div>
          <h2>🗼 Column T-201 McCabe-Thiele &amp; Fair Flooding</h2>
          <p className="wb-subtitle studio-drawer-collapsed" data-testid="wb4-blended-sources-badge">
            📚 Blended Sources: <code>Seader, Henley &amp; Roper 4th Ed. Ch. 6/7/8/9/14/15/18 · Perry&apos;s Sec 12–16/20 · SVNA Ch. 10</code>
          </p>
        </div>
        <div className="wb-actions-row">
          <span className={`wb-verdict ${isFlooding ? 'fail' : 'pass'}`} style={{ margin: 0, padding: '0.2rem 0.6rem', fontSize: '0.76rem' }}>
            {isFlooding ? `⚠️ Flooding: ${floodPercent.toFixed(1)}% of Fair limit` : `✅ Safe: ${floodPercent.toFixed(1)}% of Fair flood · N = ${solved.totalStages} stages`}
          </span>
          <label>
            Tray Spacing h_t:
            <select aria-label="Tray spacing" value={traySpacingM} onChange={(e) => setTraySpacingM(Number(e.target.value))}>
              <option value={0.305}>12 in (0.305 m)</option>
              <option value={0.457}>18 in (0.457 m)</option>
              <option value={0.61}>24 in (0.610 m)</option>
            </select>
          </label>
        </div>
      </header>

      <DistillationDiagramGallery
        alpha={alpha} xf={xf} xd={xd} xb={xb} q={q} rOp={rOp} rMin={rMin} rMult={rMult}
        colDiamM={colDiamM} traySpacingM={traySpacingM} totalStages={solved.totalStages}
        feedStage={solved.feedStage} fLv={solved.fLv} cSbMs={solved.cSbMs}
        floodPercent={floodPercent} dpPackingMmH2oM={solved.dpPackingMmH2oM}
        absorptionA={absorptionA} recoveryFrac={recoveryFrac}
        soluteFeedZ={soluteFeedZ} peNumber={peNumber}
        showMoreDiagrams={showMoreDiagrams}
        onChangeQ={setQ} onChangeXd={setXd} onChangeXf={setXf} onChangeXb={setXb}
        onChangeRMult={setRMult} onChangeColDiamM={setColDiamM} onChangeTraySpacingM={setTraySpacingM}
        onChangeKremser={(na, nr) => { setAbsorptionA(na); setRecoveryFrac(nr); }}
        onChangeLleAndPe={(nz, npe) => { setSoluteFeedZ(nz); setPeNumber(npe); }}
      />

      <div className="wb-split">
        <div>
          <ScrubbableNumberInput paramId="dist-alpha" label="Relative Volatility α" value={alpha} unit="-" min={1.2} max={6.0} step={0.05} onChange={setAlpha} />
          <ScrubbableNumberInput paramId="dist-xf" label="Feed Mole Fraction z_F" value={xf} unit="mol/mol" min={0.1} max={0.9} step={0.02} onChange={setXf} />
          <ScrubbableNumberInput paramId="dist-xd" label="Distillate Purity x_D" value={xd} unit="mol/mol" min={0.7} max={0.995} step={0.01} onChange={setXd} />
          <ScrubbableNumberInput paramId="dist-xb" label="Bottoms Impurity x_B" value={xb} unit="mol/mol" min={0.005} max={0.25} step={0.01} onChange={setXb} />
        </div>
        <div>
          <ScrubbableNumberInput paramId="dist-q" label="Feed Thermal Quality q" value={q} unit="-" min={-0.3} max={1.4} step={0.05} onChange={setQ} />
          <ScrubbableNumberInput paramId="dist-rmult" label="Reflux Ratio R / R_min" value={rMult} unit="×" min={1.05} max={4.5} step={0.05} onChange={setRMult} />
          <ScrubbableNumberInput paramId="dist-diam" label="Column Diameter D_c" value={colDiamM} unit="m" min={0.5} max={3.5} step={0.05} onChange={setColDiamM} />
        </div>
      </div>

      <div className="studio-disclosure-bar">
        <button type="button" onClick={() => setShowProofs(!showProofs)}>
          {showProofs ? '▾' : '▸'} 📐 Show Math Proofs ({solved.equations.length})
        </button>
        <button type="button" onClick={() => setShowMoreDiagrams(!showMoreDiagrams)}>
          {showMoreDiagrams ? '▾' : '▸'} 📊 More Diagrams (Kremser, Ternary LLE, Psychrometry, Membrane)
        </button>
        <button type="button" onClick={() => setShowInvestigation(!showInvestigation)}>
          {showInvestigation ? '▾' : '▸'} 🕵️ 6-Stage Investigation
        </button>
      </div>

      <aside className={showProofs ? 'wb-tutor-card' : 'wb-tutor-card studio-drawer-collapsed'} {...fenskeSelect.selectableProps}>
        <h3>
          {personaMode === 'learn'
            ? '🎓 Tier 1 — Fenske-Underwood-Gilliland & Stage Stepping'
            : '🏭 Tier 2 — Sec 14 Fair Flooding & Eckert GPDC Rating'}
        </h3>
        <WhiteBoxEquationCard equation={solved.equations[0]} personaMode={personaMode} katexTestIds={{ symbolic: 'katex-fenske' }} />
        <WhiteBoxEquationCard equation={solved.equations[1]} personaMode={personaMode} />
        <p className="mono">
          V_rect = {solved.vRectKmolHr.toFixed(1)} kmol/h · L_rect = {solved.lRectKmolHr.toFixed(1)} kmol/h · F_LV = {solved.fLv.toFixed(3)}{' '}
          <code>[Perry&apos;s 9th Ed., Fig. 14-32, p. 14-37]</code>
        </p>
        <p className="mono">
          Packing Table Ref: <code>[Perry&apos;s 9th Ed., Table 14-13, p. 14-58]</code>
        </p>
      </aside>

      <div className={showInvestigation ? '' : 'studio-drawer-collapsed'}>
        <LearnModeCallout
          workbenchId="wb4"
          title="McCabe-Thiele Stage Stepping, Column Flooding, Kremser, LLE/Adsorption, Psychrometry & Membranes"
          plainEnglish="Drag McCabe-Thiele handles, column diameter D_c, Kremser A = L/(mV), Ternary LLE/adsorption, or Psychrometric T_db/RH and Membrane stage cut θ."
          commonTrap="Operating above ~80–85% of Fair's entrainment flood velocity blows liquid up into the tray above, and operating an absorber at A < 1 pinches solute recovery."
          perryAnchor="[Perry's 9th Ed., Sec. 13, p. 13-36 & Fig. 14-32, p. 14-37]"
        />
      </div>
    </section>
  );
};
