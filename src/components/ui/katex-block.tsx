// Safe KaTeX wrapper: katex.renderToString with throwOnError:false for inline & display equations.
import React, { useMemo } from 'react';
import katex from 'katex';

export interface KaTeXBlockProps {
  /** Raw LaTeX source string. */
  latex: string;
  /** Render as block-level <div> when true; inline <span> otherwise (default). */
  displayMode?: boolean;
  className?: string;
  testId?: string;
  ariaLabel?: string;
}

export const KaTeXBlock: React.FC<KaTeXBlockProps> = ({ latex, displayMode = false, className, testId, ariaLabel }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, { displayMode, throwOnError: false, output: 'htmlAndMathml' });
    } catch {
      return '';
    }
  }, [latex, displayMode]);
  const Tag = displayMode ? 'div' : 'span';
  return (
    <Tag
      className={`katex-block ${className ?? ''}`.trim()}
      data-testid={testId ?? 'katex-rendered'}
      aria-label={ariaLabel ?? latex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
