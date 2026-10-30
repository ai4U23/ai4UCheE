"""Perry's 9th Ed. Sec 6 & 10 Commercial Pipe Sizing (ASME B36.10M), Darcy/Fanning
Guardrail (f_D = 4*f_F), and 3-Case Operating Matrix (Min 70% / Normal 100% / Rated 120%).

Verified Perry's anchors (Validation Session 1):
- Table 10-22 (p. 10-70): Properties of Steel Pipe (ASME B36.10M dimensions)
- Fig. 6-9    (p. 6-10):  Fanning friction factors (defines Re = D*V*rho/mu)
- Eqs. 6-37..6-39 (p. 6-11): Turbulent friction-factor correlations
"""
from __future__ import annotations

import math
from typing import Any

from fluids.friction import friction_factor
from fluids.piping import nearest_pipe

from core.handcalcs_katex import render_three_stage_equation
from core.unit_registry import ureg
from pdf.crop_engine import compute_axis_crosshair

G_STD = 9.80665  # m/s^2
FIG_6_9_AXIS_CAL = {
    "x_min": 1e3,
    "x_max": 1e7,
    "x_scale": "log10",
    "y_min": 0.001,
    "y_max": 0.02,
    "y_scale": "log10",
}


def solve_single_flow_case(
    flow_m3_s: float,
    d_inner_m: float,
    length_m: float,
    roughness_m: float,
    rho_kg_m3: float,
    mu_pa_s: float,
    k_fittings: float,
    elev_m: float,
) -> dict[str, Any]:
    """Evaluate velocity, Re, Darcy f_D, Fanning f_F = f_D/4, and head/pressure loss."""
    area_m2 = math.pi * (d_inner_m**2) / 4.0
    velocity_m_s = flow_m3_s / area_m2
    reynolds = (rho_kg_m3 * velocity_m_s * d_inner_m) / mu_pa_s
    e_over_d = roughness_m / d_inner_m
    f_darcy = float(friction_factor(Re=max(reynolds, 1.0), eD=e_over_d))
    f_fanning = f_darcy / 4.0

    k_total = f_darcy * (length_m / d_inner_m) + k_fittings
    hf_m = k_total * (velocity_m_s**2) / (2.0 * G_STD)
    dp_friction_pa = rho_kg_m3 * G_STD * hf_m
    dp_static_pa = rho_kg_m3 * G_STD * elev_m
    dp_total_pa = dp_friction_pa + dp_static_pa
    dp_total_kpa = dp_total_pa / 1000.0
    dp_total_psi = float(ureg.Quantity(dp_total_pa, "pascal").to("psi").magnitude)

    if velocity_m_s < 0.9:
        vel_status = "LOW_SETTLING_RISK"
    elif velocity_m_s <= 3.0:
        vel_status = "OPTIMAL_LIQUID_WINDOW"
    else:
        vel_status = "EROSION_HIGH_VELOCITY"

    return {
        "flow_m3_s": flow_m3_s,
        "flow_gpm": float(ureg.Quantity(flow_m3_s, "m^3/s").to("gpm").magnitude),
        "velocity_m_s": velocity_m_s,
        "reynolds": reynolds,
        "e_over_d": e_over_d,
        "f_darcy": f_darcy,
        "f_fanning": f_fanning,
        "hf_m": hf_m,
        "elev_m": elev_m,
        "head_total_m": hf_m + elev_m,
        "dp_friction_kpa": dp_friction_pa / 1000.0,
        "dp_static_kpa": dp_static_pa / 1000.0,
        "dp_total_kpa": dp_total_kpa,
        "dp_total_psi": dp_total_psi,
        "velocity_status": vel_status,
    }


def solve_pipe_hydraulics_3case(
    nps_inch: float = 4.0,
    schedule: str = "40",
    flow_gpm: float = 250.0,
    length_m: float = 100.0,
    roughness_mm: float = 0.045,
    rho_kg_m3: float = 998.2,
    mu_cp: float = 1.0,
    k_fittings: float = 4.5,
    elev_m: float = 5.0,
) -> dict[str, Any]:
    """Solve ASME B36.10M pipe sizing across Min (70%), Normal (100%), and Rated (120%) cases."""
    if flow_gpm <= 0 or length_m <= 0 or rho_kg_m3 <= 0 or mu_cp <= 0:
        raise ValueError("flow_gpm, length_m, rho_kg_m3, and mu_cp must be strictly positive")
    nps, d_inner_m, d_outer_m, wall_t_m = nearest_pipe(NPS=nps_inch, schedule=str(schedule))
    q_normal_m3_s = float(ureg.Quantity(flow_gpm, "gpm").to("m^3/s").magnitude)
    roughness_m = roughness_mm / 1000.0
    mu_pa_s = mu_cp * 1e-3

    case_min = solve_single_flow_case(
        0.70 * q_normal_m3_s, d_inner_m, length_m, roughness_m, rho_kg_m3, mu_pa_s, k_fittings, elev_m
    )
    case_norm = solve_single_flow_case(
        1.00 * q_normal_m3_s, d_inner_m, length_m, roughness_m, rho_kg_m3, mu_pa_s, k_fittings, elev_m
    )
    case_rated = solve_single_flow_case(
        1.20 * q_normal_m3_s, d_inner_m, length_m, roughness_m, rho_kg_m3, mu_pa_s, k_fittings, elev_m
    )

    step_re = render_three_stage_equation(
        "Re",
        "(rho * v * D) / mu",
        {
            "rho": (rho_kg_m3, r"\mathrm{kg/m^3}", r"\rho"),
            "v": (case_norm["velocity_m_s"], r"\mathrm{m/s}", "v"),
            "D": (d_inner_m, r"\mathrm{m}", "D_{i}"),
            "mu": (mu_pa_s, r"\mathrm{Pa \cdot s}", r"\mu"),
        },
        case_norm["reynolds"],
        "dimensionless",
        "[Perry's 9th Ed., Fig. 6-9 caption, p. 6-10]",
    )
    step_fd = render_three_stage_equation(
        "f_{D}",
        "4 * fF",
        {"fF": (case_norm["f_fanning"], "", "f_{F}")},
        case_norm["f_darcy"],
        "dimensionless",
        "[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11]",
    )
    step_hf = render_three_stage_equation(
        "h_{f}",
        "(fD * (L / D) + K) * (v ** 2) / (2 * g)",
        {
            "fD": (case_norm["f_darcy"], "", "f_{D}"),
            "L": (length_m, r"\mathrm{m}", "L"),
            "D": (d_inner_m, r"\mathrm{m}", "D_{i}"),
            "K": (k_fittings, "", r"\sum K"),
            "v": (case_norm["velocity_m_s"], r"\mathrm{m/s}", "v"),
            "g": (G_STD, r"\mathrm{m/s^2}", "g"),
        },
        case_norm["hf_m"],
        r"\mathrm{m}",
        "[Perry's 9th Ed., Eqs. 6-37..6-39, p. 6-11]",
    )

    re_clamped = min(max(case_norm["reynolds"], 1001.0), 9.9e6)
    ff_clamped = min(max(case_norm["f_fanning"], 0.0011), 0.0199)
    crosshair = compute_axis_crosshair(re_clamped, ff_clamped, FIG_6_9_AXIS_CAL)

    return {
        "pipe": {
            "nps_inch": float(nps),
            "schedule": str(schedule),
            "d_inner_m": float(d_inner_m),
            "d_outer_m": float(d_outer_m),
            "wall_thickness_m": float(wall_t_m),
            "citation": "[Perry's 9th Ed., Table 10-22 (Properties of Steel Pipe), p. 10-70]",
        },
        "cases": {
            "min": case_min,
            "normal": case_norm,
            "rated": case_rated,
        },
        "guardrail_note": (
            "Perry's Fig. 6-9 (p. 6-10) plots Fanning f_F; the friction-factor relations are "
            "Eqs. (6-37)..(6-39) on p. 6-11; Darcy f_D = 4 * f_F is used in head loss "
            "h_f = (f_D*L/D + sum(K)) * v^2/(2g)."
        ),
        "fig_6_9_crosshair": crosshair,
        "equations": [step_re.model_dump(), step_fd.model_dump(), step_hf.model_dump()],
    }
