import React, { useEffect, useRef } from 'react';
import { OceanBasin } from '../types';

interface WorldRadarProps {
  currentBasin: OceanBasin;
  xLon: number;
  yLat: number;
}

export const WorldRadar: React.FC<WorldRadarProps> = ({
  currentBasin,
  xLon,
  yLat,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.fillStyle = '#030d1b';
      ctx.fillRect(0, 0, w, h);

      // Radar grid rings / lines
      ctx.strokeStyle = '#0a2e52';
      ctx.lineWidth = 1;

      // Coordinate lines (lat / lon approximation for Indian Ocean)
      // Longitude lines: 40E to 105E
      for (let x = 0; x <= w; x += w / 6) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Latitude lines: 15S to 30N
      for (let y = 0; y <= h; y += h / 5) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw stylized coastlines (India, Arabian Peninsula, Africa, SE Asia)
      // Map mapping: Lon [40, 110] -> X [0, w], Lat [32, -15] -> Y [0, h]
      const toCanvasX = (lon: number) => ((lon - 40) / 70) * w;
      const toCanvasY = (lat: number) => ((32 - lat) / 47) * h;

      ctx.fillStyle = '#0b233a';
      ctx.strokeStyle = '#18507d';
      ctx.lineWidth = 1.2;

      // Indian Subcontinent polygon
      ctx.beginPath();
      ctx.moveTo(toCanvasX(68), toCanvasY(24));
      ctx.lineTo(toCanvasX(73), toCanvasY(21));
      ctx.lineTo(toCanvasX(76), toCanvasY(15));
      ctx.lineTo(toCanvasX(77.5), toCanvasY(8.2)); // Kanyakumari
      ctx.lineTo(toCanvasX(80), toCanvasY(13));
      ctx.lineTo(toCanvasX(84.5), toCanvasY(19));
      ctx.lineTo(toCanvasX(89), toCanvasY(22));
      ctx.lineTo(toCanvasX(92), toCanvasY(26));
      ctx.lineTo(toCanvasX(75), toCanvasY(32));
      ctx.lineTo(toCanvasX(68), toCanvasY(28));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sri Lanka
      ctx.beginPath();
      ctx.ellipse(toCanvasX(80.7), toCanvasY(7.8), w * 0.02, h * 0.035, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Arabian Peninsula
      ctx.beginPath();
      ctx.moveTo(toCanvasX(42), toCanvasY(26));
      ctx.lineTo(toCanvasX(52), toCanvasY(25));
      ctx.lineTo(toCanvasX(60), toCanvasY(22.5));
      ctx.lineTo(toCanvasX(58), toCanvasY(20));
      ctx.lineTo(toCanvasX(54), toCanvasY(17));
      ctx.lineTo(toCanvasX(45), toCanvasY(13));
      ctx.lineTo(toCanvasX(43), toCanvasY(18));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Horn of Africa
      ctx.beginPath();
      ctx.moveTo(toCanvasX(43), toCanvasY(12));
      ctx.lineTo(toCanvasX(51), toCanvasY(10.5));
      ctx.lineTo(toCanvasX(48), toCanvasY(5));
      ctx.lineTo(toCanvasX(42), toCanvasY(-2));
      ctx.lineTo(toCanvasX(38), toCanvasY(-10));
      ctx.lineTo(toCanvasX(40), toCanvasY(10));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // SE Asia / Myanmar / Sumatra
      ctx.beginPath();
      ctx.moveTo(toCanvasX(95), toCanvasY(22));
      ctx.lineTo(toCanvasX(98), toCanvasY(15));
      ctx.lineTo(toCanvasX(99), toCanvasY(8));
      ctx.lineTo(toCanvasX(103), toCanvasY(2));
      ctx.lineTo(toCanvasX(106), toCanvasY(-6));
      ctx.lineTo(toCanvasX(96), toCanvasY(5));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Radar scan beam
      angle += 0.025;
      const targetX = toCanvasX(xLon);
      const targetY = toCanvasY(yLat);

      const grad = ctx.createRadialGradient(targetX, targetY, 0, targetX, targetY, w * 0.45);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(targetX, targetY);
      ctx.arc(targetX, targetY, w * 0.45, angle, angle + 0.6);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Basin boundaries overlay
      const minX = toCanvasX(currentBasin.lonRange[0]);
      const maxX = toCanvasX(currentBasin.lonRange[1]);
      const minY = toCanvasY(currentBasin.latRange[1]);
      const maxY = toCanvasY(currentBasin.latRange[0]);

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      ctx.setLineDash([]);

      // Target Reticle & ping ring
      const pingRadius = (Math.sin(Date.now() / 250) + 1) * 4 + 7;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(targetX, targetY, pingRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Center crosshair
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(targetX - 9, targetY);
      ctx.lineTo(targetX + 9, targetY);
      ctx.moveTo(targetX, targetY - 9);
      ctx.lineTo(targetX, targetY + 9);
      ctx.stroke();

      // Coordinate marker tag
      ctx.fillStyle = '#00e5ff';
      ctx.font = '8px "JetBrains Mono"';
      ctx.fillText(
        `${Math.abs(yLat).toFixed(1)}°${yLat >= 0 ? 'N' : 'S'}, ${Math.abs(xLon).toFixed(1)}°E`,
        Math.min(targetX + 10, w - 75),
        Math.max(targetY - 6, 12)
      );

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentBasin, xLon, yLat]);

  return (
    <div className="bg-[#051124] border border-[#0d3153] rounded-lg p-3 text-xs">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono-code font-bold tracking-wider text-[#00e5ff] uppercase text-[11px]">
          WORLD RADAR & BASIN LOCATOR
        </span>
        <span className="bg-[#0b2847] border border-[#103b63] text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono-code">
          GLOBAL 2D
        </span>
      </div>

      <div className="text-[10px] text-slate-400 font-mono-code mb-2">
        Basin Transect Target
      </div>

      <div className="relative rounded overflow-hidden border border-[#0e375e] aspect-[16/9] w-full bg-[#030914]">
        <canvas
          ref={canvasRef}
          width={320}
          height={180}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
