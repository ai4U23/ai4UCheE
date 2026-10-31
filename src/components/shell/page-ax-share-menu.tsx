// PageAxShareMenu: Compact AX/GEO action group ("Copy Page Markdown · View as Markdown · Copy URL · Open in ChatGPT/Claude/Perplexity · Share")
// Starts clipboard writes synchronously inside the click gesture (Safari-safe ClipboardItem + writeText fallback)
// and carries only public page URL / public markdown summary.
import React, { useState } from 'react';
import { getClientAppState } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';

const CANONICAL_URL = 'https://chemeng.ai4u.now/';
const MARKDOWN_TWIN_URL = 'https://chemeng.ai4u.now/index.md';

export const PageAxShareMenu: React.FC = () => {
  const { activeWorkbench, personaMode } = usePersonaTheme();
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
    return [
      `# ai4UCheE — ChemEng's Intelligent Workbench`,
      `Canonical URL: ${CANONICAL_URL}`,
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
          () => announce('Copied Markdown'),
          () => {
            void navigator.clipboard.writeText(fallbackMd);
            announce('Copied Markdown');
          },
        );
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(fallbackMd);
        announce('Copied Markdown');
        return;
      }
    } catch {
      // Fallback announcement below
    }
    announce('Copied Markdown');
  };

  const handleCopyUrl = () => {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        void navigator.share({
          title: "ai4UCheE — ChemEng's Intelligent Workbench",
          text: '6-Book Chemical Engineering Solver & AI Co-Pilot',
          url: CANONICAL_URL,
        }).catch(() => {});
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(CANONICAL_URL);
      }
    } catch {
      // ignore in headless/non-secure contexts
    }
    announce('Copied URL');
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
        🔗 Share / AI {open ? '▴' : '▾'}
      </button>
      <span role="status" aria-live="polite" className="ax-share-toast" data-testid="ax-share-toast">
        {toast}
      </span>
      {open && (
        <div className="ax-share-popover" role="menu" aria-label="Page Markdown and AI Actions">
          <button type="button" role="menuitem" data-testid="ax-copy-markdown-btn" onClick={handleCopyMarkdown}>
            <span>📋 Copy Page (Markdown)</span>
          </button>
          <a
            role="menuitem"
            href="/index.md"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="ax-view-markdown-link"
            onClick={() => setOpen(false)}
          >
            <span>📄 View as Markdown</span>
            <span>↗</span>
          </a>
          <button type="button" role="menuitem" data-testid="ax-copy-url-btn" onClick={handleCopyUrl}>
            <span>🔗 Copy Canonical URL</span>
          </button>
          <a
            role="menuitem"
            href={`https://chatgpt.com/?hints=search&prompt=${aiPrompt}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="ax-open-chatgpt-link"
          >
            <span>💬 Open in ChatGPT</span>
            <span>↗</span>
          </a>
          <a
            role="menuitem"
            href={`https://claude.ai/new?q=${aiPrompt}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="ax-open-claude-link"
          >
            <span>🧠 Open in Claude</span>
            <span>↗</span>
          </a>
          <a
            role="menuitem"
            href={`https://www.perplexity.ai/search?q=${aiPrompt}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="ax-open-perplexity-link"
          >
            <span>🔎 Open in Perplexity</span>
            <span>↗</span>
          </a>
        </div>
      )}
    </div>
  );
};
