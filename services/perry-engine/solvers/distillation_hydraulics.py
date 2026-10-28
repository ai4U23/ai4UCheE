"""Perry's 9th Ed. Sec 14 Column Hydraulics: Fair's Entrainment Flooding (C_sb, Fig. 14-32, p. 14-37)
and Eckert GPDC Packed-Column Flooding (Fig. 14-55, p. 14-57 & Table 14-13, p. 14-58).
"""
from __future__ import annotations

import math
from typing import Any

from core.handcalcs_katex import render_three_stage_equation
from pdf.crop_engine import compute_axis_crosshair

FIG_14_32_AXIS_CAL = {
    "x_min": 0.01,
    "x_max": 2.0,
    "x_scale": "log10",
    "y_min": 0.01,
    "y_max": 0.4,
    "y_scale": "log10",
}


def _fair_csb(tray_spacing_m: float, f_lv: float) -> float:
    """Fair's correlation for entrainment flooding factor C_sb (m/s) — Fig. 14-32, p. 14-37."""
    # Lygeros-Nikolaou / Fair polynomial fit for sieve/valve trays
    log_flv = math.log10(min(max(f_lv, 0.015), 2.0))
    ht = min(max(tray_spacing_m, 0.20), 0.90)
    a0 = 0.0105 + 0.1496 * (ht**0.755)
    b0 = -0.18 + 0.06 * ht
    c0 = -0.045
    csb = a0 * (10.0 ** (b0 * log_flv + c0 * (log_flv**2)))
    return min(max(csb, 0.015), 0.18)


def solve_souders_brown_flooding(
    vapor_kmol_hr: float = 125.0,
    liquid_kmol_hr: float = 75.0,
    mw_vapor: float = 82.0,
    mw_liquid: float = 82.0,
    rho_vapor_kg_m3: float = 2.85,
    rho_liquid_kg_m3: float = 815.0,
    sigma_dyn_cm: float = 21.0,
    tray_spacing_m: float = 0.610,  # 24 in
    downcomer_fraction: float = 0.12,
    column_diameter_m: float = 1.20,
) -> dict[str, Any]:
    """Evaluate Fair's Souders-Brown tray flooding velocity, diameter, and % Flood."""
    v_kg_s = (vapor_kmol_hr * mw_vapor) / 3600.0
    l_kg_s = (liquid_kmol_hr * mw_liquid) / 3600.0
    q_vapor_m3_s = v_kg_s / max(rho_vapor_kg_m3, 1e-6)

    f_lv = (l_kg_s / max(v_kg_s, 1e-6)) * math.sqrt(rho_vapor_kg_m3 / max(rho_liquid_kg_m3, 1.0))
    csb = _fair_csb(tray_spacing_m, f_lv)
    u_flood_m_s = csb * ((sigma_dyn_cm / 20.0) ** 0.2) * math.sqrt(
        max(rho_liquid_kg_m3 - rho_vapor_kg_m3, 1.0) / max(rho_vapor_kg_m3, 1e-6)
    )

    area_total_m2 = math.pi * (column_diameter_m**2) / 4.0
    area_net_m2 = area_total_m2 * (1.0 - downcomer_fraction)
    u_actual_m_s = q_vapor_m3_s / max(area_net_m2, 1e-6)
    pct_flood = (u_actual_m_s / max(u_flood_m_s, 1e-6)) * 100.0

    # Required diameter at 80% design flood
    a_net_req80 = q_vapor_m3_s / max(0.80 * u_flood_m_s, 1e-6)
    a_tot_req80 = a_net_req80 / max(1.0 - downcomer_fraction, 0.1)
    d_req80_m = math.sqrt((4.0 * a_tot_req80) / math.pi)

    if pct_flood < 50.0:
        hyd_status = "WEEPING_RISK"
    elif pct_flood <= 85.0:
        hyd_status = "NORMAL_WINDOW"
    else:
        hyd_status = "JET_FLOOD_DANGER"

    citation = "[Perry's 9th Ed., Fig. 14-32, p. 14-37]"
    step_flv = render_three_stage_equation(
        "F_{LV}",
        "(Lw / Vw) * sqrt(rhoV / rhoL)",
        {
            "Lw": (l_kg_s, r"\mathrm{kg/s}", "L_{w}"),
            "Vw": (v_kg_s, r"\mathrm{kg/s}", "V_{w}"),
            "rhoV": (rho_vapor_kg_m3, r"\mathrm{kg/m^3}", r"\rho_{V}"),
            "rhoL": (rho_liquid_kg_m3, r"\mathrm{kg/m^3}", r"\rho_{L}"),
        },
        f_lv,
        "dimensionless",
        citation,
    )
    step_uflood = render_three_stage_equation(
        "u_{n,\\mathrm{flood}}",
        "Csb * ((sigma / 20) ** 0.2) * sqrt((rhoL - rhoV) / rhoV)",
        {
            "Csb": (csb, r"\mathrm{m/s}", "C_{sb}"),
            "sigma": (sigma_dyn_cm, r"\mathrm{dyn/cm}", r"\sigma"),
            "rhoL": (rho_liquid_kg_m3, r"\mathrm{kg/m^3}", r"\rho_{L}"),
            "rhoV": (rho_vapor_kg_m3, r"\mathrm{kg/m^3}", r"\rho_{V}"),
        },
        u_flood_m_s,
        r"\mathrm{m/s}",
        citation,
    )

    flv_c = min(max(f_lv, 0.011), 1.95)
    csb_c = min(max(csb, 0.011), 0.39)
    crosshair = compute_axis_crosshair(flv_c, csb_c, FIG_14_32_AXIS_CAL)

    return {
        "f_lv": f_lv,
        "c_sb_m_s": csb,
        "u_flood_m_s": u_flood_m_s,
        "u_actual_m_s": u_actual_m_s,
        "percent_flood": pct_flood,
        "hydraulic_status": hyd_status,
        "column_diameter_m": column_diameter_m,
        "recommended_diameter_80pct_m": d_req80_m,
        "fig_14_32_crosshair": crosshair,
        "citation": citation,
        "equations": [step_flv.model_dump(), step_uflood.model_dump()],
    }


def solve_eckert_gpdc(
    u_superficial_m_s: float = 1.15,
    rho_vapor_kg_m3: float = 2.85,
    rho_liquid_kg_m3: float = 815.0,
    packing_factor_fp_m_inv: float = 92.0,  # 2-in Pall ring (Table 14-13, p. 14-58)
    kinematic_visc_cst: float = 0.45,
) -> dict[str, Any]:
    """Evaluate Eckert GPDC capacity parameter C_P and packed-bed pressure drop (Fig. 14-55, p. 14-57)."""
    cp_factor = (
        u_superficial_m_s
        * math.sqrt(rho_vapor_kg_m3 / max(rho_liquid_kg_m3 - rho_vapor_kg_m3, 1.0))
        * math.sqrt(packing_factor_fp_m_inv / 3.28084)
        * (kinematic_visc_cst**0.05)
    )
    dp_mmh2o_per_m = 42.0 * ((cp_factor / 0.07) ** 1.85)
    citation = "[Perry's 9th Ed., Fig. 14-55, p. 14-57]"
    step_cp = render_three_stage_equation(
        "C_{P}",
        "uV * sqrt(rhoV / (rhoL - rhoV)) * (Fp ** 0.5) * (nu ** 0.05)",
        {
            "uV": (u_superficial_m_s, r"\mathrm{m/s}", "u_{V}"),
            "rhoV": (rho_vapor_kg_m3, r"\mathrm{kg/m^3}", r"\rho_{V}"),
            "rhoL": (rho_liquid_kg_m3, r"\mathrm{kg/m^3}", r"\rho_{L}"),
            "Fp": (packing_factor_fp_m_inv / 3.28084, r"\mathrm{ft^{-1}}", "F_{p}"),
            "nu": (kinematic_visc_cst, r"\mathrm{cSt}", r"\nu"),
        },
        cp_factor,
        "dimensionless",
        citation,
    )
    return {
        "cp_capacity_factor": cp_factor,
        "dp_mmh2o_per_m": dp_mmh2o_per_m,
        "packing_factor_m_inv": packing_factor_fp_m_inv,
        "citation": citation,
        "table_citation": "[Perry's 9th Ed., Table 14-13 (Characteristics of Random Packings), p. 14-58]",
        "step": step_cp.model_dump(),
    }
