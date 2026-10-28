"""FastAPI Thermo Router: DIPPR property evaluation + Carlson Property Package Advisor."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from pdf.crop_engine import render_table_row_composite_crop
from solvers.carlson_tree import advise_carlson_method
from solvers.dippr_coeffs import DIPPR_COMPOUNDS, get_compound_dippr
from solvers.thermo_dippr import evaluate_all_dippr_properties

router = APIRouter(prefix="/api/v1/thermo", tags=["thermo"])


class DipprRequest(BaseModel):
    compound: str = "water"
    temperature: float = 373.15
    temperature_unit: str = "K"
    include_pdf_crop: bool = False
    dpi: int = 150


class CarlsonRequest(BaseModel):
    is_pure_water: bool = False
    has_electrolytes: bool = False
    polarity: str = "nonpolar"
    pressure_bar: float = 1.0
    has_vapor_association: bool = False
    has_liquid_liquid_split: bool = False
    missing_bip: bool = False


@router.get("/compounds")
def list_dippr_compounds() -> dict:
    return {
        "compounds": [
            {"key": k, "name": v["name"], "formula": v["formula"], "cas": v["cas"]}
            for k, v in DIPPR_COMPOUNDS.items()
        ]
    }


@router.post("/dippr")
def thermo_dippr(req: DipprRequest) -> dict:
    try:
        res = evaluate_all_dippr_properties(req.compound, req.temperature, req.temperature_unit)
        if req.include_pdf_crop:
            entry = get_compound_dippr(req.compound)
            try:
                res["pdf_proof_crop"] = render_table_row_composite_crop(
                    res["sec_pages"]["vp"], entry["search_term"], dpi=req.dpi
                )
            except ValueError:
                res["pdf_proof_crop"] = None
        return res
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/carlson-advisor")
def thermo_carlson_advisor(req: CarlsonRequest) -> dict:
    return advise_carlson_method(
        is_pure_water=req.is_pure_water,
        has_electrolytes=req.has_electrolytes,
        polarity=req.polarity,
        pressure_bar=req.pressure_bar,
        has_vapor_association=req.has_vapor_association,
        has_liquid_liquid_split=req.has_liquid_liquid_split,
        missing_bip=req.missing_bip,
    )
