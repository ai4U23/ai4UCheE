// Inline Generative UI extension renderer for agentNative.ui.output() payloads,
// featuring Chart 12: an interactive Operating-Window Sparkline Scrubber that dispatches live workbench mutations.
import React, { useRef, useState } from 'react';
import type { GenUiPayload } from '../../actions/define-action';
import { dispatchWorkbenchMutation, getClientAppState, type WorkbenchId } from '../../actions/view-screen';
import { clientPointToViewBox, clampDomainValue, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';
import { KaTeXBlock } from '../ui/katex-block';

export interface RenderInlineExtensionProps {
  payload: GenUiPayload;
  onOpenCalcSheet?: (data: Record<string, unknown>) => void;
}

const SPARK_BOX: ViewBoxRect = {
  width: 320,
  height: 44,
  plotX: 16,
  plotY: 6,
  plotW: 288,
  plotH: 32,
};

const OperatingWindowSparkline: React.FC = () => {
  const draggingRef = useRef<boolean>(false);
  const [frac, setFrac] = useState<number>(0.5);

  const scrubSparkline = (e: React.PointerEvent<SVGSVGElement | SVGCircleElement>) => {
    const svgEl = e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
    const pt = clientPointToViewBox(e, svgEl, SPARK_BOX);
    setFrac(pt.u);
    const activeWb = (getClientAppState().activeWorkbench || 'wb3-hydraulics') as WorkbenchId;
    let params: Record<string, number> = { flowGpm: Math.round(clampDomainValue(50 + pt.u * 450, 50, 500, 5)) };
    if (activeWb === 'wb1-visual-verifier') {
      params = { userReading: Number(clampDomainValue(0.002 + pt.u * 0.023, 0.002, 0.025, 0.0005).toFixed(4)) };
    } else if (activeWb === 'wb2-thermo-dippr') {
      params = { tempK: Number(clampDomainValue(280 + pt.u * 220, 280, 500, 0.5).toFixed(2)) };
    } else if (activeWb === 'wb4-distillation') {
      params = { rMult: Number(clampDomainValue(1.1 + pt.u * 2.4, 1.1, 3.5, 0.05).toFixed(2)) };
    } else if (activeWb === 'wb6-kinetics-reactors') {
      params = {
        conversionX: Number(clampDomainValue(0.1 + pt.u * 0.82, 0.08, 0.92, 0.02).toFixed(2)),
        thielePhi: Number(clampDomainValue(0.3 + (1 - pt.u) * 3.5, 0.2, 10.0, 0.1).toFixed(2)),
        semenovPsi: Number(clampDomainValue(0.12 + pt.u * 0.22, 0.08, 0.35, 0.01).toFixed(2)),
      };
    } else if (activeWb === 'wb5-handbook-atlas') {
      params = { primaryVal: Number((10 + pt.u * 200).toFixed(2)) };
    }
    dispatchWorkbenchMutation({
      targetWorkbench: activeWb,
      params,
      reason: 'Scrubbed inline GenUI operating-window sparkline',
    });
  };

  const thumbX = 16 + frac * 288;
  const thumbY = 30 - Math.sin(frac * Math.PI) * 14;

  return (
    <svg
      viewBox="0 0 320 44"
      width="100%"
      height="44"
      role="img"
      aria-label="Interactive Operating Window Sparkline Scrubber"
      data-testid="genui-interactive-sparkline"
      style={{ cursor: 'ew-resize', touchAction: 'none', marginTop: '0.35rem' }}
      onPointerDown={(e) => {
        draggingRef.current = true;
        safeSetPointerCapture(e.currentTarget, e.pointerId);
        scrubSparkline(e);
      }}
      onPointerMove={(e) => {
        if (draggingRef.current) scrubSparkline(e);
      }}
      onPointerUp={() => {
        draggingRef.current = false;
      }}
    >
      <rect x="16" y="6" width="288" height="32" rx="4" fill="var(--bg-canvas)" stroke="var(--border-grid)" />
      {/* Safe Operating Window Shading (30% - 75%) */}
      <rect x="102" y="7" width="130" height="30" fill="var(--status-pass)" fillOpacity="0.18" />
      <path d="M 16 32 Q 160 4 304 28" fill="none" stroke="var(--accent-primary)" strokeWidth="2.2" />
      <line x1={thumbX} y1="6" x2={thumbX} y2="38" stroke="var(--maize)" strokeWidth="1.5" strokeDasharray="2 2" />
      <circle
        cx={thumbX}
        cy={thumbY}
        r="5.5"
        fill="var(--maize)"
        stroke="var(--ink-primary)"
        strokeWidth="1.5"
        style={{ cursor: 'grab' }}
        data-testid="genui-sparkline-handle"
        onPointerDown={(e) => {
          e.stopPropagation();
          draggingRef.current = true;
          safeSetPointerCapture(e.currentTarget.ownerSVGElement ?? e.currentTarget, e.pointerId);
          scrubSparkline(e);
        }}
      />
      <text x="22" y="18" fontSize="8.5" fontWeight="700" fill="currentColor">
        Drag Operating Window Sparkline ({Math.round(frac * 100)}%)
      </text>
    </svg>
  );
};

export const RenderInlineExtension: React.FC<RenderInlineExtensionProps> = ({
  payload,
  onOpenCalcSheet,
}) => {
  const { type, title, data } = payload;

  if (type === 'equation-proof-card') {
    const substituted = String(data.substituted_latex ?? '');
    return (
      <div className="wb-panel" data-testid="genui-equation-proof-card">
        <strong>📐 {title ?? '3-Stage White-Box Equation Proof'}</strong>
        <KaTeXBlock latex={String(data.symbolic_latex ?? 'Re = \\frac{\\rho \\cdot v \\cdot D}{\\mu}')} />
        {substituted && <KaTeXBlock latex={substituted} />}
        <div className="mono">
          <strong>Result: </strong>
          <strong>
            <KaTeXBlock latex={String(data.result_latex ?? '')} displayMode={false} />
          </strong>{' '}
          <code className="mono">{String(data.citation ?? "[Perry's 9th Ed., p. 6-10]")}</code>
        </div>
        <OperatingWindowSparkline />
      </div>
    );
  }

  if (type === 'hydraulics-summary-card') {
    return (
      <div className="wb-panel" data-testid="genui-hydraulics-summary-card">
        <strong>🔧 {title ?? '3-Case Hydraulics & NPSHa Summary'}</strong>
        <p className="mono">
          70% / 100% / 120% Flow · NPSHa Status:{' '}
          <strong>{String(data.cavitation_status ?? 'SAFE')}</strong> · Valve:{' '}
          <strong>{data.is_choked ? 'CHOKED' : 'SUBCRITICAL'}</strong>
        </p>
        <OperatingWindowSparkline />
      </div>
    );
  }

  return (
    <div className="wb-panel" data-testid="genui-calc-sheet-card">
      <strong>📋 {title ?? 'Senior-Engineer QA/QC Calculation Sheet'}</strong>
      <p className="mono">
        Tag: <strong>{String(data.equipmentTag ?? 'P-101A/B')}</strong> · Rev:{' '}
        <code>{String(data.revision ?? 'Rev 0 — Issued for Review')}</code>
      </p>
      <OperatingWindowSparkline />
      <div className="wb-actions-row">
        <button
          type="button"
          data-testid="genui-open-print-sheet"
          onClick={() => onOpenCalcSheet?.(data)}
        >
          Open Print-to-PDF Sheet
        </button>
        <button
          type="button"
          data-testid="genui-copy-markdown"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(String(data.markdown_latex ?? ''));
            }
          }}
        >
          Copy Markdown/LaTeX
        </button>
      </div>
    </div>
  );
};
