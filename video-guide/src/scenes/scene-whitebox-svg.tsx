// Scene 4: Interactive SVG Scrubbing & 3-Stage White-Box Proofs (Symbolic → Substituted → Result).
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { SceneCaptionFooter, SceneHeaderBar } from '../scene-chrome';
import { SCENE_META, VIDEO_TOKENS } from '../theme-tokens';

export const SceneWhiteboxSvg: React.FC<{ bilingualSubtitles: boolean }> = ({ bilingualSubtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meta = SCENE_META[3];

  const headerEnter = spring({ frame, fps, config: { damping: 200 } });
  const scrubProgress = interpolate(frame, [10, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const flowGpm = Math.round(interpolate(scrubProgress, [0, 1], [450, 260]));
  const pSucPsig = Math.round(interpolate(scrubProgress, [0, 1], [-10, 15]));
  const pSucPsia = (pSucPsig + 14.696).toFixed(2);
  const npshA = interpolate(scrubProgress, [0, 1], [4.18, 21.82]).toFixed(2);
  const isSafe = scrubProgress > 0.55;

  const dotX = interpolate(scrubProgress, [0, 1], [380, 185]);
  const dotY = interpolate(scrubProgress, [0, 1], [195, 110]);

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

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 28, alignItems: 'stretch' }}>
        <div
          style={{
            backgroundColor: VIDEO_TOKENS.white,
            borderRadius: 18,
            padding: 24,
            border: `2px solid ${VIDEO_TOKENS.borderGrid}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 19, fontWeight: 700 }}>
              PUMP P-101 SYSTEM CURVE &amp; NPSH_A(Q)
            </span>
            <span
              style={{
                fontFamily: VIDEO_TOKENS.fontMono,
                fontSize: 17,
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: 999,
                backgroundColor: isSafe ? 'rgba(21,128,61,0.14)' : 'rgba(185,28,28,0.14)',
                color: isSafe ? VIDEO_TOKENS.pass : VIDEO_TOKENS.danger,
              }}
            >
              {isSafe ? '✓ SAFE OPERATING MARGIN' : '⚠️ CAVITATION HAZARD (NPSHa < NPSHr)'}
            </span>
          </div>

          <svg viewBox="0 0 500 240" style={{ width: '100%', height: 220, backgroundColor: VIDEO_TOKENS.paper, borderRadius: 12 }}>
            <path d="M 50 185 Q 250 165 450 65" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="7 6" />
            <path d="M 50 70 Q 240 90 450 205" fill="none" stroke={VIDEO_TOKENS.navyDeep} strokeWidth="4" />
            <path d="M 50 200 Q 220 155 450 55" fill="none" stroke={VIDEO_TOKENS.pass} strokeWidth="4" />
            <circle cx={dotX} cy={dotY} r={14} fill={VIDEO_TOKENS.maize} stroke={VIDEO_TOKENS.navyDeep} strokeWidth="4" />
            <text x={dotX - 65} y={dotY - 20} fontFamily="JetBrains Mono" fontSize="15" fontWeight="700" fill={VIDEO_TOKENS.navyDeep}>
              Q = {flowGpm} gpm · {pSucPsig} psig
            </text>
          </svg>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ backgroundColor: VIDEO_TOKENS.paper, padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${VIDEO_TOKENS.maize}` }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>↔ Volumetric Flow (Q)</div>
              <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 24, fontWeight: 800, marginTop: 4 }}>{flowGpm} gpm</div>
            </div>
            <div style={{ backgroundColor: VIDEO_TOKENS.paper, padding: '12px 16px', borderRadius: 10, border: `1.5px solid ${VIDEO_TOKENS.maize}` }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>↔ Suction Pressure (P_suc)</div>
              <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 24, fontWeight: 800, marginTop: 4 }}>
                {pSucPsig} psig ({pSucPsia} psia)
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: VIDEO_TOKENS.navyDeep,
            color: VIDEO_TOKENS.ivory,
            borderRadius: 18,
            padding: 26,
            border: `2px solid ${VIDEO_TOKENS.maize}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 18, color: VIDEO_TOKENS.maize, fontWeight: 700 }}>
              3-STAGE WHITE-BOX PROOF CARD
            </span>
            <span
              style={{
                fontFamily: VIDEO_TOKENS.fontMono,
                fontSize: 15,
                backgroundColor: 'rgba(232,197,71,0.18)',
                color: VIDEO_TOKENS.maizeSoft,
                padding: '4px 12px',
                borderRadius: 999,
              }}
            >
              [Perry&apos;s 9th Ed., Sec. 10, p. 10-28]
            </span>
          </div>

          {[
            {
              stage: 'STAGE 1 · SYMBOLIC EQUATION',
              eq: 'NPSH_A = (P_suc,abs - P_vp) / (ρ·g) + z_s - h_f,s   (where f_D = 4·f_F)',
            },
            {
              stage: 'STAGE 2 · SUBSTITUTED WITH EXPLICIT UNITS',
              eq: `P_suc,abs = ${pSucPsig} psig + 14.696 psi = ${pSucPsia} psia · Q = ${flowGpm} gpm`,
            },
            {
              stage: 'STAGE 3 · EVALUATED ENGINEERING RESULT',
              eq: `NPSH_A = ${npshA} m  ${isSafe ? '≥ NPSH_R (3.0 m) → NO CAVITATION' : '< NPSH_R (8.0 m) → CAVITATING!'}`,
            },
          ].map((s, idx) => {
            const st = spring({ frame: frame - (8 + idx * 8), fps, config: { damping: 200 } });
            return (
              <div
                key={s.stage}
                style={{
                  backgroundColor: VIDEO_TOKENS.navy,
                  borderRadius: 12,
                  padding: '14px 18px',
                  border: `1px dashed ${VIDEO_TOKENS.maize}`,
                  opacity: st,
                }}
              >
                <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 15, color: VIDEO_TOKENS.maize, fontWeight: 700 }}>
                  {s.stage}
                </div>
                <div style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 19, color: VIDEO_TOKENS.ivory, marginTop: 6, fontWeight: 600 }}>
                  {s.eq}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SceneCaptionFooter meta={meta} bilingualSubtitles={bilingualSubtitles} />
    </AbsoluteFill>
  );
};
