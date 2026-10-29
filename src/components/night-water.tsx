"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Original dark-water nighttime scene — infinite ocean, moonlight, Gerstner
 * waves + splash ripples at the cursor. Built from scratch for this project.
 */
export function NightWater() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // ===== scene =====
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02030a);
    scene.fog = new THREE.FogExp2(0x02030a, 0.009);

    const camera = new THREE.PerspectiveCamera(
      60,
      el.clientWidth / el.clientHeight,
      0.1,
      2000,
    );
    camera.position.set(0, 6, 24);
    camera.lookAt(0, 2, -1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x02030a, 1);
    el.appendChild(renderer.domElement);

    // ===== moon in the distance =====
    const moonGeo = new THREE.CircleGeometry(14, 48);
    const moonMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {},
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          float d = length(vUv - 0.5) * 2.0;
          float core = smoothstep(0.55, 0.0, d);
          float halo = smoothstep(1.0, 0.4, d) * 0.35;
          vec3 col = mix(vec3(0.0), vec3(0.95, 0.96, 1.0), core);
          col += vec3(0.5, 0.6, 0.95) * halo;
          float a = max(core, halo);
          gl_FragColor = vec4(col, a);
        }
      `,
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(0, 24, -220);
    scene.add(moon);

    // ===== water plane — large and dense, tiled to the camera for infinity =====
    const PLANE_SIZE = 600;
    const SEGMENTS = 320;
    const waterGeo = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE, SEGMENTS, SEGMENTS);
    waterGeo.rotateX(-Math.PI / 2);

    const waterMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:         { value: 0 },
        uCamPos:       { value: new THREE.Vector3() },
        uMoonPos:      { value: new THREE.Vector3(0, 24, -220) },
        uMoonColor:    { value: new THREE.Color(0.95, 0.96, 1.0) },
        uSplashPos:    { value: new THREE.Vector3(0, 0, 0) },
        uSplashTime:   { value: -10 },
        uSplashActive: { value: 0 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec3  uCamPos;
        uniform vec3  uSplashPos;
        uniform float uSplashTime;
        uniform float uSplashActive;

        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vFoam;

        // single Gerstner wave contribution to position + normal basis
        void gerstner(
          vec2 posXZ, vec2 dir, float wavelength, float steepness, float speed, float t,
          inout vec3 displace, inout vec3 tangent, inout vec3 binormal
        ) {
          float k = 6.28318 / wavelength;
          float c = speed;
          vec2  d = normalize(dir);
          float f = k * (dot(d, posXZ) - c * t);
          float a = steepness / k;

          displace.x += d.x * a * cos(f);
          displace.z += d.y * a * cos(f);
          displace.y += a * sin(f);

          // local tangent/binormal (for normal estimation)
          tangent  += vec3(
            -d.x * d.x * (steepness * sin(f)),
             d.x * (steepness * cos(f)),
            -d.x * d.y * (steepness * sin(f))
          );
          binormal += vec3(
            -d.x * d.y * (steepness * sin(f)),
             d.y * (steepness * cos(f)),
            -d.y * d.y * (steepness * sin(f))
          );
        }

        void main() {
          // "Infinite ocean" trick: snap the mesh to follow the camera on XZ,
          // but at a coarse grid step so vertices don't visibly swim.
          float step = 2.0;
          vec3 pos = position;
          pos.x += floor(uCamPos.x / step) * step;
          pos.z += floor(uCamPos.z / step) * step;

          vec2 xz = vec2(pos.x, pos.z);

          vec3 displace = vec3(0.0);
          vec3 tangent  = vec3(1.0, 0.0, 0.0);
          vec3 binormal = vec3(0.0, 0.0, 1.0);

          // Four crossing Gerstner waves of different lengths/directions.
          gerstner(xz, vec2( 1.0,  0.3), 18.0, 0.35, 1.2, uTime, displace, tangent, binormal);
          gerstner(xz, vec2(-0.6,  1.0), 11.0, 0.28, 1.6, uTime, displace, tangent, binormal);
          gerstner(xz, vec2( 0.4, -0.9),  7.0, 0.22, 2.0, uTime, displace, tangent, binormal);
          gerstner(xz, vec2( 0.8,  0.1),  4.2, 0.14, 2.6, uTime, displace, tangent, binormal);

          // Splash ripple from the mouse pointer: a traveling ring of displacement.
          float foam = 0.0;
          if (uSplashActive > 0.5) {
            float age = uTime - uSplashTime;
            if (age > 0.0 && age < 3.0) {
              float dist = distance(xz, uSplashPos.xz);
              float ringR = age * 10.0;              // ring expands at 10 u/s
              float band  = exp(-pow(dist - ringR, 2.0) * 0.5); // thin shell
              float decay = exp(-age * 1.2);
              float amp   = 0.9 * band * decay;
              displace.y += amp;
              foam = band * decay;
              // small inward tangential wiggle for ripple feel
              vec2 awayDir = normalize(xz - uSplashPos.xz + vec2(0.0001));
              displace.x += awayDir.x * amp * 0.2;
              displace.z += awayDir.y * amp * 0.2;
            }
          }

          pos.x += displace.x;
          pos.y += displace.y;
          pos.z += displace.z;

          vec3 normal = normalize(cross(binormal, tangent));
          vNormal = normal;
          vFoam = foam;

          vec4 worldPos = modelMatrix * vec4(pos, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uCamPos;
        uniform vec3 uMoonPos;
        uniform vec3 uMoonColor;

        varying vec3 vWorldPos;
        varying vec3 vNormal;
        varying float vFoam;

        void main() {
          vec3 n = normalize(vNormal);
          vec3 v = normalize(uCamPos - vWorldPos);
          vec3 l = normalize(uMoonPos - vWorldPos);
          vec3 h = normalize(l + v);

          // dark base color
          vec3 deep    = vec3(0.008, 0.015, 0.035);
          vec3 shallow = vec3(0.03, 0.07, 0.14);
          float depthMix = clamp(1.0 - exp(-length(vWorldPos.xz - uCamPos.xz) * 0.004), 0.0, 1.0);
          vec3 base = mix(shallow, deep, depthMix);

          // fresnel
          float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);

          // moonlight specular (sharp highlight along moon reflection)
          float spec = pow(max(dot(n, h), 0.0), 180.0);

          // broader moonlight glow across the water (the long reflected trail)
          vec3 r = reflect(-v, n);
          float moonTrail = pow(max(dot(normalize(uMoonPos - vWorldPos), r), 0.0), 24.0);

          vec3 col = base;
          col += uMoonColor * spec * 1.6;
          col += uMoonColor * moonTrail * 0.45;
          col += uMoonColor * fres * 0.25;

          // splash foam — bright white crest where the ripple passes
          col += vec3(0.9, 0.95, 1.0) * vFoam * 0.9;

          // very subtle grain
          col *= 0.9 + 0.1 * fract(sin(dot(vWorldPos.xz, vec2(12.9, 78.2))) * 43758.5453);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0;
    scene.add(water);

    // ===== first-person arms attached directly to the camera =====
    scene.add(camera);

    // armsRoot sits right at the camera; the model inside will have the
    // shoulders OFF-SCREEN behind/below and arms extending forward.
    const armsRoot = new THREE.Group();
    armsRoot.position.set(0, 0, 0);
    camera.add(armsRoot);

    // Lighting for the arms. Added to the scene (not camera) so the direction
    // in world space stays consistent.
    scene.add(new THREE.AmbientLight(0x8090a0, 0.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 10, 5);
    scene.add(keyLight);

    // Shim objects so the animation code below (leftArm.group / rightArm.group)
    // keeps compiling. The real model is loaded into leftArm.group.
    const leftArm  = { group: new THREE.Group() };
    const rightArm = { group: new THREE.Group() };
    armsRoot.add(leftArm.group);
    armsRoot.add(rightArm.group);

    // Arms model disabled — positioning a rigged first-person viewmodel
    // correctly requires editing the rig in Blender, not runtime hacks.
    // Flip ENABLE_ARMS to true to try again.
    const ENABLE_ARMS = false;
    if (ENABLE_ARMS) {
      const loader = new GLTFLoader();
      loader.load("/assets/arms.glb", (gltf) => {
        const src = gltf.scene;
        src.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh) mesh.frustumCulled = false;
        });
        src.scale.setScalar(0.25);
        src.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
        leftArm.group.add(src);
        rightArm.group.visible = false;
      });
    }

    // ===== small flickering specks on the horizon (distant lights) =====
    const SPECKS = 240;
    const specPos = new Float32Array(SPECKS * 3);
    const specPhase = new Float32Array(SPECKS);
    for (let i = 0; i < SPECKS; i++) {
      const r = 180 + Math.random() * 250;
      const a = Math.random() * Math.PI * 2;
      specPos[i * 3]     = Math.cos(a) * r;
      specPos[i * 3 + 1] = 1.5 + Math.random() * 3;
      specPos[i * 3 + 2] = Math.sin(a) * r - 60;
      specPhase[i] = Math.random() * 6.28;
    }
    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute("position", new THREE.BufferAttribute(specPos, 3));
    spGeo.setAttribute("phase", new THREE.BufferAttribute(specPhase, 1));
    const spMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        attribute float phase;
        uniform float uTime;
        varying float vA;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 2.0;
          vA = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * 2.0 + phase));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying float vA;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          float a = smoothstep(0.5, 0.0, d) * vA;
          gl_FragColor = vec4(0.85, 0.9, 1.0, a);
        }
      `,
    });
    const specks = new THREE.Points(spGeo, spMat);
    scene.add(specks);

    // ===== interaction: FPS-style look + WASD + splash on hover =====
    const look = { yaw: 0, pitch: 0, targetYaw: 0, targetPitch: -0.05 };
    let dragging = false;
    let lastX = 0, lastY = 0;

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const hitPoint = new THREE.Vector3();

    const triggerSplash = (clientX: number, clientY: number) => {
      const r = el.getBoundingClientRect();
      ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -(((clientY - r.top) / r.height) * 2 - 1);
      raycaster.setFromCamera(ndc, camera);
      if (raycaster.ray.intersectPlane(waterPlane, hitPoint)) {
        waterMat.uniforms.uSplashPos.value.copy(hitPoint);
        waterMat.uniforms.uSplashTime.value = waterMat.uniforms.uTime.value;
        waterMat.uniforms.uSplashActive.value = 1;
      }
    };

    let splashCooldown = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      triggerSplash(e.clientX, e.clientY);
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    };
    const onUp = () => { dragging = false; };
    const onMove = (e: PointerEvent) => {
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        look.targetYaw   -= dx * 0.004;
        look.targetPitch -= dy * 0.003;
        look.targetPitch = Math.max(-0.8, Math.min(0.5, look.targetPitch));
      } else {
        // soft hover-look
        const r = el.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        look.targetYaw   = -nx * 0.6;
        look.targetPitch = -ny * 0.2 - 0.05;
        // periodic splashes while hovering
        if (performance.now() > splashCooldown) {
          triggerSplash(e.clientX, e.clientY);
          splashCooldown = performance.now() + 350;
        }
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointermove", onMove);

    // WASD
    const keys = { w: false, a: false, s: false, d: false, shift: false };
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w") keys.w = true;
      if (k === "a") keys.a = true;
      if (k === "s") keys.s = true;
      if (k === "d") keys.d = true;
      if (e.key === "Shift") keys.shift = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "w") keys.w = false;
      if (k === "a") keys.a = false;
      if (k === "s") keys.s = false;
      if (k === "d") keys.d = false;
      if (e.key === "Shift") keys.shift = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // swim stroke state
    let strokePhase = 0;        // 0..2π, advances while moving
    let strokeIntensity = 0;    // smoothed 0..1 "how fast arms swing"
    let bob = 0;                // tiny vertical bob while swimming

    let rafId = 0;
    let lastT = performance.now();
    const t0 = lastT;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const t = (now - t0) / 1000;

      look.yaw   += (look.targetYaw   - look.yaw)   * 0.12;
      look.pitch += (look.targetPitch - look.pitch) * 0.12;

      const speed = (keys.shift ? 28 : 12) * dt;
      const forward = new THREE.Vector3(-Math.sin(look.yaw), 0, -Math.cos(look.yaw));
      const right   = new THREE.Vector3( Math.cos(look.yaw), 0, -Math.sin(look.yaw));

      // detect any movement input
      const movingW = keys.w;
      const movingS = keys.s;
      const movingA = keys.a;
      const movingD = keys.d;
      const movingAny = movingW || movingS || movingA || movingD;

      if (movingW) camera.position.addScaledVector(forward,  speed);
      if (movingS) camera.position.addScaledVector(forward, -speed);
      if (movingD) camera.position.addScaledVector(right,    speed);
      if (movingA) camera.position.addScaledVector(right,   -speed);

      // ====== swim stroke animation ======
      const targetIntensity = movingAny ? (keys.shift ? 1.4 : 1.0) : 0.0;
      strokeIntensity += (targetIntensity - strokeIntensity) * 0.1;
      // phase advance when moving — frequency ~1Hz per stroke
      strokePhase += dt * (3.0 + strokeIntensity * 4.0) * (movingAny ? 1 : 0.3);

      // left and right arms alternate (π out of phase for forward/back swim)
      // when strafing (A/D) both arms go together on the moving side
      const strafeBias = (movingA ? -1 : 0) + (movingD ? 1 : 0); // -1,0,1

      const baseSwing = 0.9 * strokeIntensity;
      const bobTarget = 0.08 * strokeIntensity;
      bob += (bobTarget - bob) * 0.1;

      // Model-level stroke: rock the whole arms group forward/back.
      // Suppress-warn: strafeBias could be used later for per-arm bias.
      void strafeBias;
      const swing = Math.sin(strokePhase) * baseSwing;
      leftArm.group.rotation.x = -0.4 - Math.max(0, swing) * 0.6;
      leftArm.group.position.y = 0.2 + Math.sin(strokePhase * 2) * 0.05 * strokeIntensity;

      // subtle camera bob while swimming
      camera.position.y = 6 + bob * Math.sin(strokePhase * 2);
      // (y gets overwritten below by the fixed-altitude clamp — remove that)

      const lookTarget = new THREE.Vector3(
        camera.position.x + Math.sin(look.yaw) * Math.cos(look.pitch) * -1,
        camera.position.y + Math.sin(look.pitch),
        camera.position.z + Math.cos(look.yaw) * Math.cos(look.pitch) * -1,
      );
      camera.lookAt(lookTarget);

      // armsRoot is a child of the camera, so it follows automatically.

      // keep moon far ahead relative to camera so it always sits on the horizon
      moon.position.x = camera.position.x;
      moon.position.z = camera.position.z - 220;
      moon.position.y = 24;
      // make moon face the camera
      moon.lookAt(camera.position);
      waterMat.uniforms.uMoonPos.value.copy(moon.position);

      waterMat.uniforms.uTime.value = t;
      waterMat.uniforms.uCamPos.value.copy(camera.position);
      spMat.uniforms.uTime.value = t;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      waterGeo.dispose();
      waterMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      spGeo.dispose();
      spMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === el) {
        el.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, background: "#02030a" }}
    />
  );
}
