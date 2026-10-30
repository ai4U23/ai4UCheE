// WB4 Diagram Gallery & Mode Switcher subcomponent (< 200 LOC).
// Keeps DistillationWorkbench modular while hosting the DiagramModeBar ('all' default)
// and rendering McCabe-Thiele + Fair Column Flooding, Kremser Absorption + Ternary LLE/Adsorption,
// and Psychrometric Humidification + Membrane Gas Permeation.
import React, { useState } from 'react';
import { ColumnFloodingSvgSketch } from '../sketches/column-flooding-svg-sketch';
import { KremserAbsorptionSvg } from '../sketches/kremser-absorption-svg';
import { McCabeThieleSvgCanvas } from '../sketches/mccabe-thiele-svg-canvas';
import { PsychrometricMembraneSvg } from '../sketches/psychrometric-membrane-svg';
import { TernaryLleBreakthroughSvg } from '../sketches/ternary-lle-breakthrough-svg';
import { DiagramModeBar, type DiagramModeOption } from '../ui/diagram-mode-bar';
import { FramerEntranceStage } from '../ui/framer-motion-primitives';

export type DistillationDiagramMode =
  | 'all'
  | 'mode-distillation'
  | 'mode-kremser-lle'
  | 'mode-psychrometry-membrane';

const WB4_MODE_OPTIONS: ReadonlyArray<DiagramModeOption<DistillationDiagramMode>> = [
  { id: 'all', label: 'All Diagrams (6)', testId: 'wb4-mode-all' },
  { id: 'mode-distillation', label: 'McCabe-Thiele & Fair Column Flooding', testId: 'wb4-mode-distillation' },
  { id: 'mode-kremser-lle', label: 'Kremser Absorption & Ternary LLE / Adsorption', testId: 'wb4-mode-kremser-lle' },
  { id: 'mode-psychrometry-membrane', label: 'Psychrometric Chart & Membrane Permeation', testId: 'wb4-mode-psychrometry-membrane' },
];

export interface DistillationDiagramGalleryProps {
  alpha: number;
  xf: number;
  xd: number;
  xb: number;
  q: number;
  rOp: number;
  rMin: number;
  rMult: number;
  colDiamM: number;
  traySpacingM: number;
  totalStages: number;
  feedStage: number;
  fLv: number;
  cSbMs: number;
  floodPercent: number;
  dpPackingMmH2oM: number;
  absorptionA: number;
  recoveryFrac: number;
  soluteFeedZ: number;
  peNumber: number;
  onChangeQ: (nextQ: number) => void;
  onChangeXd: (nextXd: number) => void;
  onChangeXf: (nextXf: number) => void;
  onChangeXb: (nextXb: number) => void;
  onChangeRMult: (nextRMult: number) => void;
  onChangeColDiamM: (nextD: number) => void;
  onChangeTraySpacingM: (nextH: number) => void;
  onChangeKremser: (nextA: number, nextRecovery: number) => void;
  onChangeLleAndPe: (nextZ: number, nextPe: number) => void;
}

export const DistillationDiagramGallery: React.FC<DistillationDiagramGalleryProps> = ({
  alpha,
  xf,
  xd,
  xb,
  q,
  rOp,
  rMin,
  rMult,
  colDiamM,
  traySpacingM,
  totalStages,
  feedStage,
  fLv,
  cSbMs,
  floodPercent,
  dpPackingMmH2oM,
  absorptionA,
  recoveryFrac,
  soluteFeedZ,
  peNumber,
  onChangeQ,
  onChangeXd,
  onChangeXf,
  onChangeXb,
  onChangeRMult,
  onChangeColDiamM,
  onChangeTraySpacingM,
  onChangeKremser,
  onChangeLleAndPe,
}) => {
  const [diagramMode, setDiagramMode] = useState<DistillationDiagramMode>('all');
  const [tDryBulbC, setTDryBulbC] = useState<number>(32.0);
  const [relHumidityPct, setRelHumidityPct] = useState<number>(48);
  const [stageCutTheta, setStageCutTheta] = useState<number>(0.35);
  const [selectivityAlpha, setSelectivityAlpha] = useState<number>(6.5);

  const showDistillation = diagramMode === 'all' || diagramMode === 'mode-distillation';
  const showKremserLle = diagramMode === 'all' || diagramMode === 'mode-kremser-lle';
  const showPsychMembrane = diagramMode === 'all' || diagramMode === 'mode-psychrometry-membrane';

  return (
    <div>
      <DiagramModeBar
        testId="wb4-diagram-mode-bar"
        activeMode={diagramMode}
        options={WB4_MODE_OPTIONS}
        onSelectMode={setDiagramMode}
      />

      {showDistillation && (
        <FramerEntranceStage key={`wb4-dist-${diagramMode}`} className="wb-split">
          <McCabeThieleSvgCanvas
            alpha={alpha} xf={xf} xd={xd} xb={xb} q={q} rOp={rOp} rMin={rMin}
            onChangeQ={onChangeQ} onChangeXd={onChangeXd} onChangeXf={onChangeXf}
            onChangeXb={onChangeXb} onChangeRMult={onChangeRMult}
          />
          <ColumnFloodingSvgSketch
            columnDiameterM={colDiamM} traySpacingM={traySpacingM} totalStages={totalStages}
            feedStage={feedStage} fLv={fLv} cSbMs={cSbMs}
            percentFlood={floodPercent} dpPackingMmH2oM={dpPackingMmH2oM} rMult={rMult}
            onChangeColDiamM={onChangeColDiamM} onChangeTraySpacingM={onChangeTraySpacingM}
            onChangeRMult={onChangeRMult}
          />
        </FramerEntranceStage>
      )}

      {showKremserLle && (
        <FramerEntranceStage key={`wb4-krem-${diagramMode}`} className="wb-split" delay={0.06}>
          <KremserAbsorptionSvg
            absorptionA={absorptionA} recoveryFrac={recoveryFrac}
            onChangeKremser={onChangeKremser}
          />
          <TernaryLleBreakthroughSvg
            soluteFeedZ={soluteFeedZ} peNumber={peNumber}
            onChangeLleAndPe={onChangeLleAndPe}
          />
        </FramerEntranceStage>
      )}

      {showPsychMembrane && (
        <FramerEntranceStage key={`wb4-psych-${diagramMode}`} delay={0.12}>
          <PsychrometricMembraneSvg
            tDryBulbC={tDryBulbC}
            relHumidityPct={relHumidityPct}
            stageCutTheta={stageCutTheta}
            selectivityAlpha={selectivityAlpha}
            onChangePsychrometry={(nt, nrh) => {
              setTDryBulbC(nt);
              setRelHumidityPct(nrh);
            }}
            onChangeMembrane={(nth, na) => {
              setStageCutTheta(nth);
              setSelectivityAlpha(na);
            }}
          />
        </FramerEntranceStage>
      )}
    </div>
  );
};
