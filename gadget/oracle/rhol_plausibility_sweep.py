#!/usr/bin/env python3
"""Physical plausibility sweep over every DIPPR Eq-105 liquid-density row.

Closes the class of data-transcription errors the battery is structurally
blind to (both oracle and JS port are byte-faithful to the same table).
Evaluates each compound IN its printed validity range (T_min+5 .. T_max-5)
and asserts: low-T density > high-T density (monotone decrease) and both
within 50-2500 kg/m^3. Run:
    services/perry-engine/.venv/bin/python gadget/oracle/rhol_plausibility_sweep.py
Exit 0 = all rows plausible.
"""
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / "services" / "perry-engine"))

from solvers.thermo_dippr import evaluate_dippr_eq105_rhol  # noqa: E402
from solvers.dippr_coeffs import DIPPR_COMPOUNDS  # noqa: E402


def main() -> int:
    fails = 0
    for comp in DIPPR_COMPOUNDS:
        data = DIPPR_COMPOUNDS[comp]
        _, _, _, _, tmin, tmax, _ = data["rhol_eq105"]
        lo, hi = tmin + 5.0, tmax - 5.0
        klo = evaluate_dippr_eq105_rhol(comp, lo)["rho_kg_m3"]
        khi = evaluate_dippr_eq105_rhol(comp, hi)["rho_kg_m3"]
        ok = 50 <= khi <= klo <= 2500 and klo > khi
        if not ok:
            fails += 1
        print(f"{comp:10s} rho({lo:.1f}K)={klo:8.1f} -> "
              f"rho({hi:.1f}K)={khi:8.1f} kg/m3 {'OK' if ok else 'FAIL'}")
    print(f"{fails} failures")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
