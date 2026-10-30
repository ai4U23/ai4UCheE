"""Edge-case input validation tests for hydraulics and distillation sidecar routers."""
from __future__ import annotations

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_hydraulics_rejects_nonpositive_flow() -> None:
    res_neg = client.post("/api/v1/hydraulics/evaluate", json={"flow_gpm": -50.0})
    assert res_neg.status_code == 422

    res_zero = client.post("/api/v1/hydraulics/evaluate", json={"flow_gpm": 0.0})
    assert res_zero.status_code == 422


def test_distillation_rejects_out_of_range_mole_fractions_and_alpha() -> None:
    res_xf = client.post("/api/v1/distillation/evaluate", json={"xf": 5.0})
    assert res_xf.status_code == 422

    res_alpha = client.post("/api/v1/distillation/evaluate", json={"alpha": 0.5})
    assert res_alpha.status_code == 422

    res_rmult = client.post("/api/v1/distillation/evaluate", json={"r_mult": 0.0})
    assert res_rmult.status_code == 422


def test_distillation_infeasible_split_returns_clean_400() -> None:
    res = client.post(
        "/api/v1/distillation/evaluate",
        json={"xf": 0.20, "xb": 0.30, "xd": 0.90},
    )
    assert res.status_code == 400
    assert "Infeasible binary split" in res.json()["detail"]
