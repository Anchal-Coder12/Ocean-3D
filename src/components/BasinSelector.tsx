import React from 'react';
import { OceanBasin, OceanBasinId } from '../types';
import { BASINS } from '../data/basins';

interface BasinSelectorProps {
  selectedBasinId: OceanBasinId;
  onSelectBasin: (id: OceanBasinId) => void;
  onSliceClick: (id: OceanBasinId) => void;
}

export const BasinSelector: React.FC<BasinSelectorProps> = ({
  selectedBasinId,
  onSelectBasin,
  onSliceClick,
}) => {
  return (
    <div className="bg-[#051124] border border-[#0d3153] rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between mb-2.5">
        <span className="font-mono-code font-bold tracking-wider text-[#00e5ff] uppercase text-[11px]">
          1. SELECT OCEAN BASIN
        </span>
        <span className="text-[10px] text-slate-400 font-mono-code">
          Click to focus
        </span>
      </div>

      <div className="space-y-2">
        {Object.values(BASINS).map((basin) => {
          const isSelected = basin.id === selectedBasinId;
          return (
            <div
              key={basin.id}
              onClick={() => onSelectBasin(basin.id)}
              className={`p-2.5 rounded border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-[#09223d] border-[#00e5ff]/60 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                  : 'bg-[#06172e]/70 border-[#0f3256] hover:border-[#1e4d7d] hover:bg-[#081c36]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 shadow-sm"
                  style={{
                    backgroundColor: basin.dotColor,
                    boxShadow: isSelected ? `0 0 8px ${basin.dotColor}` : 'none',
                  }}
                />
                <div>
                  <div className="font-tech text-sm font-semibold tracking-wide text-slate-100 leading-tight">
                    {basin.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-code mt-0.5">
                    {basin.coordRange}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSliceClick(basin.id);
                }}
                className={`px-2.5 py-1 rounded text-[10px] font-mono-code font-bold tracking-wider uppercase transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#00e5ff] text-[#031526] hover:bg-[#38bdf8] shadow-[0_0_8px_rgba(0,229,255,0.5)]'
                    : 'bg-[#0b2b4a] text-slate-300 hover:text-white hover:bg-[#103d69] border border-[#164775]'
                }`}
              >
                Slice 3D
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
