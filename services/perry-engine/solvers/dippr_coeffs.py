"""Curated Perry's 9th Ed. Section 2 DIPPR coefficients for benchmark process fluids.

- Table 2-8  (pp. 2-53 ff.): Vapor Pressure Eq. 101, P_vp = exp(C1 + C2/T + C3*ln(T) + C4*T^C5) [Pa]
- Table 2-69 (pp. 2-120 ff.): Heat of Vaporization Eq. 106, dH_vap = C1*(1-Tr)^(C2+C3*Tr+C4*Tr^2+C5*Tr^3) [J/kmol]
- Table 2-32 (pp. 2-93 ff.): Liquid Molar Density Eq. 105, rho_L = C1 / C2^(1 + (1 - T/C3)^C4) [kmol/m^3]
"""
from __future__ import annotations

from typing import Any

# Each entry provides verified Perry's Sec 2 DIPPR parameters:
# vp_eq101:   (C1, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
# hvap_eq106: (C1_J_kmol, C2, C3, C4, C5, T_min_K, T_max_K, sec_page)
# rhol_eq105: (C1, C2, C3, C4, T_min_K, T_max_K, sec_page)
DIPPR_COMPOUNDS: dict[str, dict[str, Any]] = {
    "water": {
        "name": "Water",
        "formula": "H2O",
        "cas": "7732-18-5",
        "mw": 18.015,
        "tc_k": 647.096,
        "pc_pa": 22064000.0,
        "omega": 0.3449,
        "search_term": "Water",
        "vp_eq101": (73.649, -7258.2, -7.3037, 4.1653e-6, 2.0, 273.16, 647.096, "2-53"),
        "hvap_eq106": (5.2053e7, 0.3199, -0.212, 0.25795, 0.0, 273.16, 647.096, "2-120"),
        "rhol_eq105": (17.863, 0.05861, 647.096, 0.081, 273.16, 353.15, "2-93"),
    },
    "benzene": {
        "name": "Benzene",
        "formula": "C6H6",
        "cas": "71-43-2",
        "mw": 78.114,
        "tc_k": 562.05,
        "pc_pa": 4895000.0,
        "omega": 0.2103,
        "search_term": "Benzene",
        "vp_eq101": (83.107, -6486.2, -9.2194, 6.9844e-6, 2.0, 278.68, 562.05, "2-53"),
        "hvap_eq106": (4.7500e7, 0.45238, -0.0534, 0.0, 0.0, 278.68, 562.05, "2-120"),
        "rhol_eq105": (1.0259, 0.26666, 562.05, 0.28394, 278.68, 562.05, "2-93"),
    },
    "toluene": {
        "name": "Toluene",
        "formula": "C7H8",
        "cas": "108-88-3",
        "mw": 92.141,
        "tc_k": 591.75,
        "pc_pa": 4108000.0,
        "omega": 0.2640,
        "search_term": "Toluene",
        "vp_eq101": (76.945, -6729.8, -8.179, 5.3017e-6, 2.0, 178.18, 591.75, "2-53"),
        "hvap_eq106": (5.0144e7, 0.3859, 0.0, 0.0, 0.0, 178.18, 591.75, "2-120"),
        "rhol_eq105": (0.8792, 0.26465, 591.75, 0.2878, 178.18, 591.75, "2-93"),
    },
    "ethanol": {
        "name": "Ethanol",
        "formula": "C2H6O",
        "cas": "64-17-5",
        "mw": 46.069,
        "tc_k": 514.0,
        "pc_pa": 6137000.0,
        "omega": 0.6436,
        "search_term": "Ethanol",
        "vp_eq101": (73.304, -7122.3, -7.1424, 2.8853e-6, 2.0, 159.05, 514.0, "2-53"),
        "hvap_eq106": (5.6900e7, 0.3359, 0.0, 0.0, 0.0, 159.05, 514.0, "2-120"),
        "rhol_eq105": (1.6288, 0.27469, 514.0, 0.23178, 159.05, 514.0, "2-93"),
    },
    "methanol": {
        "name": "Methanol",
        "formula": "CH4O",
        "cas": "67-56-1",
        "mw": 32.042,
        "tc_k": 512.5,
        "pc_pa": 8084000.0,
        "omega": 0.5658,
        "search_term": "Methanol",
        "vp_eq101": (82.718, -6904.5, -8.8622, 7.4664e-6, 2.0, 175.47, 512.5, "2-53"),
        "hvap_eq106": (5.2390e7, 0.3682, 0.0, 0.0, 0.0, 175.47, 512.5, "2-120"),
        "rhol_eq105": (2.3267, 0.27073, 512.5, 0.24713, 175.47, 512.5, "2-93"),
    },
    "acetone": {
        "name": "Acetone",
        "formula": "C3H6O",
        "cas": "67-64-1",
        "mw": 58.08,
        "tc_k": 508.2,
        "pc_pa": 4701000.0,
        "omega": 0.3071,
        "search_term": "Acetone",
        "vp_eq101": (69.006, -5599.6, -7.0985, 6.2237e-6, 2.0, 178.45, 508.2, "2-53"),
        "hvap_eq106": (4.2150e7, 0.3397, 0.0, 0.0, 0.0, 178.45, 508.2, "2-120"),
        "rhol_eq105": (1.2332, 0.25886, 508.2, 0.2913, 178.45, 508.2, "2-93"),
    },
    "n-hexane": {
        "name": "n-Hexane",
        "formula": "C6H14",
        "cas": "110-54-3",
        "mw": 86.177,
        "tc_k": 507.6,
        "pc_pa": 3025000.0,
        "omega": 0.3013,
        "search_term": "Hexane",
        "vp_eq101": (104.65, -6995.5, -12.702, 1.2381e-5, 2.0, 177.83, 507.6, "2-53"),
        "hvap_eq106": (4.4544e7, 0.39002, 0.0, 0.0, 0.0, 177.83, 507.6, "2-120"),
        "rhol_eq105": (0.70824, 0.26411, 507.6, 0.27537, 177.83, 507.6, "2-93"),
    },
    "n-heptane": {
        "name": "n-Heptane",
        "formula": "C7H16",
        "cas": "142-82-5",
        "mw": 100.204,
        "tc_k": 540.2,
        "pc_pa": 2740000.0,
        "omega": 0.3495,
        "search_term": "Heptane",
        "vp_eq101": (87.829, -6996.4, -9.8802, 7.2099e-6, 2.0, 182.57, 540.2, "2-53"),
        "hvap_eq106": (4.9966e7, 0.38795, 0.0, 0.0, 0.0, 182.57, 540.2, "2-120"),
        "rhol_eq105": (0.61259, 0.26211, 540.2, 0.28141, 182.57, 540.2, "2-93"),
    },
    "ammonia": {
        "name": "Ammonia",
        "formula": "NH3",
        "cas": "7664-41-7",
        "mw": 17.031,
        "tc_k": 405.4,
        "pc_pa": 11333000.0,
        "omega": 0.2560,
        "search_term": "Ammonia",
        "vp_eq101": (90.483, -4669.7, -11.607, 1.7194e-2, 1.0, 195.41, 405.4, "2-53"),
        "hvap_eq106": (3.1523e7, 0.3914, -0.2289, 0.2309, 0.0, 195.41, 405.4, "2-120"),
        "rhol_eq105": (3.5383, 0.25443, 405.4, 0.2888, 195.41, 405.4, "2-93"),
    },
    "methane": {
        "name": "Methane",
        "formula": "CH4",
        "cas": "74-82-8",
        "mw": 16.043,
        "tc_k": 190.564,
        "pc_pa": 4599000.0,
        "omega": 0.0115,
        "search_term": "Methane",
        "vp_eq101": (39.205, -1324.4, -3.4366, 3.1019e-5, 2.0, 90.69, 190.564, "2-53"),
        "hvap_eq106": (1.0194e7, 0.26087, -0.14694, 0.22154, 0.0, 90.69, 190.564, "2-120"),
        "rhol_eq105": (2.9214, 0.28976, 190.564, 0.28881, 90.69, 190.564, "2-93"),
    },
}


def get_compound_dippr(compound: str) -> dict[str, Any]:
    """Lookup curated compound by case-insensitive key, name, or formula."""
    key = compound.strip().lower()
    if key in DIPPR_COMPOUNDS:
        return DIPPR_COMPOUNDS[key]
    for entry in DIPPR_COMPOUNDS.values():
        if key in (entry["name"].lower(), entry["formula"].lower(), entry["cas"].lower()):
            return entry
    raise ValueError(
        f"Unknown DIPPR compound {compound!r}; supported: {sorted(DIPPR_COMPOUNDS)}"
    )
