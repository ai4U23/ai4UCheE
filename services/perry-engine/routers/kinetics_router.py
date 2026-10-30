"""FastAPI router for Subject 5 (WB6): Kinetics & Reactor Design + Multi-Book Textbook Corpus."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from pdf.textbook_corpus import list_textbooks, search_fogler_epub, search_pdf_textbook_toc
from solvers.kinetics_reactors import solve_kinetics_reactor

router = APIRouter(prefix="/api/v1", tags=["kinetics-and-textbooks"])


class KineticsSolveRequest(BaseModel):
    conversion_x: float = Field(default=0.80, ge=0.01, le=0.98)
    temp_k: float = Field(default=450.0, gt=200.0, le=1500.0)
    p_inlet_psig: float = Field(default=45.0, ge=-14.0, le=2000.0)
    epsilon_a: float = Field(default=0.25, ge=-0.8, le=3.0)
    alpha_ergun: float = Field(default=0.015, ge=0.0, le=0.045)
    thiele_phi: float = Field(default=1.4, ge=0.05, le=25.0)
    semenov_psi: float = Field(default=0.28, ge=0.01, le=1.5)
    patm_psia: float = Field(default=14.6959, gt=0.0)


@router.post("/kinetics/solve")
def kinetics_solve(req: KineticsSolveRequest) -> dict:
    try:
        return solve_kinetics_reactor(
            conversion_x=req.conversion_x,
            temp_k=req.temp_k,
            p_inlet_psig=req.p_inlet_psig,
            epsilon_a=req.epsilon_a,
            alpha_ergun=req.alpha_ergun,
            thiele_phi=req.thiele_phi,
            semenov_psi=req.semenov_psi,
            patm_psia=req.patm_psia,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/textbooks/catalog")
def textbooks_catalog() -> dict:
    books = list_textbooks()
    return {
        "count": len(books),
        "textbooks": books,
    }


@router.get("/textbooks/search")
def textbooks_search(
    q: str = Query(default="levenspiel"),
    book_id: str | None = Query(default=None),
    max_results: int = Query(default=10, ge=1, le=30),
) -> dict:
    results = []
    if book_id in (None, "all", "fogler-7e"):
        results.extend(search_fogler_epub(q, max_results=max_results))
    for pdf_id in ("perry-9e", "bsl-2e", "svna-9e", "seader-4e", "crowl-4e"):
        if book_id in (None, "all", pdf_id):
            results.extend(search_pdf_textbook_toc(pdf_id, q, max_results=max_results))
    return {
        "query": q,
        "book_id": book_id or "all",
        "results": results[:max_results],
    }
