// WB3 Diagram Gallery & Mode Switcher subcomponent (< 200 LOC).
// Keeps HydraulicsWorkbench modular while hosting the DiagramModeBar ('all' default)
// and rendering BSL Pipe Velocity/BL, ISA-75.01 Choked Valve, Shell-Tube HX/Nukiyama Boiling,
// and Crowl & Louvar Flammability Triangle / Pasquill-Gifford Plume Dispersion.
import React, { useState } from 'react';
import { BslPipeVelocityBoundarySvg } from '../sketches/bsl-pipe-velocity-boundary-svg';
import { HeatExchangerBoilingSvg } from '../sketches/heat-exchanger-boiling-svg';
import { IsaControlValveChokedSvg } from '../sketches/isa-control-valve-choked-svg';
import { ProcessSafetyFlammabilityPlumeSvg } from '../sketches/process-safety-flammability-plume-svg';
import { DiagramModeBar, type DiagramModeOption } from '../ui/diagram-mode-bar';
import { FramerEntranceStage } from '../ui/framer-motion-primitives';

export type HydraulicsDiagramMode = 'all' | 'mode-hydraulics' | 'mode-heat-boiling' | 'mode-safety';

const WB3_MODE_OPTIONS: ReadonlyArray<DiagramModeOption<HydraulicsDiagramMode>> = [
  { id: 'all', label: 'All Diagrams (6)', testId: 'wb3-mode-all' },
  { id: 'mode-hydraulics', label: 'BSL Velocity/BL & ISA Choked Valve', testId: 'wb3-mode-hydraulics' },
  { id: 'mode-heat-boiling', label: 'HX T-Q Cross (F_T) & Nukiyama Boiling', testId: 'wb3-mode-heat-boiling' },
  { id: 'mode-safety', label: 'Flammability LOC & Plume Dispersion', testId: 'wb3-mode-safety' },
];

export interface HydraulicsDiagramGalleryProps {
  powerLawN: number;
  prandtlPr: number;
  reynolds: number;
  valveDpPsi: number;
  pSuctionPsig: number;
  cvRated: number;
  onChangeRheologyAndPr: (nextN: number, nextPr: number) => void;
  onChangeValveDpPsi: (nextDpPsi: number) => void;
}

export const HydraulicsDiagramGallery: React.FC<HydraulicsDiagramGalleryProps> = ({
  powerLawN,
  prandtlPr,
  reynolds,
  valveDpPsi,
  pSuctionPsig,
  cvRated,
  onChangeRheologyAndPr,
  onChangeValveDpPsi,
}) => {
  const [diagramMode, setDiagramMode] = useState<HydraulicsDiagramMode>('all');
  const [tColdOutC, setTColdOutC] = useState<number>(88);
  const [deltaTExcessC, setDeltaTExcessC] = useState<number>(22);
  const [fuelMolPct, setFuelMolPct] = useState<number>(8.5);
  const [o2MolPct, setO2MolPct] = useState<number>(10.5);
  const [downwindDistM, setDownwindDistM] = useState<number>(450);
  const [windSpeedMs, setWindSpeedMs] = useState<number>(3.5);

  const showHydraulics = diagramMode === 'all' || diagramMode === 'mode-hydraulics';
  const showHeatBoiling = diagramMode === 'all' || diagramMode === 'mode-heat-boiling';
  const showSafety = diagramMode === 'all' || diagramMode === 'mode-safety';

  return (
    <div>
      <DiagramModeBar
        testId="wb3-diagram-mode-bar"
        activeMode={diagramMode}
        options={WB3_MODE_OPTIONS}
        onSelectMode={setDiagramMode}
      />

      {showHydraulics && (
        <FramerEntranceStage key={`wb3-hyd-${diagramMode}`} className="wb-split">
          <BslPipeVelocityBoundarySvg
            powerLawN={powerLawN}
            prandtlPr={prandtlPr}
            reynolds={reynolds}
            onChangeRheologyAndPr={onChangeRheologyAndPr}
          />
          <IsaControlValveChokedSvg
            valveDpPsi={valveDpPsi}
            pSuctionPsig={pSuctionPsig}
            cvRated={cvRated}
            onChangeValveDpPsi={onChangeValveDpPsi}
          />
        </FramerEntranceStage>
      )}

      {(showHeatBoiling || showSafety) && (
        <FramerEntranceStage key={`wb3-hb-saf-${diagramMode}`} className="wb-split" delay={0.06}>
          {showHeatBoiling && (
            <HeatExchangerBoilingSvg
              tColdOutC={tColdOutC}
              deltaTExcessC={deltaTExcessC}
              onChangeHxColdOutC={setTColdOutC}
              onChangeBoilingDeltaTC={setDeltaTExcessC}
            />
          )}
          {showSafety && (
            <ProcessSafetyFlammabilityPlumeSvg
              fuelMolPct={fuelMolPct}
              o2MolPct={o2MolPct}
              downwindDistM={downwindDistM}
              windSpeedMs={windSpeedMs}
              onChangeFlammability={(nf, no) => {
                setFuelMolPct(nf);
                setO2MolPct(no);
              }}
              onChangePlume={(nd, nw) => {
                setDownwindDistM(nd);
                setWindSpeedMs(nw);
              }}
            />
          )}
        </FramerEntranceStage>
      )}
    </div>
  );
};
