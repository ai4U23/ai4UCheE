// Cluster D (Sec 16..20) deterministic solvers, 3-stage white-box KaTeX derivations, and inverse SVG drag mappings.
import { clampDomainValue, inverseLinearMap } from '../svg-drag-math';
import { buildSvgCurvePoints, type PerrySectionDescriptor } from './perry-section-types';

const GRID_21 = Array.from({ length: 21 }, (_, i) => i / 20);

export const SEC_16_20_DESCRIPTORS: ReadonlyArray<PerrySectionDescriptor> = [
  {
    secNum: 16, secTitle: 'Adsorption and Ion Exchange', clusterId: 'cluster-d',
    secPage: '16-8', pdfPage1Based: 1453, verifyToken: 'Langmuir', citation: "[Perry's 9th Ed., Sec. 16, Eq. 16-11, p. 16-8]",
    xAxisLabel: 'Feed Concentration C (kg/m³: 0.05 → 10.0)', yAxisLabel: 'Equilibrium Loading q*(C) (kg/kg)',
    primaryParam: { key: 'concKgM3', label: 'Feed Concentration C', symbol: 'C', unit: 'kg/m³', min: 0.05, max: 10.0, step: 0.05, defaultVal: 1.5, scale: 'linear' },
    secondaryParam: { key: 'affinityB', label: 'Langmuir Affinity b', symbol: 'b', unit: 'm³/kg', min: 0.1, max: 5.0, step: 0.05, defaultVal: 1.2, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 0.05, 10.0), 0.05, 10.0, 0.05), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.1, 5.0), 0.1, 5.0, 0.05) }),
    solve: (cRaw, bRaw) => {
      const c = clampDomainValue(cRaw, 0.05, 10.0), b = clampDomainValue(bRaw, 0.1, 5.0), qMax = 0.28;
      const calcQ = (conc: number) => (qMax * b * conc) / (1 + b * conc);
      const qStar = calcQ(c), rL = 1 / (1 + b * c);
      const rhoB = 480, uS = 18.0, lBed = 2.4, lMtz = 0.45 + 0.12 / Math.sqrt(b);
      const tBreakHr = Math.max(((rhoB * qStar) / (uS * c)) * (lBed - lMtz), 0.05);
      const xs = GRID_21.map((t) => 0.05 + t * 9.95);
      return {
        secNum: 16, secTitle: 'Adsorption and Ion Exchange', clusterId: 'cluster-d',
        secPage: '16-8', pdfPage1Based: 1453, verifyToken: 'Langmuir', citation: "[Perry's 9th Ed., Sec. 16, Eq. 16-11, p. 16-8]",
        primaryVal: c, secondaryVal: b, responseVal: Number(qStar.toFixed(4)), responseUnit: 'kg/kg',
        secondaryResponseLabel: 'Separation Factor R_L & LUB t_b', secondaryResponseVal: `R_L = ${rL.toFixed(3)} · t_b = ${tBreakHr.toFixed(2)} h`,
        statusBanner: tBreakHr < 0.75 ? `RAPID BREAKTHROUGH WARNING: t_b = ${tBreakHr.toFixed(2)} h (R_L = ${rL.toFixed(3)})` : `Favorable Langmuir Isotherm (R_L = ${rL.toFixed(3)} < 1) · Collins LUB t_b = ${tBreakHr.toFixed(2)} h`,
        isAlert: tBreakHr < 0.75,
        curvePoints: buildSvgCurvePoints(xs, xs.map(calcQ), [0.05, 10.0], [0, 0.3]),
        operatingPoint: buildSvgCurvePoints([c], [qStar], [0.05, 10.0], [0, 0.3])[0],
        readoutText: `C = ${c.toFixed(2)} kg/m³, b = ${b.toFixed(2)} m³/kg → q* = ${qStar.toFixed(4)} kg/kg · R_L = ${rL.toFixed(3)} · t_b = ${tBreakHr.toFixed(2)} h`,
        learnCallout: { title: 'Langmuir Isotherm & Collins Length of Unused Bed (LUB)', plainEnglish: 'Favorable adsorption (R_L < 1) forms a self-sharpening mass-transfer zone (MTZ) so bed length scales directly via LUB.', commonTrap: 'Ignoring the unused bed length L_MTZ overpredicts breakthrough time t_b and risks early effluent breakthrough.' },
        equations: [{
          id: 'sec16-langmuir-lub', title: 'Langmuir Isotherm & Collins LUB Breakthrough Time', citation: "[Perry's 9th Ed., Sec. 16, Eq. 16-11, p. 16-8]",
          symbolicLatex: 'q^*(C) = \\frac{q_{\\max} b C}{1 + b C}, \\quad R_L = \\frac{1}{1 + b C}, \\quad t_b = \\frac{\\rho_b q^*(C)}{u_s C}(L_{\\mathrm{bed}} - L_{\\mathrm{MTZ}})',
          substitutedLatex: `q^* = \\frac{0.28 \\times ${b.toFixed(2)} \\times ${c.toFixed(2)}}{1 + ${b.toFixed(2)} \\times ${c.toFixed(2)}}, \\; R_L = ${rL.toFixed(3)}`,
          resultLatex: `q^* = ${qStar.toFixed(4)}\\ \\mathrm{kg/kg}, \\quad t_b = ${tBreakHr.toFixed(2)}\\ \\mathrm{h}`,
        }],
      };
    },
  },
  {
    secNum: 17, secTitle: 'Gas-Solid Operations and Equipment', clusterId: 'cluster-d',
    secPage: '17-3', pdfPage1Based: 1502, verifyToken: 'fluidized', citation: "[Perry's 9th Ed., Sec. 17, Fig. 17-2, p. 17-3]",
    xAxisLabel: 'Superficial Gas Velocity u_0 (m/s: 0.01 → 2.50)', yAxisLabel: 'Bed Pressure Drop ΔP/L (kPa/m)',
    primaryParam: { key: 'uSuperficialMs', label: 'Superficial Velocity u_0', symbol: 'u_0', unit: 'm/s', min: 0.01, max: 2.5, step: 0.02, defaultVal: 0.45, scale: 'linear' },
    secondaryParam: { key: 'dpMicron', label: 'Particle Diameter d_p', symbol: 'd_p', unit: 'μm', min: 100, max: 3000, step: 25, defaultVal: 500, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 0.01, 2.5), 0.01, 2.5, 0.02), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 100, 3000), 100, 3000, 25) }),
    solve: (u0Raw, dpRaw) => {
      const u0 = clampDomainValue(u0Raw, 0.01, 2.5), dpUm = clampDomainValue(dpRaw, 100, 3000), dp = dpUm * 1e-6;
      const rhoG = 1.2, rhoP = 2500, mu = 1.85e-5, eps = 0.42, phiS = 0.86, g = 9.80665;
      const ar = (dp ** 3 * rhoG * (rhoP - rhoG) * g) / (mu * mu);
      const reMf = Math.sqrt(33.7 * 33.7 + 0.0408 * ar) - 33.7;
      const uMf = (reMf * mu) / (rhoG * dp);
      const dpMaxKpaM = ((1 - eps) * (rhoP - rhoG) * g) / 1000;
      const calcDpKpaM = (u: number) => {
        const visc = (150 * mu * (1 - eps) ** 2 * u) / (phiS ** 2 * dp ** 2 * eps ** 3);
        const inert = (1.75 * rhoG * (1 - eps) * u * u) / (phiS * dp * eps ** 3);
        return Math.min((visc + inert) / 1000, dpMaxKpaM);
      };
      const dpKpaM = calcDpKpaM(u0), reP = Math.max((rhoG * u0 * dp) / (mu * (1 - eps)), 1e-3);
      const fPacked = 150 / reP + 1.75, fFanningPipe = 0.0791 / Math.pow(Math.max(reP, 2100), 0.25);
      const dpcUm = Math.sqrt((9 * mu * 0.15) / (2 * Math.PI * 5 * Math.max(u0, 0.05) * (rhoP - rhoG))) * 1e6;
      const xs = GRID_21.map((t) => 0.01 + t * 2.49), isFluidized = u0 >= uMf;
      return {
        secNum: 17, secTitle: 'Gas-Solid Operations and Equipment', clusterId: 'cluster-d',
        secPage: '17-3', pdfPage1Based: 1502, verifyToken: 'fluidized', citation: "[Perry's 9th Ed., Sec. 17, Fig. 17-2, p. 17-3]",
        primaryVal: u0, secondaryVal: dpUm, responseVal: Number(dpKpaM.toFixed(2)), responseUnit: 'kPa/m',
        secondaryResponseLabel: 'Wen-Yu u_mf, f_p vs f_F & Cyclone d_pc', secondaryResponseVal: `u_mf = ${uMf.toFixed(3)} m/s · f_p = ${fPacked.toFixed(2)} (pipe f_F = ${fFanningPipe.toFixed(4)}, f_D = 4f_F) · d_pc = ${dpcUm.toFixed(1)} μm`,
        statusBanner: isFluidized ? `FLUIDIZED BED REGIME (u_0 = ${u0.toFixed(2)} >= u_mf = ${uMf.toFixed(3)} m/s) · ΔP/L plateau = ${dpKpaM.toFixed(2)} kPa/m` : `Fixed Packed Bed (u_0 < u_mf = ${uMf.toFixed(3)} m/s) · Ergun ΔP/L = ${dpKpaM.toFixed(2)} kPa/m`,
        isAlert: u0 > 4.5 * uMf,
        curvePoints: buildSvgCurvePoints(xs, xs.map(calcDpKpaM), [0.01, 2.5], [0, 16]),
        operatingPoint: buildSvgCurvePoints([u0], [dpKpaM], [0.01, 2.5], [0, 16])[0],
        readoutText: `u_0 = ${u0.toFixed(2)} m/s, d_p = ${dpUm.toFixed(0)} μm → ΔP/L = ${dpKpaM.toFixed(2)} kPa/m · u_mf = ${uMf.toFixed(3)} m/s · d_pc = ${dpcUm.toFixed(1)} μm`,
        learnCallout: { title: 'Ergun Packed-Bed ΔP/L, Minimum Fluidization u_mf & Lapple Cyclone Cut-Size', plainEnglish: 'Pressure drop rises with velocity via Ergun until bed weight is suspended at u_mf, where ΔP/L plateaus.', commonTrap: 'Do not confuse packed-bed friction factor f_p = 150/Re_p + 1.75 with empty-pipe Fanning f_F (or Darcy f_D = 4f_F).' },
        equations: [{
          id: 'sec17-ergun-umf', title: 'Ergun Packed-Bed Pressure Drop & Wen-Yu Minimum Fluidization', citation: "[Perry's 9th Ed., Sec. 17, Fig. 17-2, p. 17-3]",
          symbolicLatex: '\\frac{\\Delta P}{L} = \\frac{150\\mu(1-\\varepsilon)^2 u_0}{\\phi_s^2 d_p^2 \\varepsilon^3} + \\frac{1.75\\rho_g(1-\\varepsilon)u_0^2}{\\phi_s d_p \\varepsilon^3}, \\quad f_p = \\frac{150}{\\mathrm{Re}_p} + 1.75',
          substitutedLatex: `u_0 = ${u0.toFixed(2)}\\ \\mathrm{m/s}, \\; d_p = ${dpUm.toFixed(0)}\\ \\mu\\mathrm{m}, \\; u_{mf} = ${uMf.toFixed(3)}\\ \\mathrm{m/s}`,
          resultLatex: `\\Delta P/L = ${dpKpaM.toFixed(2)}\\ \\mathrm{kPa/m}, \\quad f_p = ${fPacked.toFixed(2)}, \\quad d_{pc} = ${dpcUm.toFixed(1)}\\ \\mu\\mathrm{m}`,
        }],
      };
    },
  },
  {
    secNum: 18, secTitle: 'Liquid-Solid Operations and Equipment', clusterId: 'cluster-d',
    secPage: '18-3', pdfPage1Based: 1572, verifyToken: 'Filtration', citation: "[Perry's 9th Ed., Sec. 18, p. 18-3]",
    xAxisLabel: 'Specific Filtrate Volume V/A (m³/m²: 0.05 → 2.50)', yAxisLabel: 'Ruth Filtration Ratio t / (V/A) (s/m)',
    primaryParam: { key: 'filtrateFlux', label: 'Filtrate Volume V/A', symbol: 'V/A', unit: 'm³/m²', min: 0.05, max: 2.5, step: 0.05, defaultVal: 0.8, scale: 'linear' },
    secondaryParam: { key: 'dpKpa', label: 'Filtration ΔP', symbol: '\\Delta P', unit: 'kPa', min: 20, max: 500, step: 5, defaultVal: 150, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 0.05, 2.5), 0.05, 2.5, 0.05), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 20, 500), 20, 500, 5) }),
    solve: (vOverARaw, dpKpaRaw) => {
      const vOverA = clampDomainValue(vOverARaw, 0.05, 2.5), dpKpa = clampDomainValue(dpKpaRaw, 20, 500), dpPa = dpKpa * 1000;
      const mu = 1.0e-3, cSolid = 45.0, alphaC = 1.2e10 * Math.pow(dpKpa / 100, 0.35), rM = 4.5e10;
      const calcRatio = (q: number) => ((mu * alphaC * cSolid) / (2 * dpPa)) * q + (mu * rM) / dpPa;
      const ratioSm = calcRatio(vOverA), tSec = ratioSm * vOverA;
      const xs = GRID_21.map((t) => 0.05 + t * 2.45);
      return {
        secNum: 18, secTitle: 'Liquid-Solid Operations and Equipment', clusterId: 'cluster-d',
        secPage: '18-3', pdfPage1Based: 1572, verifyToken: 'Filtration', citation: "[Perry's 9th Ed., Sec. 18, p. 18-3]",
        primaryVal: vOverA, secondaryVal: dpKpa, responseVal: Number(ratioSm.toFixed(1)), responseUnit: 's/m',
        secondaryResponseLabel: 'Total Filtration Cycle Time t', secondaryResponseVal: `t = ${tSec.toFixed(1)} s (${(tSec / 60).toFixed(2)} min)`,
        statusBanner: tSec > 1800 ? `High Cake Resistance Cycle: t = ${(tSec / 60).toFixed(1)} min — consider filter aid or higher ΔP` : `Constant-ΔP Cake Filtration: t/(V/A) = ${ratioSm.toFixed(1)} s/m · Total t = ${tSec.toFixed(1)} s`,
        isAlert: tSec > 1800,
        curvePoints: buildSvgCurvePoints(xs, xs.map(calcRatio), [0.05, 2.5], [0, 3500]),
        operatingPoint: buildSvgCurvePoints([vOverA], [ratioSm], [0.05, 2.5], [0, 3500])[0],
        readoutText: `V/A = ${vOverA.toFixed(2)} m³/m², ΔP = ${dpKpa.toFixed(0)} kPa → t/(V/A) = ${ratioSm.toFixed(1)} s/m · t = ${tSec.toFixed(1)} s`,
        learnCallout: { title: 'Ruth Constant-Pressure Cake Filtration Law', plainEnglish: 'Plotting t/(V/A) vs. V/A yields a straight line whose slope gives specific cake resistance α_c and intercept gives medium resistance R_m.', commonTrap: 'For compressible cakes (s > 0), doubling ΔP does not halve filtration time because α_c = α_0(ΔP)^s increases.' },
        equations: [{
          id: 'sec18-ruth-filtration', title: 'Ruth Constant-Pressure Cake Filtration Equation', citation: "[Perry's 9th Ed., Sec. 18, p. 18-3]",
          symbolicLatex: '\\frac{t}{V/A} = \\frac{\\mu \\alpha_c c}{2\\Delta P}\\!\\left(\\frac{V}{A}\\right) + \\frac{\\mu R_m}{\\Delta P}',
          substitutedLatex: `V/A = ${vOverA.toFixed(2)}\\ \\mathrm{m^3/m^2}, \\; \\Delta P = ${dpKpa.toFixed(0)}\\ \\mathrm{kPa}, \\; \\alpha_c = ${alphaC.toExponential(2)}\\ \\mathrm{m/kg}`,
          resultLatex: `\\frac{t}{V/A} = ${ratioSm.toFixed(1)}\\ \\mathrm{s/m}, \\quad t = ${tSec.toFixed(1)}\\ \\mathrm{s}`,
        }],
      };
    },
  },
  {
    secNum: 19, secTitle: 'Reactors', clusterId: 'cluster-d',
    secPage: '19-3', pdfPage1Based: 1696, verifyToken: 'residence', citation: "[Perry's 9th Ed., Sec. 19, p. 19-3]",
    xAxisLabel: 'Fractional Conversion X (0.05 → 0.98)', yAxisLabel: 'Space Time τ (min: CSTR vs. PFR)',
    primaryParam: { key: 'conversionX', label: 'Target Conversion X', symbol: 'X', unit: '-', min: 0.05, max: 0.98, step: 0.01, defaultVal: 0.85, scale: 'linear' },
    secondaryParam: { key: 'semenovPsi', label: 'Semenov Thermal Number ψ', symbol: '\\psi', unit: '-', min: 0.05, max: 0.8, step: 0.01, defaultVal: 0.25, scale: 'linear' },
    deepDiveWorkbench: 'wb6-kinetics-reactors',
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 0.05, 0.98), 0.05, 0.98, 0.01), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.05, 0.8), 0.05, 0.8, 0.01) }),
    solve: (xRaw, psiRaw) => {
      const x = clampDomainValue(xRaw, 0.05, 0.98), psi = clampDomainValue(psiRaw, 0.05, 0.8), k1 = 0.25 * (1 + 1.4 * (psi - 0.25));
      const calcCstr = (conv: number) => conv / (k1 * Math.max(1 - conv, 0.015));
      const calcPfr = (conv: number) => -Math.log(Math.max(1 - conv, 0.015)) / k1;
      const tauCstr = calcCstr(x), tauPfr = calcPfr(x), volRatio = tauCstr / Math.max(tauPfr, 1e-6);
      const isRunaway = psi > 1 / Math.E;
      const xs = GRID_21.map((t) => 0.05 + t * 0.93);
      return {
        secNum: 19, secTitle: 'Reactors', clusterId: 'cluster-d',
        secPage: '19-3', pdfPage1Based: 1696, verifyToken: 'residence', citation: "[Perry's 9th Ed., Sec. 19, p. 19-3]",
        primaryVal: x, secondaryVal: psi, responseVal: Number(tauCstr.toFixed(2)), responseUnit: 'min',
        secondaryResponseLabel: 'PFR Space Time & Volume Ratio', secondaryResponseVal: `τ_PFR = ${tauPfr.toFixed(2)} min · V_CSTR/V_PFR = ${volRatio.toFixed(2)}x`,
        statusBanner: isRunaway ? `SEMENOV THERMAL RUNAWAY (ψ > 1/e = 0.368): ψ = ${psi.toFixed(3)} exceeds critical tangency limit!` : `Stable Thermal Operation (ψ = ${psi.toFixed(3)} <= 0.368) · V_CSTR/V_PFR = ${volRatio.toFixed(2)}x`,
        isAlert: isRunaway, deepDiveWorkbench: 'wb6-kinetics-reactors',
        curvePoints: buildSvgCurvePoints(xs, xs.map((conv) => Math.min(calcCstr(conv), 180)), [0.05, 0.98], [0, 180]),
        secondaryCurvePoints: buildSvgCurvePoints(xs, xs.map(calcPfr), [0.05, 0.98], [0, 180]),
        secondaryCurveLabel: 'PFR Space Time τ_PFR',
        operatingPoint: buildSvgCurvePoints([x], [Math.min(tauCstr, 180)], [0.05, 0.98], [0, 180])[0],
        readoutText: `X = ${x.toFixed(2)}, ψ = ${psi.toFixed(2)} → τ_CSTR = ${tauCstr.toFixed(2)} min vs. τ_PFR = ${tauPfr.toFixed(2)} min (${volRatio.toFixed(2)}x)`,
        learnCallout: { title: 'Levenspiel CSTR vs. PFR Sizing & Semenov Runaway Criterion', plainEnglish: 'A CSTR operates entirely at the low exit reactant concentration C_A0(1-X), requiring a much larger volume than a PFR at high conversion.', commonTrap: 'When Semenov number ψ > 1/e ≈ 0.368, heat generation outpaces jacket cooling tangency and triggers thermal runaway.' },
        equations: [{
          id: 'sec19-cstr-pfr-semenov', title: '1st-Order CSTR vs. PFR Space Time & Semenov Stability', citation: "[Perry's 9th Ed., Sec. 19, p. 19-3]",
          symbolicLatex: '\\tau_{\\mathrm{CSTR}} = \\frac{X}{k_1(1-X)}, \\quad \\tau_{\\mathrm{PFR}} = \\frac{-\\ln(1-X)}{k_1}, \\quad \\psi_{\\mathrm{crit}} = \\frac{1}{e} \\approx 0.3679',
          substitutedLatex: `X = ${x.toFixed(2)}, \\; k_1 = ${k1}\\ \\mathrm{min^{-1}}, \\; \\psi = ${psi.toFixed(3)}`,
          resultLatex: `\\tau_{\\mathrm{CSTR}} = ${tauCstr.toFixed(2)}\\ \\mathrm{min}, \\; \\tau_{\\mathrm{PFR}} = ${tauPfr.toFixed(2)}\\ \\mathrm{min}, \\; \\frac{V_{\\mathrm{CSTR}}}{V_{\\mathrm{PFR}}} = ${volRatio.toFixed(2)}`,
        }],
      };
    },
  },
  {
    secNum: 20, secTitle: 'Bioreactions and Bioprocessing', clusterId: 'cluster-d',
    secPage: '20-83', pdfPage1Based: 1832, verifyToken: 'TABLE 20-36', citation: "[Perry's 9th Ed., Sec. 20, Table 20-36, p. 20-83]",
    xAxisLabel: 'Dilution Rate D (h⁻¹: 0.02 → 0.95)', yAxisLabel: 'Biomass Productivity D·X* (g/(L·h))',
    primaryParam: { key: 'dilutionRate', label: 'Dilution Rate D', symbol: 'D', unit: 'h⁻¹', min: 0.02, max: 0.95, step: 0.01, defaultVal: 0.35, scale: 'linear' },
    secondaryParam: { key: 'monodKs', label: 'Monod Constant K_s', symbol: 'K_s', unit: 'g/L', min: 0.05, max: 2.5, step: 0.05, defaultVal: 0.4, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 0.02, 0.95), 0.02, 0.95, 0.01), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.05, 2.5), 0.05, 2.5, 0.05) }),
    solve: (dRaw, ksRaw) => {
      const d = clampDomainValue(dRaw, 0.02, 0.95), ks = clampDomainValue(ksRaw, 0.05, 2.5);
      const muMax = 0.85, s0 = 10.0, yXs = 0.5, kla = 120, cStar = 8.2, cL = 2.5;
      const dWash = (muMax * s0) / (ks + s0), otrMgLh = kla * (cStar - cL);
      const calcProd = (dil: number) => {
        if (dil >= dWash) return 0;
        const sStar = Math.min((ks * dil) / Math.max(muMax - dil, 1e-4), s0);
        return dil * yXs * Math.max(s0 - sStar, 0);
      };
      const prod = calcProd(d), isWashout = d >= dWash;
      const xs = GRID_21.map((t) => 0.02 + t * 0.93);
      return {
        secNum: 20, secTitle: 'Bioreactions and Bioprocessing', clusterId: 'cluster-d',
        secPage: '20-83', pdfPage1Based: 1832, verifyToken: 'TABLE 20-36', citation: "[Perry's 9th Ed., Sec. 20, Table 20-36, p. 20-83]",
        primaryVal: d, secondaryVal: ks, responseVal: Number(prod.toFixed(3)), responseUnit: 'g/(L·h)',
        secondaryResponseLabel: 'Washout D_wash & OTR', secondaryResponseVal: `D_wash = ${dWash.toFixed(3)} h⁻¹ · OTR = ${otrMgLh.toFixed(0)} mg O₂/(L·h)`,
        statusBanner: isWashout ? `CHEMOSTAT WASHOUT (D = ${d.toFixed(2)} >= D_wash = ${dWash.toFixed(3)} h⁻¹): Cells flushed faster than growth!` : `Steady Chemostat: D·X* = ${prod.toFixed(3)} g/(L·h) (D_wash = ${dWash.toFixed(3)} h⁻¹)`,
        isAlert: isWashout,
        curvePoints: buildSvgCurvePoints(xs, xs.map(calcProd), [0.02, 0.95], [0, 4.0]),
        operatingPoint: buildSvgCurvePoints([d], [prod], [0.02, 0.95], [0, 4.0])[0],
        readoutText: `D = ${d.toFixed(2)} h⁻¹, K_s = ${ks.toFixed(2)} g/L → D·X* = ${prod.toFixed(3)} g/(L·h) · D_wash = ${dWash.toFixed(3)} h⁻¹`,
        learnCallout: { title: 'Monod Chemostat Kinetics, Washout & Oxygen Transfer Rate (OTR)', plainEnglish: 'Chemostat productivity D·X* peaks just below the washout dilution rate D_wash = μ_max S_0 / (K_s + S_0).', commonTrap: 'Operating too close to D_wash risks sudden complete biomass washout (X* → 0) upon minor feed perturbations.' },
        equations: [{
          id: 'sec20-monod-chemostat', title: 'Monod Chemostat Productivity & Washout Dilution Rate', citation: "[Perry's 9th Ed., Sec. 20, Table 20-36, p. 20-83]",
          symbolicLatex: 'S^* = \\frac{K_s D}{\\mu_{\\max} - D}, \\quad X^* = Y_{X/S}(S_0 - S^*), \\quad D_{\\mathrm{wash}} = \\frac{\\mu_{\\max}S_0}{K_s + S_0}, \\quad \\mathrm{OTR} = k_L a(C^* - C_L)',
          substitutedLatex: `D = ${d.toFixed(2)}\\ \\mathrm{h^{-1}}, \\; K_s = ${ks.toFixed(2)}\\ \\mathrm{g/L}, \\; D_{\\mathrm{wash}} = ${dWash.toFixed(3)}\\ \\mathrm{h^{-1}}`,
          resultLatex: `D\\cdot X^* = ${prod.toFixed(3)}\\ \\mathrm{g/(L\\cdot h)}, \\quad \\mathrm{OTR} = ${otrMgLh.toFixed(0)}\\ \\mathrm{mg/(L\\cdot h)}`,
        }],
      };
    },
  },
];
