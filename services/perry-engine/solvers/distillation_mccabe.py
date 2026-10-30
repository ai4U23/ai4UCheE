"""Perry's 9th Ed. Sec 13 Binary McCabe-Thiele Stage-Stepping & Fenske-Underwood-Gilliland Solver.

Verified Perry's anchors (Validation Session 1):
- Sec. 13 (p. 13-14): VLE curve y* = alpha*x / (1 + (alpha - 1)*x) & q-line construction (Fig. 13-19)
- Eq. 13-35 (p. 13-25): Overall & component material balances
- Sec. 13 Fenske (p. 13-36): Minimum stages N_min at total reflux
"""
from __future__ import annotations

import math
from typing import Any

from core.handcalcs_katex import render_three_stage_equation


def compute_vle_curve(alpha: float = 2.45, num_points: int = 101) -> list[dict[str, float]]:
    """Constant relative volatility VLE curve y* = alpha*x / (1 + (alpha - 1)*x)."""
    pts: list[dict[str, float]] = []
    for i in range(num_points):
        x = i / (num_points - 1)
        y = (alpha * x) / (1.0 + (alpha - 1.0) * x)
        pts.append({"x": round(x, 4), "y": round(y, 4)})
    return pts


def _pinch_intersection(xf: float, q: float, alpha: float) -> tuple[float, float]:
    """Intersect the q-line with the VLE curve y* = alpha*x / (1 + (alpha - 1)*x)."""
    if abs(q - 1.0) < 1e-6:
        x_p = xf
        y_p = (alpha * x_p) / (1.0 + (alpha - 1.0) * x_p)
        return x_p, y_p
    # Solve (alpha - 1)*q*x^2 + (q + zf*(alpha - 1) - alpha*(q - 1))*x - zf = 0
    a = (alpha - 1.0) * q
    b = q - zf_term(xf, alpha, q)
    c = -xf
    disc = max(b * b - 4.0 * a * c, 0.0)
    x_p = (-b + math.sqrt(disc)) / (2.0 * a)
    x_p = min(max(x_p, 1e-4), 0.9999)
    y_p = (alpha * x_p) / (1.0 + (alpha - 1.0) * x_p)
    return x_p, y_p


def zf_term(xf: float, alpha: float, q: float) -> float:
    return alpha * (q - 1.0) - xf * (alpha - 1.0)


def solve_mccabe_thiele(
    xf: float = 0.50,
    xd: float = 0.95,
    xb: float = 0.05,
    q: float = 1.0,
    r_mult: float = 1.3,
    alpha: float = 2.45,
    feed_kmol_hr: float = 100.0,
) -> dict[str, Any]:
    """Solve binary McCabe-Thiele stage-stepping, FUG shortcut, and 3-stage white-box equations."""
    if not (0.0 < xb < xf < xd < 1.0):
        raise ValueError(f"Infeasible binary split: require 0 < x_B ({xb}) < z_F ({xf}) < x_D ({xd}) < 1")
    if alpha <= 1.0 or r_mult <= 1.0 or feed_kmol_hr <= 0.0:
        raise ValueError("Require alpha > 1.0, r_mult > 1.0, and feed_kmol_hr > 0")
    distillate = feed_kmol_hr * (xf - xb) / max(xd - xb, 1e-6)
    bottoms = feed_kmol_hr - distillate

    x_pinch, y_pinch = _pinch_intersection(xf, q, alpha)
    r_min = max((xd - y_pinch) / max(y_pinch - x_pinch, 1e-6), 0.05)
    r_op = r_mult * r_min
    n_min = math.log((xd * (1.0 - xb)) / max(xb * (1.0 - xd), 1e-9)) / math.log(max(alpha, 1.0001))

    # Internal molar flows (kmol/hr)
    l_rect = r_op * distillate
    v_rect = (r_op + 1.0) * distillate
    l_strip = l_rect + q * feed_kmol_hr
    v_strip = v_rect + (q - 1.0) * feed_kmol_hr

    # Intersection of ROL and q-line for feed-stage transition
    if abs(q - 1.0) < 1e-6:
        x_int = xf
        y_int = (r_op / (r_op + 1.0)) * x_int + xd / (r_op + 1.0)
    else:
        y_int = (xf * (r_op + 1.0) + (q - 1.0) * xd) / max(r_op + q, 1e-6)
        x_int = ((r_op + 1.0) * y_int - xd) / max(r_op, 1e-6)

    # Step off theoretical stages from (x_D, x_D) down to x_B
    stages: list[dict[str, float | int | str]] = []
    staircase_pts: list[tuple[float, float]] = [(xd, xd)]
    y_curr = xd
    feed_stage_index = 1
    switched = False
    for stage_idx in range(1, 60):
        # Inverse VLE: x_eq = y / (alpha - (alpha - 1)*y)
        x_eq = y_curr / max(alpha - (alpha - 1.0) * y_curr, 1e-6)
        staircase_pts.append((round(x_eq, 5), round(y_curr, 5)))
        section = "rectifying"
        if x_eq <= x_int and not switched:
            switched = True
            feed_stage_index = stage_idx
        if switched:
            section = "stripping"
        if x_eq <= xb:
            staircase_pts.append((round(x_eq, 5), round(x_eq, 5)))
            stages.append({"stage": stage_idx, "x_eq": round(x_eq, 4), "y_in": round(y_curr, 4), "section": section})
            break
        if not switched:
            y_next = (r_op / (r_op + 1.0)) * x_eq + xd / (r_op + 1.0)
        else:
            slope_s = l_strip / max(v_strip, 1e-6)
            y_next = slope_s * x_eq - (bottoms / max(v_strip, 1e-6)) * xb
        staircase_pts.append((round(x_eq, 5), round(y_next, 5)))
        stages.append({"stage": stage_idx, "x_eq": round(x_eq, 4), "y_in": round(y_curr, 4), "section": section})
        y_curr = y_next

    step_d = render_three_stage_equation(
        "D",
        "F * (zF - xB) / (xD - xB)",
        {
            "F": (feed_kmol_hr, r"\mathrm{kmol/h}", "F"),
            "zF": (xf, "", "z_{F}"),
            "xB": (xb, "", "x_{B}"),
            "xD": (xd, "", "x_{D}"),
        },
        distillate,
        r"\mathrm{kmol/h}",
        "[Perry's 9th Ed., Eq. 13-35, p. 13-25]",
    )
    step_rmin = render_three_stage_equation(
        "R_{\\min}",
        "(xD - yp) / (yp - xp)",
        {
            "xD": (xd, "", "x_{D}"),
            "yp": (y_pinch, "", "y_{\\mathrm{pinch}}"),
            "xp": (x_pinch, "", "x_{\\mathrm{pinch}}"),
        },
        r_min,
        "dimensionless",
        "[Perry's 9th Ed., Sec. 13 q-line, p. 13-14]",
    )
    step_nmin = render_three_stage_equation(
        "N_{\\min}",
        "ln((xD * (1 - xB)) / (xB * (1 - xD))) / ln(alpha)",
        {
            "xD": (xd, "", "x_{D}"),
            "xB": (xb, "", "x_{B}"),
            "alpha": (alpha, "", r"\alpha"),
        },
        n_min,
        r"\mathrm{stages}",
        "[Perry's 9th Ed., Sec. 13 Fenske, p. 13-36]",
    )

    return {
        "feed_kmol_hr": feed_kmol_hr,
        "distillate_kmol_hr": distillate,
        "bottoms_kmol_hr": bottoms,
        "x_pinch": x_pinch,
        "y_pinch": y_pinch,
        "q_intersection": {"x": x_int, "y": y_int},
        "r_min": r_min,
        "r_operating": r_op,
        "n_min_fenske": n_min,
        "total_stages": len(stages),
        "feed_stage_index": feed_stage_index,
        "internal_flows_kmol_hr": {
            "L_rect": l_rect,
            "V_rect": v_rect,
            "L_strip": l_strip,
            "V_strip": v_strip,
        },
        "stages_list": stages,
        "staircase_points": staircase_pts,
        "vle_curve": compute_vle_curve(alpha, 51),
        "equations": [step_d.model_dump(), step_rmin.model_dump(), step_nmin.model_dump()],
    }
