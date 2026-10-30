// WB2 Diagram Gallery & Mode Switcher subcomponent (< 200 LOC).
// Keeps ThermoDipprWorkbench modular while hosting the DiagramModeBar ('all' default)
// and rendering BinaryVleTxySvg, PengRobinsonEosSvg, and RankineRxnEquilibriumSvg.
import React, { useState } from 'react';
import { BinaryVleTxySvg } from '../sketches/binary-vle-txy-svg';
import { PengRobinsonEosSvg } from '../sketches/peng-robinson-eos-svg';
import { RankineRxnEquilibriumSvg } from '../sketches/rankine-rxn-equilibrium-svg';
import { DiagramModeBar, type DiagramModeOption } from '../ui/diagram-mode-bar';

export type ThermoDiagramMode = 'all' | 'mode-phase' | 'mode-cycles-eq';

const WB2_MODE_OPTIONS: ReadonlyArray<DiagramModeOption<ThermoDiagramMode>> = [
  { id: 'all', label: 'All Diagrams (4)', testId: 'wb2-mode-all' },
  { id: 'mode-phase', label: 'Binary VLE & Peng-Robinson EOS', testId: 'wb2-mode-phase' },
  { id: 'mode-cycles-eq', label: 'Rankine T-S Dome & Reaction X_eq(T)', testId: 'wb2-mode-cycles-eq' },
];

export interface ThermoDiagramGalleryProps {
  vleX1: number;
  vleA12: number;
  prReducedP: number;
  prReducedT: number;
  onChangeVle: (nextX1: number, nextA12: number) => void;
  onChangePrTr: (nextPr: number, nextTr: number) => void;
}

export const ThermoDiagramGallery: React.FC<ThermoDiagramGalleryProps> = ({
  vleX1,
  vleA12,
  prReducedP,
  prReducedT,
  onChangeVle,
  onChangePrTr,
}) => {
  const [diagramMode, setDiagramMode] = useState<ThermoDiagramMode>('all');
  const [etaIsentropic, setEtaIsentropic] = useState<number>(0.84);
  const [pBoilerRatio, setPBoilerRatio] = useState<number>(40);
  const [rxnTInletK, setRxnTInletK] = useState<number>(360);
  const [deltaHrxnKjMol, setDeltaHrxnKjMol] = useState<number>(-45);

  const showPhase = diagramMode === 'all' || diagramMode === 'mode-phase';
  const showCyclesEq = diagramMode === 'all' || diagramMode === 'mode-cycles-eq';

  return (
    <div>
      <DiagramModeBar
        testId="wb2-diagram-mode-bar"
        activeMode={diagramMode}
        options={WB2_MODE_OPTIONS}
        onSelectMode={setDiagramMode}
      />

      {showPhase && (
        <div className="wb-split">
          <BinaryVleTxySvg x1={vleX1} a12={vleA12} onChangeVle={onChangeVle} />
          <PengRobinsonEosSvg pr={prReducedP} tr={prReducedT} onChangePrTr={onChangePrTr} />
        </div>
      )}

      {showCyclesEq && (
        <RankineRxnEquilibriumSvg
          etaIsentropic={etaIsentropic}
          pBoilerRatio={pBoilerRatio}
          rxnTInletK={rxnTInletK}
          deltaHrxnKjMol={deltaHrxnKjMol}
          onChangeCycle={(ne, np) => {
            setEtaIsentropic(ne);
            setPBoilerRatio(np);
          }}
          onChangeRxnEq={(nt, ndh) => {
            setRxnTInletK(nt);
            setDeltaHrxnKjMol(ndh);
          }}
        />
      )}
    </div>
  );
};
