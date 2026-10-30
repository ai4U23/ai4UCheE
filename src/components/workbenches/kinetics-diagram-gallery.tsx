// WB6 Diagram Gallery & Mode Switcher subcomponent (< 200 LOC).
// Keeps KineticsReactorWorkbench modular while hosting the DiagramModeBar ('all' default)
// and rendering Semenov Thermal Runaway, Series Selectivity / RTD, Butler-Volmer Polarization,
// and LHHW Catalytic Rate Roof / Decay + Monod Chemostat Bioreactor.
import React, { useState } from 'react';
import { ButlerVolmerPolarizationSvg } from '../sketches/butler-volmer-polarization-svg';
import { LhhwBioreactorSvg } from '../sketches/lhhw-bioreactor-svg';
import { SemenovThermalRunawaySvg } from '../sketches/semenov-thermal-runaway-svg';
import { SeriesSelectivityRtdSvg } from '../sketches/series-selectivity-rtd-svg';
import { DiagramModeBar, type DiagramModeOption } from '../ui/diagram-mode-bar';

export type KineticsDiagramMode =
  | 'all'
  | 'mode-semenov-rtd'
  | 'mode-lhhw-bioreactor'
  | 'mode-electro';

const WB6_MODE_OPTIONS: ReadonlyArray<DiagramModeOption<KineticsDiagramMode>> = [
  { id: 'all', label: 'All Companion Diagrams (6)', testId: 'wb6-mode-all' },
  { id: 'mode-semenov-rtd', label: 'Semenov G(T)/R(T) & Series Selectivity / RTD', testId: 'wb6-mode-semenov-rtd' },
  { id: 'mode-lhhw-bioreactor', label: 'LHHW Catalytic Roof / Decay & Monod Chemostat', testId: 'wb6-mode-lhhw-bioreactor' },
  { id: 'mode-electro', label: 'Butler-Volmer / Koutecký-Levich i(η)', testId: 'wb6-mode-electro' },
];

export interface KineticsDiagramGalleryProps {
  coolantTcK: number;
  semenovPsi: number;
  seriesTauMin: number;
  rtdTanksN: number;
  overpotentialV: number;
  iLimMaCm2: number;
  onChangeSemenov: (nextTcK: number, nextPsi: number) => void;
  onChangeTauAndTanks: (nextTauMin: number, nextTanksN: number) => void;
  onChangeElectro: (nextEtaV: number, nextILim: number) => void;
}

export const KineticsDiagramGallery: React.FC<KineticsDiagramGalleryProps> = ({
  coolantTcK,
  semenovPsi,
  seriesTauMin,
  rtdTanksN,
  overpotentialV,
  iLimMaCm2,
  onChangeSemenov,
  onChangeTauAndTanks,
  onChangeElectro,
}) => {
  const [diagramMode, setDiagramMode] = useState<KineticsDiagramMode>('all');
  const [pReactantBar, setPReactantBar] = useState<number>(2.8);
  const [catalystTimeHr, setCatalystTimeHr] = useState<number>(24);
  const [dilutionRateHr, setDilutionRateHr] = useState<number>(0.42);
  const [feedSubstrateGPerL, setFeedSubstrateGPerL] = useState<number>(14);

  const showSemenovRtd = diagramMode === 'all' || diagramMode === 'mode-semenov-rtd';
  const showLhhwBio = diagramMode === 'all' || diagramMode === 'mode-lhhw-bioreactor';
  const showElectro = diagramMode === 'all' || diagramMode === 'mode-electro';

  return (
    <div>
      <DiagramModeBar
        testId="wb6-diagram-mode-bar"
        activeMode={diagramMode}
        options={WB6_MODE_OPTIONS}
        onSelectMode={setDiagramMode}
      />

      {showSemenovRtd && (
        <div className="wb-split">
          <SemenovThermalRunawaySvg
            tcK={coolantTcK}
            semenovPsi={semenovPsi}
            onChangeSemenov={onChangeSemenov}
          />
          <SeriesSelectivityRtdSvg
            tauMin={seriesTauMin}
            tanksN={rtdTanksN}
            onChangeTauAndTanks={onChangeTauAndTanks}
          />
        </div>
      )}

      {showLhhwBio && (
        <LhhwBioreactorSvg
          pReactantBar={pReactantBar}
          catalystTimeHr={catalystTimeHr}
          dilutionRateHr={dilutionRateHr}
          feedSubstrateGPerL={feedSubstrateGPerL}
          onChangeLhhw={(np, nt) => {
            setPReactantBar(np);
            setCatalystTimeHr(nt);
          }}
          onChangeBioreactor={(nd, ns) => {
            setDilutionRateHr(nd);
            setFeedSubstrateGPerL(ns);
          }}
        />
      )}

      {showElectro && (
        <ButlerVolmerPolarizationSvg
          overpotentialV={overpotentialV}
          iLimMaCm2={iLimMaCm2}
          onChangeElectro={onChangeElectro}
        />
      )}
    </div>
  );
};
