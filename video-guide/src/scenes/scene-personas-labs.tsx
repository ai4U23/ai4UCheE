// Scene 2: Dual-Persona Switch (🎓 Learn Mode vs. 🏭 Plant Mode) & 5 Subject Workbenches + WB1 Charts.
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SCENE_META, VIDEO_TOKENS } from '../theme-tokens';

const SUBJECT_LABS = [
  { id: 'WB2', title: '1. Thermodynamics & Phase', detail: 'DIPPR Eq. 101/106 · Binary VLE T-x-y · Peng-Robinson EOS · Rankine Cycles' },
  { id: 'WB3', title: '2. Fluid & Transport Hydraulics', detail: 'Sch 40/80 Pipe · f_D = 4·f_F Guard · Pump NPSHa · ISA-75.01 Valves' },
  { id: 'WB4', title: '3. Separations & Distillation', detail: '5-Handle McCabe-Thiele · Fair Flooding C_sb · Kremser N_OG · LLE' },
  { id: 'WB6', title: '4. Kinetics & Reactor Design', detail: 'Levenspiel CSTR/PFR · Ergun ΔP · Thiele η(φ) · Semenov Runaway' },
  { id: 'WB5 + WB1', title: '5. 25-Sec Perry Atlas & 10 Charts', detail: 'All 25 Perry Sections · S-P Index (pp. 2244–2274) · High-DPI Crops' },
];

export const ScenePersonasLabs: React.FC<{ bilingualSubtitles: boolean }> = ({ bilingualSubtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = SCENE_META[1];

  const headerEnter = spring({ frame, fps, config: { damping: 200 } });
  const pillSlide = spring({ frame: frame - 35, fps, config: { damping: 18, stiffness: 160 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: VIDEO_TOKENS.ivory,
        color: VIDEO_TOKENS.navyDeep,
        fontFamily: VIDEO_TOKENS.fontSans,
        padding: '44px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ opacity: headerEnter }}>
        <span
          style={{
            fontFamily: VIDEO_TOKENS.fontMono,
            fontSize: 20,
            fontWeight: 700,
            backgroundColor: VIDEO_TOKENS.maize,
            padding: '6px 16px',
            borderRadius: 999,
          }}
        >
          {meta.step}
        </span>
        <h2 style={{ fontFamily: VIDEO_TOKENS.fontDisplay, fontSize: 56, fontWeight: 700, margin: '12px 0 4px' }}>
          {meta.titleEn}
        </h2>
        {bilingualSubtitles && (
          <p style={{ fontSize: 24, color: VIDEO_TOKENS.inkMuted, margin: 0, fontWeight: 600 }}>{meta.titleVi}</p>
        )}
      </div>

      {/* Dual Persona Comparison + 5 Subject Labs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: 28, alignItems: 'stretch' }}>
        {/* Left: Dual-Lens Persona Switcher */}
        <div
          style={{
            backgroundColor: VIDEO_TOKENS.navyDeep,
            color: VIDEO_TOKENS.ivory,
            borderRadius: 18,
            padding: 28,
            border: `2px solid ${VIDEO_TOKENS.maize}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 19, color: VIDEO_TOKENS.maize, fontWeight: 700 }}>
              PERSONA LENS SWITCHER
            </div>
            {/* Animated Pill Switcher */}
            <div
              style={{
                marginTop: 14,
                backgroundColor: VIDEO_TOKENS.navy,
                borderRadius: 12,
                padding: 8,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                border: '1px solid rgba(232,197,71,0.35)',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 22,
                  backgroundColor: pillSlide < 0.5 ? VIDEO_TOKENS.maize : 'transparent',
                  color: pillSlide < 0.5 ? VIDEO_TOKENS.navyDeep : VIDEO_TOKENS.ivory,
                }}
              >
                🎓 Learn Mode
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: 22,
                  backgroundColor: pillSlide >= 0.5 ? VIDEO_TOKENS.maize : 'transparent',
                  color: pillSlide >= 0.5 ? VIDEO_TOKENS.navyDeep : VIDEO_TOKENS.ivory,
                }}
              >
                🏭 Plant Mode
              </div>
            </div>

            <div style={{ marginTop: 20, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 21, color: VIDEO_TOKENS.maizeSoft }}>🎓 For ChE Students:</div>
              <p style={{ fontSize: 18, margin: '6px 0 0', lineHeight: 1.4 }}>
                First-principles intuition banners, Socratic hints, DIY (+35%) vs. Auto-Fix (+12%) mastery scorecard &amp; error-signature coaching.
              </p>
            </div>
            <div style={{ marginTop: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 21, color: VIDEO_TOKENS.maizeSoft }}>🏭 For Plant &amp; EPC Engineers:</div>
              <p style={{ fontSize: 18, margin: '6px 0 0', lineHeight: 1.4 }}>
                3-Case operating matrices (70% Turndown · 100% Normal · 120% Design), ASME B36.10M pipes &amp; Rev 0 QA/QC Calc Sheets.
              </p>
            </div>
          </div>
        </div>

        {/* Right: 5 Subject Workbenches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'space-between' }}>
          {SUBJECT_LABS.map((lab, idx) => {
            const rowSpring = spring({ frame: frame - (10 + idx * 7), fps, config: { damping: 200 } });
            return (
              <div
                key={lab.id}
                style={{
                  backgroundColor: VIDEO_TOKENS.white,
                  border: `2px solid ${idx === 1 ? VIDEO_TOKENS.maize : VIDEO_TOKENS.borderGrid}`,
                  borderRadius: 14,
                  padding: '15px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: rowSpring,
                  transform: `translateX(${interpolate(rowSpring, [0, 1], [32, 0])}px)`,
                }}
              >
                <div>
                  <div style={{ fontSize: 23, fontWeight: 700, color: VIDEO_TOKENS.navyDeep }}>{lab.title}</div>
                  <div style={{ fontSize: 17, color: VIDEO_TOKENS.inkMuted, marginTop: 3, fontFamily: VIDEO_TOKENS.fontMono }}>
                    {lab.detail}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: VIDEO_TOKENS.fontMono,
                    fontSize: 17,
                    fontWeight: 700,
                    backgroundColor: VIDEO_TOKENS.paper,
                    border: `1px solid ${VIDEO_TOKENS.maize}`,
                    padding: '6px 14px',
                    borderRadius: 999,
                    color: VIDEO_TOKENS.navyDeep,
                  }}
                >
                  {lab.id}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          backgroundColor: VIDEO_TOKENS.navyDeep,
          color: VIDEO_TOKENS.ivory,
          borderRadius: 14,
          padding: '16px 28px',
          borderLeft: `6px solid ${VIDEO_TOKENS.maize}`,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 700 }}>{meta.captionEn}</div>
        {bilingualSubtitles && <div style={{ fontSize: 20, color: VIDEO_TOKENS.maizeSoft }}>{meta.captionVi}</div>}
      </div>
    </AbsoluteFill>
  );
};
