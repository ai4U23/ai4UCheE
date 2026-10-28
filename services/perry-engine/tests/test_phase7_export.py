"""Phase 7 tests: Senior-Engineer Calculation Sheet Exporter (EPC HTML + Markdown/LaTeX)."""
from __future__ import annotations

from fastapi.testclient import TestClient

from main import app
from solvers.calc_sheet_exporter import CalcSheetMetadata, build_senior_calc_sheet
from solvers.hydraulics_pipe import solve_pipe_hydraulics_3case

client = TestClient(app)


def test_build_senior_calc_sheet_html_and_markdown() -> None:
    pipe = solve_pipe_hydraulics_3case()
    meta = CalcSheetMetadata(
        project_name="Ammonia Synthesis Loop — Rev 0",
        project_no="PRJ-2026-07",
        equipment_tag="P-101A/B",
        service_description="Boiler Feedwater Transfer Pump",
        calc_no="CALC-HYD-101",
        revision="Rev 0 — Issued for Review",
        prepared_by="N. A. Duc",
        checked_by="Kongming QA/QC",
    )
    sheet = build_senior_calc_sheet(
        metadata=meta,
        workbench_type="hydraulics",
        inputs_summary={"Flow Q": "250 gpm", "Pipe": "4-in Sch 40"},
        equations=pipe["equations"],
        cases_table={
            "Min 70%": {"dp_kpa": round(pipe["cases"]["min"]["dp_total_kpa"], 2)},
            "Normal 100%": {"dp_kpa": round(pipe["cases"]["normal"]["dp_total_kpa"], 2)},
            "Rated 120%": {"dp_kpa": round(pipe["cases"]["rated"]["dp_total_kpa"], 2)},
        },
    )
    html_doc = sheet["html_document"]
    md_doc = sheet["markdown_latex"]
    assert "@media print" in html_doc
    assert "P-101A/B" in html_doc
    assert "Rev 0 — Issued for Review" in html_doc
    assert "Stage 1 (Symbolic):" in html_doc
    assert "Stage 2 (Substituted w/ Units):" in html_doc
    assert "Stage 3 (Result):" in html_doc
    assert "Perry&#x27;s 9th Ed." in html_doc or "Perry's 9th Ed." in html_doc
    assert "\\begin{aligned}" in md_doc


def test_export_router_endpoint() -> None:
    res = client.post(
        "/api/v1/export/calc-sheet",
        json={
            "metadata": {"equipment_tag": "T-201", "calc_no": "CALC-DIST-201"},
            "workbench_type": "distillation",
            "inputs_summary": {"Feed": "100 kmol/h", "alpha": 2.45},
            "equations": [
                {
                    "lhs_symbol": "D",
                    "symbolic_latex": "D = F*(zF-xB)/(xD-xB)",
                    "substituted_latex": "= 50",
                    "result_latex": "= 50 kmol/h",
                    "citation": "[Perry's 9th Ed., Eq. 13-35, p. 13-25]",
                }
            ],
        },
    )
    assert res.status_code == 200
    body = res.json()
    assert "T-201" in body["html_document"]
    assert "@media print" in body["html_document"]
