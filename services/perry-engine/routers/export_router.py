"""FastAPI Export Router: Senior-Engineer QA/QC Calculation Sheet (HTML + Markdown/LaTeX)."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field

from solvers.calc_sheet_exporter import CalcSheetMetadata, build_senior_calc_sheet

router = APIRouter(prefix="/api/v1/export", tags=["export"])


class CalcSheetExportRequest(BaseModel):
    metadata: CalcSheetMetadata = Field(default_factory=CalcSheetMetadata)
    workbench_type: str = "hydraulics"
    inputs_summary: dict[str, Any] = Field(
        default_factory=lambda: {"Flow Q": "250 gpm", "Pipe": "4-in Sch 40", "Suction P": "2.0 psig (16.70 psia)"}
    )
    equations: list[dict[str, Any]] = Field(default_factory=list)
    cases_table: dict[str, Any] | None = None
    proof_crops: list[dict[str, Any]] = Field(default_factory=list)


@router.post("/calc-sheet")
def export_calc_sheet(req: CalcSheetExportRequest) -> dict[str, Any]:
    return build_senior_calc_sheet(
        metadata=req.metadata,
        workbench_type=req.workbench_type,
        inputs_summary=req.inputs_summary,
        equations=req.equations,
        cases_table=req.cases_table,
        proof_crops=req.proof_crops,
    )
