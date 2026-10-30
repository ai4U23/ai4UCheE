// Shared SVG pointer coordinate projection, percentage mapping, inverse linear/log10 solvers,
// and JSDOM-safe pointer-capture helpers used across all interactive engineering charts.

if (typeof window !== 'undefined' && typeof window.PointerEvent === 'undefined' && typeof window.MouseEvent !== 'undefined') {
  // JSDOM omits window.PointerEvent, causing @testing-library/dom to fall back to generic Event
  // which strips clientX/clientY. Aliasing PointerEvent to MouseEvent preserves pointer coordinates.
  (window as unknown as { PointerEvent: typeof MouseEvent }).PointerEvent = window.MouseEvent;
}

export interface ViewBoxRect {
  width: number;
  height: number;
  plotX: number;
  plotY: number;
  plotW: number;
  plotH: number;
}

export interface ProjectedSvgPoint {
  vx: number;
  vy: number;
  u: number;
  v: number;
  xPct: number;
  yPct: number;
}

/** Clamp a numeric value to [min, max] with optional step quantization. */
export function clampDomainValue(val: number, min: number, max: number, step?: number): number {
  const safeVal = Number.isFinite(val) ? val : min;
  const clamped = Math.min(Math.max(safeVal, min), max);
  if (!step || step <= 0) return clamped;
  const quantized = min + Math.round((clamped - min) / step) * step;
  return Number(Math.min(Math.max(quantized, min), max).toFixed(6));
}

/** Map normalized fraction t in [0, 1] linearly onto [min, max]. */
export function inverseLinearMap(t: number, min: number, max: number): number {
  const u = clampDomainValue(t, 0, 1);
  return min + u * (max - min);
}

/** Map normalized fraction t in [0, 1] logarithmically onto [min, max] (min > 0, max > 0). */
export function inverseLog10Map(t: number, min: number, max: number): number {
  const u = clampDomainValue(t, 0, 1);
  const logMin = Math.log10(Math.max(min, 1e-12));
  const logMax = Math.log10(Math.max(max, 1e-12));
  return Math.pow(10, logMin + u * (logMax - logMin));
}

/**
 * Project a pointer/mouse event onto SVG viewBox coordinates and normalized [0, 1] plot fractions.
 * In JSDOM (where getBoundingClientRect().width === 0), clientX/clientY are treated directly as
 * SVG viewBox coordinates so unit tests can pass exact viewBox coordinates.
 */
export function clientPointToViewBox(
  e: {
    clientX?: number;
    clientY?: number;
    pageX?: number;
    pageY?: number;
    nativeEvent?: { clientX?: number; clientY?: number; pageX?: number; pageY?: number };
  },
  svgEl: SVGElement | Element | null,
  viewBox: ViewBoxRect,
): ProjectedSvgPoint {
  const rect = svgEl?.getBoundingClientRect?.();
  const rawX = e.clientX ?? e.nativeEvent?.clientX ?? e.pageX ?? e.nativeEvent?.pageX ?? 0;
  const rawY = e.clientY ?? e.nativeEvent?.clientY ?? e.pageY ?? e.nativeEvent?.pageY ?? 0;
  let vx = Number.isFinite(rawX) ? rawX : 0;
  let vy = Number.isFinite(rawY) ? rawY : 0;
  if (rect && rect.width > 0 && rect.height > 0) {
    vx = ((vx - rect.left) / rect.width) * viewBox.width;
    vy = ((vy - rect.top) / rect.height) * viewBox.height;
  }
  const u = clampDomainValue((vx - viewBox.plotX) / Math.max(viewBox.plotW, 1), 0, 1);
  const v = clampDomainValue((vy - viewBox.plotY) / Math.max(viewBox.plotH, 1), 0, 1);
  return {
    vx,
    vy,
    u,
    v,
    xPct: Number((u * 100).toFixed(2)),
    yPct: Number((v * 100).toFixed(2)),
  };
}

/** Safely invoke setPointerCapture when supported by the host DOM (no-op in JSDOM). */
export function safeSetPointerCapture(el: Element | null | undefined, pointerId?: number): void {
  if (!el || pointerId === undefined) return;
  try {
    if ('setPointerCapture' in el && typeof (el as HTMLElement).setPointerCapture === 'function') {
      (el as HTMLElement).setPointerCapture(pointerId);
    }
  } catch {
    // Ignore pointer capture errors in headless/synthetic test environments
  }
}
