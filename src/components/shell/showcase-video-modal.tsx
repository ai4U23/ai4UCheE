// Showcase & Video Guide Modal (`🎬 Guide` — English-only):
// Introduces ai4UCheE's features, plays the Remotion user-guide video (/ai4uchee-guide.mp4),
// provides an interactive 5-step walkthrough, and links to the standalone /showcase.html page.
import React, { useState } from 'react';
import type { WorkbenchId } from '../../context/persona-theme-context';
import { FramerModalShell } from '../ui/framer-motion-primitives';

const GUIDE_CHAPTERS: ReadonlyArray<{
  step: string;
  timeSec: number;
  title: string;
  desc: string;
  targetWb?: WorkbenchId;
}> = [
  {
    step: '01 · 3-Zone Studio',
    timeSec: 0,
    title: '1 Bar · 1 Canvas · 1 AI Co-Pilot',
    desc: 'Blend 6 canonical ChE textbooks (Perry 9e, Fogler 7e, BSL, SVNA, Seader, Crowl) with 55+ live SVG nomographs.',
  },
  {
    step: '02 · 5 Subject Labs',
    timeSec: 3,
    title: 'Switch 🎓 Learn ↔ 🏭 Plant Across 5 Labs',
    desc: 'Explore Thermodynamics (WB2), Hydraulics (WB3), Separations (WB4), Kinetics (WB6), and the 25-Sec Atlas (WB5).',
    targetWb: 'wb2-thermo-dippr',
  },
  {
    step: '03 · 24 Plant Problems',
    timeSec: 6,
    title: '6-Stage Fogler & LeBlanc Troubleshooting (L1–L4)',
    desc: 'Diagnose plant telemetry, apply K-T IS/IS NOT, and Prove ✅ / Disprove ❌ hypotheses (Rule #12).',
    targetWb: 'wb3-hydraulics',
  },
  {
    step: '04 · White-Box Proofs',
    timeSec: 9,
    title: 'Scrub SVG Curves & 3-Stage KaTeX Proofs',
    desc: 'Drag operating points with automatic guardrails for Fanning vs. Darcy (f_D = 4·f_F) and psig ↔ psia.',
    targetWb: 'wb4-distillation',
  },
  {
    step: '05 · Co-Pilot & QA/QC',
    timeSec: 12,
    title: '+ Ask Chips, What-If Mutations & EPC Calc Sheet',
    desc: 'Attach equipment chips, mutate sliders in plain English, and compile a print-ready Rev 0 QA/QC sheet.',
    targetWb: 'wb6-kinetics-reactors',
  },
];

export interface ShowcaseVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkbench?: (wb: WorkbenchId) => void;
}

export const ShowcaseVideoModal: React.FC<ShowcaseVideoModalProps> = ({ isOpen, onClose, onSelectWorkbench }) => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  if (!isOpen) return null;

  const jumpToChapter = (idx: number) => {
    setActiveIdx(idx);
    const v = videoRef.current;
    if (v) {
      v.currentTime = GUIDE_CHAPTERS[idx].timeSec;
      try { const p = v.play?.(); if (p && typeof p.catch === 'function') p.catch(() => {}); } catch { /* jsdom */ }
    }
  };

  const active = GUIDE_CHAPTERS[activeIdx];

  return (
    <FramerModalShell
      backdropTestId="showcase-modal-backdrop"
      dialogTestId="showcase-video-modal"
      ariaLabel="ai4UCheE Feature Tour & Remotion Video Guide"
      onClose={onClose}
    >
      <div className="wb-toolbar modal-sticky-header">
        <div>
          <h2 style={{ margin: 0 }}>🎬 ai4UCheE — Feature Showcase &amp; Interactive Video Guide</h2>
          <p className="wb-subtitle">
            6 Canonical Textbooks · 55+ Interactive SVG Charts · 24 Real-Life Plant Problems · Remotion Walkthrough
          </p>
        </div>
        <div className="wb-actions-row">
          <a
            href="/showcase.html"
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
            ✨ Open Full Showcase Page ↗
          </a>
          <button type="button" data-testid="close-showcase-modal-btn" onClick={onClose}>
            ✕ Close
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 1fr)', gap: '0.85rem', marginTop: '0.6rem' }}>
        <div style={{ background: 'var(--navy-deep)', borderRadius: 10, padding: '0.55rem', border: '1px solid var(--maize)' }}>
          <video
            ref={videoRef}
            src="/ai4uchee-guide.mp4"
            controls
            playsInline
            preload="metadata"
            data-testid="remotion-guide-video"
            style={{ width: '100%', borderRadius: 8, display: 'block', background: '#071a33' }}
          />
          <div style={{ color: 'var(--ivory)', padding: '0.45rem 0.35rem 0.15rem', fontSize: '0.82rem' }}>
            <strong style={{ color: 'var(--maize)' }}>{active.step}:</strong> {active.title} —{' '}
            <span style={{ color: 'var(--maize-soft)' }}>{active.desc}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {GUIDE_CHAPTERS.map((ch, idx) => (
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
                    Open Lab →
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
