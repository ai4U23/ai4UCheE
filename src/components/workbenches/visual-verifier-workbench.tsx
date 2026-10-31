// WB1: Perry's 9th Ed. 25-Section Visual Crop Verifier & 10-Chart Multi-Book Nomograph Practice.
import React, { useEffect, useRef, useState } from 'react';
import { cropPerryPageAction } from '../../actions/search-perry-pdf';
import { syncWorkbenchPayload } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { useWorkbenchMutations } from '../../hooks/use-workbench-mutations';
import { PRESET_ANCHORS, type PerryPresetAnchor } from '../../lib/perry-figure-chart-meta';
import { samplePerryCurveAtPct, type PerryCurveSampleResult } from '../../lib/perry-figure-curve-sampler';
import { clientPointToViewBox, safeSetPointerCapture } from '../../lib/svg-drag-math';
import { MotionPillButton } from '../ui/framer-motion-primitives';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { PerryFigureSvgPreview } from './perry-figure-svg-preview';
import { VisualVerifierTutorCard } from './visual-verifier-tutor-card';

export const VisualVerifierWorkbench: React.FC = () => {
  const { personaMode } = usePersonaTheme();
  const [secNum, setSecNum] = useState<number>(6);
  const [secPage, setSecPage] = useState<string>('6-10');
  const [userReading, setUserReading] = useState<string>('0.018');
  const [exactValue, setExactValue] = useState<number>(0.0045);
  const [crosshair, setCrosshair] = useState<{ xPct: number; yPct: number }>({ xPct: 50, yPct: 49.8 });
  const [revealed, setRevealed] = useState<boolean>(false);
  const [cropDataUri, setCropDataUri] = useState<string | null>(null);
  const overlayDragRef = useRef<boolean>(false);

  const figSelectable = useAgentSelectable('figure', 'perry-crop', `Perry's ${secPage} visual crop`, {
    secPage, exactValue, userReading: Number(userReading),
  });

  const numReading = Number(userReading) || 0;
  const errPct = exactValue !== 0 ? (Math.abs(numReading - exactValue) / Math.abs(exactValue)) * 100 : 0;
  const pass = errPct <= 5.0;
  const fourXErr = exactValue !== 0 ? (Math.abs(numReading - 4 * exactValue) / (4 * exactValue)) * 100 : 100;
  const fanning4xDetected = secPage === '6-10' && fourXErr <= 15.0 && !pass;
  const showCrosshair = personaMode === 'plant' || revealed;

  useWorkbenchMutations('wb1-visual-verifier', (p) => {
    if (p.secPage !== undefined) {
      const nextPage = String(p.secPage);
      setSecPage(nextPage);
      setSecNum(Number(nextPage.split('-')[0]) || 6);
      setRevealed(false);
      setCropDataUri(null);
    }
    if (p.userReading !== undefined) setUserReading(String(p.userReading));
    if (p.exactValue !== undefined) setExactValue(Number(p.exactValue));
  });

  useEffect(() => {
    syncWorkbenchPayload('wb1-visual-verifier', {
      summary: `WB1 chart verifier: Perry p. ${secPage}, reading ${userReading} vs exact ${exactValue}`,
      inputs: { secPage, userReading, exactValue },
      metrics: { errPct, pass, fanning4xDetected },
      statusBanner: pass
        ? '✅ Reading within 5% of the Perry-exact value'
        : fanning4xDetected
          ? '⚠️ 4× Fanning/Darcy trap detected — re-read the chart'
          : '❌ Reading off — re-check the crosshair',
    });
  });

  const applyPreset = (preset: PerryPresetAnchor) => {
    setSecPage(preset.secPage);
    setSecNum(Number(preset.secPage.split('-')[0]) || 6);
    setExactValue(preset.exactVal);
    setRevealed(false);
    setCrosshair({ xPct: 50, yPct: 48 });
  };

  const handleScrubSample = (sample: PerryCurveSampleResult, nextCrosshair: { xPct: number; yPct: number }) => {
    setCrosshair(nextCrosshair);
    setExactValue(sample.yCurve);
    setUserReading(String(sample.yCursor));
  };

  const handleOverlayPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    e.stopPropagation();
    const pt = clientPointToViewBox(e, e.currentTarget, { width: 100, height: 100, plotX: 0, plotY: 0, plotW: 100, plotH: 100 });
    const sample = samplePerryCurveAtPct(secPage, pt.xPct, pt.yPct);
    const snapY = e.altKey ? pt.yPct : sample.yCurvePct;
    handleScrubSample({ ...sample, yCursor: e.altKey ? sample.yCursor : sample.yCurve }, { xPct: pt.xPct, yPct: snapY });
  };

  const handleLoadCrop = async () => {
    try {
      const res = (await cropPerryPageAction.run({ sec_page: secPage, dpi: 150 })) as { image_base64?: string; composite_image_base64?: string };
      setCropDataUri(res.image_base64 ?? res.composite_image_base64 ?? null);
    } catch {
      setCropDataUri(null);
    }
  };

  const [showPresetsDrawer, setShowPresetsDrawer] = useState<boolean>(false);
  const [showInvestigationDrawer, setShowInvestigationDrawer] = useState<boolean>(false);

  return (
    <section className="wb-panel" data-testid="wb1-visual-verifier">
      <header className="wb-toolbar">
        <div>
          <h2>📐 Calibrated Nomographs &amp; Chart Verifier</h2>
          <p className="wb-subtitle studio-drawer-collapsed" data-testid="wb1-blended-sources-badge">
            📚 Blended Sources: <code>Perry&apos;s 9th Ed. · BSL Transport · SVNAS · Seader · Fogler · Crowl &amp; Louvar</code> · 10 Calibrated Charts
          </p>
        </div>
        <div className="wb-controls">
          <label>
            Section (1–25):
            <select aria-label="Section selector" value={secNum} onChange={(e) => { const s = Number(e.target.value); setSecNum(s); setSecPage(`${s}-1`); }}>
              {Array.from({ length: 25 }, (_, i) => i + 1).map((s) => (<option key={s} value={s}>Sec {s}</option>))}
            </select>
          </label>
          <label>
            Sec-Page:
            <input aria-label="Sec-Page code" value={secPage} onChange={(e) => setSecPage(e.target.value)} />
          </label>
        </div>
      </header>

      <div className="wb-split">
        <div className="wb-crop-stage" {...figSelectable.selectableProps} data-agent-select="figure:perry-crop">
          {cropDataUri ? (
            <img src={cropDataUri} alt={`Perry's ${secPage} crop`} className="wb-crop-img" />
          ) : (
            <div className="wb-crop-placeholder">
              <PerryFigureSvgPreview
                secPage={secPage} exactValue={exactValue} showCrosshair={showCrosshair}
                crosshair={crosshair} onScrubCrosshair={handleScrubSample}
              />
              <span>Drag curve to scrub reading or click to attach Point-and-Ask chip · [Perry&apos;s 9th Ed., p. {secPage}]</span>
            </div>
          )}
          {showCrosshair && (
            <svg
              className="wb-crosshair-svg" viewBox="0 0 100 100" preserveAspectRatio="none"
              data-testid="calibrated-crosshair"
              style={{ pointerEvents: cropDataUri ? 'auto' : 'none', cursor: 'crosshair' }}
              onPointerDown={(e) => {
                overlayDragRef.current = true;
                safeSetPointerCapture(e.currentTarget, e.pointerId);
                handleOverlayPointer(e);
              }}
              onPointerMove={(e) => { if (overlayDragRef.current) handleOverlayPointer(e); }}
              onPointerUp={() => { overlayDragRef.current = false; }}
            >
              <line x1={crosshair.xPct} y1={0} x2={crosshair.xPct} y2={100} stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.6" />
              <line x1={0} y1={crosshair.yPct} x2={100} y2={crosshair.yPct} stroke="currentColor" strokeDasharray="2 2" strokeOpacity="0.6" />
              <circle cx={crosshair.xPct} cy={crosshair.yPct} r={2.2} fill="currentColor" />
            </svg>
          )}
        </div>

        <VisualVerifierTutorCard
          personaMode={personaMode} secPage={secPage} exactValue={exactValue}
          showCrosshair={showCrosshair} revealed={revealed} userReading={userReading}
          onReadingChange={setUserReading} errPct={errPct} pass={pass}
          fanning4xDetected={fanning4xDetected} numReading={numReading}
          onVerify={() => setRevealed(true)} onLoadCrop={handleLoadCrop} onResetCrop={() => setCropDataUri(null)}
        />
      </div>

      <div className="studio-disclosure-bar">
        <button type="button" onClick={() => setShowPresetsDrawer(!showPresetsDrawer)}>
          {showPresetsDrawer ? '▾' : '▸'} 📊 All 10 Calibrated Charts ({PRESET_ANCHORS.length})
        </button>
        <button type="button" onClick={() => setShowInvestigationDrawer(!showInvestigationDrawer)}>
          {showInvestigationDrawer ? '▾' : '▸'} 🕵️ 6-Stage Investigation
        </button>
      </div>

      <div className={showPresetsDrawer ? 'wb-presets' : 'wb-presets studio-drawer-collapsed'} data-testid="wb1-preset-chips">
        {PRESET_ANCHORS.map((p) => (
          <MotionPillButton
            key={p.secPage} layoutId="wb1-preset-pill" isActive={secPage === p.secPage}
            className="wb-chip" testId={`wb1-preset-${p.secPage}`} onClick={() => applyPreset(p)}
          >
            {p.label}
          </MotionPillButton>
        ))}
      </div>

      <div className={showInvestigationDrawer ? '' : 'studio-drawer-collapsed'}>
        <LearnModeCallout
          workbenchId="wb1" title="How to Read Log-Log & Multi-Book ChE Nomographs"
          plainEnglish="Pick any of the 10 calibrated multi-book nomographs above, drag the crosshair across the curve to scrub live readings, or type your visual estimate to verify against textbook benchmarks."
          commonTrap="Perry's Fig. 6-9 plots Fanning f_F, which is 4× smaller than the Moody Darcy friction factor f_D = 4·f_F."
          perryAnchor="[Perry's 9th Ed., Fig. 6-9, p. 6-10]"
        />
      </div>
    </section>
  );
};
