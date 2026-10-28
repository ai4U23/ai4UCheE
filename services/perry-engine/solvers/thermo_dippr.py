"""Perry's 9th Ed. Section 2 DIPPR correlation solver (Eq. 101, Eq. 106 w/ C5, Eq. 105).

Produces 3-Stage White-Box KaTeX steps with verified Perry's citations:
- Table 2-8  (p. 2-53):  Vapor pressure Eq. 101
- Table 2-69 (p. 2-120): Heat of vaporization Eq. 106 (with full C2..C5 exponent)
- Table 2-32 (p. 2-93):  Liquid molar density Eq. 105
"""
from __future__ import annotations

import math
from typing import Any

from core.handcalcs_katex import render_three_stage_equation, steps_to_dict
from core.unit_registry import ureg
from solvers.dippr_coeffs import get_compound_dippr


def _temp_to_kelvin(temp_val: float, temp_unit: str) -> float:
    u = temp_unit.strip()
    mapping = {
        "k": "kelvin",
        "c": "degC",
        "degc": "degC",
        "°c": "degC",
        "f": "degF",
        "degf": "degF",
        "°f": "degF",
        "r": "degR",
        "degr": "degR",
        "°r": "degR",
    }
    target = mapping.get(u.lower(), u)
    return float(ureg.Quantity(temp_val, target).to("kelvin").magnitude)


def _coolprop_vp_pa(fluid_name: str, temp_k: float) -> float | None:
    try:
        from CoolProp.CoolProp import PropsSI

        return float(PropsSI("P", "T", temp_k, "Q", 0, fluid_name))
    except Exception:
        return None


def evaluate_dippr_eq101_vp(compound: str, temp_k: float) -> dict[str, Any]:
    """DIPPR Eq. 101 vapor pressure (Pa) — Table 2-8, p. 2-53."""
    data = get_compound_dippr(compound)
    c1, c2, c3, c4, c5, t_min, t_max, sec_page = data["vp_eq101"]
    range_warning = not (t_min <= temp_k <= t_max)
    exponent = c1 + (c2 / temp_k) + c3 * math.log(temp_k) + c4 * (temp_k**c5)
    vp_pa = math.exp(min(exponent, 60.0))
    citation = f"[Perry's 9th Ed., Table 2-8 (DIPPR Eq. 101), p. {sec_page}]"
    step = render_three_stage_equation(
        "P_{vp}",
        "exp(C1 + C2 / T + C3 * ln(T) + C4 * (T ** C5))",
        {
            "C1": (c1, "", "C_{1}"),
            "C2": (c2, r"\mathrm{K}", "C_{2}"),
            "C3": (c3, "", "C_{3}"),
            "C4": (c4, "", "C_{4}"),
            "C5": (c5, "", "C_{5}"),
            "T": (temp_k, r"\mathrm{K}", "T"),
        },
        vp_pa,
        r"\mathrm{Pa}",
        citation,
    )
    return {
        "vapor_pressure_pa": vp_pa,
        "t_min_k": t_min,
        "t_max_k": t_max,
        "range_warning": range_warning,
        "sec_page": sec_page,
        "citation": citation,
        "step": step.model_dump(),
    }


def evaluate_dippr_eq106_hvap_t_c5(compound: str, temp_k: float) -> dict[str, Any]:
    """DIPPR Eq. 106 heat of vaporization (J/kmol) with full C2..C5 exponent — Table 2-69, p. 2-120."""
    data = get_compound_dippr(compound)
    c1, c2, c3, c4, c5, t_min, t_max, sec_page = data["hvap_eq106"]
    tc = float(data["tc_k"])
    tr = min(temp_k / tc, 0.9999)
    range_warning = not (t_min <= temp_k <= t_max)
    poly = c2 + c3 * tr + c4 * (tr**2) + c5 * (tr**3)
    hvap_j_kmol = c1 * ((1.0 - tr) ** poly)
    citation = f"[Perry's 9th Ed., Table 2-69 (DIPPR Eq. 106), p. {sec_page}]"
    step = render_three_stage_equation(
        r"\Delta H_{vap}",
        "C1 * ((1 - Tr) ** (C2 + C3 * Tr + C4 * (Tr ** 2) + C5 * (Tr ** 3)))",
        {
            "C1": (c1, r"\mathrm{J/kmol}", "C_{1}"),
            "C2": (c2, "", "C_{2}"),
            "C3": (c3, "", "C_{3}"),
            "C4": (c4, "", "C_{4}"),
            "C5": (c5, "", "C_{5}"),
            "Tr": (tr, "", "T_{r}"),
        },
        hvap_j_kmol,
        r"\mathrm{J/kmol}",
        citation,
    )
    return {
        "hvap_j_kmol": hvap_j_kmol,
        "tr": tr,
        "exponent_poly": poly,
        "t_min_k": t_min,
        "t_max_k": t_max,
        "range_warning": range_warning,
        "sec_page": sec_page,
        "citation": citation,
        "step": step.model_dump(),
    }


def evaluate_dippr_eq105_rhol(compound: str, temp_k: float) -> dict[str, Any]:
    """DIPPR Eq. 105 liquid molar density (kmol/m^3) — Table 2-32, p. 2-93."""
    data = get_compound_dippr(compound)
    c1, c2, c3, c4, t_min, t_max, sec_page = data["rhol_eq105"]
    range_warning = not (t_min <= temp_k <= t_max)
    tau = max(1.0 - temp_k / c3, 1e-6)
    rhol_kmol_m3 = c1 / (c2 ** (1.0 + (tau**c4)))
    rho_kg_m3 = rhol_kmol_m3 * float(data["mw"])
    citation = f"[Perry's 9th Ed., Table 2-32 (DIPPR Eq. 105), p. {sec_page}]"
    step = render_three_stage_equation(
        r"\rho_{L}",
        "C1 / (C2 ** (1 + ((1 - T / C3) ** C4)))",
        {
            "C1": (c1, r"\mathrm{kmol/m^3}", "C_{1}"),
            "C2": (c2, "", "C_{2}"),
            "C3": (c3, r"\mathrm{K}", "C_{3}"),
            "C4": (c4, "", "C_{4}"),
            "T": (temp_k, r"\mathrm{K}", "T"),
        },
        rhol_kmol_m3,
        r"\mathrm{kmol/m^3}",
        citation,
    )
    return {
        "rhol_kmol_m3": rhol_kmol_m3,
        "rho_kg_m3": rho_kg_m3,
        "t_min_k": t_min,
        "t_max_k": t_max,
        "range_warning": range_warning,
        "sec_page": sec_page,
        "citation": citation,
        "step": step.model_dump(),
    }


def evaluate_all_dippr_properties(
    compound: str, temp_val: float, temp_unit: str = "K"
) -> dict[str, Any]:
    """Evaluate Eq. 101 VP, Eq. 106 dH_vap (w/ C5), and Eq. 105 rho_L with CoolProp check."""
    data = get_compound_dippr(compound)
    temp_k = _temp_to_kelvin(temp_val, temp_unit)
    vp = evaluate_dippr_eq101_vp(compound, temp_k)
    hvap = evaluate_dippr_eq106_hvap_t_c5(compound, temp_k)
    rhol = evaluate_dippr_eq105_rhol(compound, temp_k)
    cp_vp = _coolprop_vp_pa(data["name"], temp_k)
    any_warning = vp["range_warning"] or hvap["range_warning"]
    return {
        "compound": data["name"],
        "formula": data["formula"],
        "cas": data["cas"],
        "mw": data["mw"],
        "tc_k": data["tc_k"],
        "pc_pa": data["pc_pa"],
        "temperature_k": temp_k,
        "vapor_pressure_pa": vp["vapor_pressure_pa"],
        "hvap_j_kmol": hvap["hvap_j_kmol"],
        "rhol_kmol_m3": rhol["rhol_kmol_m3"],
        "rho_kg_m3": rhol["rho_kg_m3"],
        "range_warning": any_warning,
        "range_bounds_k": [vp["t_min_k"], vp["t_max_k"]],
        "coolprop_vp_reference_pa": cp_vp,
        "equations": [vp["step"], hvap["step"], rhol["step"]],
        "sec_pages": {"vp": vp["sec_page"], "hvap": hvap["sec_page"], "rhol": rhol["sec_page"]},
    }
