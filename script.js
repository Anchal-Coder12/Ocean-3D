// --- PRO THREE.JS SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060913, 0.003); // Deep space/ocean fog

// Camera slightly offset to match the composition of the screenshot
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = false; // Locked zoom for a dashboard feel

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xd946ef, 1.5); // Magenta light
dirLight.position.set(5, 3, 5);
scene.add(dirLight);
const blueLight = new THREE.DirectionalLight(0x00f0ff, 0.5); // Cyan rim light
blueLight.position.set(-5, -3, -5);
scene.add(blueLight);

// --- MESH CREATION (The Sleek Globe) ---
// Base dark sphere
const earthGeo = new THREE.SphereGeometry(1, 64, 64);
const earthMat = new THREE.MeshPhongMaterial({
    color: 0x0a0514,
    emissive: 0x1a0a2e,
    transparent: true,
    opacity: 0.9,
    shininess: 50
});
const earth = new THREE.Mesh(earthGeo, earthMat);
scene.add(earth);

// Outer atmosphere/glow (The pinkish gradient from your image)
const atmosGeo = new THREE.SphereGeometry(1.03, 64, 64);
const atmosMat = new THREE.MeshPhongMaterial({
    color: 0xd946ef, // Deep pink/magenta
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const atmosphere = new THREE.Mesh(atmosGeo, atmosMat);
scene.add(atmosphere);

// Tiny subtle stars/data points in the background
const starsGeo = new THREE.BufferGeometry();
const starsCount = 500;
const posArray = new Float32Array(starsCount * 3);
for(let i = 0; i < starsCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 8;
}
starsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMat = new THREE.PointsMaterial({
    size: 0.005,
    color: 0xffffff,
    transparent: true,
    opacity: 0.3
});
const stars = new THREE.Points(starsGeo, starsMat);
scene.add(stars);

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    
    // Very slow, professional rotation
    earth.rotation.y += 0.0005;
    atmosphere.rotation.y += 0.0005;
    stars.rotation.y += 0.0002;

    controls.update();
    renderer.render(scene, camera);
}
animate();

// --- UI EVENT LISTENERS ---
// Update UI numbers when sliders move to make the mock-up feel interactive
document.getElementById('depth-slider').addEventListener('input', (e) => {
    document.getElementById('depth-val').innerText = e.target.value + ' m';
});

document.getElementById('vert-slider').addEventListener('input', (e) => {
    document.getElementById('vert-val').innerText = e.target.value + 'x';
});

document.getElementById('opac-slider').addEventListener('input', (e) => {
    document.getElementById('opac-val').innerText = e.target.value + '%';
});

// Handle Window Resizing for the flex container
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
