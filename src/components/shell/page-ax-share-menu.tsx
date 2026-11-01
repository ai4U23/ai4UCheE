// PageAxShareMenu: Compact AX/GEO action group ("Copy Page Markdown · View as Markdown · Copy URL · Open in ChatGPT/Claude/Perplexity · Share")
// Starts clipboard writes synchronously inside the click gesture (Safari-safe ClipboardItem + writeText fallback)
// and carries only public page URL / public markdown summary.
import React, { useState } from 'react';
import { getClientAppState } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { getShellCopy } from '../../lib/i18n/vi-shell-dictionary';

const ROOT_CANONICAL_URL = 'https://chemeng.ai4u.now/';
const APP_CANONICAL_URL = 'https://chemeng.ai4u.now/app';
const MARKDOWN_TWIN_URL = 'https://chemeng.ai4u.now/index.md';

function resolveCurrentCanonicalUrl(): string {
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/app') || window.location.pathname.startsWith('/workbench'))) {
    return APP_CANONICAL_URL;
  }
  return ROOT_CANONICAL_URL;
}

export const PageAxShareMenu: React.FC = () => {
  const { activeWorkbench, personaMode, locale } = usePersonaTheme();
  const t = getShellCopy(locale);
  const [open, setOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string>('');

  const announce = (msg: string) => {
    setToast(msg);
    if (typeof window !== 'undefined') {
      window.setTimeout(() => setToast(''), 2600);
    }
  };

  const buildPublicMarkdownSnapshot = (): string => {
    const state = getClientAppState();
    const summary = String(state.payload?.summary ?? `${activeWorkbench} (${personaMode} mode)`);
    const status = String(state.payload?.statusBanner ?? 'Ready');
    const canonicalUrl = resolveCurrentCanonicalUrl();
    return [
      `# ai4UCheE — ChemEng's Intelligent Workbench`,
      `Canonical URL: ${canonicalUrl}`,
      `Markdown Twin: ${MARKDOWN_TWIN_URL}`,
      `Active Workbench: ${activeWorkbench} (${personaMode === 'learn' ? 'Learn Mode' : 'Plant Mode'})`,
      `Summary: ${summary}`,
      `Verdict: ${status}`,
    ].join('\n');
  };

  const handleCopyMarkdown = () => {
    const fallbackMd = buildPublicMarkdownSnapshot();
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        const textPromise = fetch('/index.md')
          .then((r) => (r.ok ? r.text() : fallbackMd))
          .catch(() => fallbackMd)
          .then((md) => new Blob([`${fallbackMd}\n\n---\n\n${md}`], { type: 'text/plain' }));
        void navigator.clipboard.write([new ClipboardItem({ 'text/plain': textPromise })]).then(
          () => announce(t.copiedMarkdownToast),
          () => {
            void navigator.clipboard.writeText(fallbackMd).catch(() => {});
            announce(t.copiedMarkdownToast);
          },
        );
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(fallbackMd).catch(() => {});
        announce(t.copiedMarkdownToast);
        return;
      }
    } catch {
      // Fallback announcement below
    }
    announce(t.copiedMarkdownToast);
  };

  const handleCopyUrl = () => {
    const canonicalUrl = resolveCurrentCanonicalUrl();
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        void navigator.share({
          title: "ai4UCheE — ChemEng's Intelligent Workbench",
          text: '6-Book Chemical Engineering Solver & AI Co-Pilot',
          url: canonicalUrl,
        }).catch(() => {});
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(canonicalUrl).catch(() => {});
      }
    } catch {
      // ignore in headless/non-secure contexts
    }
    announce(t.copiedUrlToast);
  };

  const aiPrompt = encodeURIComponent(
    `Read ${MARKDOWN_TWIN_URL} (ai4UCheE — ChemEng's Intelligent Workbench, active lab: ${activeWorkbench}). Help me analyze this chemical engineering problem with explicit psig/psia and Fanning/Darcy guardrails.`,
  );

  return (
    <div className="ax-share-wrap" data-testid="page-ax-share-menu">
      <button
        type="button"
        data-testid="toggle-ax-share-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        title="Copy page as Markdown, copy canonical URL, or open in ChatGPT, Claude, or Perplexity"
        onClick={() => setOpen(!open)}
      >
        {t.shareBtn} {open ? '▴' : '▾'}
      </button>
      <span role="status" aria-live="polite" className="ax-share-toast" data-testid="ax-share-toast">
        {toast}
      </span>
      {open && (
        <div className="ax-share-popover" role="menu" aria-label="Page Markdown and AI Actions">
          <button type="button" role="menuitem" data-testid="ax-copy-markdown-btn" onClick={handleCopyMarkdown}>
            <span>{t.copyMarkdownLabel}</span>
          </button>
          <a
            role="menuitem"
            href="/index.md"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="ax-view-markdown-link"
            onClick={() => setOpen(false)}
          >
            <span>{t.viewMarkdownLabel}</span>
            <span>↗</span>
          </a>
          <button type="button" role="menuitem" data-testid="ax-copy-url-btn" onClick={handleCopyUrl}>
            <span>{t.copyUrlLabel}</span>
          </button>
          <a
            role="menuitem"
            href={`https://chatgpt.com/?hints=search&prompt=${aiPrompt}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="ax-open-chatgpt-link"
          >
            <span>{locale === 'vi' ? 'Mở trong ChatGPT' : 'Open in ChatGPT'}</span>
            <span>↗</span>
          </a>
          <a
            role="menuitem"
            href={`https://claude.ai/new?q=${aiPrompt}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="ax-open-claude-link"
          >
            <span>{locale === 'vi' ? 'Mở trong Claude' : 'Open in Claude'}</span>
            <span>↗</span>
          </a>
          <a
            role="menuitem"
            href={`https://www.perplexity.ai/search?q=${aiPrompt}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="ax-open-perplexity-link"
          >
            <span>{locale === 'vi' ? 'Mở trong Perplexity' : 'Open in Perplexity'}</span>
            <span>↗</span>
          </a>
        </div>
      )}
    </div>
  );
};
