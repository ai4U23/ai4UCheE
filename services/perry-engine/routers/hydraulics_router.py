"""FastAPI Hydraulics Router: 3-Case Pipe Sizing, Pump NPSH_A, and ISA Control Valve C_v."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.unit_registry import normalize_pressure_to_pa
from solvers.hydraulics_pipe import solve_pipe_hydraulics_3case
from solvers.hydraulics_pump_valve import (
    evaluate_control_valve_cv,
    evaluate_pump_npsha,
    generate_pump_system_curve,
)

router = APIRouter(prefix="/api/v1/hydraulics", tags=["hydraulics"])


class HydraulicsEvaluateRequest(BaseModel):
    nps_inch: float = Field(default=4.0, gt=0)
    schedule: str = "40"
    flow_gpm: float = Field(default=250.0, gt=0, le=100000.0)
    length_m: float = Field(default=100.0, gt=0)
    roughness_mm: float = Field(default=0.045, ge=0)
    rho_kg_m3: float = Field(default=998.2, gt=0)
    mu_cp: float = Field(default=1.0, gt=0)
    k_fittings: float = Field(default=4.5, ge=0)
    elev_m: float = 5.0
    p_suction_val: float = 2.0
    p_suction_unit: str = "psig"
    patm_psia: float = Field(default=14.6959, gt=0)
    z_suction_m: float = 2.0
    hf_suction_m: float = Field(default=0.8, ge=0)
    p_vapor_pa: float = Field(default=3169.0, ge=0)
    p_crit_pa: float = Field(default=22064000.0, gt=0)
    npshr_m: float = Field(default=3.0, gt=0)
    valve_p1_val: float = 65.0
    valve_p1_unit: str = "psig"
    valve_p2_val: float = 35.0
    valve_p2_unit: str = "psig"
    fl_factor: float = Field(default=0.9, ge=0.3, le=1.0)


@router.post("/evaluate")
def hydraulics_evaluate(req: HydraulicsEvaluateRequest) -> dict:
    try:
        pipe_res = solve_pipe_hydraulics_3case(
            nps_inch=req.nps_inch,
            schedule=req.schedule,
            flow_gpm=req.flow_gpm,
            length_m=req.length_m,
            roughness_mm=req.roughness_mm,
            rho_kg_m3=req.rho_kg_m3,
            mu_cp=req.mu_cp,
            k_fittings=req.k_fittings,
            elev_m=req.elev_m,
        )
        pump_res = evaluate_pump_npsha(
            p_suction_val=req.p_suction_val,
            p_suction_unit=req.p_suction_unit,
            patm_psia=req.patm_psia,
            z_suction_m=req.z_suction_m,
            hf_suction_m=req.hf_suction_m,
            p_vapor_pa=req.p_vapor_pa,
            rho_kg_m3=req.rho_kg_m3,
            npshr_m=req.npshr_m,
        )
        p1_pa = normalize_pressure_to_pa(req.valve_p1_val, req.valve_p1_unit, req.patm_psia)["value_pa"]
        p2_pa = normalize_pressure_to_pa(req.valve_p2_val, req.valve_p2_unit, req.patm_psia)["value_pa"]
        flow_m3_s = pipe_res["cases"]["normal"]["flow_m3_s"]
        valve_res = evaluate_control_valve_cv(
            flow_m3_s=flow_m3_s,
            p1_pa=p1_pa,
            p2_pa=p2_pa,
            p_vapor_pa=req.p_vapor_pa,
            p_crit_pa=req.p_crit_pa,
            rho_kg_m3=req.rho_kg_m3,
            fl_factor=req.fl_factor,
        )
        curve = generate_pump_system_curve(
            q_normal_gpm=req.flow_gpm,
            static_head_m=req.elev_m,
            frictional_head_normal_m=pipe_res["cases"]["normal"]["hf_m"],
            npsha_normal_m=pump_res["npsha_m"],
            npshr_normal_m=req.npshr_m,
        )
        return {
            "pipe_3case": pipe_res,
            "pump_npsha": pump_res,
            "control_valve": valve_res,
            "pump_system_curve": curve,
            "equations": pipe_res["equations"] + [pump_res["step"]] + valve_res["equations"],
        }
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
