<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-vue-next";

const props = defineProps<{
  points: { id: string, name: string, latitude: number, longitude: number, category: string, density_level: string }[],
  selectedId: string | null,
  routePoints?: { latitude: number, longitude: number }[],
  routeGeometry?: [number, number][]
}>();
const emit = defineEmits<{
  (e: 'select', id: string | null): void
}>();

const container = ref<HTMLElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: MapControls;
let markers: THREE.Mesh[] = [];
let routeLine: THREE.Mesh | null = null;
let routeArrows: THREE.Mesh[] = [];
let routeGlow: THREE.Mesh | null = null;
let waterMesh: THREE.Mesh | null = null;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let hoveredMarker: THREE.Mesh | null = null;
let animationFrameId: number;

const colors = {
  primary: 0x000000,
  accent: 0xA4BE4F,
  cream: 0xFCE4C0,
  water: 0x3A8EBA,
  skyTop: 0x87CEEB,
  skyBottom: 0xE8F4FD,
  sunWarm: 0xFFF5E6,
  density: {
    green: 0x22c55e,
    yellow: 0xeab308,
    red: 0xf97316
  }
};

const MAP_LON_MIN = 35.15625;
const MAP_LON_MAX = 42.1875;
const MAP_LAT_MAX = 47.04018214480666;
const MAP_LAT_MIN = 40.97989806962013;
const DISP_SCALE = 11.0;

const mapY_max = Math.log(Math.tan(MAP_LAT_MAX*Math.PI/180) + 1/Math.cos(MAP_LAT_MAX*Math.PI/180));
const mapY_min = Math.log(Math.tan(MAP_LAT_MIN*Math.PI/180) + 1/Math.cos(MAP_LAT_MIN*Math.PI/180));

let heightmapData: Uint8ClampedArray | null = null;
let heightmapWidth = 0;
let heightmapHeight = 0;

function getTerrainHeight(pctX: number, pctY: number): number {
  if (!heightmapData) return 1;
  const px = Math.max(0, Math.min(heightmapWidth - 1, Math.floor(pctX * heightmapWidth)));
  const py = Math.max(0, Math.min(heightmapHeight - 1, Math.floor(pctY * heightmapHeight)));
  const idx = (py * heightmapWidth + px) * 4;
  const val = heightmapData[idx] || 0;
  return (val / 255.0) * DISP_SCALE;
}

function latLonToWorld(lat: number, lon: number): { x: number, z: number, pctX: number, pctY: number } {
  const pctX = (lon - MAP_LON_MIN) / (MAP_LON_MAX - MAP_LON_MIN);
  const x = pctX * 200 - 100;
  const yVal = Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180));
  const pctY = (mapY_max - yVal) / (mapY_max - mapY_min);
  const z = pctY * 240 - 120;
  return { x, z, pctX, pctY };
}

function createSkyGradient(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#87CEEB');
  gradient.addColorStop(0.3, '#B8DCF0');
  gradient.addColorStop(0.6, '#E8F4FD');
  gradient.addColorStop(0.85, '#FCE4C0');
  gradient.addColorStop(1, '#F5D6A8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

function initThree() {
  if (!container.value) return;

  scene = new THREE.Scene();

  // Sky dome for realistic atmosphere
  const skyGeo = new THREE.SphereGeometry(400, 32, 32);
  const skyMat = new THREE.MeshBasicMaterial({
    map: createSkyGradient(),
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  scene.add(skyDome);

  scene.fog = new THREE.FogExp2(0xE8F4FD, 0.004);

  camera = new THREE.PerspectiveCamera(45, container.value.clientWidth / container.value.clientHeight, 0.1, 1000);
  camera.position.set(0, 50, 60);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.value.appendChild(renderer.domElement);

  controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 15;
  controls.maxDistance = 250;
  controls.screenSpacePanning = false;

  // Hemisphere light for natural sky-ground color
  const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B7355, 0.5);
  scene.add(hemiLight);

  // Warm ambient for base illumination
  const ambientLight = new THREE.AmbientLight(0xFFF8F0, 0.35);
  scene.add(ambientLight);

  // Main directional sun with warm tint
  const sunLight = new THREE.DirectionalLight(0xFFF5E6, 2.0);
  sunLight.position.set(30, 60, -25);
  sunLight.castShadow = true;
  sunLight.shadow.camera.top = 80;
  sunLight.shadow.camera.bottom = -80;
  sunLight.shadow.camera.left = -80;
  sunLight.shadow.camera.right = 80;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.bias = -0.0003;
  sunLight.shadow.normalBias = 0.02;
  scene.add(sunLight);

  // Soft fill light from opposite side
  const fillLight = new THREE.DirectionalLight(0xB8D4E3, 0.4);
  fillLight.position.set(-20, 30, 20);
  scene.add(fillLight);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const textureLoader = new THREE.TextureLoader();
  const colorMap = textureLoader.load('/terrain/texture_large.jpg');
  if (maxAniso > 0) {
    colorMap.anisotropy = maxAniso;
  }
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.magFilter = THREE.LinearFilter;
  colorMap.minFilter = THREE.LinearMipmapLinearFilter;
  colorMap.generateMipmaps = true;

  const dispMap = textureLoader.load('/terrain/heightmap_large.png');
  if (maxAniso > 0) {
    dispMap.anisotropy = maxAniso;
  }
  dispMap.magFilter = THREE.LinearFilter;
  dispMap.minFilter = THREE.LinearMipmapLinearFilter;

  // Load heightmap into JS canvas for exact point snapping
  const img = new Image();
  img.src = '/terrain/heightmap_large.png';
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    heightmapWidth = img.width;
    heightmapHeight = img.height;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      heightmapData = ctx.getImageData(0, 0, img.width, img.height).data;
      updateMarkers();
      updateRouteLine();
    }
  };

  // High-detail terrain plane (512x512 segments for crisp mountains)
  const planeGeo = new THREE.PlaneGeometry(200, 240, 512, 512);
  const planeMat = new THREE.MeshStandardMaterial({
    map: colorMap,
    displacementMap: dispMap,
    displacementScale: DISP_SCALE,
    roughness: 0.7,
    metalness: 0.02,
    envMapIntensity: 0.4,
    flatShading: false,
  });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);

  // Water plane at sea level
  createWaterPlane();


  loadGeoJSONBorder();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('resize', onWindowResize);
  container.value.addEventListener('mousemove', onMouseMove);
  container.value.addEventListener('click', onClick);

  updateMarkers();
  animate();
}

function createWaterPlane() {
  const waterGeo = new THREE.PlaneGeometry(220, 260, 1, 1);
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: colors.water,
    transparent: true,
    opacity: 0.45,
    roughness: 0.05,
    metalness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transmission: 0.4,
    side: THREE.DoubleSide,
  });
  waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.y = -0.3;
  waterMesh.receiveShadow = true;
  scene.add(waterMesh);
}



function loadGeoJSONBorder() {
  fetch('/terrain/krasnodar.geojson')
    .then(r => r.json())
    .then(geo => {
      const material = new THREE.MeshStandardMaterial({
        color: 0xff1111,
        emissive: 0xff0000,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.9
      });

      const processCoords = (coords: number[][]) => {
        const points: THREE.Vector3[] = [];
        coords.forEach(pt => {
           if (pt.length < 2) return;
           const { x, z, pctX, pctY } = latLonToWorld(pt[1] as number, pt[0] as number);
           const height = getTerrainHeight(pctX, pctY);
           points.push(new THREE.Vector3(x, height + 0.3, z));
        });

        if (points.length < 2) return;

        const path = new THREE.CatmullRomCurve3(points, false, "chordal");
        const tubeGeo = new THREE.TubeGeometry(path, points.length, 0.35, 5, false);
        const tubeMesh = new THREE.Mesh(tubeGeo, material);
        tubeMesh.castShadow = true;
        scene.add(tubeMesh);
      };

      if (geo.type === 'Polygon') {
        geo.coordinates.forEach(processCoords);
      } else if (geo.type === 'MultiPolygon') {
        geo.coordinates.forEach((poly: any[]) => poly.forEach(processCoords));
      }
    })
    .catch(e => console.error("Error loading geojson", e));
}

function updateMarkers() {
  markers.forEach(m => {
    scene.remove(m);
    m.geometry.dispose();
    (m.material as THREE.Material).dispose();
    m.children.forEach(child => {
      (child as THREE.Mesh).geometry.dispose();
      ((child as THREE.Mesh).material as THREE.Material).dispose();
      m.remove(child);
    });
  });
  markers = [];

  const geometry = new THREE.SphereGeometry(1.2, 32, 32);
  const selectedGeometry = new THREE.ConeGeometry(1.5, 4, 32);

  props.points.forEach(point => {
    const { x, z, pctX, pctY } = latLonToWorld(point.latitude, point.longitude);
    const groundY = getTerrainHeight(pctX, pctY);

    const densityColor = colors.density[point.density_level as keyof typeof colors.density] || colors.accent;
    const isSelected = props.selectedId === point.id;

    const material = new THREE.MeshStandardMaterial({
      color: densityColor,
      roughness: 0.2,
      metalness: 0.2,
      emissive: densityColor,
      emissiveIntensity: isSelected ? 0.6 : 0.2
    });

    const mesh = new THREE.Mesh(isSelected ? selectedGeometry : geometry, material);

    if (isSelected) {
      mesh.position.set(x, groundY + 3.0, z);
      mesh.rotation.x = Math.PI;
    } else {
      mesh.position.set(x, groundY + 0.8, z);
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { id: point.id, originalY: mesh.position.y };

    if (isSelected) {
      const glowGeo = new THREE.SphereGeometry(2.5, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.y = -1.5;
      mesh.add(glow);

      const ringGeo = new THREE.TorusGeometry(3, 0.2, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -4;
      mesh.add(ring);
    }

    scene.add(mesh);
    markers.push(mesh);
  });
}

function clearRouteLine() {
  if (routeLine) {
    scene.remove(routeLine);
    routeLine.geometry.dispose();
    (routeLine.material as THREE.Material).dispose();
    routeLine = null;
  }
  if (routeGlow) {
    scene.remove(routeGlow);
    routeGlow.geometry.dispose();
    (routeGlow.material as THREE.Material).dispose();
    routeGlow = null;
  }
  routeArrows.forEach(a => {
    scene.remove(a);
    a.geometry.dispose();
    (a.material as THREE.Material).dispose();
  });
  routeArrows = [];
}

function updateRouteLine() {
  clearRouteLine();

  // Prefer OSRM road geometry, fall back to simple route points
  const geometry = props.routeGeometry && props.routeGeometry.length >= 2
    ? props.routeGeometry
    : null;

  const simplePoints = props.routePoints && props.routePoints.length >= 2
    ? props.routePoints.map(p => [p.latitude, p.longitude] as [number, number])
    : null;

  const coordArray = geometry || simplePoints;
  if (!coordArray || coordArray.length < 2) return;

  const points3d = coordArray.map(([lat, lon]) => {
    const { x, z, pctX, pctY } = latLonToWorld(lat, lon);
    const groundY = getTerrainHeight(pctX, pctY);
    return new THREE.Vector3(x, Math.max(groundY + 0.6, 0.7), z);
  });

  // Main route tube
  const path = new THREE.CatmullRomCurve3(points3d, false, 'centripetal', 0.3);
  const segments = Math.min(points3d.length * 3, 800);
  const tubeGeo = new THREE.TubeGeometry(path, segments, 0.35, 8, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: colors.accent,
    emissive: colors.accent,
    emissiveIntensity: 0.5,
    roughness: 0.3,
    metalness: 0.1,
  });

  routeLine = new THREE.Mesh(tubeGeo, tubeMat);
  routeLine.castShadow = true;
  scene.add(routeLine);

  // Outer glow tube
  const glowGeo = new THREE.TubeGeometry(path, segments, 0.7, 8, false);
  const glowMat = new THREE.MeshBasicMaterial({
    color: colors.accent,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
  });
  routeGlow = new THREE.Mesh(glowGeo, glowMat);
  scene.add(routeGlow);

  // Direction arrows along the path
  const arrowGeo = new THREE.ConeGeometry(0.5, 1.2, 6);
  const arrowMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    emissive: colors.accent,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });

  const arrowCount = Math.min(Math.floor(points3d.length / 8), 25);
  for (let i = 1; i <= arrowCount; i++) {
    const t = i / (arrowCount + 1);
    const pos = path.getPointAt(t);
    const tangent = path.getTangentAt(t);

    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.position.copy(pos);
    arrow.position.y += 0.3;

    // Orient arrow along path direction
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion();
    const rotAxis = new THREE.Vector3().crossVectors(up, tangent).normalize();
    const rotAngle = Math.acos(Math.max(-1, Math.min(1, up.dot(tangent))));
    quaternion.setFromAxisAngle(rotAxis, rotAngle);
    arrow.quaternion.copy(quaternion);

    arrow.castShadow = true;
    scene.add(arrow);
    routeArrows.push(arrow);
  }
}

function onMouseMove(event: MouseEvent) {
  if (!container.value) return;
  const rect = container.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onClick(event: MouseEvent) {
  if (!container.value) return;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers, false);

  if (intersects.length > 0 && intersects[0]?.object) {
    const id = intersects[0].object.userData?.id;
    if (id) emit('select', props.selectedId === id ? null : id);
  } else {
    emit('select', null);
  }
}

function onWindowResize() {
  if (!container.value || !camera || !renderer) return;
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
}

function panMap(dx: number, dz: number) {
  if (!camera || !controls) return;
  const panSpeed = 15;
  camera.position.x += dx * panSpeed;
  camera.position.z += dz * panSpeed;
  controls.target.x += dx * panSpeed;
  controls.target.z += dz * panSpeed;
  controls.update();
}

function zoomMap(delta: number) {
  if (!camera || !controls) return;
  const zoomSpeed = 20;
  const lookDir = new THREE.Vector3();
  camera.getWorldDirection(lookDir);
  camera.position.addScaledVector(lookDir, delta * zoomSpeed);
  controls.update();
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const time = Date.now() * 0.001;

  // Constrain controls
  if (controls && controls.target) {
    controls.target.x = Math.max(-95, Math.min(95, controls.target.x));
    controls.target.z = Math.max(-115, Math.min(115, controls.target.z));
  }

  // Water animation
  if (waterMesh) {
    waterMesh.position.y = -0.3 + Math.sin(time * 0.5) * 0.03;
    (waterMesh.material as THREE.MeshPhysicalMaterial).opacity = 0.42 + Math.sin(time * 0.3) * 0.03;
  }

  // Route glow pulse
  if (routeGlow) {
    (routeGlow.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(time * 2) * 0.07;
  }

  // Raycasting for hover effects
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markers, false);

  if (intersects.length > 0 && intersects[0]?.object) {
    if (hoveredMarker !== intersects[0].object) {
      if (hoveredMarker && props.selectedId !== hoveredMarker.userData.id) {
        hoveredMarker.scale.set(1, 1, 1);
      }
      hoveredMarker = intersects[0].object as THREE.Mesh;
      if (props.selectedId !== hoveredMarker.userData.id) {
        hoveredMarker.scale.set(1.3, 1.3, 1.3);
      }
      document.body.style.cursor = 'pointer';
    }
  } else {
    if (hoveredMarker) {
      if (props.selectedId !== hoveredMarker.userData.id) {
        hoveredMarker.scale.set(1, 1, 1);
      }
      hoveredMarker = null;
    }
    document.body.style.cursor = 'grab';
  }

  // Animate markers gently
  const markerTime = time * 2;
  markers.forEach((m, i) => {
    if (m.userData.id === props.selectedId) {
      m.position.y = m.userData.originalY + Math.sin(markerTime * 2) * 0.5;
      m.rotation.y += 0.02;
    } else {
      m.position.y = m.userData.originalY + Math.sin(markerTime + i) * 0.2;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

watch(() => props.points, updateMarkers, { deep: true });
watch(() => props.selectedId, updateMarkers);
watch(() => props.routePoints, updateRouteLine, { deep: true });
watch(() => props.routeGeometry, updateRouteLine, { deep: true });

onMounted(() => {
  initThree();
  updateRouteLine();
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', onWindowResize);
  if (container.value) {
    container.value.removeEventListener('mousemove', onMouseMove);
    container.value.removeEventListener('click', onClick);
  }
  document.body.style.cursor = 'default';

  renderer?.dispose();
  scene?.traverse((object) => {
    if ((object as THREE.Mesh).geometry) {
      (object as THREE.Mesh).geometry.dispose();
    }
    if ((object as THREE.Mesh).material) {
      const mat = (object as THREE.Mesh).material;
      if (Array.isArray(mat)) mat.forEach(m => m.dispose());
      else mat.dispose();
    }
  });
});
</script>

<template>
  <div class="w-full h-full relative group">
    <div ref="container" class="w-full h-full outline-none" tabindex="0"></div>

    <!-- Navigation Controls -->
    <div class="absolute bottom-6 right-6 flex flex-col items-center gap-1 z-20 pointer-events-auto">
      <div class="flex flex-col items-center gap-1 mb-2 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl p-1">
        <button @click.stop="zoomMap(1)" class="w-8 h-8 flex items-center justify-center rounded-xl text-primary hover:bg-white/60 hover:text-accent transition-all cursor-pointer">
          <Plus class="w-4 h-4" />
        </button>
        <div class="w-6 h-[1px] bg-primary/10"></div>
        <button @click.stop="zoomMap(-1)" class="w-8 h-8 flex items-center justify-center rounded-xl text-primary hover:bg-white/60 hover:text-accent transition-all cursor-pointer">
          <Minus class="w-4 h-4" />
        </button>
      </div>

      <button @click.stop="panMap(0, -1)" class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 text-primary hover:bg-white/80 hover:text-accent transition-all cursor-pointer shadow-sm">
        <ChevronUp class="w-6 h-6" />
      </button>
      <div class="flex gap-1 relative">
        <button @click.stop="panMap(-1, 0)" class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 text-primary hover:bg-white/80 hover:text-accent transition-all cursor-pointer shadow-sm">
          <ChevronLeft class="w-6 h-6" />
        </button>
        <button @click.stop="panMap(0, 1)" class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 text-primary hover:bg-white/80 hover:text-accent transition-all cursor-pointer shadow-sm">
          <ChevronDown class="w-6 h-6" />
        </button>
        <button @click.stop="panMap(1, 0)" class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 text-primary hover:bg-white/80 hover:text-accent transition-all cursor-pointer shadow-sm">
          <ChevronRight class="w-6 h-6" />
        </button>
      </div>
    </div>
  </div>
</template>
