"""3-Stage White-Box Equation Renderer: Python AST -> KaTeX (handcalcs style).

Stage 1  symbolic   — variables rendered as LaTeX symbols.
Stage 2  substituted — numeric values with units substituted.
Stage 3  result     — value + unit, with the mandatory Perry's citation.

Every rendered equation MUST cite Perry's 9th Ed. as
``[Perry's 9th Ed., <artifact>, p. S-P]`` — an uncited calculation raises.
"""
from __future__ import annotations

import ast
import math
import re
from typing import Any

from pydantic import BaseModel, Field

CITATION_RE = re.compile(r"^\[Perry's 9th Ed\., .*p\. \d+-\d+\]$")
# env: variable name -> (numeric_value, unit_latex, symbol_latex)
Env = dict[str, tuple[float, str, str]]

_FUNCS = {
    # NOTE: "log"/"log10" render as \log_{10}; any future numeric evaluator of
    # rendered expressions must therefore call math.log10 for "log" (math.log
    # is natural log — the rendered white-box would disagree with the number).
    "ln": r"\ln",
    "log10": r"\log_{10}",
    "log": r"\log_{10}",
    "exp": r"\exp",
    "sqrt": r"\sqrt",
    "sin": r"\sin",
    "cos": r"\cos",
    "tan": r"\tan",
    "sinh": r"\sinh",
    "cosh": r"\cosh",
    "tanh": r"\tanh",
}

_BINOP = {ast.Add: "+", ast.Sub: "-", ast.Mult: r" \cdot "}


def _child(node: ast.expr, env: Env, numeric: bool) -> str:
    """Render a child, adding visible \\left(..\\right) around Add/Sub groups.

    LaTeX braces group for macros but are visually invisible, so a bare
    ``{b + c}`` child displays as ``b + c`` — wrong for ``a - (b + c)``.
    \\frac and ``^{}`` group correctly without parens, so only callers that
    lose the grouping (Sub right operand, Mult operands, USub) wrap here.
    """
    latex = _node_latex(node, env, numeric)
    if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Add, ast.Sub)):
        return rf"\left({latex}\right)"
    return latex


class WhiteBoxStep(BaseModel):
    """One fully-traced equation: symbolic -> substituted -> result + citation."""

    lhs_symbol: str
    symbolic_latex: str
    substituted_latex: str
    result_latex: str
    citation: str = Field(pattern=r"^\[Perry's 9th Ed\., .*p\. \d+-\d+\]$")
    full_aligned_katex: str


def fmt_num(value: float) -> str:
    """Format a number for Stage-2/3 LaTeX: 4 sig figs, or x 10^n outside [0.01, 10000)."""
    if value == 0:
        return "0"
    a = abs(value)
    if 0.01 <= a < 10000:
        s = f"{value:.4g}"
        return s
    exp = math.floor(math.log10(a))
    mant = value / (10.0**exp)
    return rf"{mant:.3f} \times 10^{{{exp}}}"


def _node_latex(node: ast.expr, env: Env, numeric: bool) -> str:
    """Render an AST node either symbolically (symbol_latex) or numerically."""
    if isinstance(node, ast.BinOp):
        left = _child(node.left, env, numeric)
        right = _child(node.right, env, numeric)
        if isinstance(node.op, ast.Div):
            return rf"\frac{{{left}}}{{{right}}}"
        if isinstance(node.op, ast.Pow):
            return rf"{{{left}}}^{{{right}}}"
        op = _BINOP.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported binary operator in expression: {type(node.op).__name__}")
        return rf"{{{left}}}{op}{{{right}}}"
    if isinstance(node, ast.UnaryOp):
        inner = _child(node.operand, env, numeric)
        return rf"-{{{inner}}}" if isinstance(node.op, ast.USub) else inner
    if isinstance(node, ast.Call):
        fname = node.func.id if isinstance(node.func, ast.Name) else "?"
        latex_op = _FUNCS.get(fname)
        if latex_op is None:
            raise ValueError(f"Unsupported function '{fname}' in expression")
        args = [_node_latex(a, env, numeric) for a in node.args]
        if latex_op == r"\sqrt":
            return rf"\sqrt{{{args[0]}}}"
        return rf"{latex_op}\left({', '.join(args)}\right)"
    if isinstance(node, ast.Name):
        if node.id not in env:
            raise ValueError(f"Variable '{node.id}' missing from environment")
        value, unit_latex, symbol_latex = env[node.id]
        if numeric:
            return rf"{fmt_num(value)}\;{unit_latex}" if unit_latex else fmt_num(value)
        return symbol_latex or node.id
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return fmt_num(float(node.value))
    raise ValueError(f"Unsupported AST node: {type(node).__name__}")


def render_three_stage_equation(
    lhs_symbol: str,
    expr_str: str,
    env: Env,
    result_value: float,
    result_unit: str,
    citation: str,
) -> WhiteBoxStep:
    """Build the full 3-stage white-box step for ``lhs = expr``.

    ``result_unit`` is the LaTeX unit of the result (e.g. ``r'\\text{Pa}'``,
    ``'dimensionless'``). The citation is mandatory and regex-verified.
    """
    if not CITATION_RE.match(citation):
        raise ValueError(
            "Every calculation must cite Perry's 9th Ed. as "
            f"[Perry's 9th Ed., <artifact>, p. S-P]; got: {citation!r}"
        )
    tree = ast.parse(expr_str, mode="eval")
    symbolic = _node_latex(tree.body, env, numeric=False)
    substituted = _node_latex(tree.body, env, numeric=True)
    result_unit_latex = "" if result_unit == "dimensionless" else rf"\;{result_unit}"
    result_latex = rf"= {fmt_num(result_value)}{result_unit_latex}"
    aligned = (
        r"\begin{aligned}"
        rf"{lhs_symbol} &= {symbolic} \\"
        rf"&= {substituted} \\"
        rf"&= {fmt_num(result_value)}{result_unit_latex}"
        rf"\quad {citation}"
        r"\end{aligned}"
    )
    return WhiteBoxStep(
        lhs_symbol=lhs_symbol,
        symbolic_latex=rf"{lhs_symbol} = {symbolic}",
        substituted_latex=rf"= {substituted}",
        result_latex=result_latex,
        citation=citation,
        full_aligned_katex=aligned,
    )


def steps_to_dict(steps: list[WhiteBoxStep]) -> list[dict[str, Any]]:
    """Serialize white-box steps for JSON API responses."""
    return [s.model_dump() for s in steps]
