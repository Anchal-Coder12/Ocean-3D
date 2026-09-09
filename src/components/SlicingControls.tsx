import React from 'react';
import { OceanBasin } from '../types';

interface SlicingControlsProps {
  currentBasin: OceanBasin;
  zDepth: number;
  onZDepthChange: (val: number) => void;
  xLon: number;
  onXLonChange: (val: number) => void;
  yLat: number;
  onYLatChange: (val: number) => void;
  tempOffset: number;
  onTempOffsetChange: (val: number) => void;
}

export const SlicingControls: React.FC<SlicingControlsProps> = ({
  currentBasin,
  zDepth,
  onZDepthChange,
  xLon,
  onXLonChange,
  yLat,
  onYLatChange,
  tempOffset,
  onTempOffsetChange,
}) => {
  const [minLon, maxLon] = currentBasin.lonRange;
  const [minLat, maxLat] = currentBasin.latRange;

  const formatLon = (deg: number) => `${Math.abs(deg).toFixed(1)}° ${deg >= 0 ? 'E' : 'W'}`;
  const formatLat = (deg: number) => `${Math.abs(deg).toFixed(1)}° ${deg >= 0 ? 'N' : 'S'}`;
  const formatTempOffset = (c: number) => `${c >= 0 ? '+' : ''}${c.toFixed(1)} °C`;

  return (
    <div className="bg-[#051124] border border-[#0d3153] rounded-lg p-3 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono-code font-bold tracking-wider text-[#00e5ff] uppercase text-[11px]">
          3. 3D XYZ SLICING CONTROLS
        </span>
        <span className="bg-[#00e5ff]/15 border border-[#00e5ff]/40 text-[#00e5ff] px-1.5 py-0.5 rounded text-[10px] font-mono-code font-semibold">
          XYZ Active
        </span>
      </div>

      {/* Z (Depth Transect) */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-slate-200 font-mono-code text-[11px] mb-1">
          <span className="font-semibold text-slate-300">Z (Depth Transect)</span>
          <span className="font-bold text-[#00e5ff]">{Math.round(zDepth)} m</span>
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          step="25"
          value={zDepth}
          onChange={(e) => onZDepthChange(parseFloat(e.target.value))}
          className="w-full cursor-pointer accent-[#00e5ff]"
        />
        <div className="flex justify-between text-[9px] text-slate-500 font-mono-code mt-1 px-0.5">
          <span>0m (Surface)</span>
          <span>500m</span>
          <span>1000m</span>
          <span>2000m (Abyss)</span>
        </div>
      </div>

      {/* X (Longitude Slice) */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-slate-200 font-mono-code text-[11px] mb-1">
          <span className="font-semibold text-slate-300">X (Longitude Slice)</span>
          <span className="font-bold text-[#00e5ff]">{formatLon(xLon)}</span>
        </div>
        <input
          type="range"
          min={minLon}
          max={maxLon}
          step="0.1"
          value={Math.min(Math.max(xLon, minLon), maxLon)}
          onChange={(e) => onXLonChange(parseFloat(e.target.value))}
          className="w-full cursor-pointer accent-[#00e5ff]"
        />
        <div className="flex justify-between text-[9px] text-slate-500 font-mono-code mt-0.5">
          <span>{minLon}° E</span>
          <span>{((minLon + maxLon) / 2).toFixed(1)}° E</span>
          <span>{maxLon}° E</span>
        </div>
      </div>

      {/* Y (Latitude Slice) */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-slate-200 font-mono-code text-[11px] mb-1">
          <span className="font-semibold text-slate-300">Y (Latitude Slice)</span>
          <span className="font-bold text-[#00e5ff]">{formatLat(yLat)}</span>
        </div>
        <input
          type="range"
          min={minLat}
          max={maxLat}
          step="0.1"
          value={Math.min(Math.max(yLat, minLat), maxLat)}
          onChange={(e) => onYLatChange(parseFloat(e.target.value))}
          className="w-full cursor-pointer accent-[#00e5ff]"
        />
        <div className="flex justify-between text-[9px] text-slate-500 font-mono-code mt-0.5">
          <span>{formatLat(minLat)}</span>
          <span>{formatLat((minLat + maxLat) / 2)}</span>
          <span>{formatLat(maxLat)}</span>
        </div>
      </div>

      {/* Simulated Temp Offset */}
      <div>
        <div className="flex items-center justify-between text-slate-200 font-mono-code text-[11px] mb-1">
          <span className="font-semibold text-slate-300">Simulated Temp Offset</span>
          <span className="font-bold text-amber-400">{formatTempOffset(tempOffset)}</span>
        </div>
        <input
          type="range"
          min="-3.0"
          max="3.0"
          step="0.1"
          value={tempOffset}
          onChange={(e) => onTempOffsetChange(parseFloat(e.target.value))}
          className="w-full cursor-pointer accent-amber-400"
        />
      </div>
    </div>
  );
};
