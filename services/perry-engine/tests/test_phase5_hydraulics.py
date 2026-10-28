"""Phase 5 tests: ASME B36.10M pipe sizing, Darcy f_D = 4*f_F guardrail, 3-case matrix,
Pump NPSH_A cavitation check (psig/psia + 1.35x rule), ISA control valve C_v choked flow,
and live-PDF citation anchors.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from main import app
from pdf.section_map import verify_page_contains
from solvers.hydraulics_pipe import solve_pipe_hydraulics_3case
from solvers.hydraulics_pump_valve import (
    evaluate_control_valve_cv,
    evaluate_pump_npsha,
    generate_pump_system_curve,
)

client = TestClient(app)


def test_perry_hydraulics_citation_anchors_in_live_pdf() -> None:
    assert verify_page_contains("6-10", "FIG. 6-9")
    assert verify_page_contains("10-70", "TABLE 10-22")
    assert verify_page_contains("10-24", "NPSH")
    assert verify_page_contains("8-71", "8-77")


def test_pipe_3case_and_darcy_fanning_guardrail() -> None:
    res = solve_pipe_hydraulics_3case(
        nps_inch=4,
        schedule="40",
        flow_gpm=250.0,
        length_m=100.0,
        roughness_mm=0.045,
        rho_kg_m3=998.2,
        mu_cp=1.0,
        k_fittings=4.5,
        elev_m=5.0,
    )
    assert abs(res["pipe"]["d_inner_m"] - 0.10226) < 0.001
    for key in ("min", "normal", "rated"):
        case = res["cases"][key]
        assert abs(case["f_darcy"] - 4.0 * case["f_fanning"]) < 1e-9
    assert res["cases"]["min"]["dp_total_kpa"] < res["cases"]["normal"]["dp_total_kpa"]
    assert res["cases"]["normal"]["dp_total_kpa"] < res["cases"]["rated"]["dp_total_kpa"]


def test_pump_npsha_psig_normalization_and_cavitation_trigger() -> None:
    safe = evaluate_pump_npsha(
        p_suction_val=2.0,
        p_suction_unit="psig",
        z_suction_m=2.0,
        hf_suction_m=0.8,
        p_vapor_pa=3169.0,
        rho_kg_m3=998.2,
        npshr_m=3.0,
    )
    assert safe["is_gauge_converted"] is True
    assert safe["cavitation_status"] == "SAFE"
    assert safe["npsha_m"] > 10.0

    # Near-boiling water or negative suction lift triggers CAVITATION_DANGER
    danger = evaluate_pump_npsha(
        p_suction_val=0.0,
        p_suction_unit="psig",
        z_suction_m=-2.5,
        hf_suction_m=2.0,
        p_vapor_pa=70000.0,
        rho_kg_m3=965.0,
        npshr_m=3.5,
    )
    assert danger["cavitation_status"] == "CAVITATION_DANGER"

    with pytest.raises(ValueError, match="Ambiguous pressure unit"):
        evaluate_pump_npsha(p_suction_val=5.0, p_suction_unit="psi")


def test_control_valve_cv_choked_flow_and_ff_step() -> None:
    res = evaluate_control_valve_cv(
        flow_m3_s=0.01577,
        p1_pa=600000.0,
        p2_pa=50000.0,  # large drop -> choked
        p_vapor_pa=80000.0,
        p_crit_pa=22064000.0,
        rho_kg_m3=998.2,
        fl_factor=0.85,
    )
    assert res["is_choked"] is True
    assert res["is_flashing"] is True
    assert 0.90 < res["f_f"] < 0.96
    assert res["equations"][0]["lhs_symbol"] == "F_{F}"
    assert "p. 8-71" in res["citation"]


def test_hydraulics_router_and_pump_curve() -> None:
    pts = generate_pump_system_curve()
    assert len(pts) == 15
    resp = client.post("/api/v1/hydraulics/evaluate", json={"flow_gpm": 250.0, "p_suction_unit": "psig"})
    assert resp.status_code == 200
    body = resp.json()
    assert "pipe_3case" in body and "pump_npsha" in body and "control_valve" in body
