// WB1: Perry's 9th Ed. 25-Section Visual Crop Verifier & DeepTutor Chart-Reading Practice.
import React, { useEffect, useState } from 'react';
import { cropPerryPageAction } from '../../actions/search-perry-pdf';
import { syncWorkbenchPayload } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { useWorkbenchMutations } from '../../hooks/use-workbench-mutations';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { PerryFigureSvgPreview } from './perry-figure-svg-preview';
import { VisualVerifierTutorCard } from './visual-verifier-tutor-card';

const PRESET_ANCHORS: Array<{ secPage: string; label: string; exactVal: number; xVal: number; yVal: number }> = [
  { secPage: '6-10', label: 'Fig. 6-9 — Fanning Friction Factor (p. 6-10)', exactVal: 0.0045, xVal: 1e5, yVal: 0.0045 },
  { secPage: '14-37', label: "Fig. 14-32 — Fair's Entrainment Flooding C_sb (p. 14-37)", exactVal: 0.082, xVal: 0.1, yVal: 0.082 },
  { secPage: '14-57', label: 'Fig. 14-55 — Eckert GPDC Packing Flooding (p. 14-57)', exactVal: 0.065, xVal: 0.12, yVal: 0.065 },
  { secPage: '2-53', label: 'Table 2-8 — DIPPR Eq. 101 Vapor Pressure (p. 2-53)', exactVal: 101325, xVal: 373.15, yVal: 101325 },
];

export const VisualVerifierWorkbench: React.FC = () => {
  const { personaMode } = usePersonaTheme();
  const [secNum, setSecNum] = useState<number>(6);
  const [secPage, setSecPage] = useState<string>('6-10');
  const [userReading, setUserReading] = useState<string>('0.018');
  const [exactValue, setExactValue] = useState<number>(0.0045);
  const [crosshair, setCrosshair] = useState<{ xPct: number; yPct: number }>({ xPct: 50, yPct: 49.8 });
  const [revealed, setRevealed] = useState<boolean>(false);
  const [cropDataUri, setCropDataUri] = useState<string | null>(null);

  const figSelectable = useAgentSelectable(
    'figure',
    'perry-crop',
    `Perry's ${secPage} visual crop`,
    { secPage, exactValue, userReading: Number(userReading) },
  );

  const numReading = Number(userReading) || 0;
  const errPct = exactValue !== 0 ? (Math.abs(numReading - exactValue) / Math.abs(exactValue)) * 100 : 0;
  const pass = errPct <= 5.0;
  const fourXErr = exactValue !== 0 ? (Math.abs(numReading - 4 * exactValue) / (4 * exactValue)) * 100 : 100;
  const fanning4xDetected = secPage === '6-10' && fourXErr <= 15.0 && !pass;
  const showCrosshair = personaMode === 'plant' || revealed;

  useWorkbenchMutations('wb1-visual-verifier', (p) => {
    if (p.secPage !== undefined) setSecPage(String(p.secPage));
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

  const applyPreset = (preset: (typeof PRESET_ANCHORS)[number]) => {
    setSecPage(preset.secPage);
    setSecNum(Number(preset.secPage.split('-')[0]) || 6);
    setExactValue(preset.exactVal);
    setRevealed(false);
    setCrosshair({ xPct: 50, yPct: 48 });
  };

  const handleLoadCrop = async () => {
    try {
      const res = (await cropPerryPageAction.run({ sec_page: secPage, dpi: 150 })) as { image_base64?: string; composite_image_base64?: string };
      setCropDataUri(res.image_base64 ?? res.composite_image_base64 ?? null);
    } catch {
      setCropDataUri(null);
    }
  };

  return (
    <section className="wb-panel" data-testid="wb1-visual-verifier">
      <header className="wb-toolbar">
        <div>
          <h2>WB1 · Perry&apos;s 25-Section Visual Crop &amp; Chart Verifier</h2>
          <p className="wb-subtitle">
            Deterministic <code>Sec-Page</code> resolver · High-DPI vector crops · Calibrated SVG crosshair
          </p>
        </div>
        <div className="wb-controls">
          <label>
            Section (1–25):
            <select
              aria-label="Section selector"
              value={secNum}
              onChange={(e) => {
                const s = Number(e.target.value);
                setSecNum(s);
                setSecPage(`${s}-1`);
              }}
            >
              {Array.from({ length: 25 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>Sec {s}</option>
              ))}
            </select>
          </label>
          <label>
            Sec-Page:
            <input aria-label="Sec-Page code" value={secPage} onChange={(e) => setSecPage(e.target.value)} />
          </label>
        </div>
      </header>

      <div className="wb-presets">
        {PRESET_ANCHORS.map((p) => (
          <button key={p.secPage} type="button" className="wb-chip" onClick={() => applyPreset(p)}>
            {p.label}
          </button>
        ))}
      </div>

      <LearnModeCallout
        workbenchId="wb1"
        title="How to Read Log-Log Perry Charts"
        plainEnglish="Pick a preset figure chip above, read the curve at the target Reynolds or flow parameter, and type your estimate to check against the calibrated SVG crosshair."
        commonTrap="Perry's Fig. 6-9 plots Fanning f_F, which is 4× smaller than the Moody Darcy friction factor f_D = 4·f_F."
        perryAnchor="[Perry's 9th Ed., Fig. 6-9, p. 6-10]"
      />

      <div className="wb-split">
        <div className="wb-crop-stage" {...figSelectable.selectableProps} data-agent-select="figure:perry-crop">
          {cropDataUri ? (
            <img src={cropDataUri} alt={`Perry's ${secPage} crop`} className="wb-crop-img" />
          ) : (
            <div className="wb-crop-placeholder">
              <PerryFigureSvgPreview secPage={secPage} exactValue={exactValue} showCrosshair={showCrosshair} />
              <span>Click chart to attach Point-and-Ask chip · [Perry&apos;s 9th Ed., p. {secPage}]</span>
            </div>
          )}
          {showCrosshair && (
            <svg className="wb-crosshair-svg" viewBox="0 0 100 100" preserveAspectRatio="none" data-testid="calibrated-crosshair">
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
    </section>
  );
};
