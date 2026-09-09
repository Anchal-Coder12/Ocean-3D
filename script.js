// --- THREE.JS SCENE SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020611, 0.002); // Dark oceanic fog

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.5;
controls.maxDistance = 10;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0x00e5ff, 1.2);
dirLight.position.set(5, 3, 5);
scene.add(dirLight);

// --- MESH CREATION ---
// 1. Base Earth (Wireframe Tech Look)
const earthGeo = new THREE.SphereGeometry(1, 64, 64);
const earthMat = new THREE.MeshPhongMaterial({
    color: 0x0a1526,
    emissive: 0x051020,
    wireframe: true,
    transparent: true,
    opacity: 0.3
});
const earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

// 2. Ocean Layer (Volumetric Sphere)
const oceanGeo = new THREE.SphereGeometry(1.02, 64, 64);
const oceanMat = new THREE.MeshPhongMaterial({
    color: 0x0088ff,
    transparent: true,
    opacity: 0.6,
    shininess: 90,
    depthWrite: false
});
const ocean = new THREE.Mesh(oceanGeo, oceanMat);
scene.add(ocean);

// 3. Particles (To simulate ocean currents or data nodes)
const partsGeo = new THREE.BufferGeometry();
const partsCount = 2500;
const posArray = new Float32Array(partsCount * 3);
for(let i = 0; i < partsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 3.5;
}
partsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const partsMat = new THREE.PointsMaterial({
    size: 0.008,
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.6
});
const particles = new THREE.Points(partsGeo, partsMat);
scene.add(particles);

// --- STATE LOGIC ---
let currentDepth = 0;
let activeVariable = 'temperature';
let is3DMode = true;

// DOM Elements
const depthSlider = document.getElementById('depth-slider');
const depthVal = document.getElementById('depth-val');
const tempVal = document.getElementById('temp-val');
const pressureVal = document.getElementById('pressure-val');
const lightVal = document.getElementById('light-val');
const varBtns = document.querySelectorAll('.var-btn');
const viewBtn = document.getElementById('view-toggle-btn');

// Scientific calculations and color mapping
function updateOceanVis() {
    // --- Calculate Physics ---
    // Temperature drop profile (Thermocline)
    let temp;
    if(currentDepth <= 200) {
        temp = 28.5 - (currentDepth / 200) * 8; // Mixed layer
    } else if(currentDepth <= 1000) {
        temp = 20.5 - ((currentDepth - 200) / 800) * 15; // Thermocline
    } else {
        temp = 5.5 - ((currentDepth - 1000) / 10000) * 3.5; // Deep ocean
    }
    tempVal.innerText = temp.toFixed(1) + ' °C';
    
    // Pressure (roughly +1 atm per 10m depth)
    let pressure = 1 + (currentDepth / 10);
    pressureVal.innerText = pressure.toFixed(0) + ' atm';

    // Light Level (exponential decay)
    let light = Math.max(0, 100 * Math.exp(-currentDepth / 120));
    lightVal.innerText = light < 0.1 ? '0.0%' : light.toFixed(1) + '%';

    // --- Visual Mapping ---
    if (activeVariable === 'temperature') {
        // Surface = Warm bright blue/cyan. Deep = Cold dark black/blue.
        let r = Math.max(0, 0.1 - (currentDepth/2000));
        let g = Math.max(0, 0.8 - (currentDepth/3000));
        let b = Math.max(0.2, 1.0 - (currentDepth/11000));
        oceanMat.color.setRGB(r, g, b);
        partsMat.color.setHex(0x00e5ff);
    } else if (activeVariable === 'salinity') {
        // Salinity visualizer: higher depth/salinity gets purplish hue
        let factor = currentDepth / 11000;
        oceanMat.color.setRGB(0.3 + factor * 0.4, 0.2, 0.7 + factor * 0.3);
        partsMat.color.setHex(0xb266ff);
    } else if (activeVariable === 'chlorophyll') {
        // Chlorophyll exists only near the surface where there is light
        let factor = Math.max(0, 1 - currentDepth / 250);
        oceanMat.color.setRGB(0.05, 0.6 * factor + 0.1, 0.2);
        partsMat.color.setHex(0x00ff88);
    } else if (activeVariable === 'currents') {
        oceanMat.color.setRGB(0.1, 0.3, 0.6);
        partsMat.color.setHex(0xffffff);
    }

    // Deep sea becomes highly opaque/dark
    oceanMat.opacity = 0.5 + (currentDepth / 11000) * 0.45;
}

// --- EVENT LISTENERS ---
depthSlider.addEventListener('input', (e) => {
    currentDepth = e.target.value;
    depthVal.innerText = currentDepth;
    updateOceanVis();
});

varBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        varBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeVariable = e.target.getAttribute('data-var');
        updateOceanVis();
    });
});

viewBtn.addEventListener('click', () => {
    is3DMode = !is3DMode;
    if(is3DMode) {
        camera.position.set(0, 0, 4.5);
        viewBtn.innerText = "Enter 2D Flat View";
        earth.visible = true;
        oceanGeo.parameters.radius = 1.02; // Restore shape
    } else {
        // Simulate 2D view by zooming straight in and stopping rotation
        camera.position.set(0, 0, 2);
        viewBtn.innerText = "Return to 3D Globe";
    }
});

// --- RENDER LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    // Idle rotation
    if (is3DMode) {
        earth.rotation.y += 0.001;
        ocean.rotation.y += 0.0015;
    }

    // Current flows speed up particles
    if(activeVariable === 'currents') {
        particles.rotation.y += 0.004;
        particles.rotation.x += 0.001;
    } else {
        particles.rotation.y += 0.0008;
    }

    controls.update();
    renderer.render(scene, camera);
}

// Initialize
updateOceanVis();
animate();

// Handle Window Resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});