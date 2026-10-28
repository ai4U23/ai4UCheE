"""FastAPI Distillation Router: McCabe-Thiele + Fair's Tray Flooding + Eckert GPDC."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from solvers.distillation_hydraulics import solve_eckert_gpdc, solve_souders_brown_flooding
from solvers.distillation_mccabe import solve_mccabe_thiele

router = APIRouter(prefix="/api/v1/distillation", tags=["distillation"])


class DistillationEvaluateRequest(BaseModel):
    xf: float = 0.50
    xd: float = 0.95
    xb: float = 0.05
    q: float = 1.0
    r_mult: float = 1.3
    alpha: float = 2.45
    feed_kmol_hr: float = 100.0
    mw_vapor: float = 82.0
    mw_liquid: float = 82.0
    rho_vapor_kg_m3: float = 2.85
    rho_liquid_kg_m3: float = 815.0
    sigma_dyn_cm: float = 21.0
    tray_spacing_m: float = 0.610
    downcomer_fraction: float = 0.12
    column_diameter_m: float = 1.20
    packing_factor_fp_m_inv: float = 92.0
    kinematic_visc_cst: float = 0.45


@router.post("/evaluate")
def distillation_evaluate(req: DistillationEvaluateRequest) -> dict:
    try:
        mt = solve_mccabe_thiele(
            xf=req.xf,
            xd=req.xd,
            xb=req.xb,
            q=req.q,
            r_mult=req.r_mult,
            alpha=req.alpha,
            feed_kmol_hr=req.feed_kmol_hr,
        )
        v_rect = mt["internal_flows_kmol_hr"]["V_rect"]
        l_rect = mt["internal_flows_kmol_hr"]["L_rect"]
        tray = solve_souders_brown_flooding(
            vapor_kmol_hr=v_rect,
            liquid_kmol_hr=l_rect,
            mw_vapor=req.mw_vapor,
            mw_liquid=req.mw_liquid,
            rho_vapor_kg_m3=req.rho_vapor_kg_m3,
            rho_liquid_kg_m3=req.rho_liquid_kg_m3,
            sigma_dyn_cm=req.sigma_dyn_cm,
            tray_spacing_m=req.tray_spacing_m,
            downcomer_fraction=req.downcomer_fraction,
            column_diameter_m=req.column_diameter_m,
        )
        packing = solve_eckert_gpdc(
            u_superficial_m_s=tray["u_actual_m_s"] * (1.0 - req.downcomer_fraction),
            rho_vapor_kg_m3=req.rho_vapor_kg_m3,
            rho_liquid_kg_m3=req.rho_liquid_kg_m3,
            packing_factor_fp_m_inv=req.packing_factor_fp_m_inv,
            kinematic_visc_cst=req.kinematic_visc_cst,
        )
        return {
            "mccabe_thiele": mt,
            "tray_flooding": tray,
            "packing_gpdc": packing,
            "equations": mt["equations"] + tray["equations"] + [packing["step"]],
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
