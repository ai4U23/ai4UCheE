// Cluster E (Sec 21..25) deterministic solvers, 3-stage white-box KaTeX derivations, and inverse SVG drag mappings.
import { clampDomainValue, inverseLinearMap, inverseLog10Map } from '../svg-drag-math';
import { buildSvgCurvePoints, type PerrySectionDescriptor } from './perry-section-types';

const GRID_21 = Array.from({ length: 21 }, (_, i) => i / 20);
const API_ORIFICES: ReadonlyArray<[string, number]> = [
  ['D', 0.11], ['E', 0.196], ['F', 0.307], ['G', 0.503], ['H', 0.785], ['J', 1.287], ['K', 1.838], ['L', 2.853], ['M', 3.6], ['N', 4.34], ['P', 6.38], ['Q', 11.05], ['R', 16.0], ['T', 26.0],
];

export const SEC_21_25_DESCRIPTORS: ReadonlyArray<PerrySectionDescriptor> = [
  {
    secNum: 21, secTitle: 'Solids Processing and Particle Technology', clusterId: 'cluster-e',
    secPage: '21-34', pdfPage1Based: 1885, verifyToken: 'FIG. 21-76', citation: "[Perry's 9th Ed., Sec. 21, Fig. 21-76, p. 21-34]",
    xAxisLabel: 'Product 80%-Passing Size d_{80,P} (μm, log10: 25 → 2000)', yAxisLabel: 'Bond Specific Grinding Energy E (kWh/t)',
    primaryParam: { key: 'd80ProductUm', label: 'Product Size d_{80,P}', symbol: 'd_{80,P}', unit: 'μm', min: 25, max: 2000, step: 5, defaultVal: 250, scale: 'log10' },
    secondaryParam: { key: 'bondWi', label: 'Bond Work Index W_i', symbol: 'W_i', unit: 'kWh/t', min: 5.0, max: 25.0, step: 0.5, defaultVal: 13.5, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: Math.round(clampDomainValue(inverseLog10Map(u, 25, 2000), 25, 2000, 5)), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 5.0, 25.0), 5.0, 25.0, 0.5) }),
    solve: (d80PRaw, wiRaw) => {
      const d80P = clampDomainValue(d80PRaw, 25, 2000), wi = clampDomainValue(wiRaw, 5.0, 25.0), d80F = 5000, tonsPerHr = 85;
      const calcE = (dp: number) => Math.max(10 * wi * (1 / Math.sqrt(dp) - 1 / Math.sqrt(d80F)), 0.05);
      const eKwhT = calcE(d80P), motorKw = eKwhT * tonsPerHr, redRatio = d80F / d80P;
      const xs = GRID_21.map((t) => inverseLog10Map(t, 25, 2000));
      return {
        secNum: 21, secTitle: 'Solids Processing and Particle Technology', clusterId: 'cluster-e',
        secPage: '21-34', pdfPage1Based: 1885, verifyToken: 'FIG. 21-76', citation: "[Perry's 9th Ed., Sec. 21, Fig. 21-76, p. 21-34]",
        primaryVal: d80P, secondaryVal: wi, responseVal: Number(eKwhT.toFixed(2)), responseUnit: 'kWh/t',
        secondaryResponseLabel: 'Mill Motor Power (85 t/h) & R_r', secondaryResponseVal: `P_mill = ${motorKw.toFixed(0)} kW · R_r = ${redRatio.toFixed(1)}:1`,
        statusBanner: d80P < 60 ? `Ultrafine Grinding Regime (d_{80,P} = ${d80P} μm) — High Specific Energy E = ${eKwhT.toFixed(2)} kWh/t` : `Ball/Rod Mill Comminution: E = ${eKwhT.toFixed(2)} kWh/t · Motor P = ${motorKw.toFixed(0)} kW`,
        isAlert: d80P < 60,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => Math.min(calcE(x), 45)), [25, 2000], [0, 45], 'log10', 'linear'),
        operatingPoint: buildSvgCurvePoints([d80P], [Math.min(eKwhT, 45)], [25, 2000], [0, 45], 'log10', 'linear')[0],
        readoutText: `d_{80,P} = ${d80P.toFixed(0)} μm, W_i = ${wi.toFixed(1)} kWh/t → E = ${eKwhT.toFixed(2)} kWh/t · P_mill = ${motorKw.toFixed(0)} kW`,
        learnCallout: { title: 'Bond Third Theory of Comminution (Work Index W_i)', plainEnglish: 'Specific grinding work scales with the inverse square root of product particle diameter d_{80,P} in micrometers.', commonTrap: 'Bond’s constant 10 requires d_{80,P} and d_{80,F} in micrometers (μm), not millimeters!' },
        equations: [{
          id: 'sec21-bond-work', title: 'Bond Work Index Specific Grinding Energy', citation: "[Perry's 9th Ed., Sec. 21, Fig. 21-76, p. 21-34]",
          symbolicLatex: 'E = 10\\,W_i\\!\\left(\\frac{1}{\\sqrt{d_{80,P}}} - \\frac{1}{\\sqrt{d_{80,F}}}\\right), \\quad P_{\\mathrm{mill}} = \\dot{m}_s E',
          substitutedLatex: `E = 10(${wi.toFixed(1)})\\!\\left(\\frac{1}{\\sqrt{${d80P.toFixed(0)}}} - \\frac{1}{\\sqrt{5000}}\\right)`,
          resultLatex: `E = ${eKwhT.toFixed(2)}\\ \\mathrm{kWh/t}, \\quad P_{\\mathrm{mill}} = ${motorKw.toFixed(0)}\\ \\mathrm{kW}`,
        }],
      };
    },
  },
  {
    secNum: 22, secTitle: 'Waste Management', clusterId: 'cluster-e',
    secPage: '22-3', pdfPage1Based: 1964, verifyToken: 'BOD', citation: "[Perry's 9th Ed., Sec. 22, p. 22-3]",
    xAxisLabel: 'Downstream Travel Time t (days: 0.2 → 15.0)', yAxisLabel: 'Dissolved Oxygen DO(t) (mg/L)',
    primaryParam: { key: 'travelDays', label: 'River Travel Time t', symbol: 't', unit: 'd', min: 0.2, max: 15.0, step: 0.2, defaultVal: 3.5, scale: 'linear' },
    secondaryParam: { key: 'bodLoadMgL', label: 'Ultimate BOD Load L_0', symbol: 'L_0', unit: 'mg/L', min: 20, max: 400, step: 5, defaultVal: 120, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 0.2, 15.0), 0.2, 15.0, 0.2), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 20, 400), 20, 400, 5) }),
    solve: (tRaw, l0Raw) => {
      const t = clampDomainValue(tRaw, 0.2, 15.0), l0 = clampDomainValue(l0Raw, 20, 400);
      const k1 = 0.25, k2 = 0.45, doSat = 9.0, d0 = 1.2;
      const calcDo = (timeD: number) => {
        const deficit = ((k1 * l0) / (k2 - k1)) * (Math.exp(-k1 * timeD) - Math.exp(-k2 * timeD)) + d0 * Math.exp(-k2 * timeD);
        return clampDomainValue(doSat - deficit, 0, doSat);
      };
      const doVal = calcDo(t), deficitVal = doSat - doVal, isHypoxia = doVal < 4.0;
      const xs = GRID_21.map((p) => 0.2 + p * 14.8);
      return {
        secNum: 22, secTitle: 'Waste Management', clusterId: 'cluster-e',
        secPage: '22-3', pdfPage1Based: 1964, verifyToken: 'BOD', citation: "[Perry's 9th Ed., Sec. 22, p. 22-3]",
        primaryVal: t, secondaryVal: l0, responseVal: Number(doVal.toFixed(2)), responseUnit: 'mg/L DO',
        secondaryResponseLabel: 'Oxygen Deficit D_ox(t) & Remaining BOD', secondaryResponseVal: `D_ox = ${deficitVal.toFixed(2)} mg/L · L(t) = ${(l0 * Math.exp(-k1 * t)).toFixed(1)} mg/L`,
        statusBanner: isHypoxia ? `HYPOXIA ALERT (DO = ${doVal.toFixed(2)} mg/L < 4.0 mg/L): BOD Load L_0 = ${l0} mg/L Exceeds Reaeration!` : `Compliant Receiving Water DO = ${doVal.toFixed(2)} mg/L >= 4.0 mg/L (D_ox = ${deficitVal.toFixed(2)} mg/L)`,
        isAlert: isHypoxia,
        curvePoints: buildSvgCurvePoints(xs, xs.map(calcDo), [0.2, 15.0], [0, 9.5]),
        operatingPoint: buildSvgCurvePoints([t], [doVal], [0.2, 15.0], [0, 9.5])[0],
        readoutText: `t = ${t.toFixed(1)} d, L_0 = ${l0.toFixed(0)} mg/L → DO(t) = ${doVal.toFixed(2)} mg/L · Deficit D_ox = ${deficitVal.toFixed(2)} mg/L`,
        learnCallout: { title: 'Streeter-Phelps Dissolved Oxygen Sag Curve & BOD Assimilation', plainEnglish: 'Microbial BOD oxidation depletes oxygen at rate k_1 L(t) while atmospheric reaeration replenishes it at k_2 D_ox(t).', commonTrap: 'Peak oxygen deficit occurs downstream at critical travel time t_c, not immediately at the wastewater outfall.' },
        equations: [{
          id: 'sec22-streeter-phelps', title: 'Streeter-Phelps Dissolved Oxygen Deficit & DO(t)', citation: "[Perry's 9th Ed., Sec. 22, p. 22-3]",
          symbolicLatex: 'D_{\\mathrm{ox}}(t) = \\frac{k_1 L_0}{k_2 - k_1}(e^{-k_1 t} - e^{-k_2 t}) + D_0 e^{-k_2 t}, \\quad \\mathrm{DO}(t) = \\mathrm{DO}_{\\mathrm{sat}} - D_{\\mathrm{ox}}(t)',
          substitutedLatex: `t = ${t.toFixed(1)}\\ \\mathrm{d}, \\; L_0 = ${l0.toFixed(0)}\\ \\mathrm{mg/L}, \\; k_1 = 0.25\\ \\mathrm{d^{-1}}, \\; k_2 = 0.45\\ \\mathrm{d^{-1}}`,
          resultLatex: `\\mathrm{DO}(t) = ${doVal.toFixed(2)}\\ \\mathrm{mg/L}, \\quad D_{\\mathrm{ox}}(t) = ${deficitVal.toFixed(2)}\\ \\mathrm{mg/L}`,
        }],
      };
    },
  },
  {
    secNum: 23, secTitle: 'Process Safety (API 520 Relief Valve Sizing)', clusterId: 'cluster-e',
    secPage: '23-30', pdfPage1Based: 2085, verifyToken: 'relief', citation: "[Perry's 9th Ed., Sec. 23, p. 23-30]",
    xAxisLabel: 'PSV Set Gauge Pressure P_{set,psig} (psig: 15 → 1000)', yAxisLabel: 'Required API 520 Orifice Area A (in²)',
    primaryParam: { key: 'pSetPsig', label: 'Set Gauge Pressure P_{set,psig}', symbol: 'P_{\\mathrm{set,psig}}', unit: 'psig', min: 15, max: 1000, step: 5, defaultVal: 150, scale: 'linear' },
    secondaryParam: { key: 'reliefRateKgH', label: 'Relief Mass Rate W', symbol: 'W', unit: 'kg/h', min: 500, max: 50000, step: 500, defaultVal: 8500, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 15, 1000), 15, 1000, 5), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 500, 50000), 500, 50000, 500) }),
    solve: (pSetRaw, wRaw) => {
      const pSetPsig = clampDomainValue(pSetRaw, 15, 1000), wKgH = clampDomainValue(wRaw, 500, 50000);
      const wLbH = wKgH * 2.20462, cGas = 345, kd = 0.975, kb = 1.0, kc = 1.0, tR = 560, zFac = 0.98, mw = 44.0;
      const calcAreaIn2 = (psig: number) => {
        const p1Psia = 1.10 * psig + 14.6959;
        return (wLbH / (cGas * kd * p1Psia * kb * kc)) * Math.sqrt((tR * zFac) / mw);
      };
      const p1Psia = 1.10 * pSetPsig + 14.6959, areaIn2 = calcAreaIn2(pSetPsig), areaCm2 = areaIn2 * 6.4516;
      const wrongGaugeAreaIn2 = (wLbH / (cGas * kd * (1.10 * pSetPsig) * kb * kc)) * Math.sqrt((tR * zFac) / mw);
      const gaugeErrPct = ((wrongGaugeAreaIn2 - areaIn2) / areaIn2) * 100;
      const orifice = API_ORIFICES.find(([, a]) => a >= areaIn2) ?? API_ORIFICES[API_ORIFICES.length - 1];
      const xs = GRID_21.map((t) => 15 + t * 985);
      return {
        secNum: 23, secTitle: 'Process Safety (API 520 Relief Valve Sizing)', clusterId: 'cluster-e',
        secPage: '23-30', pdfPage1Based: 2085, verifyToken: 'relief', citation: "[Perry's 9th Ed., Sec. 23, p. 23-30]",
        primaryVal: pSetPsig, secondaryVal: wKgH, responseVal: Number(areaIn2.toFixed(3)), responseUnit: 'in²',
        secondaryResponseLabel: 'P_{1,psia} & Selected API Letter Orifice', secondaryResponseVal: `P_1 = ${p1Psia.toFixed(2)} psia · Orifice '${orifice[0]}' (${orifice[1]} in² / ${areaCm2.toFixed(2)} cm²)`,
        statusBanner: pSetPsig <= 40 ? `LOW-PRESSURE PSV DATUM TRAP: P_1 = 1.10(${pSetPsig}) + 14.696 = ${p1Psia.toFixed(2)} psia (omitting +14.696 psia skews A by ${gaugeErrPct.toFixed(1)}%)` : `API 520 Critical Gas Relief: P_1 = ${p1Psia.toFixed(2)} psia → A = ${areaIn2.toFixed(3)} in² (API '${orifice[0]}')`,
        isAlert: pSetPsig <= 40 || areaIn2 > 26.0,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => Math.min(calcAreaIn2(x), 18)), [15, 1000], [0, 18]),
        operatingPoint: buildSvgCurvePoints([pSetPsig], [Math.min(areaIn2, 18)], [15, 1000], [0, 18])[0],
        readoutText: `P_set = ${pSetPsig.toFixed(0)} psig → P_1 = ${p1Psia.toFixed(2)} psia (10% accum + 14.696 psia) · A = ${areaIn2.toFixed(3)} in² (${areaCm2.toFixed(2)} cm², API '${orifice[0]}')`,
        learnCallout: { title: 'API 520 Sonic Gas Relief Sizing & Relieving Pressure P_1 (psig → psia)', plainEnglish: 'Choked sonic gas mass flux scales linearly with absolute relieving pressure P_{1,psia} = 1.10·P_{set,psig} + 14.696 psia.', commonTrap: 'Using gauge pressure (psig) instead of absolute (psia) in API 520 distorts orifice sizing by >30% on low-pressure vessels!' },
        equations: [{
          id: 'sec23-api520-psv', title: 'API 520 Critical Gas Relief Orifice Area (Mandatory psig → psia)', citation: "[Perry's 9th Ed., Sec. 23, p. 23-30]",
          symbolicLatex: 'P_{1,\\mathrm{psia}} = 1.10\\,P_{\\mathrm{set,psig}} + 14.6959\\ \\mathrm{psia}, \\quad A = \\frac{W}{C K_d P_{1,\\mathrm{psia}} K_b K_c}\\sqrt{\\frac{T Z}{M_w}}',
          substitutedLatex: `P_{1,\\mathrm{psia}} = 1.10(${pSetPsig.toFixed(0)}) + 14.6959 = ${p1Psia.toFixed(2)}\\ \\mathrm{psia}, \\; W = ${wKgH.toFixed(0)}\\ \\mathrm{kg/h}`,
          resultLatex: `A = ${areaIn2.toFixed(3)}\\ \\mathrm{in^2} = ${areaCm2.toFixed(2)}\\ \\mathrm{cm^2}\\;(\\mathrm{API\\ Orifice\\ '${orifice[0]}'})`,
        }],
      };
    },
  },
  {
    secNum: 24, secTitle: 'Energy Resources, Conversion and Utilization', clusterId: 'cluster-e',
    secPage: '24-21', pdfPage1Based: 2162, verifyToken: 'Rankine', citation: "[Perry's 9th Ed., Sec. 24, p. 24-21]",
    xAxisLabel: 'Heat Source Temperature T_H (K: 450 → 900)', yAxisLabel: 'Thermal Efficiency η_th vs. Carnot Limit η_Carnot',
    primaryParam: { key: 'tempHotK', label: 'Hot Source Temp T_H', symbol: 'T_H', unit: 'K', min: 450, max: 900, step: 5, defaultVal: 650, scale: 'linear' },
    secondaryParam: { key: 'etaSecondLaw', label: '2nd-Law Efficiency η_II', symbol: '\\eta_{\\mathrm{II}}', unit: '-', min: 0.45, max: 0.90, step: 0.01, defaultVal: 0.72, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 450, 900), 450, 900, 5), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 0.45, 0.90), 0.45, 0.90, 0.01) }),
    solve: (thRaw, eta2Raw) => {
      const th = clampDomainValue(thRaw, 450, 900), eta2 = clampDomainValue(eta2Raw, 0.45, 0.90), tc = 303.15;
      const calcCarnot = (t: number) => 1 - tc / t;
      const etaCarnot = calcCarnot(th), etaTh = eta2 * etaCarnot, exergyDestKjKg = 1000 * etaCarnot * (1 - eta2);
      const xs = GRID_21.map((t) => 450 + t * 450);
      return {
        secNum: 24, secTitle: 'Energy Resources, Conversion and Utilization', clusterId: 'cluster-e',
        secPage: '24-21', pdfPage1Based: 2162, verifyToken: 'Rankine', citation: "[Perry's 9th Ed., Sec. 24, p. 24-21]",
        primaryVal: th, secondaryVal: eta2, responseVal: Number((etaTh * 100).toFixed(2)), responseUnit: '% η_th',
        secondaryResponseLabel: 'Carnot Limit & Exergy Destruction', secondaryResponseVal: `η_Carnot = ${(etaCarnot * 100).toFixed(1)}% · I_dest = ${exergyDestKjKg.toFixed(1)} kJ/kg`,
        statusBanner: etaTh < 0.25 ? `Low-Grade Heat Recovery (η_th = ${(etaTh * 100).toFixed(1)}%) — High Exergy Destruction` : `Rankine Cycle Efficiency η_th = ${(etaTh * 100).toFixed(1)}% (Carnot Ceiling = ${(etaCarnot * 100).toFixed(1)}%)`,
        isAlert: etaTh < 0.25,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => calcCarnot(x) * eta2 * 100), [450, 900], [10, 75]),
        secondaryCurvePoints: buildSvgCurvePoints(xs, xs.map((x) => calcCarnot(x) * 100), [450, 900], [10, 75]),
        secondaryCurveLabel: 'Carnot Limit η_Carnot (%)',
        operatingPoint: buildSvgCurvePoints([th], [etaTh * 100], [450, 900], [10, 75])[0],
        readoutText: `T_H = ${th.toFixed(0)} K, η_II = ${eta2.toFixed(2)} → η_th = ${(etaTh * 100).toFixed(2)}% (η_Carnot = ${(etaCarnot * 100).toFixed(1)}%)`,
        learnCallout: { title: 'Carnot Thermodynamic Limit, Rankine Efficiency & Gouy-Stodola Exergy Loss', plainEnglish: 'Second-Law efficiency η_II measures how closely an actual Rankine power cycle approaches the reversible Carnot ceiling 1 - T_C/T_H.', commonTrap: 'Evaluating 1 - T_C/T_H in °C instead of absolute Kelvin (K) yields completely unphysical efficiencies!' },
        equations: [{
          id: 'sec24-rankine-exergy', title: 'Carnot Limit, Actual Rankine Efficiency & Exergy Destruction', citation: "[Perry's 9th Ed., Sec. 24, p. 24-21]",
          symbolicLatex: '\\eta_{\\mathrm{Carnot}} = 1 - \\frac{T_C}{T_H}, \\quad \\eta_{\\mathrm{th}} = \\eta_{\\mathrm{II}}\\,\\eta_{\\mathrm{Carnot}}, \\quad I_{\\mathrm{dest}} = T_0 S_{\\mathrm{gen}} = Q_H \\eta_{\\mathrm{Carnot}}(1 - \\eta_{\\mathrm{II}})',
          substitutedLatex: `T_H = ${th.toFixed(0)}\\ \\mathrm{K}, \\; T_C = 303.15\\ \\mathrm{K}, \\; \\eta_{\\mathrm{II}} = ${eta2.toFixed(2)}`,
          resultLatex: `\\eta_{\\mathrm{th}} = ${(etaTh * 100).toFixed(2)}\\%, \\quad \\eta_{\\mathrm{Carnot}} = ${(etaCarnot * 100).toFixed(1)}\\%`,
        }],
      };
    },
  },
  {
    secNum: 25, secTitle: 'Materials of Construction (Corrosion & PREN)', clusterId: 'cluster-e',
    secPage: '25-3', pdfPage1Based: 2206, verifyToken: 'corrosion', citation: "[Perry's 9th Ed., Sec. 25, p. 25-3]",
    xAxisLabel: 'Operating Temperature T_{op} (°C: 20 → 180)', yAxisLabel: 'Corrosion Penetration Rate CR (mpy: mils/yr)',
    primaryParam: { key: 'tempOpC', label: 'Operating Temp T_{op}', symbol: 'T_{\\mathrm{op}}', unit: '°C', min: 20, max: 180, step: 2, defaultVal: 85, scale: 'linear' },
    secondaryParam: { key: 'alloyPren', label: 'Alloy Pitting Number PREN', symbol: '\\mathrm{PREN}', unit: '-', min: 18, max: 48, step: 1, defaultVal: 25, scale: 'linear' },
    inverseSvgDrag: (u, v) => ({ primaryVal: clampDomainValue(inverseLinearMap(u, 20, 180), 20, 180, 2), secondaryVal: clampDomainValue(inverseLinearMap(1 - v, 18, 48), 18, 48, 1) }),
    solve: (tOpRaw, prenRaw) => {
      const tOp = clampDomainValue(tOpRaw, 20, 180), pren = clampDomainValue(prenRaw, 18, 48);
      const calcMpy = (t: number) => 1.8 * Math.exp(0.032 * (t - 60)) * Math.exp(-0.11 * (pren - 25));
      const crMpy = calcMpy(tOp), crMmYr = crMpy / 39.37, isUnacceptable = crMpy > 5.0;
      const alloyGrade = pren >= 40 ? 'Hastelloy C-276 / 6Mo' : pren >= 32 ? 'Duplex 2205' : '316L Stainless';
      const xs = GRID_21.map((t) => 20 + t * 160);
      return {
        secNum: 25, secTitle: 'Materials of Construction (Corrosion & PREN)', clusterId: 'cluster-e',
        secPage: '25-3', pdfPage1Based: 2206, verifyToken: 'corrosion', citation: "[Perry's 9th Ed., Sec. 25, p. 25-3]",
        primaryVal: tOp, secondaryVal: pren, responseVal: Number(crMpy.toFixed(2)), responseUnit: 'mpy',
        secondaryResponseLabel: 'Metric Penetration & Alloy Class', secondaryResponseVal: `${crMmYr.toFixed(3)} mm/yr · ${alloyGrade} (PREN=${pren})`,
        statusBanner: isUnacceptable ? `SEVERE CORROSION ALERT: CR = ${crMpy.toFixed(2)} mpy (${crMmYr.toFixed(3)} mm/yr) > 5.0 mpy limit — Upgrade to higher PREN alloy!` : `Acceptable Material Selection (${alloyGrade}): CR = ${crMpy.toFixed(2)} mpy (${crMmYr.toFixed(3)} mm/yr <= 5.0 mpy)`,
        isAlert: isUnacceptable,
        curvePoints: buildSvgCurvePoints(xs, xs.map((x) => Math.min(calcMpy(x), 40)), [20, 180], [0, 40]),
        operatingPoint: buildSvgCurvePoints([tOp], [Math.min(crMpy, 40)], [20, 180], [0, 40])[0],
        readoutText: `T_op = ${tOp.toFixed(0)} °C, PREN = ${pren} (${alloyGrade}) → CR = ${crMpy.toFixed(2)} mpy (${crMmYr.toFixed(3)} mm/yr)`,
        learnCallout: { title: 'Faraday/Fontana Corrosion Penetration Rate (mpy) & Alloy PREN', plainEnglish: 'Corrosion rate doubles roughly every 20–30 °C rise; higher Cr/Mo/N content (PREN = %Cr + 3.3%Mo + 16%N) suppresses chloride pitting.', commonTrap: '1 mm/yr = 39.37 mpy (mils per year); exceeding 5 mpy (0.127 mm/yr) requires thick corrosion allowance or upgrading from 316L to Duplex/Hastelloy.' },
        equations: [{
          id: 'sec25-faraday-pren', title: 'Faraday Corrosion Penetration Rate & Pitting Resistance (PREN)', citation: "[Perry's 9th Ed., Sec. 25, p. 25-3]",
          symbolicLatex: '\\mathrm{CR}_{\\mathrm{mpy}} = \\frac{K \\cdot i_{\\mathrm{corr}} \\cdot EW}{\\rho_{\\mathrm{alloy}}}, \\quad \\mathrm{CR}_{\\mathrm{mm/yr}} = \\frac{\\mathrm{CR}_{\\mathrm{mpy}}}{39.37}, \\quad \\mathrm{PREN} = \\%\\mathrm{Cr} + 3.3\\%\\mathrm{Mo} + 16\\%\\mathrm{N}',
          substitutedLatex: `T_{\\mathrm{op}} = ${tOp.toFixed(0)}^\\circ\\mathrm{C}, \\; \\mathrm{PREN} = ${pren}\\;(${alloyGrade})`,
          resultLatex: `\\mathrm{CR} = ${crMpy.toFixed(2)}\\ \\mathrm{mpy} = ${crMmYr.toFixed(3)}\\ \\mathrm{mm/yr}`,
        }],
      };
    },
  },
];
