<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-vue-next";

const props = defineProps<{
  points: { id: string, name: string, latitude: number, longitude: number, category: string, density_level: string }[],
  selectedId: string | null,
  routePoints?: { latitude: number, longitude: number }[]
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
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let hoveredMarker: THREE.Mesh | null = null;
let animationFrameId: number;

const colors = {
  primary: 0x285A71,
  accent: 0xA4BE4F,
  cream: 0xFCE4C0,
  density: {
    green: 0x22c55e,
    yellow: 0xeab308,
    red: 0xef4444
  }
};

const MAP_LON_MIN = 35.15625;
const MAP_LON_MAX = 42.1875;
const MAP_LAT_MAX = 47.04018214480666; // North
const MAP_LAT_MIN = 40.97989806962013; // South
const DISP_SCALE = 11.0; // Lower scale for softer, rounder mountains

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
  const val = heightmapData[idx] || 0; // R channel
  return (val / 255.0) * DISP_SCALE;
}

function initThree() {
  if (!container.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(colors.cream); // Remove black background void
  scene.fog = new THREE.FogExp2(colors.cream, 0.006); // Thicker fog to softly hide edge cuts

  camera = new THREE.PerspectiveCamera(45, container.value.clientWidth / container.value.clientHeight, 0.1, 1000);
  camera.position.set(0, 50, 60);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.setClearColor(0x000000, 0); // Transparent background
  container.value.appendChild(renderer.domElement);

  controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2.1; // Keep camera above ground
  controls.minDistance = 20;
  controls.maxDistance = 250;
  // Make panning strictly horizontal
  controls.screenSpacePanning = false;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
  dirLight.position.set(20, 50, -20);
  dirLight.castShadow = true;
  dirLight.shadow.camera.top = 60;
  dirLight.shadow.camera.bottom = -60;
  dirLight.shadow.camera.left = -60;
  dirLight.shadow.camera.right = 60;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  // Load Textures
  const textureLoader = new THREE.TextureLoader();
  const colorMap = textureLoader.load('/terrain/texture_large.jpg');
  if (renderer.capabilities.getMaxAnisotropy() > 0) {
    colorMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  const dispMap = textureLoader.load('/terrain/heightmap_large.png');

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
      updateMarkers(); // Refresh marker Y positions
      if (props.routePoints) updateRouteLine();
    }
  };

  // Base Map Plane for Massive Region
  // Reduced geometry density to naturally smooth and round the mountains like rolling hills
  const planeGeo = new THREE.PlaneGeometry(200, 240, 384, 384);

  const planeMat = new THREE.MeshStandardMaterial({ 
    map: colorMap,
    displacementMap: dispMap,
    displacementScale: DISP_SCALE, 
    roughness: 0.7,
    metalness: 0.1,
  });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);
  
  loadGeoJSONBorder();

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('resize', onWindowResize);
  container.value.addEventListener('mousemove', onMouseMove);
  container.value.addEventListener('click', onClick);

  updateMarkers();
  animate();
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
           const lon = pt[0] as number;
           const lat = pt[1] as number;
           const pctX = (lon - MAP_LON_MIN) / (MAP_LON_MAX - MAP_LON_MIN);
           const x = pctX * 200 - 100;
           const yVal = Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180));
           const pctY = (mapY_max - yVal) / (mapY_max - mapY_min); 
           const z = pctY * 240 - 120;
           const height = getTerrainHeight(pctX, pctY);
           points.push(new THREE.Vector3(x, height + 0.3, z)); // slightly above ground
        });
        
        if (points.length < 2) return;
        
        // Use TubeGeometry for thick pronounced borders instead of thin 1px lines
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
  // Clear old markers
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
    // Exact mapping of Lat/Lon to the dynamically generated 200x240 texture bounding box
    const pctX = (point.longitude - MAP_LON_MIN) / (MAP_LON_MAX - MAP_LON_MIN);
    const x = pctX * 200 - 100;

    const yVal = Math.log(Math.tan(point.latitude*Math.PI/180) + 1/Math.cos(point.latitude*Math.PI/180));
    const pctY = (mapY_max - yVal) / (mapY_max - mapY_min); 
    const z = pctY * 240 - 120;
    
    // Snapping marker directly to realistic terrain height!
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
    
    // Markers are placed exactly on ground
    if (isSelected) {
      mesh.position.set(x, groundY + 3.0, z); // hovering slightly higher when selected
      mesh.rotation.x = Math.PI; // point downwards
    } else {
      mesh.position.set(x, groundY + 0.8, z);
    }
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { id: point.id, originalY: mesh.position.y };

    // Outer glow for selected
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
      ring.position.y = -4; // placed on the ground
      mesh.add(ring);
    }

    scene.add(mesh);
    markers.push(mesh);
  });
}

function updateRouteLine() {
  if (routeLine) {
    scene.remove(routeLine);
    routeLine.geometry.dispose();
    (routeLine.material as THREE.Material).dispose();
    routeLine = null;
  }

  if (!props.routePoints || props.routePoints.length < 2) return;

  const points3d = props.routePoints.map(p => {
    const pctX = (p.longitude - MAP_LON_MIN) / (MAP_LON_MAX - MAP_LON_MIN);
    const x = pctX * 200 - 100;
    const yVal = Math.log(Math.tan(p.latitude*Math.PI/180) + 1/Math.cos(p.latitude*Math.PI/180));
    const pctY = (mapY_max - yVal) / (mapY_max - mapY_min); 
    const z = pctY * 240 - 120;
    const groundY = getTerrainHeight(pctX, pctY);
    return new THREE.Vector3(x, groundY + 0.5, z); // hugging the ground topography closely
  });

  const path = new THREE.CatmullRomCurve3(points3d);
  const tubeGeo = new THREE.TubeGeometry(path, 128, 0.4, 8, false);
  const tubeMat = new THREE.MeshStandardMaterial({ 
    color: colors.accent, 
    emissive: colors.accent,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.9,
    roughness: 0.2
  });

  routeLine = new THREE.Mesh(tubeGeo, tubeMat);
  routeLine.castShadow = true;
  scene.add(routeLine);
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
    // Check if dragging or just clicking. If purely clicking plane, deselect.
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
  
  // Calculate movement relative to camera rotation over the Y axis
  const angle = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
  
  // Actually, since the map is top-down, just moving world X and Z is exactly what we want for N/S/E/W.
  camera.position.x += dx * panSpeed;
  camera.position.z += dz * panSpeed;
  controls.target.x += dx * panSpeed;
  controls.target.z += dz * panSpeed;
  
  controls.update();
}

function zoomMap(delta: number) {
  if (!camera || !controls) return;
  const zoomSpeed = 20;
  
  // Move camera along its look vector
  const lookDir = new THREE.Vector3();
  camera.getWorldDirection(lookDir);
  
  camera.position.addScaledVector(lookDir, delta * zoomSpeed);
  controls.update();
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  // Constrain controls to map limits so user doesn't fly into the void
  if (controls && controls.target) {
    controls.target.x = Math.max(-95, Math.min(95, controls.target.x));
    controls.target.z = Math.max(-115, Math.min(115, controls.target.z));
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
  const time = Date.now() * 0.002;
  markers.forEach((m, i) => {
    if (m.userData.id === props.selectedId) {
      m.position.y = m.userData.originalY + Math.sin(time * 2) * 0.5;
      m.rotation.y += 0.02;
    } else {
      m.position.y = m.userData.originalY + Math.sin(time + i) * 0.2;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}

watch(() => props.points, updateMarkers, { deep: true });
watch(() => props.selectedId, updateMarkers);
watch(() => props.routePoints, updateRouteLine, { deep: true });

onMounted(() => {
  initThree();
  if (props.routePoints) updateRouteLine();
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  window.removeEventListener('resize', onWindowResize);
  if (container.value) {
    container.value.removeEventListener('mousemove', onMouseMove);
    container.value.removeEventListener('click', onClick);
  }
  document.body.style.cursor = 'default';
  
  // Clean up WebGL resources
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
