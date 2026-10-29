// Pure WB2 solver math — true DIPPR Eq. 101 / Eq. 106 with coefficients ported verbatim from
// services/perry-engine/solvers/dippr_coeffs.py (PDF-verified against Perry's 9th Ed.:
// vapor pressure Table 2-8, p. 2-53; ΔH_vap Table 2-69, p. 2-120). Replaces the shipped
// anchored correlation vpAt373Pa·exp(12.2·(1−373.15/T)).
import type { WhiteBoxStageEquation } from '../../actions/view-screen';

export interface DipprCompound {
  key: string;
  label: string;
  tcK: number;
  pcPa: number;
  vpEq101: [number, number, number, number, number]; // C1, C2, C3, C4, C5
  hvapEq106: [number, number, number, number, number]; // C1 [J/kmol], C2..C5
}

export const DIPPR_COMPOUNDS: Record<string, DipprCompound> = {
  water: { key: 'water', label: 'Water (H₂O)', tcK: 647.096, pcPa: 22064000.0, vpEq101: [73.649, -7258.2, -7.3037, 4.1653e-6, 2.0], hvapEq106: [5.2053e7, 0.3199, -0.212, 0.25795, 0.0] },
  benzene: { key: 'benzene', label: 'Benzene (C₆H₆)', tcK: 562.05, pcPa: 4895000.0, vpEq101: [83.107, -6486.2, -9.2194, 6.9844e-6, 2.0], hvapEq106: [4.75e7, 0.45238, -0.0534, 0.0, 0.0] },
  toluene: { key: 'toluene', label: 'Toluene (C₇H₈)', tcK: 591.75, pcPa: 4108000.0, vpEq101: [76.945, -6729.8, -8.179, 5.3017e-6, 2.0], hvapEq106: [5.0144e7, 0.3859, 0.0, 0.0, 0.0] },
  ethanol: { key: 'ethanol', label: 'Ethanol (C₂H₆O)', tcK: 514.0, pcPa: 6137000.0, vpEq101: [73.304, -7122.3, -7.1424, 2.8853e-6, 2.0], hvapEq106: [5.69e7, 0.3359, 0.0, 0.0, 0.0] },
  acetone: { key: 'acetone', label: 'Acetone (C₃H₆O)', tcK: 508.2, pcPa: 4701000.0, vpEq101: [69.006, -5599.6, -7.0985, 6.2237e-6, 2.0], hvapEq106: [4.215e7, 0.3397, 0.0, 0.0, 0.0] },
};

export interface ThermoInputs {
  compound: string;
  tempK: number;
}

export interface ThermoMetrics {
  label: string;
  tcK: number;
  tempC: number;
  tr: number;
  pSatPa: number;
  pSatKpa: number;
  pSatPsia: number;
  hVapJkmol: number;
  hVapKjMol: number;
}

/** DIPPR Eq. 101 vapor pressure [Pa]: P = exp(C1 + C2/T + C3·ln T + C4·T^C5). */
export function dippr101(c: DipprCompound, tK: number): number {
  const [c1, c2, c3, c4, c5] = c.vpEq101;
  return Math.exp(c1 + c2 / tK + c3 * Math.log(tK) + c4 * Math.pow(tK, c5));
}

/** DIPPR Eq. 106 heat of vaporization [J/kmol]: ΔH = C1·(1−Tr)^(C2 + C3·Tr + C4·Tr² + C5·Tr³). */
export function dippr106(c: DipprCompound, tK: number): number {
  const [c1, c2, c3, c4, c5] = c.hvapEq106;
  const tr = Math.min(Math.max(tK / c.tcK, 0.01), 0.9999);
  return c1 * Math.pow(1 - tr, c2 + c3 * tr + c4 * tr * tr + c5 * tr * tr * tr);
}

export function solveThermo(
  inputs: ThermoInputs,
): ThermoMetrics & { equations: WhiteBoxStageEquation[] } {
  const fluid = DIPPR_COMPOUNDS[inputs.compound] ?? DIPPR_COMPOUNDS.water;
  const tK = Math.max(inputs.tempK, 200);
  const tr = Math.min(Math.max(tK / fluid.tcK, 0.01), 0.9999);
  const pSatPa = dippr101(fluid, tK);
  const hVapJkmol = dippr106(fluid, tK);
  const [a, b, cc, d, e] = fluid.vpEq101;
  const equations: WhiteBoxStageEquation[] = [
    {
      id: 'wb2-dippr-101',
      title: `DIPPR Eq. 101 Vapor Pressure (${fluid.label})`,
      citation: "[Perry's 9th Ed., Table 2-8, p. 2-53]",
      symbolicLatex: 'P^{\\mathrm{sat}} = \\exp\\!\\left(C_1 + \\frac{C_2}{T} + C_3 \\ln T + C_4 T^{C_5}\\right)',
      substitutedLatex: `T = ${tK.toFixed(2)}\\ \\mathrm{K}, \\; C_{1..5} = ${a}, ${b}, ${cc}, ${d.toExponential(2)}, ${e}`,
      resultLatex: `P^{\\mathrm{sat}} = ${Math.round(pSatPa).toLocaleString('en-US')}\\ \\mathrm{Pa} = ${(pSatPa / 6894.757).toFixed(2)}\\ \\mathrm{psia}`,
      plainExplanation: 'A liquid boils when its saturation vapor pressure equals the surrounding absolute pressure — at 1 atm that is the normal boiling point.',
    },
    {
      id: 'wb2-dippr-106',
      title: `DIPPR Eq. 106 ΔH_vap with T_r^C5 (${fluid.label})`,
      citation: "[Perry's 9th Ed., Table 2-69, p. 2-120]",
      symbolicLatex: '\\Delta H_{\\mathrm{vap}} = C_1 (1 - T_r)^{C_2 + C_3 T_r + C_4 T_r^2 + C_5 T_r^3}',
      substitutedLatex: `T_r = ${tr.toFixed(4)}, \\; C_1 = ${fluid.hvapEq106[0].toExponential(3)}\\ \\mathrm{J/kmol}`,
      resultLatex: `\\Delta H_{\\mathrm{vap}} = ${(hVapJkmol / 1e6).toFixed(2)}\\ \\mathrm{MJ/kmol}`,
      plainExplanation: 'Latent heat shrinks as the critical point approaches — the Watson-style exponent tracks that curvature.',
    },
  ];
  return {
    label: fluid.label,
    tcK: fluid.tcK,
    tempC: tK - 273.15,
    tr,
    pSatPa,
    pSatKpa: pSatPa / 1000,
    pSatPsia: pSatPa / 6894.757,
    hVapJkmol,
    hVapKjMol: hVapJkmol / 1e6,
    equations,
  };
}
