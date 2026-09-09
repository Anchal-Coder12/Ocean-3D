import React from 'react';
import { Lightbulb } from 'lucide-react';

export const ScaleLegends: React.FC = () => {
  return (
    <div className="bg-[#051124] border border-[#0d3153] rounded-lg p-3 text-xs space-y-3.5">
      {/* Velocity Scale */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono-code mb-1.5">
          <span className="font-bold uppercase tracking-wider text-[#00e5ff]">
            CURRENT VELOCITY SCALE
          </span>
          <span className="text-slate-400">m/s (Geostrophic)</span>
        </div>
        {/* Color bar */}
        <div className="h-2.5 w-full rounded-sm overflow-hidden bg-gradient-to-r from-[#034077] via-[#00e5ff] via-[#10b981] to-[#f43f5e] shadow-inner" />
        <div className="flex justify-between text-[9px] text-slate-400 font-mono-code mt-1">
          <span>0.05 m/s (Calm)</span>
          <span>0.5 m/s</span>
          <span>1.1 m/s</span>
          <span>1.8+ m/s (Jet)</span>
        </div>
      </div>

      {/* Temperature Scale */}
      <div>
        <div className="flex items-center justify-between text-[10px] font-mono-code mb-1.5">
          <span className="font-bold uppercase tracking-wider text-[#00e5ff]">
            TEMPERATURE SCALE (°C)
          </span>
          <span className="text-slate-400">Stratified</span>
        </div>
        {/* Color bar */}
        <div className="h-2.5 w-full rounded-sm overflow-hidden bg-gradient-to-r from-[#1e3a8a] via-[#0284c7] via-[#10b981] via-[#f59e0b] to-[#ef4444] shadow-inner" />
        <div className="flex justify-between text-[9px] text-slate-400 font-mono-code mt-1">
          <span>8°C (Abyss)</span>
          <span>16°C</span>
          <span>24°C</span>
          <span>31°C (Surface)</span>
        </div>
      </div>

      {/* Interactive 3D Tips Card */}
      <div className="bg-[#040f21] border border-[#0c2a47] rounded p-2 text-[10px] text-slate-300 font-mono-code flex items-start gap-1.5 leading-relaxed">
        <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-amber-300 font-semibold">Interactive 3D Navigation:</span>{' '}
          Drag with left mouse button to rotate globe or slice cube. Scroll wheel to zoom into depth layers.
        </div>
      </div>
    </div>
  );
};
