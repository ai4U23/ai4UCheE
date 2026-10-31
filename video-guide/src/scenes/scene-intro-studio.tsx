// Scene 1: Welcome to ai4UCheE & the 3-Zone AI-Native Studio ("1 Bar · 1 Canvas · 1 Agent").
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneCaptionFooter, SceneHeaderBar } from '../scene-chrome';
import { SCENE_META, VIDEO_TOKENS } from '../theme-tokens';

const SIX_BOOKS = [
  { code: "Perry's 9th Ed.", tag: '25 Sections · 2,274 pp.' },
  { code: 'Fogler 7th Ed.', tag: 'Reaction Eng · 19 Ch.' },
  { code: 'Bird-Stewart-Lightfoot', tag: 'Transport Phenomena' },
  { code: 'Smith-Van Ness-Abbott', tag: 'ChE Thermodynamics' },
  { code: 'Seader 4th Ed.', tag: 'Separation Principles' },
  { code: 'Crowl & Louvar 4th Ed.', tag: 'Chemical Process Safety' },
];

export const SceneIntroStudio: React.FC<{ bilingualSubtitles: boolean }> = ({ bilingualSubtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = SCENE_META[0];

  const heroEnter = spring({ frame, fps, config: { damping: 200 } });
  const zone1Enter = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 180 } });
  const zone2Enter = spring({ frame: frame - 22, fps, config: { damping: 20, stiffness: 180 } });
  const zone3Enter = spring({ frame: frame - 34, fps, config: { damping: 20, stiffness: 180 } });

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
      <SceneHeaderBar meta={meta} bilingualSubtitles={bilingualSubtitles} enterProgress={heroEnter} isHero />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.75fr 1fr',
          gap: 24,
          backgroundColor: VIDEO_TOKENS.paper,
          border: `2px solid ${VIDEO_TOKENS.borderGrid}`,
          borderRadius: 20,
          padding: 24,
          boxShadow: '0 18px 42px rgba(7, 26, 51, 0.12)',
        }}
      >
        <div
          style={{
            gridColumn: '1 / -1',
            backgroundColor: VIDEO_TOKENS.navyDeep,
            color: VIDEO_TOKENS.ivory,
            borderRadius: 12,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: `2px solid ${VIDEO_TOKENS.maize}`,
            opacity: zone1Enter,
            transform: `scale(${interpolate(zone1Enter, [0, 1], [0.96, 1])})`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontWeight: 800, fontSize: 25, color: VIDEO_TOKENS.maize }}>ZONE 1 · TOP STUDIO BAR</span>
            <span style={{ fontSize: 20, color: VIDEO_TOKENS.maizeSoft }}>
              🔧 5 Subject Labs ▾ · 🌱 L1–L4 24 Plant Problems ▾
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontFamily: VIDEO_TOKENS.fontMono, fontSize: 18 }}>
            <span style={{ background: VIDEO_TOKENS.maize, color: VIDEO_TOKENS.navyDeep, padding: '4px 12px', borderRadius: 8, fontWeight: 700 }}>
              🎓 Learn / 🏭 Plant
            </span>
            <span style={{ border: `1px solid ${VIDEO_TOKENS.maizeSoft}`, padding: '4px 12px', borderRadius: 8 }}>📐 Charts</span>
            <span style={{ border: `1px solid ${VIDEO_TOKENS.maizeSoft}`, padding: '4px 12px', borderRadius: 8 }}>📄 Calc Sheet</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: VIDEO_TOKENS.white,
            borderRadius: 14,
            padding: 24,
            border: `2px solid ${VIDEO_TOKENS.borderGrid}`,
            opacity: zone2Enter,
            transform: `translateY(${interpolate(zone2Enter, [0, 1], [24, 0])}px)`,
          }}
        >
          <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 20, fontWeight: 700, color: VIDEO_TOKENS.navy }}>
            ZONE 2 · INTERACTIVE ENGINEERING CANVAS (55+ SVG CHARTS)
          </div>
          <p style={{ fontSize: 20, color: VIDEO_TOKENS.inkMuted, margin: '8px 0 16px' }}>
            Drag SVG handles &amp; scrub 34px dials with instant client-side math grounded in 6 canonical textbooks:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {SIX_BOOKS.map((b, idx) => {
              const cardSpring = spring({ frame: frame - (28 + idx * 5), fps, config: { damping: 200 } });
              return (
                <div
                  key={b.code}
                  style={{
                    backgroundColor: VIDEO_TOKENS.paper,
                    border: `1.5px solid ${VIDEO_TOKENS.maize}`,
                    borderRadius: 10,
                    padding: '12px 14px',
                    opacity: cardSpring,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 18, color: VIDEO_TOKENS.navyDeep }}>{b.code}</div>
                  <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 15, color: VIDEO_TOKENS.inkMuted, marginTop: 4 }}>
                    {b.tag}
                  </div>
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
            padding: 24,
            border: `2px solid ${VIDEO_TOKENS.maize}`,
            opacity: zone3Enter,
            transform: `translateX(${interpolate(zone3Enter, [0, 1], [28, 0])}px)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 20, fontWeight: 700, color: VIDEO_TOKENS.maize }}>
              ZONE 3 · STICKY AI CO-PILOT
            </div>
            <div
              style={{
                marginTop: 12,
                padding: '10px 14px',
                backgroundColor: VIDEO_TOKENS.navy,
                borderRadius: 8,
                fontFamily: VIDEO_TOKENS.fontMono,
                fontSize: 16,
                color: VIDEO_TOKENS.maizeSoft,
              }}
            >
              &lt;current-screen live=&quot;true&quot; dof=&quot;0&quot; /&gt;
            </div>
            <p style={{ fontSize: 19, lineHeight: 1.45, marginTop: 14, color: VIDEO_TOKENS.ivory }}>
              • Attach <strong>+ Ask</strong> chips from any equation or pump
              <br />• Stream 3-stage KaTeX proof cards
              <br />• Mutate workbench sliders via natural language
            </p>
          </div>
          <div
            style={{
              backgroundColor: 'rgba(232, 197, 71, 0.18)',
              border: `1px solid ${VIDEO_TOKENS.maize}`,
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 18,
              color: VIDEO_TOKENS.maizeSoft,
              fontWeight: 600,
            }}
          >
            ✓ Zero LLM Arithmetic Hallucination
          </div>
        </div>
      </div>

      <SceneCaptionFooter meta={meta} bilingualSubtitles={bilingualSubtitles} />
    </AbsoluteFill>
  );
};
