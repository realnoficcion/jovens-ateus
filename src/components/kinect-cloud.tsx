"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface KinectCloudProps {
  imageSrc: string;
  /** grid density: higher = more points, heavier */
  density?: number;
  /** depth multiplier */
  depth?: number;
  /** luminance (0..255) below which a pixel is treated as empty background */
  bgThreshold?: number;
  className?: string;
}

/**
 * A 3D point cloud derived from a static image's luminance (treated as a
 * depth map). The camera follows the mouse for parallax, like the three.js
 * kinect example — but with no kinect, just one of our photos.
 *
 * Rendered inside a given container; parent decides positioning/opacity.
 */
export function KinectCloud({
  imageSrc,
  density = 160,
  depth = 400,
  bgThreshold = 30,
  className = "",
}: KinectCloudProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      1,
      5000,
    );
    camera.position.set(0, 0, 700);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    let points: THREE.Points | null = null;
    let lines: THREE.LineSegments | null = null;
    let pointGeo: THREE.BufferGeometry | null = null;
    let lineGeo: THREE.BufferGeometry | null = null;
    let pointMat: THREE.PointsMaterial | null = null;
    let lineMat: THREE.LineBasicMaterial | null = null;

    const buildFromImage = () => {
      // sample image into a lower-density grid (we don't need thousands of lines)
      const sampler = document.createElement("canvas");
      // cap density so line count stays manageable
      const sampleW = Math.min(density, 110);
      const sampleH = Math.round(sampleW * (img.height / img.width));
      sampler.width = sampleW;
      sampler.height = sampleH;
      const sctx = sampler.getContext("2d");
      if (!sctx) return;
      sctx.drawImage(img, 0, 0, sampleW, sampleH);
      const data = sctx.getImageData(0, 0, sampleW, sampleH).data;

      const spacing = 6;
      const grid: Array<[number, number, number] | null> = [];
      const pointPositions: number[] = [];

      for (let y = 0; y < sampleH; y++) {
        for (let x = 0; x < sampleW; x++) {
          const i = (y * sampleW + x) * 4;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (lum < bgThreshold) {
            grid.push(null);
            continue;
          }
          const z = (lum / 255) * depth - depth / 2;
          const px = (x - sampleW / 2) * spacing;
          const py = (sampleH / 2 - y) * spacing;
          grid.push([px, py, z]);
          pointPositions.push(px, py, z);
        }
      }

      // === points ===
      pointGeo = new THREE.BufferGeometry();
      pointGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(pointPositions), 3),
      );
      pointMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2.6,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      points = new THREE.Points(pointGeo, pointMat);
      scene.add(points);

      // === lines: connect each cell to its right, down, and both diagonals,
      //     but only when BOTH endpoints are valid (non-background) ===
      const linePositions: number[] = [];
      const idxAt = (x: number, y: number) => y * sampleW + x;
      const addSegment = (a: [number, number, number] | null, b: [number, number, number] | null) => {
        if (!a || !b) return;
        linePositions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
      };
      for (let y = 0; y < sampleH; y++) {
        for (let x = 0; x < sampleW; x++) {
          const a = grid[idxAt(x, y)];
          if (!a) continue;
          if (x + 1 < sampleW)                      addSegment(a, grid[idxAt(x + 1, y)]);
          if (y + 1 < sampleH)                      addSegment(a, grid[idxAt(x, y + 1)]);
          if (x + 1 < sampleW && y + 1 < sampleH)   addSegment(a, grid[idxAt(x + 1, y + 1)]);
          if (x - 1 >= 0 && y + 1 < sampleH)        addSegment(a, grid[idxAt(x - 1, y + 1)]);
        }
      }
      lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(linePositions), 3),
      );
      lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      lines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lines);
    };

    img.onload = () => {
      if (disposed) return;
      buildFromImage();
    };

    // mouse parallax
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);

    // resize
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // slow auto-rotation + mouse parallax
    let rafId = 0;
    let t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;

      camera.position.x = Math.sin(t * 0.15) * 60 + current.x * 180;
      camera.position.y = Math.cos(t * 0.1) * 30 - current.y * 120;
      camera.position.z = 650 + Math.sin(t * 0.08) * 60;
      camera.lookAt(0, 0, 0);

      const ry = Math.sin(t * 0.2) * 0.1;
      if (points) points.rotation.y = ry;
      if (lines)  lines.rotation.y  = ry;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      pointGeo?.dispose();
      pointMat?.dispose();
      lineGeo?.dispose();
      lineMat?.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [imageSrc, density, depth]);

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
