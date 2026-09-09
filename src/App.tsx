/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { OceanBasinId, VisualizationMode, VectorType } from './types';
import { BASINS } from './data/basins';
import { Header } from './components/Header';
import { BasinSelector } from './components/BasinSelector';
import { CurrentsControl } from './components/CurrentsControl';
import { SlicingControls } from './components/SlicingControls';
import { OceanScene3D } from './components/OceanScene3D';
import { WorldRadar } from './components/WorldRadar';
import { RegionTelemetry } from './components/RegionTelemetry';
import { ScaleLegends } from './components/ScaleLegends';

export default function App() {
  // Active Basin (defaults to Arabian Sea matching the screenshot)
  const [selectedBasinId, setSelectedBasinId] = useState<OceanBasinId>('arabian-sea');
  const currentBasin = BASINS[selectedBasinId];

  // View Mode: 'slicer' or 'globe'
  const [viewMode, setViewMode] = useState<VisualizationMode>('slicer');

  // Ocean Currents Layer state
  const [showCurrents, setShowCurrents] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.2);
  const [vectorType, setVectorType] = useState<VectorType>('streamlines');

  // 3D XYZ Slicing Parameters
  const [zDepth, setZDepth] = useState<number>(1000);
  const [xLon, setXLon] = useState<number>(65.0);
  const [yLat, setYLat] = useState<number>(17.5);
  const [tempOffset, setTempOffset] = useState<number>(1.4);

  // 3D Grid visibility
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Handle Basin Selection
  const handleSelectBasin = (basinId: OceanBasinId) => {
    setSelectedBasinId(basinId);
    const basin = BASINS[basinId];
    setXLon(basin.defaultSlices.x);
    setYLat(basin.defaultSlices.y);
    setZDepth(basin.defaultSlices.z);
  };

  // Handle "Slice 3D" click on basin card
  const handleSliceClick = (basinId: OceanBasinId) => {
    handleSelectBasin(basinId);
    setViewMode('slicer');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#020814] text-slate-100 antialiased font-mono-code">
      {/* Top Header Bar */}
      <Header
        currentBasin={currentBasin}
        mode={viewMode}
        onModeChange={setViewMode}
        showCurrents={showCurrents}
        onToggleCurrents={() => setShowCurrents((prev) => !prev)}
      />

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Controls Panel */}
        <aside className="w-80 md:w-84 xl:w-92 shrink-0 border-r border-[#0d2a4a] bg-[#030c1b]/95 p-3 overflow-y-auto space-y-3 z-20">
          <BasinSelector
            selectedBasinId={selectedBasinId}
            onSelectBasin={handleSelectBasin}
            onSliceClick={handleSliceClick}
          />

          <CurrentsControl
            showCurrents={showCurrents}
            onToggleCurrents={() => setShowCurrents((prev) => !prev)}
            speedMultiplier={speedMultiplier}
            onSpeedChange={setSpeedMultiplier}
            vectorType={vectorType}
            onVectorTypeChange={setVectorType}
          />

          <SlicingControls
            currentBasin={currentBasin}
            zDepth={zDepth}
            onZDepthChange={setZDepth}
            xLon={xLon}
            onXLonChange={setXLon}
            yLat={yLat}
            onYLatChange={setYLat}
            tempOffset={tempOffset}
            onTempOffsetChange={setTempOffset}
          />
        </aside>

        {/* Center 3D Visualization Canvas */}
        <main className="flex-1 relative overflow-hidden bg-[#030814] min-w-0">
          <OceanScene3D
            currentBasin={currentBasin}
            mode={viewMode}
            zDepth={zDepth}
            xLon={xLon}
            yLat={yLat}
            tempOffset={tempOffset}
            speedMultiplier={speedMultiplier}
            showCurrents={showCurrents}
            vectorType={vectorType}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid((prev) => !prev)}
            onSelectBasin={handleSelectBasin}
          />
        </main>

        {/* Right Telemetry & Radar Panel */}
        <aside className="w-80 md:w-84 xl:w-92 shrink-0 border-l border-[#0d2a4a] bg-[#030c1b]/95 p-3 overflow-y-auto space-y-3 z-20">
          <WorldRadar
            currentBasin={currentBasin}
            xLon={xLon}
            yLat={yLat}
          />

          <RegionTelemetry
            currentBasin={currentBasin}
            zDepth={zDepth}
            tempOffset={tempOffset}
          />

          <ScaleLegends />
        </aside>
      </div>
    </div>
  );
}
