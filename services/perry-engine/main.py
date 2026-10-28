"""PerryEngine FastAPI sidecar (127.0.0.1:8001) — deterministic ChE & PDF engine."""
from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from core.handcalcs_katex import render_three_stage_equation
from core.unit_registry import convert_field_unit, normalize_pressure_to_pa
from routers.pdf_router import router as pdf_router

PDF_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "Perry's Chemical Engineers' Handbook, 9th Edition.pdf",
)

app = FastAPI(title="PerryEngine Sidecar", version="1.0.0")
app.include_router(pdf_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UnitConvertRequest(BaseModel):
    value: float
    from_unit: str
    to_unit: str
    patm_psia: float = 14.6959


class EquationRenderRequest(BaseModel):
    lhs_symbol: str = Field(examples=["Re"])
    expr: str = Field(examples=["(rho * v * D) / mu"])
    env: dict[str, list] = Field(
        description="var -> [numeric_value, unit_latex, symbol_latex]", examples=[
            [{"rho": [998.2, r"\mathrm{kg/m^3}", r"\rho"], "v": [2.0, r"\mathrm{m/s}", "v"]}]
        ]
    )
    result_value: float
    result_unit: str = "dimensionless"
    citation: str = "[Perry's 9th Ed., Fig. 6-9 caption, p. 6-10]"


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "pdf_exists": os.path.exists(PDF_PATH),
        "pdf_pages": 2274,
        "engine": "perry-engine-v1",
    }


@app.post("/api/v1/units/convert")
def units_convert(req: UnitConvertRequest) -> dict:
    """Field-unit conversion with explicit psig/psia datum enforcement."""
    try:
        return convert_field_unit(req.value, req.from_unit, req.to_unit, req.patm_psia)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/v1/units/normalize-pressure")
def units_normalize_pressure(
    value: float, unit: str, patm_psia: float = 14.6959
) -> dict:
    try:
        return normalize_pressure_to_pa(value, unit, patm_psia)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.post("/api/v1/equations/render")
def equations_render(req: EquationRenderRequest) -> dict:
    """3-stage white-box KaTeX render with mandatory Perry's citation."""
    env = {}
    for var, triple in req.env.items():
        try:
            env[var] = (float(triple[0]), str(triple[1]), str(triple[2]))
        except (TypeError, ValueError, IndexError) as exc:
            raise HTTPException(
                status_code=400, detail=f"env[{var!r}] must be [value, unit_latex, symbol_latex]"
            ) from exc
    try:
        step = render_three_stage_equation(
            req.lhs_symbol, req.expr, env, req.result_value, req.result_unit, req.citation
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return step.model_dump()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8001)
