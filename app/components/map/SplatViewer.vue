<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';

const props = defineProps<{
  splatUrl: string;
}>();

const container = ref<HTMLElement | null>(null);
const joystickArea = ref<HTMLElement | null>(null);
const joystickKnob = ref<HTMLElement | null>(null);

let viewer: any = null;
let animFrameId = 0;
let disposed = false;

const isMobile = ref(false);

const moveState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  up: false,
  down: false,
};

let yaw = 0;
let pitch = 0;
const MOVE_SPEED = 3.0;
const LOOK_SENSITIVITY = 0.003;
const PITCH_LIMIT = Math.PI / 2 - 0.1;

let joystickActive = false;
let joystickTouchId = -1;
let joystickStartX = 0;
let joystickStartY = 0;
let joystickDX = 0;
let joystickDY = 0;
const JOYSTICK_RADIUS = 50;

let lookTouchId: number | null = null;
let lookLastX = 0;
let lookLastY = 0;

let lastTime = 0;

function detectMobile(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function onKeyDown(e: KeyboardEvent) {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': moveState.forward = true; break;
    case 'KeyS': case 'ArrowDown': moveState.backward = true; break;
    case 'KeyA': case 'ArrowLeft': moveState.left = true; break;
    case 'KeyD': case 'ArrowRight': moveState.right = true; break;
    case 'Space': case 'KeyQ': e.preventDefault(); moveState.up = true; break;
    case 'ShiftLeft': case 'ShiftRight': case 'KeyE': moveState.down = true; break;
  }
}

function onKeyUp(e: KeyboardEvent) {
  switch (e.code) {
    case 'KeyW': case 'ArrowUp': moveState.forward = false; break;
    case 'KeyS': case 'ArrowDown': moveState.backward = false; break;
    case 'KeyA': case 'ArrowLeft': moveState.left = false; break;
    case 'KeyD': case 'ArrowRight': moveState.right = false; break;
    case 'Space': case 'KeyQ': moveState.up = false; break;
    case 'ShiftLeft': case 'ShiftRight': case 'KeyE': moveState.down = false; break;
  }
}

let mouseDragging = false;
let mouseLastX = 0;
let mouseLastY = 0;

function onMouseDown(e: MouseEvent) {
  if (isMobile.value) return;
  mouseDragging = true;
  mouseLastX = e.clientX;
  mouseLastY = e.clientY;
}

function onMouseMove(e: MouseEvent) {
  if (!mouseDragging || isMobile.value) return;
  const dx = e.clientX - mouseLastX;
  const dy = e.clientY - mouseLastY;
  mouseLastX = e.clientX;
  mouseLastY = e.clientY;
  yaw -= dx * LOOK_SENSITIVITY;
  pitch -= dy * LOOK_SENSITIVITY;
  pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
}

function onMouseUp() {
  mouseDragging = false;
}

function onTouchStart(e: TouchEvent) {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches.item(i);
    if (!t) continue;
    const rect = container.value?.getBoundingClientRect();
    if (!rect) continue;
    const relX = t.clientX - rect.left;

    if (relX < rect.width * 0.4) {
      if (!joystickActive) {
        joystickActive = true;
        joystickStartX = t.clientX;
        joystickStartY = t.clientY;
        joystickTouchId = t.identifier;
        updateJoystickVisual(t.clientX, t.clientY, t.clientX, t.clientY);
        if (joystickArea.value) joystickArea.value.style.display = 'block';
      }
    } else {
      if (lookTouchId === null) {
        lookTouchId = t.identifier;
        lookLastX = t.clientX;
        lookLastY = t.clientY;
      }
    }
  }
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault();
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches.item(i);
    if (!t) continue;

    if (joystickActive && t.identifier === joystickTouchId) {
      joystickDX = t.clientX - joystickStartX;
      joystickDY = t.clientY - joystickStartY;
      const dist = Math.sqrt(joystickDX * joystickDX + joystickDY * joystickDY);
      if (dist > JOYSTICK_RADIUS) {
        joystickDX = (joystickDX / dist) * JOYSTICK_RADIUS;
        joystickDY = (joystickDY / dist) * JOYSTICK_RADIUS;
      }
      updateJoystickVisual(joystickStartX, joystickStartY, joystickStartX + joystickDX, joystickStartY + joystickDY);
    }

    if (t.identifier === lookTouchId) {
      const dx = t.clientX - lookLastX;
      const dy = t.clientY - lookLastY;
      lookLastX = t.clientX;
      lookLastY = t.clientY;
      yaw -= dx * LOOK_SENSITIVITY * 1.5;
      pitch -= dy * LOOK_SENSITIVITY * 1.5;
      pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
    }
  }
}

function onTouchEnd(e: TouchEvent) {
  for (let i = 0; i < e.changedTouches.length; i++) {
    const t = e.changedTouches.item(i);
    if (!t) continue;

    if (joystickActive && t.identifier === joystickTouchId) {
      joystickActive = false;
      joystickDX = 0;
      joystickDY = 0;
      joystickTouchId = -1;
      if (joystickArea.value) joystickArea.value.style.display = 'none';
    }

    if (t.identifier === lookTouchId) {
      lookTouchId = null;
    }
  }
}

function updateJoystickVisual(baseX: number, baseY: number, knobX: number, knobY: number) {
  if (!joystickArea.value || !joystickKnob.value || !container.value) return;
  const rect = container.value.getBoundingClientRect();

  joystickArea.value.style.left = `${baseX - rect.left - 60}px`;
  joystickArea.value.style.top = `${baseY - rect.top - 60}px`;

  const kx = knobX - baseX;
  const ky = knobY - baseY;
  joystickKnob.value.style.transform = `translate(${kx}px, ${ky}px)`;
}

function updateCamera(camera: THREE.PerspectiveCamera, dt: number) {
  const euler = new THREE.Euler(pitch, yaw, 0, 'YXZ');
  camera.quaternion.setFromEuler(euler);

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const up = new THREE.Vector3(0, -1, 0);

  const speed = MOVE_SPEED * dt;

  if (moveState.forward) camera.position.addScaledVector(forward, speed);
  if (moveState.backward) camera.position.addScaledVector(forward, -speed);
  if (moveState.left) camera.position.addScaledVector(right, -speed);
  if (moveState.right) camera.position.addScaledVector(right, speed);
  if (moveState.up) camera.position.addScaledVector(up, speed);
  if (moveState.down) camera.position.addScaledVector(up, -speed);

  if (joystickActive) {
    const jx = joystickDX / JOYSTICK_RADIUS;
    const jy = -joystickDY / JOYSTICK_RADIUS;
    camera.position.addScaledVector(forward, jy * speed);
    camera.position.addScaledVector(right, jx * speed);
  }
}

onMounted(async () => {
  if (!container.value || !props.splatUrl) return;

  isMobile.value = detectMobile();

  const GaussianSplats3D = await import('@mkkellogg/gaussian-splats-3d');

  const mobile = isMobile.value;

  viewer = new GaussianSplats3D.Viewer({
    cameraUp: [0, -1, 0],
    initialCameraPosition: [0, 5, 10],
    initialCameraLookAt: [0, 0, 0],
    rootElement: container.value,
    sharedMemoryForWorkers: false,
    useBuiltInControls: false,
    ignoreDevicePixelRatio: mobile,
    halfPrecisionCovariancesOnGPU: mobile,
    sceneRevealMode: GaussianSplats3D.SceneRevealMode.Gradual,
    sceneFadeInRateMultiplier: 2.0,
  });

  try {
    await viewer.addSplatScene(props.splatUrl, {
      splatAlphaRemovalThreshold: mobile ? 10 : 5,
      showLoadingUI: true,
      progressiveLoad: true,
      rotation: [1, 0, 0, 0],
    });
    viewer.start();
  } catch (err) {
    console.error('Failed to load splat scene:', err);
    return;
  }

  const camera = viewer.camera as THREE.PerspectiveCamera;
  if (camera) {
    const lookAt = new THREE.Vector3(0, 0, 0);
    const dir = lookAt.sub(camera.position).normalize();
    yaw = Math.atan2(-dir.x, -dir.z);
    pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, pitch));
  }

  if (mobile && viewer.renderer) {
    viewer.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  }

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  const el = container.value;
  if (el) {
    el.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
  }

  lastTime = performance.now();
  function loop() {
    if (disposed) return;
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (camera) {
      updateCamera(camera, dt);
    }

    animFrameId = requestAnimationFrame(loop);
  }
  animFrameId = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  disposed = true;
  if (animFrameId) cancelAnimationFrame(animFrameId);

  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);

  const el = container.value;
  if (el) {
    el.removeEventListener('mousedown', onMouseDown);
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);
    el.removeEventListener('touchcancel', onTouchEnd);
  }

  if (viewer) {
    try {
      viewer.dispose();
    } catch {
      // ignore cleanup errors
    }
    viewer = null;
  }
});
</script>

<template>
  <div ref="container" class="splat-viewer" style="touch-action: none;">
    <!-- Virtual Joystick (mobile only) -->
    <div v-if="isMobile" ref="joystickArea" class="joystick-base" style="display: none;">
      <div ref="joystickKnob" class="joystick-knob"></div>
    </div>

    <!-- Controls Hint -->
    <div class="controls-hint">
      <template v-if="!isMobile">
        <span class="hint-key">W A S D</span> или <span class="hint-key">↑ ↓ ← →</span> — движение
        <br><span class="hint-key">Q</span> / <span class="hint-key">Пробел</span> — вверх &nbsp; <span class="hint-key">E</span> / <span class="hint-key">Shift</span> — вниз
        <br>Зажмите мышь — обзор
      </template>
      <template v-else>
        <span>🕹️ Левая часть — движение</span>
        <br><span>👆 Правая часть — обзор</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.splat-viewer {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.splat-viewer:active {
  cursor: grabbing;
}

.splat-viewer :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.joystick-base {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: 2px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(4px);
  z-index: 100;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.joystick-knob {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(164, 190, 79, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.05s ease-out;
  pointer-events: none;
}

.controls-hint {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
  font-family: inherit;
  padding: 8px 16px;
  border-radius: 12px;
  text-align: center;
  z-index: 90;
  pointer-events: none;
  line-height: 1.5;
  animation: hintFadeOut 6s forwards;
}

.hint-key {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 600;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
}

@keyframes hintFadeOut {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
