import React from 'react';
import { Waves, Info } from 'lucide-react';
import { VectorType } from '../types';

interface CurrentsControlProps {
  showCurrents: boolean;
  onToggleCurrents: () => void;
  speedMultiplier: number;
  onSpeedChange: (val: number) => void;
  vectorType: VectorType;
  onVectorTypeChange: (type: VectorType) => void;
}

export const CurrentsControl: React.FC<CurrentsControlProps> = ({
  showCurrents,
  onToggleCurrents,
  speedMultiplier,
  onSpeedChange,
  vectorType,
  onVectorTypeChange,
}) => {
  return (
    <div className="bg-[#051124] border border-[#0d3153] rounded-lg p-3 text-xs">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Waves className="w-3.5 h-3.5 text-[#00e5ff]" />
          <span className="font-mono-code font-bold tracking-wider text-[#00e5ff] uppercase text-[11px]">
            OCEAN CURRENTS (GOV DATA)
          </span>
        </div>

        {/* Custom Toggle Switch */}
        <button
          onClick={onToggleCurrents}
          className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${
            showCurrents ? 'bg-[#00e5ff]' : 'bg-[#0e2d4d]'
          }`}
          aria-label="Toggle ocean currents"
        >
          <div
            className={`w-4 h-4 rounded-full bg-[#031526] transition-transform ${
              showCurrents ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Speed Slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-slate-300 font-mono-code text-[11px] mb-1.5">
          <span>Velocity Speed Multiplier:</span>
          <span className="font-bold text-[#00e5ff]">{speedMultiplier.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="3.0"
          step="0.1"
          value={speedMultiplier}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full cursor-pointer accent-[#00e5ff]"
          disabled={!showCurrents}
        />
      </div>

      {/* Streamlines vs Velocity Vectors */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={() => onVectorTypeChange('streamlines')}
          disabled={!showCurrents}
          className={`py-1.5 px-2 rounded border text-center font-mono-code text-[11px] font-medium transition-all ${
            vectorType === 'streamlines'
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] font-semibold'
              : 'bg-[#06182e] border-[#103459] text-slate-400 hover:text-slate-200'
          }`}
        >
          • Streamlines
        </button>
        <button
          onClick={() => onVectorTypeChange('vectors')}
          disabled={!showCurrents}
          className={`py-1.5 px-2 rounded border text-center font-mono-code text-[11px] font-medium transition-all ${
            vectorType === 'vectors'
              ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] font-semibold'
              : 'bg-[#06182e] border-[#103459] text-slate-400 hover:text-slate-200'
          }`}
        >
          → Velocity Vectors
        </button>
      </div>

      {/* Gov note info card */}
      <div className="bg-[#030d1c] border border-[#0b2847] rounded p-2 text-[10px] text-slate-400 font-mono-code flex items-start gap-1.5 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-cyan-300 font-semibold">Current Vectors:</span>{' '}
          Simulated INCOIS/HYCOM Format (Ready for real NetCDF/CSV upload).
        </div>
      </div>
    </div>
  );
};
