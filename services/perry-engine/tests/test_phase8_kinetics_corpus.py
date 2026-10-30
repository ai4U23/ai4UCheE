"""Pytest verification suite for the 6-book textbook corpus (Perry's 9th Ed., Fogler 7th Ed. EPUB,
BSL Transport 2nd Ed., Smith-Van Ness-Abbott 9th Ed., Seader 4th Ed., Crowl & Louvar 4th Ed.)
and the deterministic Kinetics & Reactor Design solver (/api/v1/kinetics/solve).
"""
from __future__ import annotations

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_textbook_catalog_lists_all_6_books() -> None:
    res = client.get("/api/v1/textbooks/catalog")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 6
    book_ids = {b["book_id"] for b in data["textbooks"]}
    assert book_ids == {
        "perry-9e",
        "fogler-7e",
        "bsl-2e",
        "svna-9e",
        "seader-4e",
        "crowl-4e",
    }
    for b in data["textbooks"]:
        assert b["exists"] is True
        assert b["size_mb"] > 1.0


def test_fogler_epub_and_pdf_toc_search() -> None:
    res_fogler = client.get("/api/v1/textbooks/search?q=levenspiel&book_id=fogler-7e")
    assert res_fogler.status_code == 200
    hits = res_fogler.json()["results"]
    assert len(hits) >= 1
    assert "Fogler 7th Ed." in hits[0]["citation"]
    assert "#sbo-rt-content" not in hits[0]["snippet"]

    res_app = client.get("/api/v1/textbooks/search?q=polymath&book_id=fogler-7e")
    assert res_app.status_code == 200
    app_hits = res_app.json()["results"]
    assert any(h.get("section") == "appd" for h in app_hits)

    res_bsl = client.get("/api/v1/textbooks/search?q=momentum&book_id=bsl-2e")
    assert res_bsl.status_code == 200
    bsl_hits = res_bsl.json()["results"]
    assert len(bsl_hits) >= 1
    assert bsl_hits[0]["book_id"] == "bsl-2e"

    res_perry = client.get("/api/v1/textbooks/search?q=reactors&book_id=perry-9e")
    assert res_perry.status_code == 200
    perry_hits = res_perry.json()["results"]
    assert len(perry_hits) >= 1
    assert perry_hits[0]["book_id"] == "perry-9e"

    # Edge cases: empty query string and special regex metacharacters
    res_empty = client.get("/api/v1/textbooks/search?q=&max_results=5")
    assert res_empty.status_code == 200
    assert len(res_empty.json()["results"]) == 5

    res_regex = client.get("/api/v1/textbooks/search?q=%5Ba-z%5D%2B.*(&book_id=fogler-7e")
    assert res_regex.status_code == 200
    assert isinstance(res_regex.json()["results"], list)


def test_kinetics_reactor_solver_invariants_and_edge_cases() -> None:
    res = client.post(
        "/api/v1/kinetics/solve",
        json={
            "conversion_x": 0.80,
            "temp_k": 450.0,
            "p_inlet_psig": 45.0,
            "epsilon_a": 0.25,
            "alpha_ergun": 0.015,
            "thiele_phi": 1.4,
            "semenov_psi": 0.28,
        },
    )
    assert res.status_code == 200
    out = res.json()
    # Explicit psig -> psia conversion
    assert abs(out["p_inlet_psia"] - (45.0 + 14.6959)) < 0.02
    # CSTR requires larger volume than PFR for positive-order reaction
    assert out["v_ratio_cstr_pfr"] > 1.5
    # Darcy f_D = 4 * Fanning f_F
    assert abs(out["f_darcy_equiv"] - 4.0 * out["f_fanning_equiv"]) < 1e-4
    # Thiele effectiveness factor in (0, 1)
    assert 0.2 < out["effectiveness_eta"] < 1.0
    assert out["is_runaway"] is False
    assert len(out["equations"]) == 3

    # Higher temperature increases Arrhenius k(T) and reduces required space-time da_cstr
    res_hot = client.post(
        "/api/v1/kinetics/solve",
        json={"conversion_x": 0.80, "temp_k": 520.0},
    )
    assert res_hot.status_code == 200
    out_hot = res_hot.json()
    assert out_hot["k_rate_s_inv"] > out["k_rate_s_inv"]
    assert out_hot["da_cstr"] < out["da_cstr"]

    # Semenov runaway trigger when psi > 1/e (~0.3679)
    res_runaway = client.post(
        "/api/v1/kinetics/solve",
        json={"conversion_x": 0.88, "semenov_psi": 0.52},
    )
    assert res_runaway.status_code == 200
    assert res_runaway.json()["is_runaway"] is True

    # Out-of-bounds conversion rejected with 422
    res_bad = client.post("/api/v1/kinetics/solve", json={"conversion_x": 1.05})
    assert res_bad.status_code == 422

