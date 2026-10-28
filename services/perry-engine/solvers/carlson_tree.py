"""Carlson's (CEP 1996) / Perry's 9th Ed. Section 4 Property Package Decision Tree Advisor.

Verified Perry's anchors (Validation Session 1):
- Pure water/steam: Table 2-31, p. 2-92 + CoolProp IAPWS-95
- Electrolytes:     Sec. 4, p. 4-4 (Electrolyte-NRTL / Pitzer)
- Nonpolar EOS:     Sec. 4, p. 4-12 (SRK & Peng-Robinson)
- Polar activity:   Sec. 4, p. 4-18 (Margules, Wilson, NRTL, UNIQUAC)
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class CarlsonRecommendation(BaseModel):
    decision_path: list[str]
    recommended_package: str
    secondary_options: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    citation: str


def advise_carlson_method(
    is_pure_water: bool = False,
    has_electrolytes: bool = False,
    polarity: str = "nonpolar",  # "nonpolar" | "polar_non_electrolyte"
    pressure_bar: float = 1.0,
    has_vapor_association: bool = False,
    has_liquid_liquid_split: bool = False,
    missing_bip: bool = False,
) -> dict:
    """Evaluate Carlson's thermodynamic property package decision tree."""
    path: list[str] = ["Start: Carlson (1996) / Perry's Sec 4 Property Package Selector"]
    warnings: list[str] = []

    if is_pure_water:
        path.append("Pure water/steam system -> IAPWS-95 / ASME Steam Tables")
        rec = CarlsonRecommendation(
            decision_path=path,
            recommended_package="IAPWS-95 / ASME Steam Tables (CoolProp)",
            secondary_options=["IFC-67 Steam Tables"],
            warnings=[],
            citation="[Perry's 9th Ed., Sec. 2 water tables (Table 2-31), p. 2-92]",
        )
        return rec.model_dump()

    if has_electrolytes:
        path.append("Electrolyte / ionic species present -> Electrolyte-NRTL or Pitzer")
        warnings.append(
            "Standard cubic EOS (PR/SRK) and non-electrolyte activity models ignore Debye-Hückel long-range ionic forces."
        )
        rec = CarlsonRecommendation(
            decision_path=path,
            recommended_package="Electrolyte-NRTL (eNRTL) / Pitzer",
            secondary_options=["OLI MSE", " Bromley-Pitzer"],
            warnings=warnings,
            citation="[Perry's 9th Ed., Sec. 4, p. 4-4]",
        )
        return rec.model_dump()

    pol = polarity.strip().lower()
    if pol == "nonpolar":
        path.append(f"Nonpolar / hydrocarbon system at P = {pressure_bar:g} bar -> Cubic EOS")
        if pressure_bar >= 10.0:
            path.append("High pressure (>= 10 bar) -> Huron-Vidal / Wong-Sandler mixing rules if polar trace exists")
        rec = CarlsonRecommendation(
            decision_path=path,
            recommended_package="Peng-Robinson (PR) or Soave-Redlich-Kwong (SRK)",
            secondary_options=["Lee-Kesler-Plöcker (LKP)", "Benedict-Webb-Rubin (BWR)"],
            warnings=warnings,
            citation="[Perry's 9th Ed., Sec. 4 (SRK & PR equations of state), p. 4-12]",
        )
        return rec.model_dump()

    # Polar non-electrolyte branch
    path.append(f"Polar non-electrolyte mixture (P = {pressure_bar:g} bar)")
    if pressure_bar >= 10.0:
        path.append("P >= 10 bar -> EOS with predictive G^E mixing rules (PR-WS / PSRK)")
        warnings.append(
            "Above 10 bar, standard gamma-phi activity models without Poynting and fugacity corrections lose accuracy."
        )

    if has_vapor_association:
        path.append("Carboxylic acid / HF vapor-phase dimerization -> Hayden-O'Connell (HOC) vapor model")
        warnings.append(
            "TRAP: Carboxylic acids (acetic, formic, propionic) dimerize strongly in the vapor phase; ideal-gas or plain PR vapor fugacity will severely mispredict VLE."
        )
        rec = CarlsonRecommendation(
            decision_path=path,
            recommended_package="NRTL-HOC (NRTL liquid + Hayden-O'Connell vapor association)",
            secondary_options=["UNIQUAC-HOC", "Wilson-HOC (VLE only, no LLE)"],
            warnings=warnings,
            citation="[Perry's 9th Ed., Sec. 4 (Margules, Wilson, NRTL, UNIQUAC), p. 4-18]",
        )
        return rec.model_dump()

    if has_liquid_liquid_split:
        path.append("Liquid-Liquid Equilibrium (LLE / VLLE two liquid phases) -> NRTL or UNIQUAC")
        warnings.append(
            "CRITICAL LLE TRAP: NEVER use the Wilson equation for Liquid-Liquid Equilibrium (LLE) — Wilson is mathematically incapable of predicting phase splitting (d²G^E/dx² > 0 always)."
        )
        pkg = "UNIFAC-LLE (predictive fallback)" if missing_bip else "NRTL or UNIQUAC"
        rec = CarlsonRecommendation(
            decision_path=path,
            recommended_package=pkg,
            secondary_options=["UNIQUAC", "NRTL", "UNIFAC-LLE"],
            warnings=warnings,
            citation="[Perry's 9th Ed., Sec. 4 (Margules, Wilson, NRTL, UNIQUAC), p. 4-18]",
        )
        return rec.model_dump()

    if missing_bip:
        path.append("Missing experimental binary interaction parameters (k_ij / tau_ij) -> UNIFAC group contribution")
        warnings.append("Verify UNIFAC subgroup availability and temperature range before final equipment sizing.")
        pkg = "UNIFAC / Modified UNIFAC (Dortmund)"
    else:
        path.append("Single liquid phase VLE -> Wilson / NRTL / UNIQUAC")
        pkg = "Wilson / NRTL / UNIQUAC"

    rec = CarlsonRecommendation(
        decision_path=path,
        recommended_package=pkg,
        secondary_options=["NRTL", "UNIQUAC", "UNIFAC (if BIPs missing)"],
        warnings=warnings,
        citation="[Perry's 9th Ed., Sec. 4 (Margules, Wilson, NRTL, UNIQUAC), p. 4-18]",
    )
    return rec.model_dump()
