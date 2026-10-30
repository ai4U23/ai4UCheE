"""FastAPI Distillation Router: McCabe-Thiele + Fair's Tray Flooding + Eckert GPDC."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from solvers.distillation_hydraulics import solve_eckert_gpdc, solve_souders_brown_flooding
from solvers.distillation_mccabe import solve_mccabe_thiele

router = APIRouter(prefix="/api/v1/distillation", tags=["distillation"])


class DistillationEvaluateRequest(BaseModel):
    xf: float = Field(default=0.50, ge=0.01, le=0.99)
    xd: float = Field(default=0.95, ge=0.50, le=0.999)
    xb: float = Field(default=0.05, ge=0.001, le=0.49)
    q: float = Field(default=1.0, ge=-0.5, le=1.5)
    r_mult: float = Field(default=1.3, ge=1.05, le=5.0)
    alpha: float = Field(default=2.45, ge=1.1, le=10.0)
    feed_kmol_hr: float = Field(default=100.0, gt=0)
    mw_vapor: float = Field(default=82.0, gt=0)
    mw_liquid: float = Field(default=82.0, gt=0)
    rho_vapor_kg_m3: float = Field(default=2.85, gt=0)
    rho_liquid_kg_m3: float = Field(default=815.0, gt=0)
    sigma_dyn_cm: float = Field(default=21.0, gt=0)
    tray_spacing_m: float = Field(default=0.610, gt=0)
    downcomer_fraction: float = Field(default=0.12, gt=0, lt=0.5)
    column_diameter_m: float = Field(default=1.20, gt=0)
    packing_factor_fp_m_inv: float = Field(default=92.0, gt=0)
    kinematic_visc_cst: float = Field(default=0.45, gt=0)


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
