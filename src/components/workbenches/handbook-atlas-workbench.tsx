// WB5: 25-Section Perry's 9th Ed. Interactive Atlas + Domain Solvers + Back-of-Book Index (pp. 2244..2274).
import React, { useEffect, useState } from 'react';
import { syncWorkbenchPayload } from '../../actions/view-screen';
import { usePersonaTheme } from '../../context/persona-theme-context';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { useWorkbenchMutations } from '../../hooks/use-workbench-mutations';
import { ALL_25_PERRY_SECTIONS, PERRY_CLUSTERS, getPerrySectionByNumber } from '../../lib/perry-sections/perry-atlas-registry';
import type { PerryClusterId } from '../../lib/perry-sections/perry-section-types';
import { TEXTBOOK_CORPUS_CATALOG } from '../../lib/textbook-corpus-registry';
import { PerrySectionInteractiveSvg } from '../sketches/perry-section-interactive-svg';
import { MotionPillButton, SwarmPulseDot } from '../ui/framer-motion-primitives';
import { LearnModeCallout } from '../ui/learn-mode-callout';
import { ScrubbableNumberInput } from '../ui/scrubbable-number-input';
import { WhiteBoxEquationCard } from '../ui/white-box-equation-card';
import { PerryAtlasPdfExplorer } from './perry-atlas-pdf-explorer';

export const HandbookAtlasWorkbench: React.FC = () => {
  const { personaMode, setActiveWorkbench } = usePersonaTheme();
  const [clusterFilter, setClusterFilter] = useState<PerryClusterId | 'all'>('all');
  const [secNum, setSecNum] = useState<number>(1);
  const descriptor = getPerrySectionByNumber(secNum);
  const [primaryVal, setPrimaryVal] = useState<number>(descriptor.primaryParam.defaultVal);
  const [secondaryVal, setSecondaryVal] = useState<number>(descriptor.secondaryParam.defaultVal);
  const [activeSecPage, setActiveSecPage] = useState<string>(descriptor.secPage);

  const selectSection = (nextSec: number, customPrimary?: number, customSecondary?: number, customSecPage?: string) => {
    const desc = getPerrySectionByNumber(nextSec);
    setSecNum(desc.secNum);
    setPrimaryVal(customPrimary ?? desc.primaryParam.defaultVal);
    setSecondaryVal(customSecondary ?? desc.secondaryParam.defaultVal);
    setActiveSecPage(customSecPage ?? desc.secPage);
  };

  useWorkbenchMutations('wb5-handbook-atlas', (p) => {
    if (p.secNum !== undefined) {
      const desc = getPerrySectionByNumber(Number(p.secNum));
      setSecNum(desc.secNum);
      setPrimaryVal(p.primaryVal !== undefined ? Number(p.primaryVal) : desc.primaryParam.defaultVal);
      setSecondaryVal(p.secondaryVal !== undefined ? Number(p.secondaryVal) : desc.secondaryParam.defaultVal);
      setActiveSecPage(p.secPage !== undefined ? String(p.secPage) : desc.secPage);
      return;
    }
    if (p.primaryVal !== undefined) setPrimaryVal(Number(p.primaryVal));
    if (p.secondaryVal !== undefined) setSecondaryVal(Number(p.secondaryVal));
    if (p.secPage !== undefined) setActiveSecPage(String(p.secPage));
  });

  const solved = descriptor.solve(primaryVal, secondaryVal);

  useEffect(() => {
    syncWorkbenchPayload('wb5-handbook-atlas', {
      summary: `WB5 Perry Atlas · Sec ${solved.secNum} (${solved.secTitle}): ${solved.readoutText}`,
      inputs: { secNum: solved.secNum, secPage: activeSecPage, primaryVal: solved.primaryVal, secondaryVal: solved.secondaryVal },
      metrics: { responseVal: solved.responseVal, responseUnit: solved.responseUnit, secondaryResponseVal: solved.secondaryResponseVal, isAlert: solved.isAlert },
      equations: solved.equations,
      statusBanner: solved.statusBanner,
    });
  });

  const eqSelect = useAgentSelectable('equation', `perry-sec-${solved.secNum}-eq`, `Sec ${solved.secNum}: ${solved.secTitle}`, {
    secNum: solved.secNum, secPage: activeSecPage, readout: solved.readoutText, citation: solved.citation,
  });

  const visibleSections = ALL_25_PERRY_SECTIONS.filter((s) => clusterFilter === 'all' || s.clusterId === clusterFilter);

  return (
    <section className="wb-panel" data-testid="wb5-handbook-atlas">
      <header className="wb-toolbar">
        <div>
          <h2>Subject 5 · 6-Book Chemical Engineering Corpus &amp; 25-Section Atlas</h2>
          <p className="wb-subtitle" data-testid="wb5-blended-sources-badge">
            📚 6 Blended Textbooks ({TEXTBOOK_CORPUS_CATALOG.map((b) => b.shortTitle).join(' · ')}) · All 25 Perry Sections
          </p>
        </div>
        <div className="wb-actions-row">
          <button type="button" data-testid="atlas-trap-sec11-ft" onClick={() => selectSection(11, 0.72, 1.6)}>
            ⚠️ Sec 11 LMTD F_T &lt; 0.75 Cross Trap
          </button>
          <button type="button" data-testid="atlas-trap-sec19-runaway" onClick={() => selectSection(19, 0.88, 0.52)}>
            🔥 Sec 19 Semenov Runaway Trap
          </button>
          <button type="button" data-testid="atlas-trap-sec23-psv" onClick={() => selectSection(23, 25, 18000)}>
            🚨 Sec 23 PSV psig→psia Trap
          </button>
        </div>
      </header>

      <div className="wb-actions-row" style={{ flexWrap: 'wrap', marginBottom: '0.45rem' }}>
        <MotionPillButton layoutId="wb5-cluster-pill" isActive={clusterFilter === 'all'} testId="atlas-cluster-all" onClick={() => setClusterFilter('all')}>
          All 25 Sections ({ALL_25_PERRY_SECTIONS.length})
        </MotionPillButton>
        {PERRY_CLUSTERS.map((c) => (
          <MotionPillButton key={c.id} layoutId="wb5-cluster-pill" isActive={clusterFilter === c.id} testId={`atlas-cluster-${c.id}`} onClick={() => setClusterFilter(c.id)}>
            {c.label}
          </MotionPillButton>
        ))}
      </div>

      <div className="wb-actions-row" style={{ flexWrap: 'wrap', marginBottom: '0.65rem' }} data-testid="atlas-section-pills">
        {visibleSections.map((s) => (
          <MotionPillButton key={s.secNum} layoutId="wb5-sec-pill" isActive={s.secNum === solved.secNum} testId={`atlas-sec-pill-${s.secNum}`} onClick={() => selectSection(s.secNum)}>
            Sec {s.secNum}: {s.secTitle.split('(')[0].trim()}
          </MotionPillButton>
        ))}
      </div>

      <LearnModeCallout
        workbenchId="wb5"
        title={`Sec ${solved.secNum} — ${solved.learnCallout.title}`}
        plainEnglish={solved.learnCallout.plainEnglish}
        commonTrap={solved.learnCallout.commonTrap}
        perryAnchor={solved.citation}
      />

      <div className="wb-split">
        <div>
          <ScrubbableNumberInput
            paramId={`atlas-primary-${solved.secNum}`} label={descriptor.primaryParam.label} value={solved.primaryVal}
            unit={descriptor.primaryParam.unit} min={descriptor.primaryParam.min} max={descriptor.primaryParam.max}
            step={descriptor.primaryParam.step} onChange={setPrimaryVal}
          />
          <ScrubbableNumberInput
            paramId={`atlas-secondary-${solved.secNum}`} label={descriptor.secondaryParam.label} value={solved.secondaryVal}
            unit={descriptor.secondaryParam.unit} min={descriptor.secondaryParam.min} max={descriptor.secondaryParam.max}
            step={descriptor.secondaryParam.step} onChange={setSecondaryVal}
          />

          <PerrySectionInteractiveSvg
            descriptor={descriptor} result={solved}
            onScrubParameters={(nextP, nextS) => { setPrimaryVal(nextP); setSecondaryVal(nextS); }}
          />

          <div className="wb-panel" data-testid="atlas-status-banner">
            <SwarmPulseDot tone={solved.isAlert ? 'danger' : 'emerald'} />
            <strong>{solved.isAlert ? '⚠️ Engineering Alert: ' : '✅ Operating Verdict: '}</strong>
            <span className="mono">{solved.statusBanner}</span>
            {solved.deepDiveWorkbench && (
              <button type="button" data-testid="atlas-deep-dive-btn" style={{ marginLeft: '0.75rem' }} onClick={() => setActiveWorkbench(solved.deepDiveWorkbench!)}>
                Open Dedicated Workbench ({solved.deepDiveWorkbench.toUpperCase().slice(0, 3)}) →
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="wb-panel" {...eqSelect.selectableProps}>
            {solved.equations.map((eq) => (
              <WhiteBoxEquationCard key={eq.id} equation={eq} personaMode={personaMode} />
            ))}
          </div>

          <PerryAtlasPdfExplorer
            activeSecNum={solved.secNum} activeSecPage={activeSecPage} activePdfPage={solved.pdfPage1Based}
            onSelectSecPage={(nextSec, nextRef) => selectSection(nextSec, undefined, undefined, nextRef)}
          />
        </div>
      </div>
    </section>
  );
};
