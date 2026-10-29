// WB4: Perry's Sec 13 & 14 Distillation Workbench — Bi-Directional McCabe-Thiele + Tray/Packing Flooding.
import React, { useEffect, useState } from 'react';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { useWorkbenchMutations } from '../../hooks/use-workbench-mutations';
import { syncWorkbenchPayload } from '../../actions/view-screen';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { ColumnFloodingSvgSketch } from '../sketches/column-flooding-svg-sketch';
import { McCabeThieleSvgCanvas } from '../sketches/mccabe-thiele-svg-canvas';
import { ScrubbableNumberInput } from '../ui/scrubbable-number-input';
import { WhiteBoxEquationCard } from '../ui/white-box-equation-card';
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
  });

  useEffect(() => {
    syncWorkbenchPayload('wb4-distillation', {
      summary: `WB4 distillation: α ${alpha.toFixed(2)}, R/R_min ${rMult.toFixed(2)} → ${floodPercent.toFixed(1)}% of Fair flood`,
      inputs: { alpha, xf, xd, xb, q, rMult, traySpacingM, colDiamM },
      metrics: {
        rMin, rOp, nMin, totalStages: solved.totalStages, floodPercent,
        isFlooding, vRectKmolHr: solved.vRectKmolHr,
      },
      equations: solved.equations,
      statusBanner: isFlooding ? `⚠️ FLOODING at ${floodPercent.toFixed(1)}%` : `✅ ${floodPercent.toFixed(1)}% of flood`,
    });
  });

  const fenskeSelect = useAgentSelectable(
    'equation',
    'eq-13-fenske',
    'Fenske N_min & Underwood R_min (Perry Sec 13, p. 13-36)',
    { rMin, rOp, nMin, totalStages: solved.totalStages },
  );

  return (
    <section className="wb-panel" data-testid="wb4-distillation">
      <header className="wb-toolbar">
        <div>
          <h2>WB4 · Sec 13 &amp; 14 Distillation: McCabe-Thiele &amp; Column Flooding Hydraulics</h2>
          <p className="wb-subtitle">
            Draggable <code>q</code>-line · Fair&apos;s <code>Fig. 14-32 (p. 14-37)</code> tray flooding · Eckert GPDC{' '}
            <code>Fig. 14-55 (p. 14-57)</code>
          </p>
        </div>
        <div className="wb-actions-row">
          <label>
            Tray Spacing h_t:
            <select
              aria-label="Tray spacing"
              value={traySpacingM}
              onChange={(e) => setTraySpacingM(Number(e.target.value))}
            >
              <option value={0.305}>12 in (0.305 m)</option>
              <option value={0.457}>18 in (0.457 m)</option>
              <option value={0.61}>24 in (0.610 m)</option>
            </select>
          </label>
        </div>
      </header>

      <LearnModeCallout
        workbenchId="wb4"
        title="McCabe-Thiele Stage Stepping & Column Flooding"
        plainEnglish="Drag the feed thermal quality q or Reflux Ratio R/R_min. More reflux reduces the number of equilibrium stages (stairs) needed, but increases vapor boilup V and pushes the column closer to flooding."
        commonTrap="Operating above ~80–85% of Fair's entrainment flood velocity blows liquid up into the tray above, collapsing separation efficiency."
        perryAnchor="[Perry's 9th Ed., Sec. 13, p. 13-36 & Fig. 14-32, p. 14-37]"
      />

      <div className="wb-split">
        <McCabeThieleSvgCanvas
          alpha={alpha}
          xf={xf}
          xd={xd}
          xb={xb}
          q={q}
          rOp={rOp}
          onChangeQ={setQ}
        />

        <ColumnFloodingSvgSketch
          columnDiameterM={colDiamM}
          traySpacingM={traySpacingM}
          totalStages={solved.totalStages}
          feedStage={solved.feedStage}
          fLv={solved.fLv}
          cSbMs={solved.cSbMs}
          percentFlood={floodPercent}
          dpPackingMmH2oM={solved.dpPackingMmH2oM}
        />
      </div>

      <div className="wb-split">
        <div>
          <ScrubbableNumberInput paramId="dist-alpha" label="Relative Volatility α" value={alpha} unit="-" min={1.2} max={6.0} step={0.05} onChange={setAlpha} />
          <ScrubbableNumberInput paramId="dist-xf" label="Feed Mole Fraction z_F" value={xf} unit="mol/mol" min={0.1} max={0.9} step={0.02} onChange={setXf} />
          <ScrubbableNumberInput paramId="dist-xd" label="Distillate Purity x_D" value={xd} unit="mol/mol" min={0.7} max={0.995} step={0.01} onChange={setXd} />
          <ScrubbableNumberInput paramId="dist-xb" label="Bottoms Impurity x_B" value={xb} unit="mol/mol" min={0.005} max={0.25} step={0.01} onChange={setXb} />
          <ScrubbableNumberInput paramId="dist-q" label="Feed Thermal Quality q" value={q} unit="-" min={-0.3} max={1.4} step={0.05} onChange={setQ} />
          <ScrubbableNumberInput paramId="dist-rmult" label="Reflux Ratio R / R_min" value={rMult} unit="×" min={1.05} max={4.5} step={0.05} onChange={setRMult} />
          <ScrubbableNumberInput paramId="dist-diam" label="Column Diameter D_c" value={colDiamM} unit="m" min={0.5} max={3.5} step={0.05} onChange={setColDiamM} />
        </div>

        <aside className="wb-tutor-card" {...fenskeSelect.selectableProps}>
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
      </div>
    </section>
  );
};
