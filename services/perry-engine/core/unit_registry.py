"""Pint field-unit registry with explicit gauge/absolute pressure guardrail.

Perry's 9th Ed. Sec 6/8 discipline: bare ``psi`` is ambiguous and rejected;
``psig``/``barg``/``kpag`` carry an explicit atmospheric datum conversion
``P_abs = P_gauge + P_atm`` that is surfaced in every white-box trace.
"""
from __future__ import annotations

from typing import Any

import pint

# --- Singleton registry with plant/oilfield aliases -------------------------
ureg = pint.UnitRegistry()
_PSI_TO_PA = ureg.Quantity(1, "psi").to("pascal").magnitude  # 6894.757...

_ALIASES = {
    "gpm": "gallon / minute",
    "cP": "centipoise",
    "lbm": "pound",
    "lbf": "force_pound",
    "lb_hr": "pound / hour",
}
for _name, _expr in _ALIASES.items():
    try:
        ureg.parse_expression(_name)
    except pint.errors.UndefinedUnitError:
        ureg.define(f"{_name} = {_expr}")

DEFAULT_PATM_PSIA = 14.6959  # 1 atm at sea level (Perry's 9th Ed., Sec 1)

ABSOLUTE_PRESSURE_UNITS = {
    "psia": "psi",
    "pa": "pascal",
    "kpa": "kilopascal",
    "bar": "bar",
    "atm": "standard_atmosphere",
    "mmhg": "mmHg",
    "torr": "torr",
}
GAUGE_PRESSURE_UNITS = {"psig", "barg", "kpag"}


class UnitConversionResult(dict):
    """Dict subclass so results stay JSON-serializable over the wire."""


def normalize_pressure_to_pa(
    value: float, unit_str: str, patm_psia: float = DEFAULT_PATM_PSIA
) -> dict[str, Any]:
    """Convert a pressure reading to Pascals + psia with an explicit datum.

    - Gauge units (``psig``/``barg``/``kpag``): ``P_abs = P_gauge + P_atm``,
      returned with ``is_gauge_converted=True`` and a datum note for the
      Stage-2 white-box substitution trace.
    - ``psi`` alone: rejected (ambiguous datum) with ``ValueError``.
    - Absolute units: converted directly, ``is_gauge_converted=False``.
    """
    u = unit_str.strip().lower()
    if u == "psi":
        raise ValueError(
            "Ambiguous pressure unit 'psi': specify 'psig' (gauge) or "
            "'psia' (absolute) per Perry's Sec 6/8 cavitation safety guardrail."
        )
    if u in GAUGE_PRESSURE_UNITS:
        gauge_psia = value * _PSI_TO_PA if u == "psig" else value / _PSI_TO_PA
        abs_psia = gauge_psia + patm_psia
        return UnitConversionResult(
            value_pa=abs_psia * _PSI_TO_PA,
            value_psia=abs_psia,
            gauge_psia=gauge_psia,
            patm_psia=patm_psia,
            is_gauge_converted=True,
            datum_note=(
                f"P_abs = {value:g} {unit_str} + {patm_psia:g} psia "
                f"= {abs_psia:.4f} psia (gauge-to-absolute datum conversion)"
            ),
        )
    if u in ABSOLUTE_PRESSURE_UNITS:
        pa = ureg.Quantity(value, ABSOLUTE_PRESSURE_UNITS[u]).to("pascal").magnitude
        psia = pa / _PSI_TO_PA
        return UnitConversionResult(
            value_pa=pa,
            value_psia=psia,
            gauge_psia=None,
            patm_psia=patm_psia,
            is_gauge_converted=False,
            datum_note=f"{value:g} {unit_str} is absolute: {psia:.4f} psia",
        )
    raise ValueError(f"Unsupported pressure unit '{unit_str}'")


def convert_field_unit(
    value: float,
    from_unit: str,
    to_unit: str,
    patm_psia: float = DEFAULT_PATM_PSIA,
) -> dict[str, Any]:
    """Convert between mixed field units (gpm, lb/hr, cP, ft, psig->kPa, ...).

    Pressure units route through :func:`normalize_pressure_to_pa` so the
    gauge/absolute datum is never silently dropped.
    """
    f, t = from_unit.strip(), to_unit.strip()
    f_key, t_key = f.lower(), t.lower()
    pressure_keys = GAUGE_PRESSURE_UNITS | set(ABSOLUTE_PRESSURE_UNITS) | {"psi"}
    if f_key in pressure_keys:
        base = normalize_pressure_to_pa(value, f, patm_psia)
        if t_key not in ABSOLUTE_PRESSURE_UNITS:
            raise ValueError(
                f"Target pressure unit '{to_unit}' must be absolute "
                f"(e.g. psia, kPa, bar); gauge targets would hide the datum."
            )
        out_val = (
            ureg.Quantity(base["value_pa"], "pascal")
            .to(ABSOLUTE_PRESSURE_UNITS[t_key])
            .magnitude
        )
        factor = out_val / value if value else float("nan")
        return UnitConversionResult(
            input_value=value,
            input_unit=f,
            output_value=out_val,
            output_unit=t,
            value_pa=base["value_pa"],
            factor=factor,
            datum_note=f"{base['datum_note']}; expressed as {t}",
            is_gauge_converted=base["is_gauge_converted"],
            latex_unit=_latex_unit(t_key),
        )
    src = ureg.Quantity(value, f)
    dst = src.to(t)
    factor = dst.magnitude / value if value else float("nan")
    return UnitConversionResult(
        input_value=value,
        input_unit=f,
        output_value=dst.magnitude,
        output_unit=t,
        factor=factor,
        datum_note=f"{value:g} {f} = {dst.magnitude:.6g} {t}",
        is_gauge_converted=False,
        latex_unit=_latex_unit(t),
    )


def _latex_unit(unit_str: str) -> str:
    """Rough KaTeX rendering of a unit string for Stage-2 substitution."""
    u = unit_str.replace("^", "**")
    try:
        q = (1.0 * ureg.parse_expression(u)).units
    except Exception:
        return unit_str.replace("*", r" \cdot ").replace("**", "^")
    return f"{q:~L}".replace(r"\text{", "{").replace("}", "}")
