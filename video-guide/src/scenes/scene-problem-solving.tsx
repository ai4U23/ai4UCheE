// Scene 3: 24 Real-Life Plant Problems (L1–L4 Tiers) & Fogler & LeBlanc 6-Stage Troubleshooting Flow.
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SCENE_META, VIDEO_TOKENS } from '../theme-tokens';

const TIERS = [
  { tier: '🌱 L1', label: 'Unit / Concept Trap', ex: '4× Darcy vs. Fanning · psig vs. psia' },
  { tier: '🔧 L2', label: 'Equipment Bottleneck', ex: 'Pump P-101 Cavitation · Fair Flooding' },
  { tier: '🕵️ L3', label: 'Multi-Hypothesis Upset', ex: 'Boiler Feedwater HX 70°C → 42°C' },
  { tier: '🚨 L4', label: 'Coupled Safety / Design', ex: 'Semenov Thermal Runaway ψ > 1/e' },
];

const SIX_STAGES = [
  { num: '1', name: 'Problem Observation', note: 'Normal vs. Faulty telemetry + ⏱️ Δt horizon clue' },
  { num: '2', name: 'K-T Problem Definition', note: 'IS / IS NOT table & Real Root Problem' },
  { num: '3', name: 'Fundamental Theory', note: 'Conservation equations & dimensionless groups' },
  { num: '4', name: 'Applicable Handbook', note: "Perry's 9th Ed. tables & high-DPI PDF crops" },
  { num: '5', name: 'Prove ✅ / Disprove ❌', note: 'Fogler Rule #12: falsify decoys before proving' },
  { num: '6', name: 'Verified Safe Solution', note: 'Earn FOG-WB*-DIY-XXXXXX Detective Stamp' },
];

export const SceneProblemSolving: React.FC<{ bilingualSubtitles: boolean }> = ({ bilingualSubtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = SCENE_META[2];

  const headerEnter = spring({ frame, fps, config: { damping: 200 } });

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

      {/* L1-L4 Progression Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {TIERS.map((t, idx) => {
          const s = spring({ frame: frame - (6 + idx * 5), fps, config: { damping: 200 } });
          return (
            <div
              key={t.tier}
              style={{
                backgroundColor: VIDEO_TOKENS.navyDeep,
                color: VIDEO_TOKENS.ivory,
                borderRadius: 14,
                padding: '16px 20px',
                border: `2px solid ${VIDEO_TOKENS.maize}`,
                opacity: s,
                transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 800, color: VIDEO_TOKENS.maize }}>{t.tier} · {t.label}</div>
              <div style={{ fontSize: 16, fontFamily: VIDEO_TOKENS.fontMono, color: VIDEO_TOKENS.maizeSoft, marginTop: 6 }}>
                {t.ex}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6-Stage Fogler & LeBlanc Flow Grid */}
      <div
        style={{
          backgroundColor: VIDEO_TOKENS.paper,
          borderRadius: 18,
          padding: 24,
          border: `2px solid ${VIDEO_TOKENS.borderGrid}`,
        }}
      >
        <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 20, fontWeight: 700, marginBottom: 14 }}>
          FOGLER &amp; LEBLANC (2008) 6-STAGE CREATIVE PROBLEM-SOLVING BOARD
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {SIX_STAGES.map((st, idx) => {
            const stSpring = spring({ frame: frame - (20 + idx * 6), fps, config: { damping: 200 } });
            const isRule12 = idx === 4;
            return (
              <div
                key={st.num}
                style={{
                  backgroundColor: VIDEO_TOKENS.white,
                  borderRadius: 12,
                  padding: '16px 18px',
                  border: `2px solid ${isRule12 ? VIDEO_TOKENS.pass : VIDEO_TOKENS.borderGrid}`,
                  opacity: stSpring,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontFamily: VIDEO_TOKENS.fontMono,
                      fontWeight: 800,
                      fontSize: 18,
                      backgroundColor: isRule12 ? 'rgba(21,128,61,0.14)' : VIDEO_TOKENS.paper,
                      color: isRule12 ? VIDEO_TOKENS.pass : VIDEO_TOKENS.navyDeep,
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}
                  >
                    STAGE {st.num}
                  </span>
                  <span style={{ color: VIDEO_TOKENS.pass, fontWeight: 700, fontSize: 18 }}>✓ Verified</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8 }}>{st.name}</div>
                <div style={{ fontSize: 17, color: VIDEO_TOKENS.inkMuted, marginTop: 4 }}>{st.note}</div>
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
