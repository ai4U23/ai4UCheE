"""Multi-book textbook corpus engine: Perry's 9th Ed. (PDF), Fogler 7th Ed. (EPUB),
Bird-Stewart-Lightfoot 2nd Ed. (PDF), Smith-Van Ness-Abbott 9th Ed. (PDF),
Seader-Henley-Roper 4th Ed. (PDF), and Crowl & Louvar 4th Ed. (PDF).
Serves built-in indexed chapters/TOC snippets when raw binary books are absent on VPS.
"""
from __future__ import annotations

import os
import re
import zipfile
from typing import Any

import pymupdf as fitz

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

TEXTBOOK_CATALOG: list[dict[str, Any]] = [
    {"book_id": "perry-9e", "short_title": "Perry's 9th Ed.", "full_title": "Perry's Chemical Engineers' Handbook, 9th Edition (2019)", "authors": "D. W. Green & M. Z. Southard", "format": "pdf", "filename": "Perry's Chemical Engineers' Handbook, 9th Edition.pdf", "nominal_size_mb": 215.4, "subjects": ["thermo", "transport", "separations", "kinetics", "safety", "atlas"], "citation_template": "[Perry's 9th Ed., Sec. {sec}, p. {page}]"},
    {"book_id": "fogler-7e", "short_title": "Fogler 7th Ed.", "full_title": "Elements of Chemical Reaction Engineering, 7th Edition (2025)", "authors": "H. S. Fogler, B. R. Goldsmith & E. Nikolla", "format": "epub", "filename": "Elements of Chemical Reaction Engineering, 7th Edition -- H_ Scott Fogler & Bryan R_ Goldsmith & Eranda Nikolla & -- 2025 -- Pearson.epub", "nominal_size_mb": 43.8, "subjects": ["kinetics", "transport", "safety"], "citation_template": "[Fogler 7th Ed., Ch. {sec}, {page}]"},
    {"book_id": "bsl-2e", "short_title": "BSL Transport 2nd Ed.", "full_title": "Transport Phenomena, Revised 2nd Edition (2006)", "authors": "R. B. Bird, W. E. Stewart & E. N. Lightfoot", "format": "pdf", "filename": "Transport Phenomena, Revised 2nd Edition -- Robert Byron Bird; Warren E Stewart; Edwin N Lightfoot -- 2nd, 2006.pdf", "nominal_size_mb": 7.9, "subjects": ["transport", "kinetics"], "citation_template": "[BSL Transport Phenomena 2nd Ed., Ch. {sec}, p. {page}]"},
    {"book_id": "svna-9e", "short_title": "Smith-Van Ness-Abbott 9th Ed.", "full_title": "Introduction to Chemical Engineering Thermodynamics, 9th Edition (2021)", "authors": "J. M. Smith, H. C. Van Ness, M. M. Abbott & M. T. Swihart", "format": "pdf", "filename": "Introduction to Chemical Engineering Thermodynamics 9th -- Hendrick Van Ness, Michael  Abbott, Joseph Mauk Smith, Mark -- 9th Edition, PT, 2021.pdf", "nominal_size_mb": 76.2, "subjects": ["thermo", "separations"], "citation_template": "[Smith, Van Ness & Abbott 9th Ed., Ch. {sec}, p. {page}]"},
    {"book_id": "seader-4e", "short_title": "Seader 4th Ed.", "full_title": "Separation Process Principles, 4th Edition (2016)", "authors": "J. D. Seader, E. J. Henley & D. K. Roper", "format": "pdf", "filename": "Separation Process Principles with Applications Using -- J_ D_ Seader, Ernest J_ Henley, D_ Keith Roper -- 4, 2015-12-23.pdf", "nominal_size_mb": 7.2, "subjects": ["separations", "thermo"], "citation_template": "[Seader, Henley & Roper 4th Ed., Ch. {sec}, p. {page}]"},
    {"book_id": "crowl-4e", "short_title": "Crowl & Louvar 4th Ed.", "full_title": "Chemical Process Safety: Fundamentals with Applications, 4th Edition (2019)", "authors": "D. A. Crowl & J. F. Louvar", "format": "pdf", "filename": "Chemical Process Safety- Fundamentals with Applications, 4th -- Daniel A_ Crowl & Joseph F_ Louvar -- 2019.pdf", "nominal_size_mb": 23.4, "subjects": ["safety", "kinetics", "transport"], "citation_template": "[Crowl & Louvar 4th Ed., Ch. {sec}, p. {page}]"},
]

FOGLER_SECTIONS: dict[str, str] = {
    "ch01": "Ch. 1: Mole Balances (GMBE, Batch, CSTR, PFR, PBR)",
    "ch02": "Ch. 2: Conversion and Reactor Sizing (Levenspiel Plots & Series Reactors)",
    "ch03": "Ch. 3: Rate Laws (Arrhenius Temperature Dependence & Power Law)",
    "ch04": "Ch. 4: Stoichiometry (Gas-Phase Volume Expansion epsilon_A & P/P0)",
    "ch05": "Ch. 5: Isothermal Reactor Design: Conversion (Ergun Pressure Drop in PBR)",
    "ch06": "Ch. 6: Isothermal Reactor Design: Molar Flow Rates & Membrane Reactors",
    "ch07": "Ch. 7: Collection and Analysis of Rate Data",
    "ch08": "Ch. 8: Multiple Reactions (Series/Parallel Selectivity S_D/U)",
    "ch09": "Ch. 9: Bioreactions and Bioreactors (Monod & Michaelis-Menten)",
    "ch10": "Ch. 10: Catalysis and Catalytic Reactors (Langmuir-Hinshelwood & Deactivation)",
    "ch11": "Ch. 11: Nonisothermal Reactor Design: Adiabatic Equilibrium & Energy Balance",
    "ch12": "Ch. 12: Steady-State Nonisothermal Flow Reactors with Heat Exchange (Semenov)",
    "ch13": "Ch. 13: Unsteady-State Nonisothermal Reactor Design (Thermal Runaway)",
    "ch14": "Ch. 14: External Mass Transfer Limitations in Reacting Systems",
    "ch15": "Ch. 15: Internal Diffusion and Reaction (Thiele Modulus phi & Effectiveness eta)",
    "ch16": "Ch. 16: Residence Time Distributions (RTD Pulse/Step E(t) & Mean t_m)",
    "ch17": "Ch. 17: Predicting Conversion Directly from RTD (Segregation & Max Mixedness)",
    "ch18": "Ch. 18: Models for Nonideal Reactors (Tanks-in-Series & Dispersion Pe)",
    "ch19": "Ch. 19: Electrochemical Reactor Design (Butler-Volmer Overpotential)",
    "appa": "App. A: Numerical Techniques (Simpson's Rule & Useful Integrals)",
    "appb": "App. B: Ideal Gas Constant and Conversion Factors (psig/psia)",
    "appc": "App. C: Thermodynamic Relationships Involving the Equilibrium Constant",
    "appd": "App. D: Software Packages (Polymath, Python, Wolfram, MATLAB)",
    "appe": "App. E: Rate Law Data",
    "appf": "App. F: Nomenclature",
    "appg": "App. G: Open-Ended Problems",
    "apph": "App. H: Use of Computational Chemistry Software Packages (DFT)",
    "appi": "App. I: How to Use the CRE Web Resources",
    "appj": "App. J: General Derivations (CSTR LMTD & Differential Balances)",
    "index": "Index: Fogler 7th Ed. Subject & Equation Index",
}

PDF_TOC_INDEX: dict[str, list[tuple[int, str, int]]] = {
    "perry-9e": [
        (1, "Section 2 Physical and Chemical Data (DIPPR Eq. 101/106)", 95),
        (1, "Section 6 Fluid and Particle Dynamics (Fanning f_F vs Darcy f_D = 4f_F)", 429),
        (1, "Section 13 & 14 Distillation & Equipment for Distillation (McCabe-Thiele & Fair)", 1013),
        (1, "Section 19 Reactors (CSTR, PFR, Levenspiel, Thiele & Semenov Runaway)", 1759),
        (1, "Section 23 Process Safety (API 520 Relief Sizing psig to psia)", 2021),
    ],
    "bsl-2e": [
        (1, "Part I Momentum Transport: Viscosity, Shell Momentum Balances & Friction Factors f_F", 11),
        (1, "Ch. 6 Macroscopic Balances for Isothermal Flow Systems & Ergun Packed-Bed Friction", 177),
        (1, "Part II Energy Transport: Fourier Conduction, Forced Convection & Heat Transfer", 265),
        (1, "Part III Mass Transport: Fick Diffusion, Porous Catalyst Thiele Modulus & Effectiveness", 513),
    ],
    "svna-9e": [
        (1, "Ch. 3 Volumetric Properties of Pure Fluids (Virial & Cubic EOS PR/SRK)", 68),
        (1, "Ch. 10 Vapor/Liquid Equilibrium: Introduction & Modified Raoult's Law", 336),
        (1, "Ch. 12 Solution Thermodynamics: Activity Models (Wilson, NRTL, UNIQUAC)", 412),
        (1, "Ch. 14 Phase Equilibria: Liquid/Liquid Equilibrium (LLE) & Azeotropes", 528),
    ],
    "seader-4e": [
        (1, "Ch. 6 Absorption and Stripping of Dilute Mixtures (Kremser Equations)", 185),
        (1, "Ch. 7 Distillation of Binary Mixtures (McCabe-Thiele, q-Line, Murphree Efficiency)", 223),
        (1, "Ch. 9 Approximate Shortcut Methods for Multicomponent Distillation (Fenske-Underwood-Gilliland)", 315),
        (1, "Ch. 14 Tray & Packed Column Capacity and Efficiency (Fair C_sb & Eckert GPDC Flooding)", 512),
    ],
    "crowl-4e": [
        (1, "Ch. 6 & 7 Fires, Explosions, LFL/UFL Flammability Limits & Inerting", 224),
        (1, "Ch. 8 Chemical Reactivity & Semenov Thermal Runaway (psi_crit = 1/e)", 346),
        (1, "Ch. 9 Introduction to Reliefs & Ch. 10 Relief Sizing (API 520 Critical Flow psig -> psia)", 382),
    ],
}


def list_textbooks() -> list[dict[str, Any]]:
    """Return metadata for all 6 Chemical Engineering textbooks (self-contained index + optional raw file)."""
    items: list[dict[str, Any]] = []
    for book in TEXTBOOK_CATALOG:
        path = os.path.join(REPO_ROOT, book["filename"])
        raw_exists = os.path.exists(path)
        items.append({
            **book,
            "exists": True,
            "raw_file_present": raw_exists,
            "size_mb": round(os.path.getsize(path) / (1024 * 1024), 2) if raw_exists else book["nominal_size_mb"],
        })
    return items


def _build_fogler_hit(sec_key: str, sec_title: str, snippet: str) -> dict[str, Any]:
    return {
        "book_id": "fogler-7e",
        "short_title": "Fogler 7th Ed.",
        "section": sec_key,
        "chapter_title": sec_title,
        "snippet": snippet,
        "citation": f"[Fogler 7th Ed., {sec_title.split('(')[0].strip()}]",
    }


def search_fogler_epub(query: str, max_results: int = 10) -> list[dict[str, Any]]:
    """Search Fogler 7th Ed. EPUB (if local file present) or built-in 30-section index."""
    epub_path = os.path.join(REPO_ROOT, TEXTBOOK_CATALOG[1]["filename"])
    q = query.strip().lower()
    hits: list[tuple[int, dict[str, Any]]] = []
    if os.path.exists(epub_path):
        with zipfile.ZipFile(epub_path, "r") as zf:
            for sec_key, sec_title in FOGLER_SECTIONS.items():
                member = f"OEBPS/{sec_key}.xhtml"
                if member not in zf.namelist():
                    continue
                raw = zf.read(member).decode("utf-8", errors="ignore")
                no_style = re.sub(r"<style[^>]*>.*?</style>", " ", raw, flags=re.S | re.I)
                plain = re.sub(r"\s+", " ", re.sub(r"<[^>]+>|&#\d+;", " ", no_style)).strip()
                in_title = bool(q and (q in sec_title.lower() or q in sec_key.lower()))
                idx = plain.lower().find(q) if q else 0
                if idx == -1 and not in_title:
                    continue
                snippet_start = max(0, idx - 60) if idx >= 0 else 0
                snippet = plain[snippet_start : snippet_start + 220].strip()
                hits.append((0 if in_title else 1, _build_fogler_hit(sec_key, sec_title, snippet)))
    else:
        for sec_key, sec_title in FOGLER_SECTIONS.items():
            if not q or q in sec_title.lower() or q in sec_key.lower():
                hits.append((0, _build_fogler_hit(sec_key, sec_title, sec_title)))
    hits.sort(key=lambda item: item[0])
    return [h for _, h in hits[:max_results]]


def search_pdf_textbook_toc(book_id: str, query: str, max_results: int = 8) -> list[dict[str, Any]]:
    """Search the PyMuPDF TOC of a PDF textbook (if present) or built-in TOC index."""
    book = next((b for b in TEXTBOOK_CATALOG if b["book_id"] == book_id), None)
    if not book or book["format"] != "pdf":
        return []
    pdf_path = os.path.join(REPO_ROOT, book["filename"])
    q = query.strip().lower()
    toc_entries: list[tuple[int, str, int]] = []
    if os.path.exists(pdf_path):
        with fitz.open(pdf_path) as doc:
            toc_entries = [(lvl, t.replace("\x00", "").strip(), pg) for lvl, t, pg in doc.get_toc()]
    if not toc_entries:
        toc_entries = PDF_TOC_INDEX.get(book_id, [])
    hits: list[dict[str, Any]] = []
    for level, title, page_num in toc_entries:
        if not q or q in title.lower():
            hits.append({
                "book_id": book_id,
                "short_title": book["short_title"],
                "level": level,
                "title": title,
                "pdf_page": page_num,
                "citation": f"[{book['short_title']}, '{title}', PDF p. {page_num}]",
            })
            if len(hits) >= max_results:
                break
    return hits
