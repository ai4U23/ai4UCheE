// WB3: Perry's Sec 6, 8 & 10 Fluid Hydraulics, Pipe Sizing (Sch 40/80), Pump NPSHa & Control Valve Cv.
import React, { useEffect, useState } from 'react';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { useWorkbenchMutations } from '../../hooks/use-workbench-mutations';
import { syncWorkbenchPayload } from '../../actions/view-screen';
import { KaTeXBlock } from '../ui/katex-block';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { PipingPumpSvgSketch } from '../sketches/piping-pump-svg-sketch';
import { ScrubbableNumberInput } from '../ui/scrubbable-number-input';
import { WhiteBoxEquationCard } from '../ui/white-box-equation-card';
import { solveHydraulics } from './hydraulics-solver-math';

export const HydraulicsWorkbench: React.FC = () => {
  const { personaMode } = usePersonaTheme();
  const [npsInch, setNpsInch] = useState<number>(4);
  const [schedule, setSchedule] = useState<'40' | '80'>('40');
  const [flowGpm, setFlowGpm] = useState<number>(250);
  const [lengthM, setLengthM] = useState<number>(100);
  const [pSuctionPsig, setPSuctionPsig] = useState<number>(2.0);
  const [zSuctionM, setZSuctionM] = useState<number>(2.0);
  const [npshrM, setNpshrM] = useState<number>(3.0);
  const [valveDpPsi, setValveDpPsi] = useState<number>(30.0);

  const solved = solveHydraulics({ flowGpm, npsInch, schedule, lengthM, pSuctionPsig, zSuctionM, npshrM, valveDpPsi });
  const { caseNorm, npshAvailableM, isCavitating } = solved;

  useWorkbenchMutations('wb3-hydraulics', (p) => {
    if (p.flowGpm !== undefined) setFlowGpm(Number(p.flowGpm));
    if (p.npsInch !== undefined) setNpsInch(Number(p.npsInch));
    if (p.schedule !== undefined) setSchedule(String(p.schedule) as '40' | '80');
    if (p.pSuctionPsig !== undefined) setPSuctionPsig(Number(p.pSuctionPsig));
    if (p.zSuctionM !== undefined) setZSuctionM(Number(p.zSuctionM));
    if (p.npshrM !== undefined) setNpshrM(Number(p.npshrM));
  });

  useEffect(() => {
    syncWorkbenchPayload('wb3-hydraulics', {
      summary: `WB3 hydraulics @ ${flowGpm} gpm, ${npsInch}" Sch ${schedule}: NPSH_A ${npshAvailableM.toFixed(2)} m vs NPSH_r ${npshrM.toFixed(1)} m`,
      inputs: { flowGpm, npsInch, schedule, lengthM, pSuctionPsig, zSuctionM, npshrM, valveDpPsi },
      metrics: {
        reynolds: caseNorm.re, fDarcy: caseNorm.fDarcy, fFanning: caseNorm.fFanning,
        pAbsPa: solved.pAbsPa, npshAvailableM, npshrM, isCavitating,
      },
      equations: solved.equations,
      statusBanner: isCavitating ? '⚠️ CAVITATION — NPSH_A below NPSH_r' : '✅ SAFE — NPSH_A ≥ NPSH_r',
    });
  });

  const eqGuardrailSelect = useAgentSelectable(
    'equation',
    'eq-6-38-fanning-darcy',
    'Darcy f_D = 4·f_F Guardrail (Perry Fig. 6-9, p. 6-10)',
    { re: caseNorm.re, fDarcy: caseNorm.fDarcy, fFanning: caseNorm.fFanning },
  );

  return (
    <section className="wb-panel" data-testid="wb3-hydraulics">
      <header className="wb-toolbar">
        <div>
          <h2>WB3 · Sec 6, 8 &amp; 10 Fluid Hydraulics, Pipe Sizing, Pump NPSHa &amp; Valve Cv</h2>
          <p className="wb-subtitle">
            ASME B36.10M <code>Table 10-22 (p. 10-70)</code> · Explicit <code>f_D = 4·f_F</code> guardrail · 3-Case <code>70%/100%/120%</code> matrix
          </p>
        </div>
        <div className="wb-actions-row">
          <label>
            NPS:
            <select aria-label="Nominal pipe size" value={npsInch} onChange={(e) => setNpsInch(Number(e.target.value))}>
              <option value={2}>2&quot;</option>
              <option value={3}>3&quot;</option>
              <option value={4}>4&quot;</option>
              <option value={6}>6&quot;</option>
            </select>
          </label>
          <label>
            Schedule:
            <select aria-label="Pipe schedule" value={schedule} onChange={(e) => setSchedule(e.target.value as '40' | '80')}>
              <option value="40">Sch 40</option>
              <option value="80">Sch 80</option>
            </select>
          </label>
        </div>
      </header>

      <LearnModeCallout
        workbenchId="wb3"
        title="Pipe Friction Loss, Pump Cavitation & Control Valves"
        plainEnglish="Drag Flow Q or Suction Pressure to see how velocity, friction loss, and Available Net Positive Suction Head (NPSHa) respond across 70% / 100% / 120% operating cases."
        commonTrap="If NPSHa drops below Pump NPSHr, liquid flashes into vapor bubbles that implode on the impeller (cavitation)."
        perryAnchor="[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11 & Sec. 8, p. 8-71]"
      />

      <div className="wb-panel" {...eqGuardrailSelect.selectableProps} data-testid="darcy-fanning-banner">
        <strong>🛡️ Darcy vs. Fanning Friction Guardrail:</strong> Perry&apos;s <code>Fig. 6-9 (p. 6-10)</code> plots{' '}
        <em>Fanning</em> <code>f_F = {caseNorm.fFanning.toFixed(5)}</code>, while Darcy-Weisbach head loss uses{' '}
        <em>Darcy</em> <code>f_D = 4·f_F = {caseNorm.fDarcy.toFixed(5)}</code>{' '}
        <code>[Perry&apos;s 9th Ed., Eqs. 6-37..6-39, p. 6-11]</code>.
        <KaTeXBlock latex={'f_D = 4 f_F, \\quad h_f = f_D \\frac{L}{D} \\frac{v^2}{2g}'} testId="katex-darcy-fanning" />
      </div>

      {solved.equations.map((eq) => (
        <WhiteBoxEquationCard key={eq.id} equation={eq} personaMode={personaMode} />
      ))}

      <PipingPumpSvgSketch
        npsInch={npsInch}
        schedule={schedule}
        dInnerM={solved.dInnerM}
        flowGpm={flowGpm}
        pSuctionPsig={pSuctionPsig}
        zSuctionM={zSuctionM}
        npshaM={npshAvailableM}
        npshrM={npshrM}
        cvNormal={solved.cvNormal}
        isChoked={solved.isChoked}
        isFlashing={false}
      />

      <div className="wb-split">
        <div>
          <ScrubbableNumberInput paramId="hyd-flow-gpm" label="Normal Flow Q" value={flowGpm} unit="gpm" min={20} max={1200} step={10} onChange={setFlowGpm} />
          <ScrubbableNumberInput paramId="hyd-length-m" label="Pipe Length L" value={lengthM} unit="m" min={5} max={1000} step={5} onChange={setLengthM} />
          <ScrubbableNumberInput paramId="hyd-psuc-psig" label="Suction Pressure" value={pSuctionPsig} unit="psig" min={-14} max={100} step={1} onChange={setPSuctionPsig} />
          <ScrubbableNumberInput paramId="hyd-z-m" label="Suction Static Head z" value={zSuctionM} unit="m" min={-5} max={20} step={0.5} onChange={setZSuctionM} />
          <ScrubbableNumberInput paramId="hyd-npshr-m" label="Pump NPSHr" value={npshrM} unit="m" min={1} max={12} step={0.2} onChange={setNpshrM} />
          <ScrubbableNumberInput paramId="hyd-valve-dp" label="Valve ΔP" value={valveDpPsi} unit="psi" min={2} max={90} step={2} onChange={setValveDpPsi} />
        </div>

        <aside className="wb-tutor-card">
          <h3>
            {personaMode === 'learn'
              ? '🎓 Tier 1 — Shortcut Sizing & Fig. 6-9 Crosshair'
              : '🏭 Tier 2 — 3-Case (70%/100%/120%) EPC Datasheet Matrix'}
          </h3>
          <table className="mono" style={{ width: '100%', fontSize: '0.82rem' }} data-testid="hydraulics-3case-table">
            <thead>
              <tr>
                <th>Case</th>
                <th>Flow (gpm)</th>
                <th>v (m/s)</th>
                <th>Re</th>
                <th>f_F / f_D</th>
                <th>ΔP_tot (kPa)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Min 70%', c: solved.caseMin },
                { label: 'Normal 100%', c: caseNorm },
                { label: 'Rated 120%', c: solved.caseRated },
              ].map(({ label, c }) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{c.qGpm.toFixed(1)}</td>
                  <td>{c.vel.toFixed(2)}</td>
                  <td>{c.re.toExponential(2)}</td>
                  <td>
                    {c.fFanning.toFixed(4)} / {c.fDarcy.toFixed(4)}
                  </td>
                  <td>{c.dpTotalKpa.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mono">
            ISA-75.01 F_F = {(0.96 - 0.28 * Math.sqrt(3169.0 / 22064000.0)).toFixed(4)} · C_v(100%) = {solved.cvNormal.toFixed(1)}{' '}
            <code>[Perry&apos;s 9th Ed., Eqs. 8-77..8-81, p. 8-71]</code>
          </p>
        </aside>
      </div>
    </section>
  );
};
