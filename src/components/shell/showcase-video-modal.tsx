// Showcase & Video Guide Modal (`🎬 Guide` — Bilingual EN/VI):
// Introduces ai4UCheE's features, plays the Remotion user-guide video (/ai4uchee-guide.mp4),
// provides an interactive 5-step walkthrough, and links to the standalone /showcase.html page.
import React, { useState } from 'react';
import type { WorkbenchId } from '../../context/persona-theme-context';
import { getUiSubcomponentCopy } from '../../lib/i18n/vi-ui-subcomponents';
import { FramerModalShell } from '../ui/framer-motion-primitives';

export interface ShowcaseVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkbench?: (wb: WorkbenchId) => void;
}

export const ShowcaseVideoModal: React.FC<ShowcaseVideoModalProps> = ({ isOpen, onClose, onSelectWorkbench }) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const ui = getUiSubcomponentCopy();
  const chapters = ui.guideChapters;

  if (!isOpen) return null;

  const jumpToChapter = (idx: number) => {
    setActiveIdx(idx);
    const v = videoRef.current;
    if (v) {
      v.currentTime = chapters[idx].timeSec;
      try { const p = v.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {}); } catch { /* jsdom */ }
    }
  };

  const active = chapters[activeIdx] ?? chapters[0];

  return (
    <FramerModalShell
      backdropTestId="showcase-modal-backdrop"
      dialogTestId="showcase-video-modal"
      ariaLabel="ai4UCheE Feature Tour & Remotion Video Guide"
      onClose={onClose}
    >
      <div className="wb-toolbar modal-sticky-header">
        <div>
          <h2 style={{ margin: 0 }}>{ui.guideModalTitle}</h2>
          <p className="wb-subtitle">{ui.guideModalSub}</p>
        </div>
        <div className="wb-actions-row">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            data-testid="open-full-showcase-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.3rem 0.65rem',
              borderRadius: 7,
              background: 'var(--maize)',
              color: 'var(--navy-deep)',
              fontWeight: 700,
              fontSize: '0.8rem',
              textDecoration: 'none',
            }}
          >
            {ui.guideOpenShowcaseBtn}
          </a>
          <button type="button" data-testid="close-showcase-modal-btn" onClick={onClose}>
            {ui.guideCloseBtn}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: '0.85rem', marginTop: '0.6rem' }}>
        <div style={{ background: 'var(--navy-deep)', borderRadius: 10, padding: '0.55rem', border: '1px solid var(--maize)' }}>
          <video
            ref={videoRef}
            src="/ai4uchee-guide.mp4"
            poster="/ai4uchee-guide-poster.svg"
            controls
            playsInline
            preload="metadata"
            data-testid="remotion-guide-video"
            style={{ width: '100%', borderRadius: 8, display: 'block', background: '#071a33' }}
          >
            <track kind="captions" src="/ai4uchee-guide-en.vtt" srcLang="en" label="English" default />
            <track kind="captions" src="/ai4uchee-guide-vi.vtt" srcLang="vi" label="Tiếng Việt" />
          </video>
          <div style={{ color: 'var(--ivory)', padding: '0.45rem 0.35rem 0.15rem', fontSize: '0.82rem' }}>
            <strong style={{ color: 'var(--maize)' }}>{active.step}:</strong> {active.title} —{' '}
            <span style={{ color: 'var(--maize-soft)' }}>{active.desc}</span>
          </div>
          <details data-testid="video-transcript-disclosure" style={{ color: 'var(--ivory)', fontSize: '0.75rem', padding: '0.2rem 0.35rem' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--maize-soft)' }}>Transcript / Phụ đề (0:00–0:15)</summary>
            <ol style={{ margin: '0.3rem 0 0 1.1rem', padding: 0 }}>
              {chapters.map((ch) => (
                <li key={ch.step}><strong>{ch.step} ({ch.timeSec}s) — {ch.title}:</strong> {ch.desc}</li>
              ))}
            </ol>
          </details>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {chapters.map((ch, idx) => (
            <div
              key={ch.step}
              data-testid={`guide-chapter-${idx + 1}`}
              onClick={() => jumpToChapter(idx)}
              style={{
                padding: '0.55rem 0.7rem',
                borderRadius: 8,
                cursor: 'pointer',
                background: idx === activeIdx ? 'rgba(232, 197, 71, 0.18)' : 'var(--bg-elevated)',
                border: idx === activeIdx ? '1.5px solid var(--maize)' : '1px solid var(--border-grid)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem' }}>
                <strong style={{ fontSize: '0.82rem' }}>
                  {ch.step} · {ch.title}
                </strong>
                {ch.targetWb && onSelectWorkbench && (
                  <button
                    type="button"
                    data-testid={`guide-open-lab-${idx + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWorkbench(ch.targetWb!);
                      onClose();
                    }}
                    style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem' }}
                  >
                    {ui.guideOpenLabBtn}
                  </button>
                )}
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.76rem', color: 'var(--ink-muted)' }}>{ch.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </FramerModalShell>
  );
};
