// WB4: Perry's Sec 13 & 14 Distillation Workbench — Bi-Directional McCabe-Thiele + Tray/Packing Flooding.
import React, { useState } from 'react';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { KaTeXBlock } from '../ui/katex-block';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { ColumnFloodingSvgSketch } from '../sketches/column-flooding-svg-sketch';
import { McCabeThieleSvgCanvas } from '../sketches/mccabe-thiele-svg-canvas';
import { ScrubbableNumberInput } from '../ui/scrubbable-number-input';

export const DistillationWorkbench: React.FC = () => {
  const { personaMode } = usePersonaTheme();
  const [alpha, setAlpha] = useState<number>(2.45);
  const [xf, setXf] = useState<number>(0.5);
  const [xd, setXd] = useState<number>(0.95);
  const [xb, setXb] = useState<number>(0.05);
  const [q, setQ] = useState<number>(1.0);
  const [rMult, setRMult] = useState<number>(1.3);
  const [traySpacingM, setTraySpacingM] = useState<number>(0.61);
  const [colDiamM, setColDiamM] = useState<number>(1.2);

  // Pinch & FUG calculations
  const yPinch = (alpha * xf) / (1 + (alpha - 1) * xf);
  const rMin = Math.max((xd - yPinch) / Math.max(yPinch - xf, 0.02), 0.1);
  const rOp = rMult * rMin;
  const nMin = Math.log((xd * (1 - xb)) / Math.max(xb * (1 - xd), 1e-6)) / Math.log(Math.max(alpha, 1.05));
  const totalStages = Math.max(Math.round(nMin * 2.1), 6);
  const feedStage = Math.max(Math.round(totalStages * 0.5), 2);

  // Sec 14 Fair's Souders-Brown & Eckert GPDC hydraulics coupled to V = (R+1)*D
  const distillateKmolHr = 100 * ((xf - xb) / Math.max(xd - xb, 0.05));
  const vRectKmolHr = (rOp + 1) * distillateKmolHr;
  const lRectKmolHr = rOp * distillateKmolHr;
  const fLv = (lRectKmolHr / Math.max(vRectKmolHr, 1)) * Math.sqrt(2.85 / 815.0);
  const cSbMs = (0.0105 + 0.1496 * Math.pow(traySpacingM, 0.755)) * Math.pow(10, -0.14 * Math.log10(Math.max(fLv, 0.02)));
  const uFloodMs = cSbMs * Math.pow(21.0 / 20.0, 0.2) * Math.sqrt((815 - 2.85) / 2.85);
  const qVaporM3s = (vRectKmolHr * 82.0) / 3600 / 2.85;
  const aNet = ((Math.PI * colDiamM * colDiamM) / 4) * 0.88;
  const uActualMs = qVaporM3s / Math.max(aNet, 0.05);
  const pctFlood = (uActualMs / Math.max(uFloodMs, 0.05)) * 100;
  const dpPacking = 42.0 * Math.pow(uActualMs / 1.1, 1.85);

  const fenskeSelect = useAgentSelectable(
    'equation',
    'eq-13-fenske',
    'Fenske N_min & Underwood R_min (Perry Sec 13, p. 13-36)',
    { rMin, rOp, nMin, totalStages },
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
          totalStages={totalStages}
          feedStage={feedStage}
          fLv={fLv}
          cSbMs={cSbMs}
          percentFlood={pctFlood}
          dpPackingMmH2oM={dpPacking}
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
          <KaTeXBlock latex={'N_{\\min} = \\frac{\\ln[(x_D/(1-x_D))\\cdot((1-x_B)/x_B)]}{\\ln \\alpha_{AB}}'} testId="katex-fenske" />
          <p className="mono">
            R_min = {rMin.toFixed(3)} · R_op = {rOp.toFixed(3)} · N_min = {nMin.toFixed(2)}{' '}
            <code>[Perry&apos;s 9th Ed., Sec. 13, p. 13-36]</code>
          </p>
          <p className="mono">
            V_rect = {vRectKmolHr.toFixed(1)} kmol/h · L_rect = {lRectKmolHr.toFixed(1)} kmol/h · F_LV = {fLv.toFixed(3)}{' '}
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
