"""Golden-value battery: Python perry-engine oracle vs gadget JS port.

Phase 3 of plans/261113-0638-quick-calcs-html-pages.

Field-name contract (oracle -> expected.json -> JS comparator):
  DIPPR  : vapor_pressure_pa, hvap_j_kmol, rhol_kmol_m3, rho_kg_m3,
           temperature_k, tr (computed here as temp_k/tc_k), range_warning
  NPSHa  : p_suction_abs_pa, p_suction_psia, npsha_m, npshr_m, margin_m,
           ratio, cavitation_status, is_gauge_converted

Oracle runner: services/perry-engine/.venv/bin/python (PRIMARY — same-tree
truth; the VPS container fallback was demoted by the plan review: the deployed
image can silently differ from the working tree).

ONE COMMAND is the whole battery:
    python3 gadget/oracle/golden_battery.py
Generates expected.json, then runs `node gadget/src/cli-selftest.js` and
exits with its return code. Success = final line `ALL GREEN ...`.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "services" / "perry-engine"))

from solvers.thermo_dippr import evaluate_all_dippr_properties  # noqa: E402
from solvers.hydraulics_pump_valve import evaluate_pump_npsha  # noqa: E402

ORACLE_DIR = Path(__file__).resolve().parent
GRID = ORACLE_DIR / "input_grid.json"
EXPECTED = ORACLE_DIR / "expected.json"
SELFTEST = REPO / "gadget" / "src" / "cli-selftest.js"


def main() -> int:
    grid = json.loads(GRID.read_text())

    expected: dict[str, list[dict]] = {"dippr": [], "npsha": []}
    for case in grid["dippr"]:
        res = evaluate_all_dippr_properties(case["compound"], case["temp_k"])
        expected["dippr"].append(
            {
                "input": case,
                "vapor_pressure_pa": res["vapor_pressure_pa"],
                "hvap_j_kmol": res["hvap_j_kmol"],
                "rhol_kmol_m3": res["rhol_kmol_m3"],
                "rho_kg_m3": res["rho_kg_m3"],
                "temperature_k": res["temperature_k"],
                "tr": res["temperature_k"] / res["tc_k"],
                "range_warning": res["range_warning"],
            }
        )
    for case in grid["npsha"]:
        res = evaluate_pump_npsha(
            p_suction_val=case["p_suction_val"],
            p_suction_unit=case["p_suction_unit"],
            patm_psia=case.get("patm_psia", 14.6959),
            z_suction_m=case.get("z_suction_m", 2.0),
            hf_suction_m=case.get("hf_suction_m", 0.8),
            p_vapor_pa=case.get("p_vapor_pa", 3169.0),
            rho_kg_m3=case.get("rho_kg_m3", 998.2),
            npshr_m=case.get("npshr_m", 3.0),
        )
        expected["npsha"].append(
            {
                "input": case,
                "p_suction_abs_pa": res["p_suction_abs_pa"],
                "p_suction_psia": res["p_suction_psia"],
                "npsha_m": res["npsha_m"],
                "npshr_m": res["npshr_m"],
                "margin_m": res["margin_m"],
                "ratio": res["ratio"],
                "cavitation_status": res["cavitation_status"],
                "is_gauge_converted": res["is_gauge_converted"],
            }
        )

    EXPECTED.write_text(json.dumps(expected, indent=1))
    print(f"oracle path: services/perry-engine/.venv (same-tree primary)")
    print(f"expected.json written: "
          f"{len(expected['dippr'])} dippr + {len(expected['npsha'])} npsha cases")

    proc = subprocess.run(
        ["node", str(SELFTEST)], cwd=str(REPO), check=False
    )
    return proc.returncode


if __name__ == "__main__":
    sys.exit(main())
