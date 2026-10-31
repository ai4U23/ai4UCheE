// Scene 5: Bi-Directional AI Co-Pilot (+ Ask Chips, What-If Mutations) & Senior EPC QA/QC Calc Sheet Export.
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneCaptionFooter, SceneHeaderBar } from '../scene-chrome';
import { SCENE_META, VIDEO_TOKENS } from '../theme-tokens';

export const SceneCopilotQaqc: React.FC<{ bilingualSubtitles: boolean }> = ({ bilingualSubtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = SCENE_META[4];

  const headerEnter = spring({ frame, fps, config: { damping: 200 } });
  const leftEnter = spring({ frame: frame - 6, fps, config: { damping: 200 } });
  const rightEnter = spring({ frame: frame - 18, fps, config: { damping: 200 } });
  const ctaPulse = interpolate(frame, [45, 75], [0.95, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

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
      <SceneHeaderBar meta={meta} bilingualSubtitles={bilingualSubtitles} enterProgress={headerEnter} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr', gap: 28, alignItems: 'stretch' }}>
        <div
          style={{
            backgroundColor: VIDEO_TOKENS.navyDeep,
            color: VIDEO_TOKENS.ivory,
            borderRadius: 18,
            padding: 26,
            border: `2px solid ${VIDEO_TOKENS.maize}`,
            opacity: leftEnter,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 19, color: VIDEO_TOKENS.maize, fontWeight: 700 }}>
              BI-DIRECTIONAL AI CO-PILOT INSPECTOR
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {['agent-select:equipment:pump-P101', 'agent-select:equation:eq-6-38'].map((chip) => (
                <span
                  key={chip}
                  style={{
                    backgroundColor: 'rgba(232,197,71,0.2)',
                    border: `1px solid ${VIDEO_TOKENS.maize}`,
                    color: VIDEO_TOKENS.maizeSoft,
                    padding: '6px 14px',
                    borderRadius: 999,
                    fontSize: 16,
                    fontFamily: VIDEO_TOKENS.fontMono,
                  }}
                >
                  🎯 {chip}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 16, backgroundColor: 'rgba(232,197,71,0.14)', borderRadius: 10, padding: '12px 16px', fontSize: 18 }}>
              <strong>Engineer Prompt:</strong> &ldquo;Set flow to 260 gpm and suction pressure to 15 psig to eliminate cavitation.&rdquo;
            </div>

            <div
              style={{
                marginTop: 12,
                backgroundColor: VIDEO_TOKENS.navy,
                border: `1px solid ${VIDEO_TOKENS.pass}`,
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 18,
              }}
            >
              <div style={{ color: '#4ade80', fontWeight: 700, fontFamily: VIDEO_TOKENS.fontMono }}>
                ✓ Applied Live Workbench Mutation: flowGpm=260, pSuctionPsig=15
              </div>
              <div style={{ marginTop: 6, color: VIDEO_TOKENS.ivory }}>
                NPSH_A rises to 21.82 m (&gt; NPSH_R = 3.0 m). Ready to compile Rev 0 QA/QC Sheet.
              </div>
            </div>
          </div>

          <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 16, color: VIDEO_TOKENS.maizeSoft }}>
            🔗 Share / AI: Copy Page as Markdown · Open in Claude / ChatGPT / Perplexity
          </div>
        </div>

        <div
          style={{
            backgroundColor: VIDEO_TOKENS.white,
            borderRadius: 18,
            padding: 26,
            border: `2px solid ${VIDEO_TOKENS.borderGrid}`,
            opacity: rightEnter,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 19, fontWeight: 800, color: VIDEO_TOKENS.navyDeep }}>
                📄 SENIOR EPC QA/QC CALCULATION SHEET
              </span>
              <span
                style={{
                  fontFamily: VIDEO_TOKENS.fontMono,
                  fontSize: 16,
                  fontWeight: 700,
                  backgroundColor: VIDEO_TOKENS.paper,
                  border: `1px solid ${VIDEO_TOKENS.maize}`,
                  padding: '4px 12px',
                  borderRadius: 6,
                }}
              >
                Rev 0 — Issued for Review
              </span>
            </div>

            <div
              style={{
                marginTop: 14,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 10,
                fontFamily: VIDEO_TOKENS.fontMono,
                fontSize: 16,
                backgroundColor: VIDEO_TOKENS.paper,
                padding: 14,
                borderRadius: 10,
              }}
            >
              <div>
                <strong>TAG:</strong> P-101A/B
              </div>
              <div>
                <strong>BASIS:</strong> Perry 9e Sec 10
              </div>
              <div>
                <strong>STORE:</strong> SQLite Verified
              </div>
            </div>

            <ul style={{ fontSize: 19, lineHeight: 1.55, marginTop: 14, paddingLeft: 22 }}>
              <li>
                <strong>3-Case Operating Matrix:</strong> 70% Turndown · 100% Normal · 120% Design
              </li>
              <li>
                <strong>White-Box Equations:</strong> Symbolic + Substituted + Evaluated KaTeX
              </li>
              <li>
                <strong>6-Stage Fogler Root-Cause Audit:</strong> Detective Stamp{' '}
                <code style={{ fontFamily: VIDEO_TOKENS.fontMono, fontWeight: 700 }}>FOG-WB3-DIY-902184</code>
              </li>
            </ul>
          </div>

          <div
            style={{
              backgroundColor: VIDEO_TOKENS.maize,
              color: VIDEO_TOKENS.navyDeep,
              borderRadius: 12,
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 800,
              fontSize: 23,
              transform: `scale(${ctaPulse})`,
            }}
          >
            <span>🚀 Start Solving Now at chemeng.ai4u.now</span>
            <span style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 17 }}>6 Books · 55+ Charts · 24 Problems</span>
          </div>
        </div>
      </div>

      <SceneCaptionFooter meta={meta} bilingualSubtitles={bilingualSubtitles} />
    </AbsoluteFill>
  );
};
