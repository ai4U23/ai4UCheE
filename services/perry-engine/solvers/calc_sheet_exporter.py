"""Senior-Engineer QA/QC Calculation Sheet Compiler (EPC Print-to-PDF HTML + Markdown/LaTeX).

Produces both:
1. ``html_document``: Standalone EPC Calculation Pad HTML with ``@media print`` A4/Letter
   rules, QA/QC Document Control Header (Project, Equipment Tag, Service, Calc No., Rev,
   Prepared By, Checked By, Date, Design Basis), 3-stage white-box equations, 3-Case
   (Min 70% / Normal 100% / Rated 120%) operating summary table, and embedded Perry's
   9th Ed. proof crops.
2. ``markdown_latex``: Archival Markdown + ``$$\\begin{aligned}...\\end{aligned}$$`` LaTeX.
"""
from __future__ import annotations

import html
from datetime import date
from typing import Any

from pydantic import BaseModel, Field


class CalcSheetMetadata(BaseModel):
    project_name: str = "Perry's Intelligent Workbench — Process Design Package"
    project_no: str = "AI4U-CHE-2026"
    equipment_tag: str = Field(default="P-101A/B", examples=["P-101A/B", "T-201"])
    service_description: str = "Process Fluid Transfer / Separation Unit"
    calc_no: str = "CALC-CHE-001"
    revision: str = "Rev 0 — Issued for Review"
    prepared_by: str = "Process Engineer (Plant Mode)"
    checked_by: str = "Lead ChE / QA-QC"
    date_iso: str = Field(default_factory=lambda: date.today().isoformat())
    design_basis_notes: str = (
        "Grounded in Perry's Chemical Engineers' Handbook, 9th Edition. "
        "Explicit psig/psia datum and Darcy f_D = 4*f_F enforced."
    )


def _esc(val: Any) -> str:
    return html.escape(str(val))


def _render_cases_html(cases_table: dict[str, Any] | None) -> str:
    if not cases_table:
        return ""
    rows = []
    for case_name, metrics in cases_table.items():
        if isinstance(metrics, dict):
            cells = ", ".join(f"{_esc(k)}: {_esc(v)}" for k, v in metrics.items())
        else:
            cells = _esc(metrics)
        rows.append(f"<tr><td><strong>{_esc(case_name)}</strong></td><td>{cells}</td></tr>")
    return (
        "<section class='calc-section'>"
        "<h3>3-Case Operating Matrix (Min 70% / Normal 100% / Rated 120%)</h3>"
        "<table class='calc-table'><thead><tr><th>Case</th><th>Operating Parameters</th></tr></thead>"
        f"<tbody>{''.join(rows)}</tbody></table></section>"
    )


def build_senior_calc_sheet(
    metadata: CalcSheetMetadata,
    workbench_type: str,
    inputs_summary: dict[str, Any],
    equations: list[dict[str, Any]],
    cases_table: dict[str, Any] | None = None,
    proof_crops: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Compile a Senior-Engineer QA/QC Calculation Sheet into HTML and Markdown/LaTeX."""
    proof_crops = proof_crops or []
    inputs_rows = "".join(
        f"<tr><td>{_esc(k)}</td><td><code>{_esc(v)}</code></td></tr>"
        for k, v in inputs_summary.items()
    )
    eq_blocks_html: list[str] = []
    eq_blocks_md: list[str] = []
    for idx, eq in enumerate(equations, start=1):
        lhs = eq.get("lhs_symbol", f"Eq_{idx}")
        sym = eq.get("symbolic_latex", "")
        sub = eq.get("substituted_latex", "")
        res = eq.get("result_latex", "")
        cit = eq.get("citation", "[Perry's 9th Ed., p. 1-1]")
        aligned = eq.get("full_aligned_katex") or f"\\begin{{aligned}}{sym} \\\\ {sub} \\\\ {res}\\end{{aligned}}"
        eq_blocks_html.append(
            "<div class='eq-box'>"
            f"<div class='eq-stage'><strong>Stage 1 (Symbolic):</strong> <code>{_esc(sym)}</code></div>"
            f"<div class='eq-stage'><strong>Stage 2 (Substituted w/ Units):</strong> <code>{_esc(sub)}</code></div>"
            f"<div class='eq-stage'><strong>Stage 3 (Result):</strong> <strong><code>{_esc(lhs)} {_esc(res)}</code></strong> "
            f"<span class='citation'>{_esc(cit)}</span></div></div>"
        )
        eq_blocks_md.append(f"### Step {idx}: `{lhs}` — {cit}\n\n$$\n{aligned}\n$$\n")

    crops_html = "".join(
        "<figure class='crop-fig'>"
        f"<figcaption>Perry's 9th Ed. Visual Proof — p. {_esc(c.get('sec_page', ''))}</figcaption>"
        f"<img src='{_esc(c.get('image_base64', ''))}' alt='Perry proof crop' />"
        "</figure>"
        for c in proof_crops
        if c.get("image_base64")
    )

    html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>{_esc(metadata.calc_no)} — {_esc(metadata.equipment_tag)} Calculation Sheet</title>
<style>
  body {{ font-family: 'Inter', Arial, sans-serif; color: #141413; background: #FAF8F5; margin: 24px; }}
  .sheet {{ border: 2px solid #141413; padding: 18px; background: #FFFFFF; max-width: 960px; margin: 0 auto; }}
  .qa-header, .calc-table {{ width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 13px; }}
  .qa-header th, .qa-header td, .calc-table th, .calc-table td {{ border: 1px solid #141413; padding: 6px 8px; text-align: left; }}
  .eq-box {{ border: 1px solid #DCD6CC; background: #FAF8F5; padding: 10px; margin-bottom: 10px; font-family: monospace; }}
  .citation {{ color: #B8332A; font-weight: 600; }}
  @media print {{
    body {{ background: #FFFFFF; margin: 0; }}
    .sheet {{ border: 2px solid #000000; page-break-after: always; }}
    .no-print {{ display: none !important; }}
  }}
</style>
</head>
<body>
<div class="sheet">
  <h2>SENIOR-ENGINEER QA/QC CALCULATION SHEET ({_esc(workbench_type.upper())})</h2>
  <table class="qa-header">
    <tr><th>Project</th><td>{_esc(metadata.project_name)}</td><th>Project No.</th><td>{_esc(metadata.project_no)}</td></tr>
    <tr><th>Equipment Tag</th><td><strong>{_esc(metadata.equipment_tag)}</strong></td><th>Calc No. / Rev</th><td>{_esc(metadata.calc_no)} ({_esc(metadata.revision)})</td></tr>
    <tr><th>Service</th><td>{_esc(metadata.service_description)}</td><th>Date</th><td>{_esc(metadata.date_iso)}</td></tr>
    <tr><th>Prepared By</th><td>{_esc(metadata.prepared_by)}</td><th>Checked By</th><td>{_esc(metadata.checked_by)}</td></tr>
  </table>
  <p><strong>Design Basis:</strong> {_esc(metadata.design_basis_notes)}</p>
  <section class="calc-section">
    <h3>Design Inputs</h3>
    <table class="calc-table"><thead><tr><th>Parameter</th><th>Value</th></tr></thead><tbody>{inputs_rows}</tbody></table>
  </section>
  {_render_cases_html(cases_table)}
  <section class="calc-section">
    <h3>3-Stage White-Box Equations &amp; Perry's 9th Ed. Citations</h3>
    {''.join(eq_blocks_html)}
  </section>
  {crops_html}
</div>
</body>
</html>"""

    inputs_md = "\n".join(f"- **{k}**: `{v}`" for k, v in inputs_summary.items())
    md_doc = (
        f"# Senior-Engineer QA/QC Calculation Note — {metadata.equipment_tag}\n\n"
        f"- **Project**: {metadata.project_name} (`{metadata.project_no}`)\n"
        f"- **Calc No. / Revision**: `{metadata.calc_no}` — {metadata.revision}\n"
        f"- **Prepared By / Checked By**: {metadata.prepared_by} / {metadata.checked_by}\n"
        f"- **Date**: {metadata.date_iso}\n"
        f"- **Design Basis**: {metadata.design_basis_notes}\n\n"
        f"## Design Inputs\n\n{inputs_md}\n\n"
        f"## 3-Stage White-Box Equations\n\n{''.join(eq_blocks_md)}"
    )

    return {
        "metadata": metadata.model_dump(),
        "workbench_type": workbench_type,
        "html_document": html_doc,
        "markdown_latex": md_doc,
        "equation_count": len(equations),
    }
