export type OceanBasinId = 'arabian-sea' | 'bay-of-bengal' | 'equatorial-indian';

export type VisualizationMode = 'slicer' | 'globe';

export type VectorType = 'streamlines' | 'vectors';

export interface OceanBasin {
  id: OceanBasinId;
  name: string;
  coordRange: string;
  latRange: [number, number];
  lonRange: [number, number];
  depthRange: [number, number];
  subRegion: string;
  description: string;
  dotColor: string;
  defaultSlices: {
    x: number; // longitude
    y: number; // latitude
    z: number; // depth meters (0 - 2000)
  };
  surfaceTemp: number;
  abyssTemp: number;
  thermoclineRate: number;
  nominalVelocity: number;
}

export interface SliceParams {
  zDepth: number; // 0 to 2000 meters
  xLon: number; // longitude
  yLat: number; // latitude
  tempOffset: number; // -5 to +5 C
  speedMultiplier: number; // 0.2 to 3.0
  showCurrents: boolean;
  vectorType: VectorType;
  showGrid: boolean;
}
