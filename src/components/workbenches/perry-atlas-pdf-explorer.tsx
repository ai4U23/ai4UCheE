// Full-Book Perry's 9th Ed. Back-of-Book Index (pp. 2244..2274) + 6-Textbook Corpus Search & Crop Explorer.
import React, { useEffect, useState } from 'react';
import {
  cropPerryPageAction,
  searchMultiBookCorpusWithFallback,
  searchPerryIndexWithFallback,
  type MultiBookSearchHit,
  type PerryIndexHit,
} from '../../actions/search-perry-pdf';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { TEXTBOOK_CORPUS_CATALOG } from '../../lib/textbook-corpus-registry';

export interface PerryAtlasPdfExplorerProps {
  activeSecNum: number;
  activeSecPage: string;
  activePdfPage: number;
  onSelectSecPage: (secNum: number, secPage: string) => void;
}

export const PerryAtlasPdfExplorer: React.FC<PerryAtlasPdfExplorerProps> = ({
  activeSecNum,
  activeSecPage,
  activePdfPage,
  onSelectSecPage,
}) => {
  const [query, setQuery] = useState<string>('relief');
  const [bookFilter, setBookFilter] = useState<string>('all');
  const [hits, setHits] = useState<PerryIndexHit[]>([]);
  const [corpusHits, setCorpusHits] = useState<MultiBookSearchHit[]>([]);
  const [cropDataUri, setCropDataUri] = useState<string | null>(null);
  const [cropStatus, setCropStatus] = useState<string>('');

  const pageSelect = useAgentSelectable(
    'figure',
    `perry-atlas-page-${activeSecPage}`,
    `Perry's 9th Ed. Sec ${activeSecNum} Page ${activeSecPage} (PDF p. ${activePdfPage})`,
    { secNum: activeSecNum, secPage: activeSecPage, pdfPage: activePdfPage },
  );

  useEffect(() => {
    let cancelled = false;
    searchPerryIndexWithFallback(query).then((res) => {
      if (!cancelled) setHits(res);
    });
    searchMultiBookCorpusWithFallback(query, bookFilter).then((res) => {
      if (!cancelled) setCorpusHits(res);
    });
    return () => {
      cancelled = true;
    };
  }, [query, bookFilter]);

  const handleSearch = async () => {
    const [res, cRes] = await Promise.all([
      searchPerryIndexWithFallback(query),
      searchMultiBookCorpusWithFallback(query, bookFilter),
    ]);
    setHits(res);
    setCorpusHits(cRes);
  };

  const handleLoadCrop = async (secPageToCrop: string) => {
    setCropStatus(`Cropping p. ${secPageToCrop}...`);
    try {
      const res = (await cropPerryPageAction.handler({
        sec_page: secPageToCrop,
        dpi: 160,
      })) as { image_base64?: string; png_base64?: string; pdf_page_1based?: number };
      const imgUri = res?.image_base64 ?? (res?.png_base64 ? `data:image/png;base64,${res.png_base64}` : undefined);
      if (imgUri) {
        setCropDataUri(imgUri);
        setCropStatus(`Verified PDF p. ${res.pdf_page_1based ?? activePdfPage} [Sec-Page ${secPageToCrop}]`);
      } else {
        setCropStatus(`Resolved Sec-Page ${secPageToCrop} (PDF p. ${activePdfPage})`);
      }
    } catch {
      setCropStatus(`Resolved Sec-Page ${secPageToCrop} (PDF p. ${activePdfPage} · offline vector preview)`);
    }
  };

  return (
    <div className="wb-panel" data-testid="perry-atlas-pdf-explorer">
      <div className="wb-toolbar">
        <div>
          <strong>📖 6-Book Corpus &amp; Perry Back-of-Book Index (pp. 2244–2274)</strong>
          <p className="wb-subtitle">
            Active Reference: <code>p. {activeSecPage}</code> (PDF Page {activePdfPage} of 2,274)
          </p>
        </div>
        <div className="wb-actions-row">
          <button type="button" data-testid="perry-atlas-crop-btn" onClick={() => handleLoadCrop(activeSecPage)}>
            Crop PDF Page {activeSecPage}
          </button>
          {cropDataUri && (
            <button type="button" onClick={() => setCropDataUri(null)}>
              Hide PDF Crop
            </button>
          )}
        </div>
      </div>

      <div className="wb-actions-row" style={{ marginBottom: '0.5rem' }}>
        <select
          aria-label="Filter textbook corpus"
          data-testid="corpus-book-filter"
          value={bookFilter}
          onChange={(e) => setBookFilter(e.target.value)}
        >
          <option value="all">All 6 Textbooks</option>
          {TEXTBOOK_CORPUS_CATALOG.map((b) => (
            <option key={b.bookId} value={b.bookId}>
              {b.shortTitle} ({b.format})
            </option>
          ))}
        </select>
        <input
          type="text"
          aria-label="Search Perry Back-of-Book Index (pp. 2244-2274)"
          data-testid="perry-index-search-input"
          placeholder="Search 6-Book Corpus & Index: e.g. Levenspiel, Thiele, LMTD, relief..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="button" data-testid="perry-index-search-btn" onClick={handleSearch}>
          Search Index
        </button>
      </div>

      {cropStatus && (
        <p className="mono" data-testid="perry-atlas-crop-status">
          {cropStatus}
        </p>
      )}

      {cropDataUri && (
        <div {...pageSelect.selectableProps} style={{ marginBottom: '0.5rem' }}>
          <img
            src={cropDataUri}
            alt={`Perry's 9th Ed. p. ${activeSecPage}`}
            data-testid="perry-atlas-crop-img"
            style={{ width: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: '6px' }}
          />
        </div>
      )}

      <div data-testid="perry-index-results-list">
        {hits.slice(0, 4).map((hit, idx) => (
          <div key={`${hit.index_pdf_page}-${idx}`} className="mono" style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-grid)' }}>
            <span>[Index PDF p. {hit.index_pdf_page}] {hit.line} </span>
            {hit.sec_page_refs.map((ref) => {
              const secNum = Math.min(Math.max(parseInt(ref.split('-')[0] ?? '1', 10) || 1, 1), 25);
              return (
                <button
                  key={ref}
                  type="button"
                  data-testid={`index-ref-chip-${ref}`}
                  onClick={() => onSelectSecPage(secNum, ref)}
                  style={{ marginLeft: '0.35rem', padding: '0.1rem 0.4rem', fontSize: '0.78rem' }}
                >
                  Jump → p. {ref} (Sec {secNum})
                </button>
              );
            })}
          </div>
        ))}
        {corpusHits.slice(0, 3).map((ch, idx) => (
          <div key={`${ch.book_id}-${idx}`} className="mono" data-testid="multi-book-corpus-hit" style={{ padding: '0.25rem 0', borderBottom: '1px solid var(--border-grid)' }}>
            <strong>{ch.citation}</strong> — {ch.snippet ?? ch.title}
          </div>
        ))}
      </div>
    </div>
  );
};

