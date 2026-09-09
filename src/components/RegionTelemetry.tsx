import React from 'react';
import { OceanBasin } from '../types';

interface RegionTelemetryProps {
  currentBasin: OceanBasin;
  zDepth: number;
  tempOffset: number;
}

export const RegionTelemetry: React.FC<RegionTelemetryProps> = ({
  currentBasin,
  zDepth,
  tempOffset,
}) => {
  // Scientific exponential/logistic ocean temperature stratification model
  // T(z) = T_abyss + (T_surface - T_abyss) * exp(-z / z_scale)
  // At z = 0, T = surface. At z = 1000, T ~ 11.8 C. At z = 2000, T ~ 8 C.
  const tempScale = 650;
  const rawTemp =
    currentBasin.abyssTemp +
    (currentBasin.surfaceTemp - currentBasin.abyssTemp) * Math.exp(-zDepth / tempScale);
  const currentTemp = (rawTemp + tempOffset).toFixed(1);

  // Gradient dT/dz = - (T_surface - T_abyss) / z_scale * exp(-z / z_scale)
  const grad = (
    (-((currentBasin.surfaceTemp - currentBasin.abyssTemp) / tempScale) *
      Math.exp(-zDepth / tempScale))
  ).toFixed(2);

  return (
    <div className="bg-[#051124] border border-[#0d3153] rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono-code font-bold tracking-wider text-[#00e5ff] uppercase text-[11px]">
          REGION TELEMETRY
        </span>
        <span className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono-code font-semibold">
          Active Basin
        </span>
      </div>

      <div className="font-tech text-sm font-bold text-slate-100 mb-1.5 tracking-wide">
        {currentBasin.subRegion}
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed font-mono-code mb-3.5">
        {currentBasin.description}
      </p>

      {/* Telemetry Metric Boxes */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-[#030e1d] border border-[#0d2a45] rounded-md p-2.5">
          <div className="text-[10px] text-slate-400 font-mono-code uppercase tracking-wider mb-1">
            Slice Temp at Depth
          </div>
          <div className="font-tech text-base font-bold text-[#00e5ff] tracking-tight">
            {currentTemp} °C
          </div>
        </div>

        <div className="bg-[#030e1d] border border-[#0d2a45] rounded-md p-2.5">
          <div className="text-[10px] text-slate-400 font-mono-code uppercase tracking-wider mb-1">
            Thermocline Grad.
          </div>
          <div className="font-tech text-base font-bold text-amber-400 tracking-tight">
            {grad} °C/m
          </div>
        </div>
      </div>
    </div>
  );
};
