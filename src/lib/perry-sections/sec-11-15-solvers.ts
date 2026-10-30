// Cluster C (Sec 11..15) deterministic solvers, 3-stage white-box KaTeX derivations, and inverse SVG drag mappings.
import { solveDistillation } from '../../components/workbenches/distillation-solver-math';
import { clampDomainValue, inverseLinearMap, inverseLog10Map } from '../svg-drag-math';
import { buildSvgCurvePoints, type PerrySectionDescriptor } from './perry-section-types';

const GRID_21 = Array.from({ length: 21 }, (_, i) => i / 20);

function calcBowmanFt(p: number, r: number): number {
  const s = Math.sqrt(r * r + 1);
  if (Math.abs(r - 1) < 1e-4) {
    const pLim = Math.min(p, 2 / (2 + Math.SQRT2) - 0.002), num = (Math.SQRT2 * pLim) / Math.max(1 - pLim, 1e-4);
    const den = Math.log(Math.max((2 - pLim * (2 - Math.SQRT2)) / Math.max(2 - pLim * (2 + Math.SQRT2), 1e-4), 1.0001));
    return clampDomainValue(num / Math.max(den, 1e-4), 0.35, 1.0);
  }
  const pSafe = Math.min(p, 2 / (r + 1 + s) - 0.002);
  const num = s * Math.log(Math.max((1 - pSafe) / Math.max(1 - r * pSafe, 1e-4), 1.0001));
  const den = (r - 1) * Math.log(Math.max((2 - pSafe * (r + 1 - s)) / Math.max(2 - pSafe * (r + 1 + s), 1e-4), 1.0001));
  return clampDomainValue(num / Math.max(den, 1e-4), 0.35, 1.0);
}
const calcSatPressKpa = (tC: number): number => 0.61078 * Math.exp((17.27 * tC) / (tC + 237.3));

export const SEC_11_15_DESCRIPTORS: ReadonlyArray<PerrySectionDescriptor> = [
  {
    secNum: 11, secTitle: 'Heat-Transfer Equipment (LMTD & Bowman F_T)', clusterId: 'cluster-c',
    secPage: '11-4', pdfPage1Based: 949, verifyToken: 'LMTD', citation: "[Perry's 9th Ed., Sec. 11, Eq. 11-5 & Fig. 11-3, p. 11-4]",
    xAxisLabel: 'Thermal Effectiveness P_th = (t_2 - t_1)/(T_1 - t_1) (0.05 → 0.85)', yAxisLabel: 'Bowman LMTD Correction Factor F_T (-)',
    primaryParam: { key: 'pThermal', label: 'Thermal Effectiveness P_th', symbol: 'P_{\\mathrm{th}}', unit: '-', min: 0.05, max: 0.85, step: 0.01, defaultVal: 0.45, scale: 'linear' },
    secondaryParam: { key: 'rThermal', label: 'Heat-Capacity Ratio R_th', symbol: 'R_{\\mathrm{th}}', unit: '-', min: 0.20, max: 3.00, step: 0.05, defaultVal: 1.00, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 0.05, 0.85), 0.05, 0.85, 0.01), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.20, 3.00), 0.20, 3.00, 0.05) }),
    solve: (pRaw, rRaw) => {
      const pTh = clampDomainValue(pRaw, 0.05, 0.85), rTh = clampDomainValue(rRaw, 0.20, 3.00);
      const ft = calcBowmanFt(pTh, rTh), uVal = 650, dtLm = 28.0, qKw = 1200;
      const areaM2 = (qKw * 1000) / Math.max(uVal * ft * dtLm, 1);
      const isCrossTrap = ft < 0.75;
      const xs = GRID_21.map((t) => 0.05 + t * 0.80);
      return {
        secNum: 11, secTitle: 'Heat-Transfer Equipment (LMTD & Bowman F_T)', clusterId: 'cluster-c',
        secPage: '11-4', pdfPage1Based: 949, verifyToken: 'LMTD', citation: "[Perry's 9th Ed., Sec. 11, Eq. 11-5 & Fig. 11-3, p. 11-4]",
        primaryVal: pTh, secondaryVal: rTh, responseVal: Number(ft.toFixed(3)), responseUnit: 'F_T (-)',
        secondaryResponseLabel: 'Required Area A (Q=1.2 MW)', secondaryResponseVal: `${areaM2.toFixed(1)} m² (U=${uVal} W/m²K, ΔT_lm=${dtLm} K)`,
        statusBanner: isCrossTrap ? `TEMPERATURE CROSS TRAP (F_T < 0.75): F_T = ${ft.toFixed(3)} — 1-2 Exchanger Infeasible; Use 2-4 Shell Pass` : `Feasible 1-2 Shell-and-Tube Regime: F_T = ${ft.toFixed(3)} >= 0.75 (A = ${areaM2.toFixed(1)} m²)`,
        isAlert: isCrossTrap,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => calcBowmanFt(x, rTh)), [0.05, 0.85], [0.35, 1.02]),
        operatingPoint: buildSvgCurvePoints([pTh], [ft], [0.05, 0.85], [0.35, 1.02])[0],
        readoutText: `P_th = ${pTh.toFixed(2)}, R_th = ${rTh.toFixed(2)} → F_T = ${ft.toFixed(3)} · Area A = ${areaM2.toFixed(1)} m²`,
        learnCallout: { title: 'Bowman LMTD Correction Factor F_T & Temperature Cross', plainEnglish: 'Countercurrent ΔT_lm must be multiplied by F_T in multi-pass shell-and-tube exchangers because half the tube passes flow cocurrently.', commonTrap: 'Operating where F_T < 0.75 lies on the steep asymptotic cliff—minor fouling causes a severe temperature cross failure.' },
        equations: [{
          id: 'sec11-bowman-ft', title: '1-2 Shell-and-Tube Bowman LMTD Factor F_T & Exchanger Area', citation: "[Perry's 9th Ed., Sec. 11, Eq. 11-5 & Fig. 11-3, p. 11-4]",
          symbolicLatex: 'Q = U A F_T \\Delta T_{\\mathrm{lm}}, \\quad F_T = \\frac{\\sqrt{R^2+1}\\,\\ln\\!\\left(\\frac{1-P}{1-RP}\\right)}{(R-1)\\,\\ln\\!\\left(\\frac{2-P(R+1-\\sqrt{R^2+1})}{2-P(R+1+\\sqrt{R^2+1})}\\right)}',
          substitutedLatex: `P_{\\mathrm{th}} = ${pTh.toFixed(2)}, \\; R_{\\mathrm{th}} = ${rTh.toFixed(2)}, \\; Q = 1200\\ \\mathrm{kW}, \\; U = 650\\ \\mathrm{W/(m^2\\cdot K)}`,
          resultLatex: `F_T = ${ft.toFixed(3)}, \\quad A = ${areaM2.toFixed(1)}\\ \\mathrm{m^2}`,
        }],
      };
    },
  },
  {
    secNum: 12, secTitle: 'Psychrometry, Evaporative Cooling and Solids Drying', clusterId: 'cluster-c',
    secPage: '12-4', pdfPage1Based: 1047, verifyToken: 'wet-bulb', citation: "[Perry's 9th Ed., Sec. 12, Table 12-1, p. 12-4]",
    xAxisLabel: 'Dry-Bulb Temperature T_db (°C: 5 → 85)', yAxisLabel: 'Absolute Humidity Ratio Y (kg H₂O / kg dry air)',
    primaryParam: { key: 'tDryBulbC', label: 'Dry-Bulb Temp T_db', symbol: 'T_{\\mathrm{db}}', unit: '°C', min: 5, max: 85, step: 0.5, defaultVal: 35, scale: 'linear' },
    secondaryParam: { key: 'relHumidity', label: 'Relative Humidity φ', symbol: '\\phi', unit: '-', min: 0.05, max: 1.00, step: 0.01, defaultVal: 0.50, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 5, 85), 5, 85, 0.5), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.05, 1.00), 0.05, 1.00, 0.01) }),
    solve: (tRaw, phiRaw) => {
      const tDb = clampDomainValue(tRaw, 5, 85), phi = clampDomainValue(phiRaw, 0.05, 1.00), pTotKpa = 101.325;
      const calcY = (t: number, rh: number) => {
        const pw = Math.min(rh * calcSatPressKpa(t), pTotKpa * 0.92);
        return (0.62198 * pw) / Math.max(pTotKpa - pw, 1.0);
      };
      const pSatKpa = calcSatPressKpa(tDb), yHum = calcY(tDb, phi);
      const hEnthalpy = (1.005 + 1.88 * yHum) * tDb + 2501.4 * yHum;
      const xs = GRID_21.map((t) => 5 + t * 80);
      return {
        secNum: 12, secTitle: 'Psychrometry, Evaporative Cooling and Solids Drying', clusterId: 'cluster-c',
        secPage: '12-4', pdfPage1Based: 1047, verifyToken: 'wet-bulb', citation: "[Perry's 9th Ed., Sec. 12, Table 12-1, p. 12-4]",
        primaryVal: tDb, secondaryVal: phi, responseVal: Number(yHum.toFixed(4)), responseUnit: 'kg/kg DA',
        secondaryResponseLabel: 'Humid Enthalpy H_g', secondaryResponseVal: `${hEnthalpy.toFixed(1)} kJ/kg dry air (P_sat=${pSatKpa.toFixed(2)} kPa)`,
        statusBanner: phi > 0.85 ? `Near-Saturated Air (φ = ${(phi * 100).toFixed(0)}%) — Low Constant-Rate Drying Driving Force` : `Active Drying Psychrometric State: Y = ${yHum.toFixed(4)} kg/kg, H_g = ${hEnthalpy.toFixed(1)} kJ/kg`,
        isAlert: phi > 0.90,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => Math.min(calcY(x, phi), 0.65)), [5, 85], [0, 0.65]),
        operatingPoint: buildSvgCurvePoints([tDb], [Math.min(yHum, 0.65)], [5, 85], [0, 0.65])[0],
        readoutText: `T_db = ${tDb.toFixed(1)} °C, φ = ${(phi * 100).toFixed(0)}% → Y = ${yHum.toFixed(4)} kg/kg · H_g = ${hEnthalpy.toFixed(1)} kJ/kg`,
        learnCallout: { title: 'Psychrometric Humidity Ratio & Constant-Rate Solids Drying', plainEnglish: 'Adiabatic evaporative cooling follows constant wet-bulb enthalpy lines while trading sensible heat for latent vaporization.', commonTrap: 'Always use total absolute pressure P_tot (101.325 kPa = 14.696 psia) in the denominator P_tot - φ P_w^sat.' },
        equations: [{
          id: 'sec12-psychrometry', title: 'Absolute Humidity Ratio Y & Humid Enthalpy H_g', citation: "[Perry's 9th Ed., Sec. 12, Table 12-1, p. 12-4]",
          symbolicLatex: 'Y = 0.62198\\frac{\\phi P_w^{\\mathrm{sat}}(T_{\\mathrm{db}})}{P_{\\mathrm{tot}} - \\phi P_w^{\\mathrm{sat}}(T_{\\mathrm{db}})}, \\quad H_g = (1.005 + 1.88Y)T_{\\mathrm{db}} + 2501.4Y',
          substitutedLatex: `T_{\\mathrm{db}} = ${tDb.toFixed(1)}^\\circ\\mathrm{C}, \\; \\phi = ${phi.toFixed(2)}, \\; P_w^{\\mathrm{sat}} = ${pSatKpa.toFixed(2)}\\ \\mathrm{kPa}`,
          resultLatex: `Y = ${yHum.toFixed(4)}\\ \\mathrm{kg/kg\\ DA}, \\quad H_g = ${hEnthalpy.toFixed(1)}\\ \\mathrm{kJ/kg}`,
        }],
      };
    },
  },
  {
    secNum: 13, secTitle: 'Distillation (Fenske-Underwood-Gilliland)', clusterId: 'cluster-c',
    secPage: '13-17', pdfPage1Based: 1150, verifyToken: 'Fenske', citation: "[Perry's 9th Ed., Sec. 13, Eqs. 13-25..13-27, p. 13-17]",
    xAxisLabel: 'Distillate Purity x_D (0.70 → 0.995)', yAxisLabel: 'Minimum Equilibrium Stages N_min (-)',
    primaryParam: { key: 'xd', label: 'Distillate Purity x_D', symbol: 'x_D', unit: 'mol/mol', min: 0.70, max: 0.995, step: 0.005, defaultVal: 0.95, scale: 'linear' },
    secondaryParam: { key: 'rMult', label: 'Reflux Factor R/R_min', symbol: 'R/R_{\\min}', unit: '-', min: 1.05, max: 3.00, step: 0.05, defaultVal: 1.30, scale: 'linear' },
    deepDiveWorkbench: 'wb4-distillation',
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 0.70, 0.995), 0.70, 0.995, 0.005), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 1.05, 3.00), 1.05, 3.00, 0.05) }),
    solve: (xdRaw, rMultRaw) => {
      const xd = clampDomainValue(xdRaw, 0.70, 0.995), rMult = clampDomainValue(rMultRaw, 1.05, 3.00);
      const d = solveDistillation({ alpha: 2.45, xf: 0.45, xd, xb: 0.03, q: 1.0, rMult, traySpacingM: 0.6, colDiamM: 1.5 });
      const gillilandN = (xVal: number, rm: number) => {
        const s = solveDistillation({ alpha: 2.45, xf: 0.45, xd: xVal, xb: 0.03, q: 1.0, rMult: rm, traySpacingM: 0.6, colDiamM: 1.5 });
        const xG = clampDomainValue((s.rOp - s.rMin) / (s.rOp + 1), 0.01, 0.99);
        const yG = 1 - Math.exp(((1 + 54.4 * xG) / (11 + 117.2 * xG)) * ((xG - 1) / Math.sqrt(xG)));
        return Math.min((s.nMin + yG) / Math.max(1 - yG, 0.05), 32);
      };
      const nGill = gillilandN(xd, rMult);
      const xs = GRID_21.map((t) => 0.70 + t * 0.295);
      return {
        secNum: 13, secTitle: 'Distillation (Fenske-Underwood-Gilliland)', clusterId: 'cluster-c',
        secPage: '13-17', pdfPage1Based: 1150, verifyToken: 'Fenske', citation: "[Perry's 9th Ed., Sec. 13, Eqs. 13-25..13-27, p. 13-17]",
        primaryVal: xd, secondaryVal: rMult, responseVal: Number(d.nMin.toFixed(2)), responseUnit: 'N_min stages',
        secondaryResponseLabel: 'Gilliland Stages N & R_op', secondaryResponseVal: `N = ${nGill.toFixed(1)} stages (R_op = ${d.rOp.toFixed(2)}, R_min = ${d.rMin.toFixed(2)})`,
        statusBanner: rMult < 1.12 ? `Near Minimum-Reflux Pinch (R/R_min = ${rMult.toFixed(2)}) — Stage Count Escalates` : `Economic Reflux Regime (R/R_min = ${rMult.toFixed(2)}) → N_min = ${d.nMin.toFixed(2)}, N = ${nGill.toFixed(1)}`,
        isAlert: rMult < 1.12, deepDiveWorkbench: 'wb4-distillation',
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => gillilandN(x, rMult)), [0.70, 0.995], [3, 32]),
        secondaryCurvePoints: buildSvgCurvePoints(xs, xs.map((x) => solveDistillation({ alpha: 2.45, xf: 0.45, xd: x, xb: 0.03, q: 1.0, rMult, traySpacingM: 0.6, colDiamM: 1.5 }).nMin), [0.70, 0.995], [3, 32]),
        secondaryCurveLabel: 'Fenske N_min (Total Reflux)',
        operatingPoint: buildSvgCurvePoints([xd], [nGill], [0.70, 0.995], [3, 32])[0],
        readoutText: `x_D = ${xd.toFixed(3)}, R/R_min = ${rMult.toFixed(2)} → N_min = ${d.nMin.toFixed(2)}, N = ${d.totalStages} stages`,
        learnCallout: { title: 'Fenske Minimum Stages & Underwood Pinch', plainEnglish: 'High purity x_D -> 1 scales N_min logarithmically while operating reflux R = (R/R_min)·R_min sets boilup energy.', commonTrap: 'Operating at R <= R_min creates a tangent pinch requiring infinite trays.' },
        equations: [{ ...d.equations[0], citation: "[Perry's 9th Ed., Sec. 13, Eqs. 13-25..13-27, p. 13-17]" }],
      };
    },
  },
  {
    secNum: 14, secTitle: 'Equipment for Distillation and Gas Absorption', clusterId: 'cluster-c',
    secPage: '14-37', pdfPage1Based: 1270, verifyToken: 'FIG. 14-32', citation: "[Perry's 9th Ed., Sec. 14, Fig. 14-32, p. 14-37]",
    xAxisLabel: 'Liquid-Vapor Flow Factor F_LV (log10: 0.01 → 1.00)', yAxisLabel: 'Fair Capacity Factor C_sb (m/s)',
    primaryParam: { key: 'fLv', label: 'Flow Parameter F_LV', symbol: 'F_{LV}', unit: '-', min: 0.01, max: 1.00, step: 0.01, defaultVal: 0.10, scale: 'log10' },
    secondaryParam: { key: 'colDiamM', label: 'Column Diameter D_c', symbol: 'D_c', unit: 'm', min: 0.30, max: 4.50, step: 0.05, defaultVal: 1.50, scale: 'linear' },
    deepDiveWorkbench: 'wb4-distillation',
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLog10Map(u, 0.01, 1.00), 0.01, 1.00, 0.01), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.30, 4.50), 0.30, 4.50, 0.05) }),
    solve: (fLvRaw, dColRaw) => {
      const fLv = clampDomainValue(fLvRaw, 0.01, 1.00), colDiamM = clampDomainValue(dColRaw, 0.30, 4.50);
      const calcCsb = (flv: number) => (0.0105 + 0.1496 * Math.pow(0.6, 0.755)) * Math.pow(10, -0.14 * Math.log10(Math.max(flv, 0.01)));
      const cSb = calcCsb(fLv), uFlood = cSb * Math.sqrt((815 - 2.85) / 2.85);
      const aNet = ((Math.PI * colDiamM * colDiamM) / 4) * 0.88, uAct = 2.65 / Math.max(aNet, 0.05);
      const floodPct = (uAct / Math.max(uFlood, 0.05)) * 100, nOg = Math.log((0.05 / 0.002) * (1 - 1 / 1.4) + 1 / 1.4) / (1 - 1 / 1.4);
      const xs = GRID_21.map((t) => inverseLog10Map(t, 0.01, 1.00));
      const floodSeries = xs.map((x) => clampDomainValue(0.08 + ((uAct / Math.max(calcCsb(x) * Math.sqrt((815 - 2.85) / 2.85), 0.05)) / 1.2) * 0.14, 0.08, 0.22));
      return {
        secNum: 14, secTitle: 'Equipment for Distillation and Gas Absorption', clusterId: 'cluster-c',
        secPage: '14-37', pdfPage1Based: 1270, verifyToken: 'FIG. 14-32', citation: "[Perry's 9th Ed., Sec. 14, Fig. 14-32, p. 14-37]",
        primaryVal: fLv, secondaryVal: colDiamM, responseVal: Number(cSb.toFixed(4)), responseUnit: 'm/s (C_sb)',
        secondaryResponseLabel: '%Flood & Kremser N_OG', secondaryResponseVal: `${floodPct.toFixed(1)}% Flood (u_f=${uFlood.toFixed(2)} m/s, N_OG=${nOg.toFixed(2)}, P_abs=P_psig+14.696 psia)`,
        statusBanner: floodPct >= 85 ? `JET / ENTRAINMENT FLOODING (%Flood = ${floodPct.toFixed(1)}% >= 85%) — Increase D_c` : `Hydraulic Tray Operation OK (%Flood = ${floodPct.toFixed(1)}%, C_sb = ${cSb.toFixed(4)} m/s)`,
        isAlert: floodPct >= 85, deepDiveWorkbench: 'wb4-distillation',
        curvePoints: buildSvgCurvePoints(xs, xs.map(calcCsb), [0.01, 1.00], [0.08, 0.22], 'log10', 'linear'),
        secondaryCurvePoints: buildSvgCurvePoints(xs, floodSeries, [0.01, 1.00], [0.08, 0.22], 'log10', 'linear'),
        secondaryCurveLabel: `Operating Load (D_c=${colDiamM.toFixed(2)}m → ${floodPct.toFixed(0)}% Flood)`,
        operatingPoint: buildSvgCurvePoints([fLv], [cSb], [0.01, 1.00], [0.08, 0.22], 'log10', 'linear')[0],
        readoutText: `F_LV = ${fLv.toFixed(3)}, D_c = ${colDiamM.toFixed(2)} m → C_sb = ${cSb.toFixed(4)} m/s · %Flood = ${floodPct.toFixed(1)}%`,
        learnCallout: { title: 'Fair Entrainment Flooding & Kremser Absorption Stages', plainEnglish: 'High liquid-to-vapor loading F_LV lowers tray capacity factor C_sb and reduces flooding velocity u_flood.', commonTrap: 'Gas density ρ_G in F_LV and u_flood must be evaluated at absolute column pressure (P_psig + 14.696 psia).' },
        equations: [{
          id: 'sec14-fair-flood', title: 'Fair Souders-Brown Capacity C_sb(F_LV) & Flooding Velocity', citation: "[Perry's 9th Ed., Sec. 14, Fig. 14-32, p. 14-37]",
          symbolicLatex: 'u_{\\mathrm{flood}} = C_{sb}(F_{LV})\\left(\\frac{\\sigma}{20}\\right)^{0.2}\\sqrt{\\frac{\\rho_L - \\rho_G}{\\rho_G}}, \\quad \\rho_G = \\frac{(P_{\\mathrm{psig}}+14.696)\\cdot 6894.76\\,M_w}{RT}',
          substitutedLatex: `F_{LV} = ${fLv.toFixed(3)}, \\; D_c = ${colDiamM.toFixed(2)}\\ \\mathrm{m}, \\; C_{sb} = ${cSb.toFixed(4)}\\ \\mathrm{m/s}`,
          resultLatex: `u_{\\mathrm{flood}} = ${uFlood.toFixed(2)}\\ \\mathrm{m/s}, \\quad \\%\\mathrm{Flood} = ${floodPct.toFixed(1)}\\%, \\quad N_{OG} = ${nOg.toFixed(2)}`,
        }],
      };
    },
  },
  {
    secNum: 15, secTitle: 'Liquid-Liquid Extraction (Kremser Cascade)', clusterId: 'cluster-c',
    secPage: '15-7', pdfPage1Based: 1358, verifyToken: 'Kremser', citation: "[Perry's 9th Ed., Sec. 15, Eq. 15-14, p. 15-7]",
    xAxisLabel: 'Extraction Factor E = m·S/F (0.40 → 4.00)', yAxisLabel: 'Unextracted Raffinate Fraction Φ (-)',
    primaryParam: { key: 'extractionFactor', label: 'Extraction Factor E', symbol: 'E', unit: '-', min: 0.40, max: 4.00, step: 0.05, defaultVal: 1.50, scale: 'linear' },
    secondaryParam: { key: 'stagesN', label: 'Equilibrium Stages N', symbol: 'N', unit: 'stages', min: 1, max: 16, step: 1, defaultVal: 6, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 0.40, 4.00), 0.40, 4.00, 0.05), secondaryVal: Math.round(clampDomainValue(inverseLinearMap(1 - v, 1, 16), 1, 16, 1)) }),
    solve: (eRaw, nRaw) => {
      const eFac = clampDomainValue(eRaw, 0.40, 4.00), nStg = Math.round(clampDomainValue(nRaw, 1, 16, 1));
      const calcPhi = (e: number, n: number) => (Math.abs(e - 1) < 1e-4 ? 1 / (n + 1) : (e - 1) / (Math.pow(e, n + 1) - 1));
      const phi = calcPhi(eFac, nStg), recPct = (1 - phi) * 100;
      const xs = GRID_21.map((t) => 0.40 + t * 3.60);
      return {
        secNum: 15, secTitle: 'Liquid-Liquid Extraction (Kremser Cascade)', clusterId: 'cluster-c',
        secPage: '15-7', pdfPage1Based: 1358, verifyToken: 'Kremser', citation: "[Perry's 9th Ed., Sec. 15, Eq. 15-14, p. 15-7]",
        primaryVal: eFac, secondaryVal: nStg, responseVal: Number(phi.toFixed(4)), responseUnit: 'Φ raffinate',
        secondaryResponseLabel: 'Solute Recovery %R', secondaryResponseVal: `${recPct.toFixed(2)}% extracted (${nStg} countercurrent stages)`,
        statusBanner: eFac < 1.0 ? `Solvent-Pinched Cascade (E = ${eFac.toFixed(2)} < 1) — Recovery Capped at ${recPct.toFixed(1)}%` : `Effective Countercurrent Extraction: Φ = ${phi.toFixed(4)} (${recPct.toFixed(2)}% recovery)`,
        isAlert: eFac < 1.0,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => calcPhi(x, nStg)), [0.40, 4.00], [0, 0.85]),
        operatingPoint: buildSvgCurvePoints([eFac], [phi], [0.40, 4.00], [0, 0.85])[0],
        readoutText: `E = ${eFac.toFixed(2)}, N = ${nStg} → Φ = ${phi.toFixed(4)} (Recovery = ${recPct.toFixed(2)}%)`,
        learnCallout: { title: 'Kremser-Souders-Brown Countercurrent Extraction Cascade', plainEnglish: 'When extraction factor E = mS/F > 1.3, adding equilibrium stages drives unextracted solute fraction Φ exponentially toward zero.', commonTrap: 'At E = 1.0, the geometric formula (E-1)/(E^{N+1}-1) hits 0/0; apply L’Hôpital’s limit Φ(1,N) = 1/(N+1).' },
        equations: [{
          id: 'sec15-kremser-lle', title: 'Kremser Countercurrent Raffinate Fraction Φ(E, N)', citation: "[Perry's 9th Ed., Sec. 15, Eq. 15-14, p. 15-7]",
          symbolicLatex: '\\Phi(E, N) = \\frac{X_N - X_S/m}{X_0 - X_S/m} = \\begin{cases} \\dfrac{1}{N+1} & |E-1| < 10^{-4} \\\\[6pt] \\dfrac{E - 1}{E^{N+1} - 1} & E \\neq 1 \\end{cases}',
          substitutedLatex: `E = ${eFac.toFixed(2)}, \\; N = ${nStg}\\ \\mathrm{stages}`,
          resultLatex: `\\Phi = ${phi.toFixed(4)}, \\quad \\%R = ${recPct.toFixed(2)}\\%`,
        }],
      };
    },
  },
];
