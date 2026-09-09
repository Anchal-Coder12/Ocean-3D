import React from 'react';
import { Waves, Globe, Box } from 'lucide-react';
import { VisualizationMode, OceanBasin } from '../types';

interface HeaderProps {
  currentBasin: OceanBasin;
  mode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
  showCurrents: boolean;
  onToggleCurrents: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBasin,
  mode,
  onModeChange,
  showCurrents,
  onToggleCurrents,
}) => {
  return (
    <header className="h-14 border-b border-[#0f2c4d] bg-[#040c1a] px-4 flex items-center justify-between gap-3 text-xs shrink-0 select-none z-30">
      {/* Brand & Gov Subsystem Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="font-tech text-xl font-bold tracking-widest text-[#00e5ff] drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]">
            OCEAN
          </span>
          <span className="font-tech text-xl font-black text-white tracking-widest">
            X
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 border border-[#0d406b] bg-[#061c33]/80 px-2.5 py-1 rounded text-[11px] text-[#38bdf8] font-mono-code font-semibold tracking-wider">
          <span>INCOIS 3D + XYZ DEPTH SLICER</span>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-300 font-mono-code pl-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span className="text-slate-400">INDIAN OCEAN BASIN</span>
          <span className="text-slate-600">•</span>
          <span className="text-cyan-300">LIVE HYDRO-SIMULATOR</span>
        </div>
      </div>

      {/* Center / Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ocean Currents Toggle */}
        <button
          onClick={onToggleCurrents}
          className={`flex items-center gap-2 px-3 py-1 rounded-md border text-xs font-mono-code transition-all ${
            showCurrents
              ? 'bg-[#00e5ff]/15 border-[#00e5ff] text-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.25)]'
              : 'bg-[#081b30] border-[#16385a] text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Government & INCOIS Ocean Currents Layer"
        >
          <Waves className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ocean Currents (Gov/INCOIS):</span>
          <span className="font-bold">{showCurrents ? 'ON' : 'OFF'}</span>
        </button>

        {/* View Mode Switchers */}
        <div className="flex items-center bg-[#07172b] p-0.5 rounded-md border border-[#0e3459]">
          <button
            onClick={() => onModeChange('globe')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono-code transition-all ${
              mode === 'globe'
                ? 'bg-[#0d4575] text-[#00e5ff] font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Globe View</span>
          </button>
          <button
            onClick={() => onModeChange('slicer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono-code transition-all ${
              mode === 'slicer'
                ? 'bg-[#0d4575] text-[#00e5ff] font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D XYZ Ocean Slicer</span>
          </button>
        </div>

        {/* Active Basin Pill */}
        <div className="hidden xl:flex items-center gap-2 border border-[#113a61] bg-[#071a30] px-3 py-1 rounded-md text-[11px] font-mono-code text-slate-300">
          <span className="text-slate-400">Selected:</span>
          <span className="font-semibold text-amber-400">{currentBasin.name}</span>
        </div>
      </div>
    </header>
  );
};
