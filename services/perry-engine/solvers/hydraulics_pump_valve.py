"""Perry's 9th Ed. Sec 8 & 10 Pump NPSH_A Cavitation Solver & ISA-75.01 Control Valve C_v Solver.

Verified Perry's anchors (Validation Session 1):
- Sec. 10 NPSH (pp. 10-24..10-25): NPSH_A definition + Perry's margin rule
  (NPSH)_A >= max[(NPSH)_R + 5 ft (~1.52 m), 1.35 * (NPSH)_R]
- Sec. 8 Control Valve Sizing (Eqs. 8-77..8-81, pp. 8-71..8-74): ISA-75.01 / IEC 60534
  liquid critical pressure ratio factor F_F = 0.96 - 0.28*sqrt(P_v/P_c) and choked drop
  dP_max = F_L^2 * (P_1 - F_F * P_v).
"""
from __future__ import annotations

import math
from typing import Any

from core.handcalcs_katex import render_three_stage_equation
from core.unit_registry import normalize_pressure_to_pa, ureg

G_STD = 9.80665  # m/s^2


def evaluate_pump_npsha(
    p_suction_val: float,
    p_suction_unit: str,
    patm_psia: float = 14.6959,
    z_suction_m: float = 2.0,
    hf_suction_m: float = 0.8,
    p_vapor_pa: float = 3169.0,
    rho_kg_m3: float = 998.2,
    npshr_m: float = 3.0,
) -> dict[str, Any]:
    """Compute Pump NPSH_A with explicit gauge-to-absolute normalization and cavitation check."""
    norm_p = normalize_pressure_to_pa(p_suction_val, p_suction_unit, patm_psia)
    p_abs_pa = float(norm_p["value_pa"])
    npsha_m = ((p_abs_pa - p_vapor_pa) / (rho_kg_m3 * G_STD)) + z_suction_m - hf_suction_m
    margin_m = npsha_m - npshr_m
    ratio = npsha_m / max(npshr_m, 1e-6)
    status = "CAVITATION_DANGER" if (margin_m < 1.0 or ratio < 1.35) else "SAFE"

    step = render_three_stage_equation(
        r"\mathrm{NPSH}_{A}",
        "(Pabs - Pvp) / (rho * g) + z - hf",
        {
            "Pabs": (p_abs_pa, r"\mathrm{Pa}", r"P_{\mathrm{suction,abs}}"),
            "Pvp": (p_vapor_pa, r"\mathrm{Pa}", r"P_{vp}"),
            "rho": (rho_kg_m3, r"\mathrm{kg/m^3}", r"\rho"),
            "g": (G_STD, r"\mathrm{m/s^2}", "g"),
            "z": (z_suction_m, r"\mathrm{m}", r"z_{\mathrm{suction}}"),
            "hf": (hf_suction_m, r"\mathrm{m}", r"h_{f,\mathrm{suction}}"),
        },
        npsha_m,
        r"\mathrm{m}",
        "[Perry's 9th Ed., Sec. 10 NPSH, p. 10-24]",
    )
    return {
        "p_suction_abs_pa": p_abs_pa,
        "p_suction_psia": norm_p["value_psia"],
        "is_gauge_converted": norm_p["is_gauge_converted"],
        "datum_note": norm_p["datum_note"],
        "npsha_m": npsha_m,
        "npshr_m": npshr_m,
        "margin_m": margin_m,
        "ratio": ratio,
        "cavitation_status": status,
        "perry_margin_rule_note": (
            "Perry's 9th Ed. p. 10-25 Eqs. (10-52)/(10-53): require "
            "(NPSH)_A >= max[(NPSH)_R + 5 ft (~1.5 m), 1.35 * (NPSH)_R]."
        ),
        "citation": "[Perry's 9th Ed., Sec. 10 NPSH, p. 10-24]",
        "step": step.model_dump(),
    }


def evaluate_control_valve_cv(
    flow_m3_s: float,
    p1_pa: float,
    p2_pa: float,
    p_vapor_pa: float,
    p_crit_pa: float,
    rho_kg_m3: float = 998.2,
    fl_factor: float = 0.9,
) -> dict[str, Any]:
    """ISA-75.01 / IEC 60534 liquid control valve C_v with explicit F_F and choked-flow check."""
    ff = 0.96 - 0.28 * math.sqrt(max(p_vapor_pa, 0.0) / max(p_crit_pa, 1.0))
    dp_actual_pa = max(p1_pa - p2_pa, 100.0)
    dp_max_pa = (fl_factor**2) * max(p1_pa - ff * p_vapor_pa, 100.0)
    is_choked = dp_actual_pa >= dp_max_pa
    is_flashing = p2_pa <= p_vapor_pa
    dp_eff_pa = min(dp_actual_pa, dp_max_pa)

    sg = rho_kg_m3 / 999.0
    dp_eff_psi = float(ureg.Quantity(dp_eff_pa, "pascal").to("psi").magnitude)
    q_norm_gpm = float(ureg.Quantity(flow_m3_s, "m^3/s").to("gpm").magnitude)
    cv_normal = q_norm_gpm * math.sqrt(sg / max(dp_eff_psi, 1e-6))

    citation = "[Perry's 9th Ed., Sec. 8 (ISA-75.01 / IEC 60534), Eqs. 8-77..8-81, p. 8-71]"
    step_ff = render_three_stage_equation(
        "F_{F}",
        "0.96 - 0.28 * sqrt(Pv / Pc)",
        {
            "Pv": (p_vapor_pa, r"\mathrm{Pa}", "P_{v}"),
            "Pc": (p_crit_pa, r"\mathrm{Pa}", "P_{c}"),
        },
        ff,
        "dimensionless",
        citation,
    )
    step_dpmax = render_three_stage_equation(
        r"\Delta P_{\max}",
        "(FL ** 2) * (P1 - FF * Pv)",
        {
            "FL": (fl_factor, "", "F_{L}"),
            "P1": (p1_pa, r"\mathrm{Pa}", "P_{1}"),
            "FF": (ff, "", "F_{F}"),
            "Pv": (p_vapor_pa, r"\mathrm{Pa}", "P_{v}"),
        },
        dp_max_pa,
        r"\mathrm{Pa}",
        citation,
    )
    step_cv = render_three_stage_equation(
        "C_{v}",
        "Q * sqrt(SG / dPeff)",
        {
            "Q": (q_norm_gpm, r"\mathrm{gpm}", "Q"),
            "SG": (sg, "", r"\mathrm{SG}"),
            "dPeff": (dp_eff_psi, r"\mathrm{psi}", r"\Delta P_{\mathrm{eff}}"),
        },
        cv_normal,
        r"\mathrm{gpm/\sqrt{psi}}",
        citation,
    )
    return {
        "f_f": ff,
        "fl_factor": fl_factor,
        "dp_actual_kpa": dp_actual_pa / 1000.0,
        "dp_max_kpa": dp_max_pa / 1000.0,
        "dp_effective_kpa": dp_eff_pa / 1000.0,
        "is_choked": is_choked,
        "is_flashing": is_flashing,
        "cv_cases": {
            "min": 0.70 * cv_normal,
            "normal": cv_normal,
            "rated": 1.20 * cv_normal,
        },
        "citation": citation,
        "equations": [step_ff.model_dump(), step_dpmax.model_dump(), step_cv.model_dump()],
    }


def generate_pump_system_curve(
    q_normal_gpm: float = 250.0,
    static_head_m: float = 5.0,
    frictional_head_normal_m: float = 12.0,
    shutoff_head_m: float = 28.0,
    npsha_normal_m: float = 8.5,
    npshr_normal_m: float = 3.0,
    num_points: int = 15,
) -> list[dict[str, float]]:
    """Return 15 points along the Pump vs. System Curve for plotting."""
    pts: list[dict[str, float]] = []
    for i in range(num_points):
        ratio = (i / (num_points - 1)) * 1.4
        q = q_normal_gpm * ratio
        sys_h = static_head_m + frictional_head_normal_m * (ratio**2)
        pump_h = max(shutoff_head_m - (shutoff_head_m - (static_head_m + frictional_head_normal_m)) * (ratio**2), 0.0)
        npsha = max(npsha_normal_m - 1.8 * (ratio**2 - 1.0), 0.5)
        npshr = npshr_normal_m * (0.7 + 0.3 * (ratio**1.5))
        pts.append({
            "flow_gpm": round(q, 2),
            "system_head_m": round(sys_h, 3),
            "pump_head_m": round(pump_h, 3),
            "npsha_m": round(npsha, 3),
            "npshr_m": round(npshr, 3),
        })
    return pts
