// Cluster B (Sec 6..10) deterministic solvers, 3-stage white-box KaTeX derivations, and inverse SVG drag mappings.
import { solveHydraulics } from '../../components/workbenches/hydraulics-solver-math';
import { clampDomainValue, inverseLinearMap, inverseLog10Map } from '../svg-drag-math';
import { buildSvgCurvePoints, type PerrySectionDescriptor } from './perry-section-types';

const GRID_21 = Array.from({ length: 21 }, (_, i) => i / 20);

const calcDarcySwameeJain = (re: number, relRough: number): number =>
  re < 2100 ? 64 / Math.max(re, 100) : 0.25 / Math.pow(Math.log10(relRough / 3.7 + 5.74 / Math.pow(re, 0.9)), 2);

export const SEC_06_10_DESCRIPTORS: ReadonlyArray<PerrySectionDescriptor> = [
  {
    secNum: 6, secTitle: 'Fluid and Particle Dynamics', clusterId: 'cluster-b',
    secPage: '6-10', pdfPage1Based: 593, verifyToken: 'FIG. 6-9', citation: "[Perry's 9th Ed., Sec. 6, Fig. 6-9 & Eqs. 6-37..6-39, p. 6-10]",
    xAxisLabel: 'Reynolds Number Re (log10: 10³ → 10⁷)', yAxisLabel: 'Friction Factor f_F & Darcy f_D = 4·f_F (log10)',
    primaryParam: { key: 're', label: 'Reynolds Number Re', symbol: '\\mathrm{Re}', unit: '-', min: 1000, max: 1e7, step: 1000, defaultVal: 100000, scale: 'log10' },
    secondaryParam: { key: 'relRoughness', label: 'Relative Roughness ε/D', symbol: '\\varepsilon/D', unit: '-', min: 0.00001, max: 0.05, step: 0.00005, defaultVal: 0.00045, scale: 'linear' },
    deepDiveWorkbench: 'wb3-hydraulics',
    inverseSvgDrag: (u, v) => ({
      primaryVal: Math.round(clampDomainValue(inverseLog10Map(u, 1000, 1e7), 1000, 1e7)),
      secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.00001, 0.05), 0.00001, 0.05, 0.00005),
    }),
    solve: (reRaw, epsRaw) => {
      const re = clampDomainValue(reRaw, 1000, 1e7), relRough = clampDomainValue(epsRaw, 0.00001, 0.05);
      const fDarcy = calcDarcySwameeJain(re, relRough), fFanning = fDarcy / 4.0;
      const xs = GRID_21.map((t) => inverseLog10Map(t, 1000, 1e7));
      const fFSeries = xs.map((x) => calcDarcySwameeJain(x, relRough) / 4.0);
      const fDSeries = fFSeries.map((f) => 4.0 * f);
      return {
        secNum: 6, secTitle: 'Fluid and Particle Dynamics', clusterId: 'cluster-b',
        secPage: '6-10', pdfPage1Based: 593, verifyToken: 'FIG. 6-9', citation: "[Perry's 9th Ed., Sec. 6, Fig. 6-9 & Eqs. 6-37..6-39, p. 6-10]",
        primaryVal: re, secondaryVal: relRough, responseVal: Number(fFanning.toFixed(5)), responseUnit: 'f_F (-)',
        secondaryResponseLabel: 'Darcy Friction Factor f_D = 4·f_F', secondaryResponseVal: `f_D = ${fDarcy.toFixed(5)} (4 × ${fFanning.toFixed(5)})`,
        statusBanner: re < 2100 ? `Laminar Regime (Re = ${Math.round(re)}) → f_F = 16/Re = ${fFanning.toFixed(4)}, f_D = 64/Re = ${fDarcy.toFixed(4)}` : `Turbulent Colebrook/Swamee-Jain (Re = ${Math.round(re).toLocaleString()}) → f_F = ${fFanning.toFixed(5)}, f_D = ${fDarcy.toFixed(5)}`,
        isAlert: re >= 2100 && re < 4000, deepDiveWorkbench: 'wb3-hydraulics',
        curvePoints: buildSvgCurvePoints(xs, fFSeries, [1000, 1e7], [0.001, 0.12], 'log10', 'log10'),
        secondaryCurvePoints: buildSvgCurvePoints(xs, fDSeries, [1000, 1e7], [0.001, 0.12], 'log10', 'log10'),
        secondaryCurveLabel: 'Darcy f_D = 4 · f_F',
        operatingPoint: buildSvgCurvePoints([re], [fFanning], [1000, 1e7], [0.001, 0.12], 'log10', 'log10')[0],
        readoutText: `Re = ${Math.round(re).toLocaleString()}, ε/D = ${relRough.toFixed(5)} → Fanning f_F = ${fFanning.toFixed(5)} · Darcy f_D = 4·f_F = ${fDarcy.toFixed(5)}`,
        learnCallout: { title: 'Fanning (f_F) vs. Darcy-Weisbach (f_D = 4·f_F)', plainEnglish: 'Perry Fig. 6-9 plots Fanning friction factor f_F, whereas Darcy-Weisbach head loss h_f = f_D (L/D)(v²/2g) uses Darcy f_D = 4·f_F.', commonTrap: 'Using Fanning f_F in the Darcy equation without multiplying by 4 underpredicts pipe pressure drop by 400%!' },
        equations: [{
          id: 'sec6-colebrook-swamee', title: 'Swamee-Jain Explicit Colebrook & Fanning-Darcy Identity', citation: "[Perry's 9th Ed., Sec. 6, Fig. 6-9 & Eqs. 6-37..6-39, p. 6-10]",
          symbolicLatex: 'f_D = \\frac{0.25}{\\left[\\log_{10}\\!\\left(\\frac{\\varepsilon/D}{3.7} + \\frac{5.74}{\\mathrm{Re}^{0.9}}\\right)\\right]^2}, \\quad f_F = \\frac{f_D}{4}, \\quad f_D = 4 f_F',
          substitutedLatex: `\\mathrm{Re} = ${re.toExponential(2)}, \\; \\varepsilon/D = ${relRough.toFixed(5)}`,
          resultLatex: `f_F = ${fFanning.toFixed(5)}, \\quad f_D = 4 f_F = ${fDarcy.toFixed(5)}`,
        }],
      };
    },
  },
  {
    secNum: 7, secTitle: 'Reaction Kinetics', clusterId: 'cluster-b',
    secPage: '7-6', pdfPage1Based: 639, verifyToken: 'Arrhenius', citation: "[Perry's 9th Ed., Sec. 7, Eq. 7-11, p. 7-6]",
    xAxisLabel: 'Reaction Temperature T (K: 300 → 750)', yAxisLabel: 'Batch Conversion X = 1 - exp(-k·t)',
    primaryParam: { key: 'tempK', label: 'Reaction Temperature T', symbol: 'T', unit: 'K', min: 300, max: 750, step: 2, defaultVal: 450, scale: 'linear' },
    secondaryParam: { key: 'eaKjMol', label: 'Activation Energy E_a', symbol: 'E_a', unit: 'kJ/mol', min: 25, max: 180, step: 1, defaultVal: 75, scale: 'linear' },
    deepDiveWorkbench: 'wb6-kinetics-reactors',
    inverseSvgDrag: (u, v) => ({
      primaryVal: clampDomainValue(inverseLinearMap(u, 300, 750), 300, 750, 2),
      secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 25, 180), 25, 180, 1),
    }),
    solve: (tRaw, eaRaw) => {
      const tempK = clampDomainValue(tRaw, 300, 750), eaKjMol = clampDomainValue(eaRaw, 25, 180);
      const aPreExp = 2.5e6, rGas = 8.314, tBatchS = 300;
      const calcK = (t: number) => aPreExp * Math.exp(-(eaKjMol * 1000) / (rGas * t));
      const kRate = calcK(tempK), convX = 1 - Math.exp(-kRate * tBatchS);
      const dLnKdT = (eaKjMol * 1000) / (rGas * tempK * tempK);
      const xs = GRID_21.map((t) => 300 + t * 450);
      return {
        secNum: 7, secTitle: 'Reaction Kinetics', clusterId: 'cluster-b',
        secPage: '7-6', pdfPage1Based: 639, verifyToken: 'Arrhenius', citation: "[Perry's 9th Ed., Sec. 7, Eq. 7-11, p. 7-6]",
        primaryVal: tempK, secondaryVal: eaKjMol, responseVal: Number(convX.toFixed(4)), responseUnit: 'X (mol/mol)',
        secondaryResponseLabel: 'Arrhenius Rate Constant k(T)', secondaryResponseVal: `k = ${kRate.toExponential(3)} s⁻¹ (d ln k/dT = ${(dLnKdT * 100).toFixed(2)} %/K)`,
        statusBanner: convX > 0.98 ? `Near-Complete Conversion X = ${(convX * 100).toFixed(1)}% (check thermal runaway risk at high T)` : `Batch Conversion X = ${(convX * 100).toFixed(1)}% at t = ${tBatchS} s (k = ${kRate.toExponential(2)} s⁻¹)`,
        isAlert: convX < 0.05 || (tempK > 600 && eaKjMol < 60), deepDiveWorkbench: 'wb6-kinetics-reactors',
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => 1 - Math.exp(-calcK(x) * tBatchS)), [300, 750], [0, 1]),
        operatingPoint: buildSvgCurvePoints([tempK], [convX], [300, 750], [0, 1])[0],
        readoutText: `T = ${tempK.toFixed(0)} K, E_a = ${eaKjMol.toFixed(0)} kJ/mol → k = ${kRate.toExponential(3)} s⁻¹ · Conversion X = ${(convX * 100).toFixed(1)}%`,
        learnCallout: { title: 'Arrhenius Exponential Temperature Sensitivity', plainEnglish: 'Rate constant k(T) = A exp(-E_a / RT) grows exponentially with T, driving an S-shaped light-off curve in batch conversion X = 1 - exp(-k·t).', commonTrap: 'Always convert E_a from kJ/mol to J/mol (×1,000) before dividing by R = 8.314 J/(mol·K)!' },
        equations: [{
          id: 'sec7-arrhenius', title: 'Arrhenius Rate Constant & 1st-Order Batch Conversion', citation: "[Perry's 9th Ed., Sec. 7, Eq. 7-11, p. 7-6]",
          symbolicLatex: 'k(T) = A\\exp\\!\\left(-\\frac{E_a}{R T}\\right), \\quad X = 1 - \\exp(-k\\cdot t)',
          substitutedLatex: `k(${tempK.toFixed(0)}) = 2.5\\times 10^6 \\exp\\!\\left(-\\frac{${(eaKjMol * 1000).toFixed(0)}}{8.314\\times ${tempK.toFixed(0)}}\\right) = ${kRate.toExponential(3)}\\ \\mathrm{s^{-1}}`,
          resultLatex: `X = 1 - \\exp(-${kRate.toExponential(3)}\\times 300) = ${convX.toFixed(4)}`,
        }],
      };
    },
  },
  {
    secNum: 8, secTitle: 'Process Control', clusterId: 'cluster-b',
    secPage: '8-14', pdfPage1Based: 683, verifyToken: 'Ziegler', citation: "[Perry's 9th Ed., Sec. 8, Fig. 8-21, p. 8-14]",
    xAxisLabel: 'Closed-Loop Tuning τ_c (s: 0.5 → 25.0)', yAxisLabel: 'Controller Gain K_c (-/-)',
    primaryParam: { key: 'tauC', label: 'Closed-Loop Time Constant τ_c', symbol: '\\tau_c', unit: 's', min: 0.5, max: 25.0, step: 0.5, defaultVal: 4.0, scale: 'linear' },
    secondaryParam: { key: 'deadTimeRatio', label: 'Dead-Time Ratio θ_d / τ_p', symbol: '\\theta_d/\\tau_p', unit: '-', min: 0.05, max: 1.00, step: 0.05, defaultVal: 0.25, scale: 'linear' },
    deepDiveWorkbench: 'wb3-hydraulics',
    inverseSvgDrag: (u, v) => ({
      primaryVal: clampDomainValue(inverseLinearMap(u, 0.5, 25.0), 0.5, 25.0, 0.5),
      secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.05, 1.00), 0.05, 1.00, 0.05),
    }),
    solve: (tauCRaw, ratioRaw) => {
      const tauC = clampDomainValue(tauCRaw, 0.5, 25.0), deadTimeRatio = clampDomainValue(ratioRaw, 0.05, 1.00);
      const tauP = 10.0, kP = 1.2, thetaD = deadTimeRatio * tauP;
      const calcKc = (tc: number) => tauP / (kP * (tc + thetaD));
      const kc = calcKc(tauC), overshootPct = Math.min(85, Math.max(0, (thetaD / Math.max(tauC, 0.4)) * 22 * (1 + deadTimeRatio)));
      const xs = GRID_21.map((t) => 0.5 + t * 24.5), isAlert = deadTimeRatio > 0.65;
      return {
        secNum: 8, secTitle: 'Process Control', clusterId: 'cluster-b',
        secPage: '8-14', pdfPage1Based: 683, verifyToken: 'Ziegler', citation: "[Perry's 9th Ed., Sec. 8, Fig. 8-21, p. 8-14]",
        primaryVal: tauC, secondaryVal: deadTimeRatio, responseVal: Number(kc.toFixed(3)), responseUnit: 'K_c (-)',
        secondaryResponseLabel: 'Closed-Loop Overshoot & Reset τ_I', secondaryResponseVal: `${overshootPct.toFixed(1)}% overshoot (τ_I = ${tauP.toFixed(1)} s)`,
        statusBanner: isAlert ? `DEAD-TIME DOMINATED (θ_d/τ_p = ${deadTimeRatio.toFixed(2)} > 0.65) — PID oscillatory; use Smith Predictor` : `Stable IMC-PI Loop: K_c = ${kc.toFixed(2)}, τ_I = ${tauP.toFixed(1)} s, overshoot = ${overshootPct.toFixed(1)}%`,
        isAlert, deepDiveWorkbench: 'wb3-hydraulics',
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => Math.min(calcKc(x), 12)), [0.5, 25.0], [0, 12]),
        operatingPoint: buildSvgCurvePoints([tauC], [Math.min(kc, 12)], [0.5, 25.0], [0, 12])[0],
        readoutText: `τ_c = ${tauC.toFixed(1)} s, θ_d/τ_p = ${deadTimeRatio.toFixed(2)} → K_c = ${kc.toFixed(2)} · Overshoot = ${overshootPct.toFixed(1)}%`,
        learnCallout: { title: 'IMC / Ziegler-Nichols FOPDT Tuning & Dead-Time Limit', plainEnglish: 'IMC tuning sets K_c = τ_p / [K_p (τ_c + θ_d)] and τ_I = τ_p to balance disturbance rejection against loop stability.', commonTrap: 'Aggressive quarter-decay Ziegler-Nichols gains become unstable when dead-time ratio θ_d/τ_p exceeds 0.65.' },
        equations: [{
          id: 'sec8-imc-zn', title: 'FOPDT Internal Model Control (IMC) / Ziegler-Nichols Gain', citation: "[Perry's 9th Ed., Sec. 8, Fig. 8-21, p. 8-14]",
          symbolicLatex: 'K_c = \\frac{\\tau_p}{K_p(\\tau_c + \\theta_d)}, \\quad \\tau_I = \\tau_p, \\quad \\frac{\\theta_d}{\\tau_p} = ' + deadTimeRatio.toFixed(2),
          substitutedLatex: `K_c = \\frac{10.0}{1.2(${tauC.toFixed(1)} + ${thetaD.toFixed(2)})}`,
          resultLatex: `K_c = ${kc.toFixed(3)}, \\quad \\mathrm{Overshoot} \\approx ${overshootPct.toFixed(1)}\\%`,
        }],
      };
    },
  },
  {
    secNum: 9, secTitle: 'Process Economics', clusterId: 'cluster-b',
    secPage: '9-3', pdfPage1Based: 758, verifyToken: 'depreciation', citation: "[Perry's 9th Ed., Sec. 9, p. 9-3]",
    xAxisLabel: 'Discount Rate i (fraction: 0.02 → 0.30)', yAxisLabel: '10-Year Net Present Value NPV ($M)',
    primaryParam: { key: 'discountRate', label: 'Discount Rate i', symbol: 'i', unit: '-', min: 0.02, max: 0.30, step: 0.01, defaultVal: 0.10, scale: 'linear' },
    secondaryParam: { key: 'scaleRatio', label: 'Capacity Ratio S_2 / S_1', symbol: 'S_2/S_1', unit: '-', min: 0.2, max: 5.0, step: 0.1, defaultVal: 1.8, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({
      primaryVal: clampDomainValue(inverseLinearMap(u, 0.02, 0.30), 0.02, 0.30, 0.01),
      secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.2, 5.0), 0.2, 5.0, 0.1),
    }),
    solve: (iRaw, sRaw) => {
      const discountRate = clampDomainValue(iRaw, 0.02, 0.30), scaleRatio = clampDomainValue(sRaw, 0.2, 5.0);
      const c1M = 10.0, cepci1 = 567.5, cepci2 = 800.0;
      const capexM = c1M * Math.pow(scaleRatio, 0.6) * (cepci2 / cepci1), annualCfM = 3.2 * Math.pow(scaleRatio, 0.75);
      const calcNpv = (r: number) => -capexM + annualCfM * ((1 - Math.pow(1 + r, -10)) / r);
      const npv = calcNpv(discountRate), xs = GRID_21.map((t) => 0.02 + t * 0.28);
      return {
        secNum: 9, secTitle: 'Process Economics', clusterId: 'cluster-b',
        secPage: '9-3', pdfPage1Based: 758, verifyToken: 'depreciation', citation: "[Perry's 9th Ed., Sec. 9, p. 9-3]",
        primaryVal: discountRate, secondaryVal: scaleRatio, responseVal: Number(npv.toFixed(2)), responseUnit: '$M',
        secondaryResponseLabel: 'Six-Tenths Escalated CAPEX C_2', secondaryResponseVal: `$${capexM.toFixed(2)}M (CF = $${annualCfM.toFixed(2)}M/yr)`,
        statusBanner: npv < 0 ? `NEGATIVE NPV ($${npv.toFixed(2)}M) — Discount rate ${(discountRate * 100).toFixed(1)}% exceeds project IRR` : `Economically Viable: 10-yr NPV = +$${npv.toFixed(2)}M (CAPEX = $${capexM.toFixed(2)}M)`,
        isAlert: npv < 0,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => clampDomainValue(calcNpv(x), -25, 65)), [0.02, 0.30], [-25, 65]),
        operatingPoint: buildSvgCurvePoints([discountRate], [clampDomainValue(npv, -25, 65)], [0.02, 0.30], [-25, 65])[0],
        readoutText: `i = ${(discountRate * 100).toFixed(1)}%, S_2/S_1 = ${scaleRatio.toFixed(1)} → CAPEX C_2 = $${capexM.toFixed(2)}M · 10-yr NPV = $${npv.toFixed(2)}M`,
        learnCallout: { title: 'Six-Tenths Rule CAPEX Scaling & Discounted Cash Flow', plainEnglish: 'Equipment capacity scales sub-linearly with exponent n ≈ 0.6, while CEPCI adjusts historical costs to current dollars.', commonTrap: 'Comparing undiscounted payback without discounting future cash flows at hurdle rate i overstates capital returns.' },
        equations: [{
          id: 'sec9-six-tenths-npv', title: 'Six-Tenths Rule CAPEX & 10-Year Net Present Value', citation: "[Perry's 9th Ed., Sec. 9, p. 9-3]",
          symbolicLatex: 'C_2 = C_1\\left(\\frac{S_2}{S_1}\\right)^{0.6}\\!\\left(\\frac{\\mathrm{CEPCI}_2}{\\mathrm{CEPCI}_1}\\right), \\quad \\mathrm{NPV}(i) = -C_2 + \\sum_{t=1}^{10}\\frac{CF}{(1+i)^t}',
          substitutedLatex: `C_2 = 10.0(${scaleRatio.toFixed(2)})^{0.6}(800/567.5) = \\$${capexM.toFixed(2)}\\mathrm{M}, \\; i = ${(discountRate * 100).toFixed(1)}\\%`,
          resultLatex: `\\mathrm{NPV} = \\$${npv.toFixed(2)}\\ \\mathrm{M}`,
        }],
      };
    },
  },
  {
    secNum: 10, secTitle: 'Transport and Storage of Fluids', clusterId: 'cluster-b',
    secPage: '10-24', pdfPage1Based: 827, verifyToken: 'NPSH', citation: "[Perry's 9th Ed., Sec. 10, pp. 10-24..25]",
    xAxisLabel: 'Volumetric Flow Rate Q (gpm: 20 → 600)', yAxisLabel: 'Pump Available Head NPSH_A - h_f(Q) (m)',
    primaryParam: { key: 'flowGpm', label: 'Flow Rate Q', symbol: 'Q', unit: 'gpm', min: 20, max: 600, step: 10, defaultVal: 250, scale: 'linear' },
    secondaryParam: { key: 'pSuctionPsig', label: 'Suction Gauge Pressure P_suc', symbol: 'P_{\\mathrm{suc,psig}}', unit: 'psig', min: -5.0, max: 60.0, step: 0.5, defaultVal: 5.0, scale: 'linear' },
    deepDiveWorkbench: 'wb3-hydraulics',
    inverseSvgDrag: (u, v) => ({
      primaryVal: clampDomainValue(inverseLinearMap(u, 20, 600), 20, 600, 10),
      secondaryVal: clampDomainValue(inverseLinearMap(1 - v, -5.0, 60.0), -5.0, 60.0, 0.5),
    }),
    solve: (qRaw, pSucRaw) => {
      const flowGpm = clampDomainValue(qRaw, 20, 600), pSuctionPsig = clampDomainValue(pSucRaw, -5.0, 60.0);
      const evalHyd = (q: number) => solveHydraulics({ flowGpm: q, npsInch: 4, schedule: '40', lengthM: 45, pSuctionPsig, zSuctionM: 2.0, npshrM: 12.0, valveDpPsi: 15.0 });
      const s = evalHyd(flowGpm), pAbsPsia = pSuctionPsig + 14.696;
      const calcNetNpsh = (q: number) => { const h = evalHyd(q); return clampDomainValue(h.npshAvailableM - 0.12 * h.caseNorm.hfM, 0, 60); };
      const xs = GRID_21.map((t) => 20 + t * 580);
      return {
        secNum: 10, secTitle: 'Transport and Storage of Fluids', clusterId: 'cluster-b',
        secPage: '10-24', pdfPage1Based: 827, verifyToken: 'NPSH', citation: "[Perry's 9th Ed., Sec. 10, pp. 10-24..25]",
        primaryVal: flowGpm, secondaryVal: pSuctionPsig, responseVal: Number(s.npshAvailableM.toFixed(2)), responseUnit: 'm NPSH_A',
        secondaryResponseLabel: 'Suction P_abs & Darcy f_D = 4·f_F', secondaryResponseVal: `${pAbsPsia.toFixed(2)} psia · f_D=${s.caseNorm.fDarcy.toFixed(4)} (4·f_F=${s.caseNorm.fFanning.toFixed(4)})`,
        statusBanner: s.isCavitating ? `CAVITATION ALERT: NPSH_A (${s.npshAvailableM.toFixed(2)} m) < NPSH_r (12.0 m) at P_abs = ${pAbsPsia.toFixed(2)} psia` : `Pump Suction Safe: NPSH_A = ${s.npshAvailableM.toFixed(2)} m ≥ NPSH_r (12.0 m) · ΔP_total = ${s.caseNorm.dpTotalKpa.toFixed(1)} kPa`,
        isAlert: s.isCavitating, deepDiveWorkbench: 'wb3-hydraulics',
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => calcNetNpsh(x)), [20, 600], [0, 60]),
        operatingPoint: buildSvgCurvePoints([flowGpm], [calcNetNpsh(flowGpm)], [20, 600], [0, 60])[0],
        readoutText: `Q = ${flowGpm.toFixed(0)} gpm, P_suc = ${pSuctionPsig.toFixed(1)} psig (${pAbsPsia.toFixed(2)} psia) → NPSH_A = ${s.npshAvailableM.toFixed(2)} m · f_D = 4·f_F = ${s.caseNorm.fDarcy.toFixed(4)}`,
        learnCallout: { title: 'Pump NPSH_A Datum (psig → psia) & Suction Friction Loss', plainEnglish: 'Available NPSH requires absolute suction pressure P_abs = P_psig + 14.696 psia minus vapor pressure P_vap and Darcy friction loss.', commonTrap: 'Using gauge pressure (psig) directly in the NPSH equation omits 14.696 psi (~10.3 m of water head)!' },
        equations: s.equations,
      };
    },
  },
];
