import { OceanBasin } from '../types';

export const BASINS: Record<string, OceanBasin> = {
  'bay-of-bengal': {
    id: 'bay-of-bengal',
    name: 'Bay of Bengal',
    coordRange: '8.0°N–22.5°N • 80°E–95°E',
    latRange: [8.0, 22.5],
    lonRange: [80.0, 95.0],
    depthRange: [0, 2000],
    subRegion: 'Bay of Bengal (Northern Basin)',
    description:
      'Marked by immense river discharge from Ganges-Brahmaputra creating low-salinity barrier layers. Features high cyclone heat potential and complex seasonal gyre reversals driven by summer/winter monsoons.',
    dotColor: '#00e5ff',
    defaultSlices: {
      x: 87.5,
      y: 18.2,
      z: 1000,
    },
    surfaceTemp: 29.5,
    abyssTemp: 8.2,
    thermoclineRate: -0.024,
    nominalVelocity: 0.72,
  },
  'arabian-sea': {
    id: 'arabian-sea',
    name: 'Arabian Sea',
    coordRange: '10.0°N–25.0°N • 55°E–75°E',
    latRange: [10.0, 25.0],
    lonRange: [55.0, 75.0],
    depthRange: [0, 2000],
    subRegion: 'Arabian Sea (North-Western Basin)',
    description:
      'High evaporation producing dense Arabian Sea High Salinity Water (ASHSW). Features intense summer upwelling along the Somali and western Indian coasts with vigorous mesoscale eddy dipoles.',
    dotColor: '#f59e0b', // amber dot in screenshot
    defaultSlices: {
      x: 65.0,
      y: 17.5,
      z: 1000,
    },
    surfaceTemp: 28.4,
    abyssTemp: 7.9,
    thermoclineRate: -0.02,
    nominalVelocity: 1.15,
  },
  'equatorial-indian': {
    id: 'equatorial-indian',
    name: 'Equatorial Indian Ocean',
    coordRange: '5.0°S–10.0°N • 60°E–95°E',
    latRange: [-5.0, 10.0],
    lonRange: [60.0, 95.0],
    depthRange: [0, 2000],
    subRegion: 'Equatorial Jet & Undercurrent Zone',
    description:
      'Dominated by intense semi-annual eastward Wyrtki Jets during monsoon transition periods, Kelvin wave propagation, and oceanic teleconnections with the Indian Ocean Dipole (IOD).',
    dotColor: '#10b981', // green dot in screenshot
    defaultSlices: {
      x: 77.5,
      y: 2.5,
      z: 1000,
    },
    surfaceTemp: 30.1,
    abyssTemp: 8.5,
    thermoclineRate: -0.018,
    nominalVelocity: 1.45,
  },
};
