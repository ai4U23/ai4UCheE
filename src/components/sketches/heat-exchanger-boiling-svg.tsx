// Subject 2 (WB3) Interactive Companion Diagram 3:
// Shell-and-Tube Heat Exchanger T-Q Temperature Cross & Bowman F_T Chart + Nukiyama Pool Boiling Curve q''(DeltaT_excess)
// (BSL 2nd Ed. Ch. 10, 12, 14 · Perry's 9th Ed. Sec. 5 & Sec. 11, Fig. 11-3).
import React, { useRef } from 'react';
import { useAgentSelectable } from '../../hooks/use-agent-selectable';
import { solveHeatExchangerAndBoiling } from '../../lib/hydraulics-heat-safety-math';
import { clientPointToViewBox, safeSetPointerCapture, type ViewBoxRect } from '../../lib/svg-drag-math';

export interface HeatExchangerBoilingSvgProps {
  tColdOutC: number;
  deltaTExcessC: number;
  onChangeHxColdOutC: (nextTColdOutC: number) => void;
  onChangeBoilingDeltaTC: (nextDeltaTExcessC: number) => void;
}

const HX_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 46, plotY: 28, plotW: 225, plotH: 150 };
const BOIL_BOX: ViewBoxRect = { width: 580, height: 215, plotX: 320, plotY: 28, plotW: 224, plotH: 150 };

export const HeatExchangerBoilingSvg: React.FC<HeatExchangerBoilingSvgProps> = ({
  tColdOutC,
  deltaTExcessC,
  onChangeHxColdOutC,
  onChangeBoilingDeltaTC,
}) => {
  const dragSideRef = useRef<'hx' | 'boil' | null>(null);
  const hb = solveHeatExchangerAndBoiling(tColdOutC, deltaTExcessC);

  const hxSelect = useAgentSelectable(
    'figure',
    'perry-hx-temperature-cross-nukiyama',
    `Perry Sec. 11 / BSL Ch. 14 Shell-Tube HX (T_c,out=${hb.tColdOutC}°C, F_T=${hb.bowmanFt.toFixed(3)}) & Nukiyama Boiling (ΔT_e=${hb.deltaTExcessC}°C, ${hb.boilingRegime})`,
    {
      tColdOutC: hb.tColdOutC,
      lmtdCounterC: hb.lmtdCounterC,
      bowmanFt: hb.bowmanFt,
      hasTemperatureCross: hb.hasTemperatureCross,
      isFtUnacceptable: hb.isFtUnacceptable,
      deltaTExcessC: hb.deltaTExcessC,
      qFluxWm2: hb.qFluxWm2,
      boilingRegime: hb.boilingRegime,
    },
  );

  const toQX = (q: number) => HX_BOX.plotX + q * HX_BOX.plotW;
  const toTY = (tC: number) => HX_BOX.plotY + (1 - Math.min(Math.max((tC - 20) / 150, 0), 1)) * HX_BOX.plotH;
  const hotPoly = hb.hxProfilePts.map((pt) => `${toQX(pt.qNorm).toFixed(1)},${toTY(pt.tHotC).toFixed(1)}`).join(' ');
  const coldPoly = hb.hxProfilePts.map((pt) => `${toQX(pt.qNorm).toFixed(1)},${toTY(pt.tColdC).toFixed(1)}`).join(' ');

  const minLogDte = Math.log10(1.5);
  const maxLogDte = Math.log10(450);
  const toBoilX = (dTeC: number) =>
    BOIL_BOX.plotX + ((Math.log10(Math.max(dTeC, 1.5)) - minLogDte) / (maxLogDte - minLogDte)) * BOIL_BOX.plotW;
  const toBoilY = (log10Q: number) =>
    BOIL_BOX.plotY + (1 - Math.min(Math.max((log10Q - 3.3) / 3.0, 0), 1)) * BOIL_BOX.plotH;
  const nukiyamaPoly = hb.nukiyamaPts.map((pt) => `${toBoilX(pt.dTeC).toFixed(1)},${toBoilY(pt.log10Q).toFixed(1)}`).join(' ');

  const scrubFromPointer = (e: React.PointerEvent<SVGSVGElement>, side: 'hx' | 'boil') => {
    if (side === 'hx') {
      const pt = clientPointToViewBox(e, e.currentTarget, HX_BOX);
      const nextTcOut = Number((50 + (1 - pt.v) * 88).toFixed(0));
      onChangeHxColdOutC(nextTcOut);
    } else {
      const pt = clientPointToViewBox(e, e.currentTarget, BOIL_BOX);
      const logDte = minLogDte + pt.u * (maxLogDte - minLogDte);
      const nextDte = Number(Math.pow(10, logDte).toFixed(1));
      onChangeBoilingDeltaTC(nextDte);
    }
  };

  return (
    <div className="wb-panel" {...hxSelect.selectableProps} data-testid="wb3-hx-boiling-container">
      <div className="wb-toolbar" style={{ marginBottom: '0.3rem' }}>
        <strong>🔥 Perry Sec. 11 / BSL Ch. 14 Shell-and-Tube T-Q Cross (Bowman F_T) &amp; Nukiyama Pool Boiling</strong>
        <span className="mono" data-testid="wb3-hx-boiling-readout">
          T_c,out={hb.tColdOutC}°C (T_h,out={hb.tHotOutC}°C) → LMTD={hb.lmtdCounterC}°C, F_T={hb.bowmanFt.toFixed(3)}{' '}
          {hb.isFtUnacceptable ? '⚠️ F_T < 0.75 CROSS TRAP' : '✅ F_T OK'} · ΔT_e={hb.deltaTExcessC}°C → q&prime;&prime;={(hb.qFluxWm2 / 1e3).toFixed(1)} kW/m² ({hb.boilingRegime})
        </span>
      </div>
      <svg
        viewBox="0 0 580 215" width="100%" height="210" role="img"
        aria-label="Shell and Tube Heat Exchanger Temperature Cross and Nukiyama Pool Boiling Curve"
        data-testid="wb3-hx-boiling-svg"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          const probe = clientPointToViewBox(e, e.currentTarget, HX_BOX);
          const side = probe.vx < 295 ? 'hx' : 'boil';
          dragSideRef.current = side;
          safeSetPointerCapture(e.currentTarget, e.pointerId);
          scrubFromPointer(e, side);
        }}
        onPointerMove={(e) => {
          if (dragSideRef.current) {
            const probe = clientPointToViewBox(e, e.currentTarget, HX_BOX);
            scrubFromPointer(e, probe.vx < 295 ? 'hx' : 'boil');
          }
        }}
        onPointerUp={() => { dragSideRef.current = null; }}
        onPointerCancel={() => { dragSideRef.current = null; }}
      >
        {/* Left Panel: Shell-and-Tube T-Q Temperature Cross & Bowman F_T */}
        <rect x={HX_BOX.plotX} y={HX_BOX.plotY} width={HX_BOX.plotW} height={HX_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={HX_BOX.plotX + 6} y={HX_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          1-2 HX T-Q Profile &amp; Bowman F_T [Perry Sec. 11]
        </text>
        <line
          x1={HX_BOX.plotX} y1={toTY(hb.tHotOutC)} x2={HX_BOX.plotX + HX_BOX.plotW} y2={toTY(hb.tHotOutC)}
          stroke="var(--border-grid)" strokeDasharray="3 3"
        />
        <polyline points={hotPoly} fill="none" stroke="var(--status-danger)" strokeWidth="2.6" />
        <polyline points={coldPoly} fill="none" stroke="var(--accent-primary)" strokeWidth="2.6" />
        <circle
          cx={toQX(0)} cy={toTY(hb.tColdOutC)} r="6.5"
          fill={hb.isFtUnacceptable ? 'var(--status-danger)' : 'var(--maize)'}
          stroke="var(--ink-primary)" strokeWidth="1.8"
          data-testid="wb3-hx-coldout-handle"
        />
        <text x={HX_BOX.plotX + 8} y={HX_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          F_T = {hb.bowmanFt.toFixed(3)} · {hb.hasTemperatureCross ? '⚠️ Temperature Cross (T_c,out > T_h,out)' : 'No Temperature Cross'}
        </text>
        <text x={HX_BOX.plotX + HX_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Normalized Duty Q/Q_tot (drag Y for T_c,out) →
        </text>

        {/* Right Panel: Nukiyama Pool Boiling Curve q''(DeltaT_excess) */}
        <rect x={BOIL_BOX.plotX} y={BOIL_BOX.plotY} width={BOIL_BOX.plotW} height={BOIL_BOX.plotH} fill="var(--bg-canvas)" stroke="var(--border-grid)" />
        <text x={BOIL_BOX.plotX + 6} y={BOIL_BOX.plotY - 8} fontSize="10" fontWeight="700" fill="currentColor">
          Nukiyama Pool Boiling q&prime;&prime;(ΔT_e) &amp; CHF [BSL Ch. 14]
        </text>
        <line x1={toBoilX(30)} y1={BOIL_BOX.plotY} x2={toBoilX(30)} y2={BOIL_BOX.plotY + BOIL_BOX.plotH} stroke="var(--status-danger)" strokeDasharray="3 3" />
        <line x1={toBoilX(120)} y1={BOIL_BOX.plotY} x2={toBoilX(120)} y2={BOIL_BOX.plotY + BOIL_BOX.plotH} stroke="var(--status-warn)" strokeDasharray="3 3" />
        <polyline points={nukiyamaPoly} fill="none" stroke="var(--accent-secondary)" strokeWidth="2.6" />
        <circle
          cx={toBoilX(hb.deltaTExcessC)} cy={toBoilY(Math.log10(Math.max(hb.qFluxWm2, 2000)))} r="6.5"
          fill={hb.isNearChfBurnout ? 'var(--status-danger)' : 'var(--status-pass)'}
          stroke="#fff" strokeWidth="1.8"
          data-testid="wb3-nukiyama-handle"
        />
        <text x={BOIL_BOX.plotX + 8} y={BOIL_BOX.plotY + 18} fontSize="8.8" fill="currentColor">
          CHF @ 30°C (1.16 MW/m²) · Leidenfrost @ 120°C
        </text>
        <text x={BOIL_BOX.plotX + BOIL_BOX.plotW / 2} y="202" fontSize="9.2" textAnchor="middle" fill="currentColor">
          Wall Superheat ΔT_excess (°C, log scale — drag X) →
        </text>
      </svg>
    </div>
  );
};
