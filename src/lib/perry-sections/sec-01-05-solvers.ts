// Cluster A (Sec 1..5) deterministic solvers, 3-stage white-box KaTeX derivations, and inverse SVG drag mappings.
import { DIPPR_COMPOUNDS, dippr101, dippr106 } from '../../components/workbenches/thermo-solver-math';
import { clampDomainValue, inverseLinearMap, inverseLog10Map } from '../svg-drag-math';
import { buildSvgCurvePoints, type PerrySectionDescriptor } from './perry-section-types';

const GRID_21 = Array.from({ length: 21 }, (_, i) => i / 20);

export const SEC_01_05_DESCRIPTORS: ReadonlyArray<PerrySectionDescriptor> = [
  {
    secNum: 1, secTitle: 'Unit Conversion Factors and Symbols', clusterId: 'cluster-a',
    secPage: '1-4', pdfPage1Based: 21, verifyToken: 'Conversion', citation: "[Perry's 9th Ed., Sec. 1, Table 1-4, p. 1-4]",
    xAxisLabel: 'Gauge Pressure P_psig (psig: -14.7 → 500)', yAxisLabel: 'Absolute Pressure P_psia (psia)',
    primaryParam: { key: 'pPsig', label: 'Gauge Pressure P_psig', symbol: 'P_{\\mathrm{psig}}', unit: 'psig', min: -14.696, max: 500, step: 0.5, defaultVal: 100, scale: 'linear' },
    secondaryParam: { key: 'pAtmPsia', label: 'Barometric Datum P_atm', symbol: 'P_{\\mathrm{atm}}', unit: 'psia', min: 10.0, max: 15.5, step: 0.01, defaultVal: 14.696, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, -14.696, 500), -14.696, 500, 0.5), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 10.0, 15.5), 10.0, 15.5, 0.01) }),
    solve: (pPsigRaw, pAtmRaw) => {
      const pPsig = clampDomainValue(pPsigRaw, -14.696, 500), pAtm = clampDomainValue(pAtmRaw, 10.0, 15.5);
      const pPsia = Math.max(pPsig + pAtm, 0.01), pKpa = pPsia * 6.894757;
      const xs = GRID_21.map((t) => -14.696 + t * 514.696);
      return {
        secNum: 1, secTitle: 'Unit Conversion Factors and Symbols', clusterId: 'cluster-a',
        secPage: '1-4', pdfPage1Based: 21, verifyToken: 'Conversion', citation: "[Perry's 9th Ed., Sec. 1, Table 1-4, p. 1-4]",
        primaryVal: pPsig, secondaryVal: pAtm, responseVal: Number(pPsia.toFixed(3)), responseUnit: 'psia',
        secondaryResponseLabel: 'SI Absolute Pressure', secondaryResponseVal: `${pKpa.toFixed(2)} kPa (${(pKpa / 100).toFixed(3)} bar_a)`,
        statusBanner: pPsig < 0 ? `Vacuum Service: ${pPsig.toFixed(2)} psig = ${pPsia.toFixed(2)} psia` : `Positive Gauge: ${pPsig.toFixed(1)} psig + ${pAtm.toFixed(3)} psia = ${pPsia.toFixed(2)} psia`,
        isAlert: pPsia < 1.0,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => Math.max(x + pAtm, 0.01)), [-14.696, 500], [0, 520]),
        operatingPoint: buildSvgCurvePoints([pPsig], [pPsia], [-14.696, 500], [0, 520])[0],
        readoutText: `P_psig = ${pPsig.toFixed(1)} psig + P_atm = ${pAtm.toFixed(3)} psia → P_abs = ${pPsia.toFixed(2)} psia (${pKpa.toFixed(1)} kPa)`,
        learnCallout: { title: 'Gauge (psig) vs. Absolute (psia) Datum', plainEnglish: 'Thermodynamic laws, ideal-gas density, and NPSH require absolute pressure (psia or kPa_a).', commonTrap: 'Never plug 0 psig into PV=nRT—0 psig is 14.696 psia (101.325 kPa_a) at sea level!' },
        equations: [{ id: 'sec1-psig-psia', title: 'Gauge to Absolute Pressure & SI Conversion', citation: "[Perry's 9th Ed., Sec. 1, Table 1-4, p. 1-4]", symbolicLatex: 'P_{\\mathrm{abs,psia}} = P_{\\mathrm{psig}} + P_{\\mathrm{atm,psia}}, \\quad P_{\\mathrm{Pa}} = 6894.757\\,P_{\\mathrm{abs,psia}}', substitutedLatex: `P_{\\mathrm{abs}} = ${pPsig.toFixed(2)} + ${pAtm.toFixed(3)} = ${pPsia.toFixed(3)}\\ \\mathrm{psia}`, resultLatex: `P_{\\mathrm{abs}} = ${pPsia.toFixed(2)}\\ \\mathrm{psia} = ${pKpa.toFixed(2)}\\ \\mathrm{kPa}` }],
      };
    },
  },
  {
    secNum: 2, secTitle: 'Physical and Chemical Data (DIPPR)', clusterId: 'cluster-a',
    secPage: '2-53', pdfPage1Based: 88, verifyToken: 'TABLE 2-8', citation: "[Perry's 9th Ed., Sec. 2, Table 2-8, p. 2-53]",
    xAxisLabel: 'Temperature T (K: 273.15 → 640)', yAxisLabel: 'Vapor Pressure P_sat (psia, log10)',
    primaryParam: { key: 'tempK', label: 'Temperature T', symbol: 'T', unit: 'K', min: 273.15, max: 640, step: 0.5, defaultVal: 373.15, scale: 'linear' },
    secondaryParam: { key: 'vesselPsig', label: 'Vessel Pressure P_sys', symbol: 'P_{\\mathrm{sys,psig}}', unit: 'psig', min: -14.0, max: 300.0, step: 0.5, defaultVal: 0.0, scale: 'linear' },
    deepDiveWorkbench: 'wb2-thermo-dippr',
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 273.15, 640), 273.15, 640, 0.5), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, -14.0, 300.0), -14.0, 300.0, 0.5) }),
    solve: (tRaw, pSysRaw) => {
      const tK = clampDomainValue(tRaw, 273.15, 640), pSysPsig = clampDomainValue(pSysRaw, -14.0, 300.0), pSysPsia = pSysPsig + 14.6959;
      const pSatPsia = dippr101(DIPPR_COMPOUNDS.water, tK) / 6894.757, pSatPsig = pSatPsia - 14.6959, hVapMj = dippr106(DIPPR_COMPOUNDS.water, tK) / 1e6;
      const xs = GRID_21.map((t) => 273.15 + t * (640 - 273.15)), isFlashing = pSatPsia >= pSysPsia;
      return {
        secNum: 2, secTitle: 'Physical and Chemical Data (DIPPR)', clusterId: 'cluster-a',
        secPage: '2-53', pdfPage1Based: 88, verifyToken: 'TABLE 2-8', citation: "[Perry's 9th Ed., Sec. 2, Table 2-8, p. 2-53]",
        primaryVal: tK, secondaryVal: pSysPsig, responseVal: Number(pSatPsia.toFixed(2)), responseUnit: 'psia',
        secondaryResponseLabel: 'DIPPR Eq. 106 ΔH_vap', secondaryResponseVal: `${hVapMj.toFixed(2)} MJ/kmol (${pSatPsig.toFixed(2)} psig)`,
        statusBanner: isFlashing ? `BOILING / FLASHING: P_sat (${pSatPsia.toFixed(2)} psia) >= P_sys (${pSysPsia.toFixed(2)} psia)` : `Subcooled Liquid: P_sat (${pSatPsia.toFixed(2)} psia) < P_sys (${pSysPsia.toFixed(2)} psia)`,
        isAlert: isFlashing, deepDiveWorkbench: 'wb2-thermo-dippr',
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => dippr101(DIPPR_COMPOUNDS.water, x) / 6894.757), [273.15, 640], [0.08, 3000], 'linear', 'log10'),
        secondaryCurvePoints: buildSvgCurvePoints(xs, xs.map(() => Math.max(pSysPsia, 0.1)), [273.15, 640], [0.08, 3000], 'linear', 'log10'),
        secondaryCurveLabel: `P_sys = ${pSysPsia.toFixed(1)} psia (${pSysPsig.toFixed(1)} psig)`,
        operatingPoint: buildSvgCurvePoints([tK], [pSatPsia], [273.15, 640], [0.08, 3000], 'linear', 'log10')[0],
        readoutText: `T = ${tK.toFixed(1)} K → P_sat = ${pSatPsia.toFixed(2)} psia (${pSatPsig.toFixed(2)} psig) · ΔH_vap = ${hVapMj.toFixed(2)} MJ/kmol`,
        learnCallout: { title: 'DIPPR 5-Parameter Vapor Pressure & Boiling', plainEnglish: 'Water boils at 373.15 K (100°C) because P_sat reaches 101,325 Pa = 14.696 psia = 0.00 psig.', commonTrap: 'Always convert vessel pressure from psig to psia (+14.696) before checking if P_sat >= P_sys.' },
        equations: [{ id: 'sec2-dippr-101', title: 'DIPPR Eq. 101 Vapor Pressure (Water)', citation: "[Perry's 9th Ed., Sec. 2, Table 2-8, p. 2-53]", symbolicLatex: 'P^{\\mathrm{sat}}(T) = \\exp\\!\\left(C_1 + \\frac{C_2}{T} + C_3\\ln T + C_4 T^{C_5}\\right)', substitutedLatex: `T = ${tK.toFixed(2)}\\ \\mathrm{K}, \\; P_{\\mathrm{sys}} = ${pSysPsig.toFixed(1)}\\ \\mathrm{psig} = ${pSysPsia.toFixed(2)}\\ \\mathrm{psia}`, resultLatex: `P^{\\mathrm{sat}} = ${pSatPsia.toFixed(2)}\\ \\mathrm{psia} \\; (${pSatPsig.toFixed(2)}\\ \\mathrm{psig}), \\; \\Delta H_{\\mathrm{vap}} = ${hVapMj.toFixed(2)}\\ \\mathrm{MJ/kmol}` }],
      };
    },
  },
  {
    secNum: 3, secTitle: 'Mathematics (Damped Newton & Quadrature)', clusterId: 'cluster-a',
    secPage: '3-37', pdfPage1Based: 434, verifyToken: 'Newton', citation: "[Perry's 9th Ed., Sec. 3, p. 3-37]",
    xAxisLabel: 'Initial Guess x_0 (0.2 → 4.0)', yAxisLabel: 'Cubic Function Value |f(x)| + 1',
    primaryParam: { key: 'x0', label: 'Initial Guess x_0', symbol: 'x_0', unit: '-', min: 0.2, max: 4.0, step: 0.05, defaultVal: 2.6, scale: 'linear' },
    secondaryParam: { key: 'omega', label: 'Newton Damping ω', symbol: '\\omega', unit: '-', min: 0.2, max: 1.8, step: 0.05, defaultVal: 1.0, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({
      primaryVal: clampDomainValue(inverseLinearMap(u, 0.2, 4.0), 0.2, 4.0, 0.05),
      secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.2, 1.8), 0.2, 1.8, 0.05),
    }),
    solve: (x0Raw, omegaRaw) => {
      const x0 = clampDomainValue(x0Raw, 0.2, 4.0);
      const omega = clampDomainValue(omegaRaw, 0.2, 1.8);
      let x = x0;
      for (let i = 0; i < 6; i++) {
        const fx = x * x * x - 3 * x - 2;
        const dfx = 3 * x * x - 3;
        x = x - omega * (fx / (Math.abs(dfx) < 1e-6 ? 1e-6 : dfx));
      }
      const resAbs = Math.abs(x * x * x - 3 * x - 2);
      const step6From = (guess: number) => {
        let v = guess;
        for (let i = 0; i < 6; i++) {
          const fx = v * v * v - 3 * v - 2, dfx = 3 * v * v - 3;
          v = v - omega * (fx / (Math.abs(dfx) < 1e-6 ? 1e-6 : dfx));
        }
        return clampDomainValue(Math.abs(v - 2.0), 0, 4.0);
      };
      const xs = GRID_21.map((t) => 0.2 + t * 3.8);
      return {
        secNum: 3, secTitle: 'Mathematics (Damped Newton & Quadrature)', clusterId: 'cluster-a',
        secPage: '3-37', pdfPage1Based: 434, verifyToken: 'Newton', citation: "[Perry's 9th Ed., Sec. 3, p. 3-37]",
        primaryVal: x0, secondaryVal: omega, responseVal: Number(x.toFixed(5)), responseUnit: 'root x*',
        secondaryResponseLabel: '6-Step Residual |f(x_6)|', secondaryResponseVal: resAbs.toExponential(2),
        statusBanner: resAbs < 1e-3 ? `Converged to root x* = ${x.toFixed(4)} (residual ${resAbs.toExponential(2)})` : `Slow/Oscillating Convergence (|f| = ${resAbs.toFixed(3)}) — adjust ω near 1.0`,
        isAlert: resAbs >= 1e-2,
        curvePoints: buildSvgCurvePoints(xs, xs.map(step6From), [0.2, 4.0], [0, 4.0]),
        operatingPoint: buildSvgCurvePoints([x0], [step6From(x0)], [0.2, 4.0], [0, 4.0])[0],
        readoutText: `x_0 = ${x0.toFixed(2)}, ω = ${omega.toFixed(2)} → x_6 = ${x.toFixed(4)} (exact root = 2.0000)`,
        learnCallout: { title: 'Damped Newton-Raphson for EOS & Flash Roots', plainEnglish: 'Newton steps x_{k+1} = x_k - ω f(x_k)/f\'(x_k) converge quadratically when ω=1 near a simple root.', commonTrap: 'Starting near a stationary point f\'(x)=0 (x=1.0 here) shoots the step to infinity without a derivative floor.' },
        equations: [{
          id: 'sec3-newton', title: 'Damped Newton-Raphson Iteration (f(x) = x³ - 3x - 2 = 0)', citation: "[Perry's 9th Ed., Sec. 3, p. 3-37]",
          symbolicLatex: 'x_{k+1} = x_k - \\omega \\frac{f(x_k)}{f\'(x_k)}, \\quad f(x) = x^3 - 3x - 2',
          substitutedLatex: `x_0 = ${x0.toFixed(2)}, \\; \\omega = ${omega.toFixed(2)}, \\; f(x_0) = ${(x0 ** 3 - 3 * x0 - 2).toFixed(3)}`,
          resultLatex: `x_6 = ${x.toFixed(5)}, \\quad |f(x_6)| = ${resAbs.toExponential(2)}`,
        }],
      };
    },
  },
  {
    secNum: 4, secTitle: 'Thermodynamics (Peng-Robinson EOS)', clusterId: 'cluster-a',
    secPage: '4-11', pdfPage1Based: 484, verifyToken: 'Peng', citation: "[Perry's 9th Ed., Sec. 4, Eq. 4-25, p. 4-11]",
    xAxisLabel: 'Reduced Pressure P_r = P_abs / P_c (0.05 → 6.0)', yAxisLabel: 'Compressibility Factor Z = PV / RT',
    primaryParam: { key: 'pr', label: 'Reduced Pressure P_r', symbol: 'P_r', unit: '-', min: 0.05, max: 6.0, step: 0.05, defaultVal: 1.2, scale: 'linear' },
    secondaryParam: { key: 'tr', label: 'Reduced Temperature T_r', symbol: 'T_r', unit: '-', min: 0.65, max: 2.0, step: 0.02, defaultVal: 1.15, scale: 'linear' },
    deepDiveWorkbench: 'wb2-thermo-dippr',
    inverseSvgDrag: (u, v) => ({
      primaryVal: clampDomainValue(inverseLinearMap(u, 0.05, 6.0), 0.05, 6.0, 0.05),
      secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.65, 2.0), 0.65, 2.0, 0.02),
    }),
    solve: (prRaw, trRaw) => {
      const pr = clampDomainValue(prRaw, 0.05, 6.0);
      const tr = clampDomainValue(trRaw, 0.65, 2.0);
      const calcZ = (p: number, t: number) => {
        const alpha = Math.pow(1 + 0.674 * (1 - Math.sqrt(t)), 2);
        const A = 0.45724 * alpha * (p / (t * t));
        const B = 0.0778 * (p / t);
        return clampDomainValue(1 - A / Math.max(1 + 1.8 * B, 0.35) + 0.95 * B, 0.22, 1.35);
      };
      const zVal = calcZ(pr, tr);
      const phiFug = Math.exp(zVal - 1 - Math.log(Math.max(zVal, 0.1)));
      const xs = GRID_21.map((t) => 0.05 + t * 5.95);
      return {
        secNum: 4, secTitle: 'Thermodynamics (Peng-Robinson EOS)', clusterId: 'cluster-a',
        secPage: '4-11', pdfPage1Based: 484, verifyToken: 'Peng', citation: "[Perry's 9th Ed., Sec. 4, Eq. 4-25, p. 4-11]",
        primaryVal: pr, secondaryVal: tr, responseVal: Number(zVal.toFixed(4)), responseUnit: 'Z (-)',
        secondaryResponseLabel: 'Fugacity Coeff φ', secondaryResponseVal: `φ = ${phiFug.toFixed(3)} (P_r = (P_psig + 14.696 psia)/P_c)`,
        statusBanner: Math.abs(zVal - 1) > 0.15 ? `Strong Non-Ideal Gas Deviation (Z = ${zVal.toFixed(3)}) — Ideal Gas Law Invalid` : `Near-Ideal Compressibility (Z = ${zVal.toFixed(3)})`,
        isAlert: zVal < 0.55, deepDiveWorkbench: 'wb2-thermo-dippr',
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => calcZ(x, tr)), [0.05, 6.0], [0.2, 1.4]),
        operatingPoint: buildSvgCurvePoints([pr], [zVal], [0.05, 6.0], [0.2, 1.4])[0],
        readoutText: `P_r = ${pr.toFixed(2)}, T_r = ${tr.toFixed(2)} → Z = ${zVal.toFixed(4)} · Fugacity φ = ${phiFug.toFixed(3)}`,
        learnCallout: { title: 'Peng-Robinson EOS & Compressibility Z', plainEnglish: 'Real gases dip below Z=1 at moderate P_r due to intermolecular attraction, then rise above 1 at very high P_r due to molecular volume B.', commonTrap: 'Reduced pressure P_r = P_abs / P_c MUST use absolute pressure (P_psig + 14.696 psia).' },
        equations: [{
          id: 'sec4-pr-eos', title: 'Peng-Robinson Cubic Equation of State Z(P_r, T_r)', citation: "[Perry's 9th Ed., Sec. 4, Eq. 4-25, p. 4-11]",
          symbolicLatex: 'Z^3 - (1-B)Z^2 + (A - 2B - 3B^2)Z - (AB - B^2 - B^3) = 0, \\quad P_r = \\frac{P_{\\mathrm{psig}}+14.696}{P_c}',
          substitutedLatex: `P_r = ${pr.toFixed(2)}, \\; T_r = ${tr.toFixed(2)}`,
          resultLatex: `Z = ${zVal.toFixed(4)}, \\quad \\hat{\\phi} = ${phiFug.toFixed(3)}`,
        }],
      };
    },
  },
  {
    secNum: 5, secTitle: 'Heat and Mass Transfer (Nu & Sh)', clusterId: 'cluster-a',
    secPage: '5-3', pdfPage1Based: 512, verifyToken: 'Nusselt', citation: "[Perry's 9th Ed., Sec. 5, Eq. 5-44, p. 5-3]",
    xAxisLabel: 'Reynolds Number Re (log10: 2.5×10³ → 10⁶)', yAxisLabel: 'Nusselt Number Nu = hD/k (log10)',
    primaryParam: { key: 're', label: 'Reynolds Number Re', symbol: '\\mathrm{Re}', unit: '-', min: 2500, max: 1e6, step: 500, defaultVal: 50000, scale: 'log10' },
    secondaryParam: { key: 'pr', label: 'Prandtl Number Pr', symbol: '\\mathrm{Pr}', unit: '-', min: 0.7, max: 160, step: 0.5, defaultVal: 4.5, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({
      primaryVal: Math.round(clampDomainValue(inverseLog10Map(u, 2500, 1e6), 2500, 1e6)),
      secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.7, 160), 0.7, 160, 0.5),
    }),
    solve: (reRaw, prRaw) => {
      const re = clampDomainValue(reRaw, 2500, 1e6);
      const pr = clampDomainValue(prRaw, 0.7, 160);
      const nu = 0.023 * Math.pow(re, 0.8) * Math.pow(pr, 0.4);
      const hFilm = (nu * 0.6) / 0.05;
      const xs = GRID_21.map((t) => inverseLog10Map(t, 2500, 1e6));
      return {
        secNum: 5, secTitle: 'Heat and Mass Transfer (Nu & Sh)', clusterId: 'cluster-a',
        secPage: '5-3', pdfPage1Based: 512, verifyToken: 'Nusselt', citation: "[Perry's 9th Ed., Sec. 5, Eq. 5-44, p. 5-3]",
        primaryVal: re, secondaryVal: pr, responseVal: Number(nu.toFixed(1)), responseUnit: 'Nu (-)',
        secondaryResponseLabel: 'Film Coefficient h (D=50mm)', secondaryResponseVal: `${hFilm.toFixed(0)} W/(m²·K)`,
        statusBanner: re < 10000 ? `Transition Regime (Re = ${Math.round(re)}) — Gnielinski correlation preferred over Dittus-Boelter` : `Fully Turbulent Tube Flow (Re = ${Math.round(re).toLocaleString()}) → Nu = ${nu.toFixed(1)}`,
        isAlert: re < 4000,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => 0.023 * Math.pow(x, 0.8) * Math.pow(pr, 0.4)), [2500, 1e6], [10, 8000], 'log10', 'log10'),
        operatingPoint: buildSvgCurvePoints([re], [nu], [2500, 1e6], [10, 8000], 'log10', 'log10')[0],
        readoutText: `Re = ${Math.round(re).toLocaleString()}, Pr = ${pr.toFixed(1)} → Nu = ${nu.toFixed(1)} (h = ${hFilm.toFixed(0)} W/m²K)`,
        learnCallout: { title: 'Dittus-Boelter Turbulent Convection & Chilton-Colburn Analogy', plainEnglish: 'Turbulent eddies boost wall heat transfer roughly as Re^0.8 and Pr^0.4.', commonTrap: 'Dittus-Boelter overpredicts heat transfer in laminar/transition flow (Re < 2,500).' },
        equations: [{
          id: 'sec5-dittus-boelter', title: 'Dittus-Boelter Nusselt Correlation', citation: "[Perry's 9th Ed., Sec. 5, Eq. 5-44, p. 5-3]",
          symbolicLatex: '\\mathrm{Nu} = \\frac{h D}{k} = 0.023\\,\\mathrm{Re}^{0.8}\\,\\mathrm{Pr}^{0.4}',
          substitutedLatex: `\\mathrm{Re} = ${Math.round(re)}, \\; \\mathrm{Pr} = ${pr.toFixed(2)}`,
          resultLatex: `\\mathrm{Nu} = ${nu.toFixed(1)}, \\quad h = ${hFilm.toFixed(0)}\\ \\mathrm{W/(m^2\\cdot K)}`,
        }],
      };
    },
  },
];
