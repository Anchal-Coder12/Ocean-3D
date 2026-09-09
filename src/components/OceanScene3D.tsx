import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OceanBasin, VisualizationMode, VectorType } from '../types';
import { Scissors, RotateCcw, Grid as GridIcon } from 'lucide-react';

interface OceanScene3DProps {
  currentBasin: OceanBasin;
  mode: VisualizationMode;
  zDepth: number; // 0 to 2000 m
  xLon: number;
  yLat: number;
  tempOffset: number;
  speedMultiplier: number;
  showCurrents: boolean;
  vectorType: VectorType;
  showGrid: boolean;
  onToggleGrid: () => void;
  onSelectBasin: (id: any) => void;
}

export const OceanScene3D: React.FC<OceanScene3DProps> = ({
  currentBasin,
  mode,
  zDepth,
  xLon,
  yLat,
  tempOffset,
  speedMultiplier,
  showCurrents,
  vectorType,
  showGrid,
  onToggleGrid,
  onSelectBasin,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Group references
  const slicerGroupRef = useRef<THREE.Group | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);

  // Slicer mesh references
  const zPlaneRef = useRef<THREE.Mesh | null>(null);
  const xPlaneRef = useRef<THREE.Mesh | null>(null);
  const yPlaneRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.LineSegments | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const vectorLinesRef = useRef<THREE.LineSegments | null>(null);

  // Interaction / Orbit State
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0.65, phi: 0.85, radius: 18 });
  const targetCameraAngleRef = useRef({ theta: 0.65, phi: 0.85, radius: 18 });

  // Slicing animation / pulse
  const [isSlicingActive, setIsSlicingActive] = useState(false);

  // Reset Camera View to perfect screenshot perspective
  const handleResetView = useCallback(() => {
    if (mode === 'slicer') {
      targetCameraAngleRef.current = { theta: 0.72, phi: 0.95, radius: 18.5 };
    } else {
      targetCameraAngleRef.current = { theta: 1.2, phi: 1.3, radius: 22 };
    }
  }, [mode]);

  // Handle "Slice Selected Region" action
  const handleSliceRegion = () => {
    setIsSlicingActive(true);
    setTimeout(() => setIsSlicingActive(false), 1400);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030814);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00e5ff, 1.8);
    dirLight1.position.set(20, 30, 25);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0);
    dirLight2.position.set(-20, -20, -20);
    scene.add(dirLight2);

    // ==========================================
    // 5. Build Slicer Scene Group
    // ==========================================
    const slicerGroup = new THREE.Group();
    slicerGroupRef.current = slicerGroup;
    scene.add(slicerGroup);

    // Dimensions for the 3D water column box
    const boxW = 12; // Longitude span
    const boxH = 7; // Depth (Surface = +3.5, Abyss = -3.5)
    const boxD = 10; // Latitude span

    // Outer wireframe bounding box
    const boxGeo = new THREE.BoxGeometry(boxW, boxH, boxD);
    const edges = new THREE.EdgesGeometry(boxGeo);
    const boxLineMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.45,
      linewidth: 1.5,
    });
    const boxWireframe = new THREE.LineSegments(edges, boxLineMat);
    slicerGroup.add(boxWireframe);

    // Coordinate Grid at ocean floor (-3.5)
    const gridHelper = new THREE.GridHelper(Math.max(boxW, boxD) * 1.4, 20, 0x00e5ff, 0x0c3053);
    gridHelper.position.y = -boxH / 2;
    gridHelperRef.current = gridHelper as any;
    slicerGroup.add(gridHelper);

    // Depth Layer Guideline rings on the box corners
    const depthLevels = [
      { y: boxH / 2, label: '0m Surface' },
      { y: boxH / 2 - (boxH * 500) / 2000, label: '500m' },
      { y: 0, label: '1000m' },
      { y: -boxH / 2, label: '2000m Abyss' },
    ];
    depthLevels.forEach((dl) => {
      const ringGeo = new THREE.BufferGeometry();
      const hw = boxW / 2;
      const hd = boxD / 2;
      const pts = [
        new THREE.Vector3(-hw, dl.y, -hd),
        new THREE.Vector3(hw, dl.y, -hd),
        new THREE.Vector3(hw, dl.y, hd),
        new THREE.Vector3(-hw, dl.y, hd),
        new THREE.Vector3(-hw, dl.y, -hd),
      ];
      ringGeo.setFromPoints(pts);
      const ringMat = new THREE.LineBasicMaterial({
        color: 0x164e7c,
        transparent: true,
        opacity: 0.6,
      });
      slicerGroup.add(new THREE.Line(ringGeo, ringMat));
    });

    // Slicing Planes Texture Generation:
    // Create canvas gradient textures with dynamic water column colors
    const createSliceTexture = (type: 'horizontal' | 'vertical') => {
      const cvs = document.createElement('canvas');
      cvs.width = 256;
      cvs.height = 256;
      const c = cvs.getContext('2d')!;

      if (type === 'horizontal') {
        // Temperature & salinity eddy swirls
        const g = c.createRadialGradient(128, 128, 10, 128, 128, 140);
        g.addColorStop(0, 'rgba(0, 240, 255, 0.85)');
        g.addColorStop(0.35, 'rgba(14, 185, 230, 0.75)');
        g.addColorStop(0.7, 'rgba(16, 185, 129, 0.65)');
        g.addColorStop(1, 'rgba(3, 75, 135, 0.55)');
        c.fillStyle = g;
        c.fillRect(0, 0, 256, 256);

        // Grid lines overlay
        c.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        c.lineWidth = 1;
        for (let i = 0; i < 256; i += 32) {
          c.beginPath();
          c.moveTo(i, 0);
          c.lineTo(i, 256);
          c.stroke();
          c.beginPath();
          c.moveTo(0, i);
          c.lineTo(256, i);
          c.stroke();
        }
      } else {
        // Vertical depth gradient (warm surface down to deep abyss)
        const g = c.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0, 'rgba(245, 158, 11, 0.8)'); // Warm surface
        g.addColorStop(0.25, 'rgba(0, 229, 255, 0.75)'); // Epipelagic
        g.addColorStop(0.65, 'rgba(16, 120, 180, 0.6)'); // Mesopelagic
        g.addColorStop(1, 'rgba(2, 28, 64, 0.5)'); // Abyss
        c.fillStyle = g;
        c.fillRect(0, 0, 256, 256);

        // Iso-therm contour curves
        c.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        c.lineWidth = 1.5;
        for (let j = 40; j < 256; j += 45) {
          c.beginPath();
          c.moveTo(0, j);
          c.bezierCurveTo(80, j - 15, 160, j + 15, 256, j);
          c.stroke();
        }
      }

      const texture = new THREE.CanvasTexture(cvs);
      return texture;
    };

    const horizTex = createSliceTexture('horizontal');
    const vertTex = createSliceTexture('vertical');

    // 1) Z-Plane (Depth Horizontal Slice)
    const zPlaneGeo = new THREE.PlaneGeometry(boxW, boxD);
    const zPlaneMat = new THREE.MeshBasicMaterial({
      map: horizTex,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const zPlane = new THREE.Mesh(zPlaneGeo, zPlaneMat);
    zPlane.rotation.x = Math.PI / 2;
    zPlaneRef.current = zPlane;
    slicerGroup.add(zPlane);

    // Glowing border for Z-plane
    const zPlaneEdges = new THREE.EdgesGeometry(zPlaneGeo);
    const zBorder = new THREE.LineSegments(
      zPlaneEdges,
      new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 })
    );
    zPlane.add(zBorder);

    // 2) X-Plane (Longitude Vertical Slice)
    const xPlaneGeo = new THREE.PlaneGeometry(boxD, boxH);
    const xPlaneMat = new THREE.MeshBasicMaterial({
      map: vertTex,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const xPlane = new THREE.Mesh(xPlaneGeo, xPlaneMat);
    xPlane.rotation.y = Math.PI / 2;
    xPlaneRef.current = xPlane;
    slicerGroup.add(xPlane);

    // Glowing border for X-plane
    const xPlaneEdges = new THREE.EdgesGeometry(xPlaneGeo);
    const xBorder = new THREE.LineSegments(
      xPlaneEdges,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 })
    );
    xPlane.add(xBorder);

    // 3) Y-Plane (Latitude Vertical Slice)
    const yPlaneGeo = new THREE.PlaneGeometry(boxW, boxH);
    const yPlaneMat = new THREE.MeshBasicMaterial({
      map: vertTex,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const yPlane = new THREE.Mesh(yPlaneGeo, yPlaneMat);
    yPlaneRef.current = yPlane;
    slicerGroup.add(yPlane);

    const yPlaneEdges = new THREE.EdgesGeometry(yPlaneGeo);
    const yBorder = new THREE.LineSegments(
      yPlaneEdges,
      new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 2 })
    );
    yPlane.add(yBorder);

    // Particles simulation for currents and scatter stratification
    const particleCount = 750;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * boxW * 0.95;
      const py = (Math.random() - 0.5) * boxH * 0.95;
      const pz = (Math.random() - 0.5) * boxD * 0.95;

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      // Color based on depth:
      // High (Surface, py > 1.5): Orange/Red (0xf59e0b)
      // Mid (py between -1.0 and 1.5): Cyan/Emerald (0x00e5ff)
      // Deep (py < -1.0): Deep Blue (0x0284c7)
      const normDepth = (py + boxH / 2) / boxH; // 0 (abyss) to 1 (surface)
      let c = new THREE.Color();
      if (normDepth > 0.65) {
        c.setHSL(0.08 + Math.random() * 0.05, 0.9, 0.6); // warm amber
      } else if (normDepth > 0.3) {
        c.setHSL(0.5 + Math.random() * 0.05, 0.95, 0.55); // cyan/teal
      } else {
        c.setHSL(0.6 + Math.random() * 0.05, 0.9, 0.45); // deep blue
      }

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      // Velocity: clockwise swirling eddy flow
      const angle = Math.atan2(pz, px) + Math.PI / 2;
      const speed = (0.015 + Math.random() * 0.02) * (normDepth + 0.3);
      velocities[i * 3] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom square particle texture
    const particleMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    slicerGroup.add(particles);

    // Velocity Vector Lines (for "Velocity Vectors" mode)
    const vectorLineCount = 200;
    const vectorGeo = new THREE.BufferGeometry();
    const vLinePositions = new Float32Array(vectorLineCount * 2 * 3);
    const vLineColors = new Float32Array(vectorLineCount * 2 * 3);

    for (let i = 0; i < vectorLineCount; i++) {
      const vx = (Math.random() - 0.5) * boxW * 0.9;
      const vy = (Math.random() - 0.5) * boxH * 0.9;
      const vz = (Math.random() - 0.5) * boxD * 0.9;

      const angle = Math.atan2(vz, vx) + Math.PI / 2;
      const len = 0.5 + Math.random() * 0.4;
      const ex = vx + Math.cos(angle) * len;
      const ey = vy;
      const ez = vz + Math.sin(angle) * len;

      const idx = i * 6;
      vLinePositions[idx] = vx;
      vLinePositions[idx + 1] = vy;
      vLinePositions[idx + 2] = vz;
      vLinePositions[idx + 3] = ex;
      vLinePositions[idx + 4] = ey;
      vLinePositions[idx + 5] = ez;

      const c = new THREE.Color(0x00e5ff);
      vLineColors[idx] = c.r;
      vLineColors[idx + 1] = c.g;
      vLineColors[idx + 2] = c.b;
      vLineColors[idx + 3] = 1;
      vLineColors[idx + 4] = 1;
      vLineColors[idx + 5] = 1;
    }

    vectorGeo.setAttribute('position', new THREE.BufferAttribute(vLinePositions, 3));
    vectorGeo.setAttribute('color', new THREE.BufferAttribute(vLineColors, 3));

    const vectorLineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      linewidth: 1.5,
    });
    const vectorLines = new THREE.LineSegments(vectorGeo, vectorLineMat);
    vectorLinesRef.current = vectorLines;
    vectorLines.visible = false;
    slicerGroup.add(vectorLines);

    // ==========================================
    // 6. Build 3D Globe Scene Group
    // ==========================================
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    globeGroup.visible = false;
    scene.add(globeGroup);

    const globeRadius = 6.5;

    // Create realistic earth ocean canvas texture with glowing coastlines
    const globeCanvas = document.createElement('canvas');
    globeCanvas.width = 1024;
    globeCanvas.height = 512;
    const gctx = globeCanvas.getContext('2d')!;

    // Deep ocean base
    gctx.fillStyle = '#020b17';
    gctx.fillRect(0, 0, 1024, 512);

    // Bathymetry ocean trenches & ridges
    const oceanGrad = gctx.createRadialGradient(650, 260, 40, 650, 260, 250);
    oceanGrad.addColorStop(0, '#0a3257');
    oceanGrad.addColorStop(0.5, '#04182e');
    oceanGrad.addColorStop(1, '#020b17');
    gctx.fillStyle = oceanGrad;
    gctx.fillRect(400, 100, 500, 320);

    // Lat/Lon graticules on globe
    gctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
    gctx.lineWidth = 1;
    for (let x = 0; x < 1024; x += 1024 / 18) {
      gctx.beginPath();
      gctx.moveTo(x, 0);
      gctx.lineTo(x, 512);
      gctx.stroke();
    }
    for (let y = 0; y < 512; y += 512 / 12) {
      gctx.beginPath();
      gctx.moveTo(0, y);
      gctx.lineTo(1024, y);
      gctx.stroke();
    }

    // Draw stylized continents around Indian Ocean
    gctx.fillStyle = '#0a233b';
    gctx.strokeStyle = '#00e5ff';
    gctx.lineWidth = 2;

    // Helper to map lat/lon into equirectangular canvas
    const lonLatToCanvas = (lon: number, lat: number) => ({
      x: ((lon + 180) / 360) * 1024,
      y: ((90 - lat) / 180) * 512,
    });

    // Indian Subcontinent
    const indPts = [
      [68, 25],
      [73, 22],
      [76, 16],
      [77.5, 8.2],
      [80, 13],
      [85, 20],
      [90, 23],
      [94, 27],
      [75, 34],
      [68, 28],
    ];
    gctx.beginPath();
    indPts.forEach(([lon, lat], i) => {
      const p = lonLatToCanvas(lon, lat);
      if (i === 0) gctx.moveTo(p.x, p.y);
      else gctx.lineTo(p.x, p.y);
    });
    gctx.closePath();
    gctx.fill();
    gctx.stroke();

    // Arabian Peninsula
    const arabPts = [
      [42, 28],
      [55, 25],
      [60, 22],
      [55, 16],
      [44, 12],
      [43, 20],
    ];
    gctx.beginPath();
    arabPts.forEach(([lon, lat], i) => {
      const p = lonLatToCanvas(lon, lat);
      if (i === 0) gctx.moveTo(p.x, p.y);
      else gctx.lineTo(p.x, p.y);
    });
    gctx.closePath();
    gctx.fill();
    gctx.stroke();

    // Africa East Coast
    const afrPts = [
      [42, 12],
      [51, 10],
      [46, 0],
      [40, -15],
      [35, -30],
      [30, -10],
      [32, 12],
    ];
    gctx.beginPath();
    afrPts.forEach(([lon, lat], i) => {
      const p = lonLatToCanvas(lon, lat);
      if (i === 0) gctx.moveTo(p.x, p.y);
      else gctx.lineTo(p.x, p.y);
    });
    gctx.closePath();
    gctx.fill();
    gctx.stroke();

    // Southeast Asia & Indonesia archipelago
    const sePts = [
      [96, 22],
      [102, 12],
      [104, 1],
      [115, -8],
      [125, -8],
      [105, -5],
      [98, 8],
    ];
    gctx.beginPath();
    sePts.forEach(([lon, lat], i) => {
      const p = lonLatToCanvas(lon, lat);
      if (i === 0) gctx.moveTo(p.x, p.y);
      else gctx.lineTo(p.x, p.y);
    });
    gctx.closePath();
    gctx.fill();
    gctx.stroke();

    const globeTexture = new THREE.CanvasTexture(globeCanvas);
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeMat = new THREE.MeshStandardMaterial({
      map: globeTexture,
      roughness: 0.6,
      metalness: 0.2,
      emissive: new THREE.Color(0x021226),
      emissiveIntensity: 0.5,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // Atmosphere Glow outer shell
    const atmoGeo = new THREE.SphereGeometry(globeRadius * 1.04, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    globeGroup.add(atmoMesh);

    // Interactive Basin Markers on the 3D globe
    const basinMarkers = [
      { id: 'arabian-sea', name: 'Arabian Sea', lat: 17.5, lon: 65.0, color: 0xf59e0b },
      { id: 'bay-of-bengal', name: 'Bay of Bengal', lat: 18.2, lon: 87.5, color: 0x00e5ff },
      { id: 'equatorial-indian', name: 'Equatorial Indian', lat: 2.5, lon: 77.5, color: 0x10b981 },
    ];

    basinMarkers.forEach((bm) => {
      const phi = (90 - bm.lat) * (Math.PI / 180);
      const theta = (bm.lon + 180) * (Math.PI / 180);
      const r = globeRadius * 1.02;

      const x = -r * Math.sin(phi) * Math.cos(theta);
      const z = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);

      const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
      const pinMat = new THREE.MeshBasicMaterial({ color: bm.color });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(x, y, z);
      pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x, y, z).normalize());
      globeGroup.add(pin);

      const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: bm.color });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(x * 1.05, y * 1.05, z * 1.05);
      globeGroup.add(head);

      // Pulsing beacon ring
      const ringGeo = new THREE.RingGeometry(0.3, 0.45, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: bm.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x * 1.055, y * 1.055, z * 1.055);
      ring.lookAt(0, 0, 0);
      globeGroup.add(ring);
    });

    // ==========================================
    // 7. Mouse Orbit & Touch Interactions
    // ==========================================
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      targetCameraAngleRef.current.theta -= deltaX * 0.007;
      targetCameraAngleRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, targetCameraAngleRef.current.phi - deltaY * 0.007)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCameraAngleRef.current.radius = Math.max(
        10,
        Math.min(32, targetCameraAngleRef.current.radius + e.deltaY * 0.015)
      );
    };

    // Touch controls for mobile/tablet
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      targetCameraAngleRef.current.theta -= deltaX * 0.008;
      targetCameraAngleRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, targetCameraAngleRef.current.phi - deltaY * 0.008)
      );

      previousMousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    dom.addEventListener('touchmove', onTouchMove, { passive: true });
    dom.addEventListener('touchend', onTouchEnd);

    // ==========================================
    // 8. Animation & Render Loop
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera damping
      const cur = cameraAngleRef.current;
      const tgt = targetCameraAngleRef.current;
      cur.theta += (tgt.theta - cur.theta) * 0.1;
      cur.phi += (tgt.phi - cur.phi) * 0.1;
      cur.radius += (tgt.radius - cur.radius) * 0.1;

      // Update camera position on sphere
      camera.position.x = cur.radius * Math.sin(cur.phi) * Math.sin(cur.theta);
      camera.position.y = cur.radius * Math.cos(cur.phi);
      camera.position.z = cur.radius * Math.sin(cur.phi) * Math.cos(cur.theta);
      camera.lookAt(0, 0, 0);

      // Animate current particles if slicer is visible
      if (slicerGroup.visible && particlesRef.current) {
        const pGeo = particlesRef.current.geometry;
        const posAttr = pGeo.attributes.position as THREE.BufferAttribute;
        const posArr = posAttr.array as Float32Array;

        const spd = speedMultiplier * delta * 5;

        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          let px = posArr[idx];
          let py = posArr[idx + 1];
          let pz = posArr[idx + 2];

          // Drift along eddy / gyre
          const angle = Math.atan2(pz, px) + Math.PI / 2;
          px += Math.cos(angle) * velocities[idx] * spd;
          pz += Math.sin(angle) * velocities[idx + 2] * spd;

          // Boundary wrap
          const hw = (boxW * 0.95) / 2;
          const hd = (boxD * 0.95) / 2;
          if (px > hw) px = -hw;
          if (px < -hw) px = hw;
          if (pz > hd) pz = -hd;
          if (pz < -hd) pz = hd;

          posArr[idx] = px;
          posArr[idx + 1] = py;
          posArr[idx + 2] = pz;
        }
        posAttr.needsUpdate = true;
      }

      // Slowly rotate 3D globe if in globe mode
      if (globeGroup.visible) {
        globeMesh.rotation.y += 0.0015 * speedMultiplier;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handling via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      dom.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update View Mode (Slicer vs Globe)
  useEffect(() => {
    if (slicerGroupRef.current && globeGroupRef.current) {
      if (mode === 'slicer') {
        slicerGroupRef.current.visible = true;
        globeGroupRef.current.visible = false;
        targetCameraAngleRef.current = { theta: 0.72, phi: 0.95, radius: 18.5 };
      } else {
        slicerGroupRef.current.visible = false;
        globeGroupRef.current.visible = true;
        targetCameraAngleRef.current = { theta: 1.25, phi: 1.25, radius: 21 };
      }
    }
  }, [mode]);

  // Update Slicing Planes positions dynamically
  useEffect(() => {
    const boxH = 7;
    const boxW = 12;
    const boxD = 10;

    // 1. Z-plane (Depth: 0m to 2000m)
    // 0m = +boxH/2, 2000m = -boxH/2
    if (zPlaneRef.current) {
      const targetY = boxH / 2 - (zDepth / 2000) * boxH;
      zPlaneRef.current.position.y = targetY;
    }

    // 2. X-plane (Longitude slice)
    if (xPlaneRef.current) {
      const [minLon, maxLon] = currentBasin.lonRange;
      const normX = (xLon - minLon) / (maxLon - minLon || 1); // 0 to 1
      const targetX = -boxW / 2 + normX * boxW;
      xPlaneRef.current.position.x = Math.max(-boxW / 2, Math.min(boxW / 2, targetX));
    }

    // 3. Y-plane (Latitude slice)
    if (yPlaneRef.current) {
      const [minLat, maxLat] = currentBasin.latRange;
      const normY = (yLat - minLat) / (maxLat - minLat || 1); // 0 to 1
      const targetZ = boxD / 2 - normY * boxD;
      yPlaneRef.current.position.z = Math.max(-boxD / 2, Math.min(boxD / 2, targetZ));
    }
  }, [zDepth, xLon, yLat, currentBasin]);

  // Update Grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Update Currents visibility and Vector mode
  useEffect(() => {
    if (particlesRef.current) {
      particlesRef.current.visible = showCurrents && vectorType === 'streamlines';
    }
    if (vectorLinesRef.current) {
      vectorLinesRef.current.visible = showCurrents && vectorType === 'vectors';
    }
  }, [showCurrents, vectorType]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#030814] flex flex-col select-none">
      {/* Top Banner overlay inside the 3D canvas */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-[#041426]/85 border border-[#0d3b63] shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-2 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#00e5ff] animate-ping" />
        <span className="font-mono-code text-[11px] font-bold tracking-wider text-[#00e5ff] uppercase">
          {mode === 'slicer'
            ? '3D XYZ OCEAN SLICER • INSPECTING WATER COLUMN STRATIFICATION & VELOCITY'
            : '3D INDIAN OCEAN GLOBE • BATHYMETRY & MAJOR CURRENT CIRCULATION'}
        </span>
      </div>

      {/* Slicing animation flash overlay */}
      {isSlicingActive && (
        <div className="absolute inset-0 z-20 pointer-events-none border-4 border-[#00e5ff] animate-pulse bg-[#00e5ff]/10 transition-all" />
      )}

      {/* WebGL Canvas container */}
      <div ref={containerRef} className="w-full h-full flex-1 cursor-grab active:cursor-grabbing" />

      {/* Bottom Floating Action Bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-[#041426]/90 border border-[#0e355c] p-1.5 rounded-lg shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-md">
        {/* Slice Selected Region button */}
        <button
          onClick={handleSliceRegion}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#00e5ff] text-[#021424] font-mono-code font-bold text-xs hover:bg-[#38bdf8] shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all uppercase tracking-wide"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>Slice Selected Region (XYZ 3D Cube)</span>
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#082038] text-slate-200 hover:text-white hover:bg-[#0c2f52] font-mono-code text-xs border border-[#11395f] transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Reset View</span>
        </button>

        {/* Grid Toggle */}
        <button
          onClick={onToggleGrid}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono-code text-xs border transition-all ${
            showGrid
              ? 'bg-[#00e5ff]/15 border-[#00e5ff]/50 text-[#00e5ff]'
              : 'bg-[#082038] border-[#11395f] text-slate-400 hover:text-slate-200'
          }`}
        >
          <GridIcon className="w-3.5 h-3.5" />
          <span>Grid: {showGrid ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
};
