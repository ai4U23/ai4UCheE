// Shared header & footer chrome for Remotion user-guide scenes (keeps all scene files < 200 LOC).
import React from 'react';
import { interpolate } from 'remotion';
import { VIDEO_TOKENS } from './theme-tokens';

export interface SceneMetaItem {
  step: string;
  titleEn: string;
  titleVi: string;
  captionEn: string;
  captionVi: string;
}

export const SceneHeaderBar: React.FC<{
  meta: SceneMetaItem;
  bilingualSubtitles: boolean;
  enterProgress: number;
  isHero?: boolean;
}> = ({ meta, bilingualSubtitles, enterProgress, isHero = false }) => (
  <div
    style={{
      opacity: enterProgress,
      transform: `translateY(${interpolate(enterProgress, [0, 1], [16, 0])}px)`,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span
        style={{
          fontFamily: VIDEO_TOKENS.fontMono,
          fontSize: 20,
          fontWeight: 700,
          color: VIDEO_TOKENS.navyDeep,
          backgroundColor: VIDEO_TOKENS.maize,
          padding: '6px 16px',
          borderRadius: 999,
        }}
      >
        {meta.step}
      </span>
      <span style={{ fontFamily: VIDEO_TOKENS.fontMono, fontSize: 19, color: VIDEO_TOKENS.inkMuted }}>
        chemeng.ai4u.now · DoF = 0 Verified
      </span>
    </div>
    <h2
      style={{
        fontFamily: VIDEO_TOKENS.fontDisplay,
        fontSize: isHero ? 60 : 54,
        fontWeight: 700,
        margin: '10px 0 4px',
        letterSpacing: '-0.02em',
      }}
    >
      {isHero ? `ai4UCheE — ${meta.titleEn}` : meta.titleEn}
    </h2>
    {bilingualSubtitles && (
      <p style={{ fontSize: 24, color: VIDEO_TOKENS.inkMuted, margin: 0, fontWeight: 600 }}>{meta.titleVi}</p>
    )}
  </div>
);

export const SceneCaptionFooter: React.FC<{
  meta: SceneMetaItem;
  bilingualSubtitles: boolean;
}> = ({ meta, bilingualSubtitles }) => (
  <div
    style={{
      backgroundColor: VIDEO_TOKENS.navyDeep,
      color: VIDEO_TOKENS.ivory,
      borderRadius: 14,
      padding: '15px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      borderLeft: `6px solid ${VIDEO_TOKENS.maize}`,
    }}
  >
    <div style={{ fontSize: 23, fontWeight: 700 }}>{meta.captionEn}</div>
    {bilingualSubtitles && <div style={{ fontSize: 19, color: VIDEO_TOKENS.maizeSoft }}>{meta.captionVi}</div>}
  </div>
);
