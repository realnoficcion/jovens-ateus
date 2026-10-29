"use client";

import { useEffect, useRef, useState } from "react";

interface WordMosaicHeroProps {
  imageSrc: string;
  textSrc: string;
  width?: number;
  rowHeight?: number;
  threshold?: number;
  autoCrop?: boolean;
  /** radius in CSS px around the cursor where words start to be pushed */
  repelRadius?: number;
  /** max push distance in CSS px for a word right under the cursor */
  repelStrength?: number;
}

interface PlacedWord {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  weight: number;
  width: number;
}

const CHAR_ASPECT = 0.52;

export function WordMosaicHero({
  imageSrc,
  textSrc,
  width = 1600,
  rowHeight = 12,
  threshold = 135,
  autoCrop = true,
  repelRadius = 90,
  repelStrength = 55,
}: WordMosaicHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wordsRef = useRef<PlacedWord[]>([]);
  const sizeRef = useRef<{ w: number; h: number; dpr: number }>({
    w: 0,
    h: 0,
    dpr: 1,
  });
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const rafRef = useRef<number | null>(null);
  const dirtyRef = useRef(true);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  // === one-shot: compute word positions ===
  useEffect(() => {
    let cancelled = false;

    const build = async () => {
      try {
        const [img, words] = await Promise.all([
          loadImage(imageSrc),
          loadWords(textSrc),
        ]);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const srcW = img.width;
        const srcH = img.height;

        // Low-res probe for bounding box detection.
        const probeW = 220;
        const probeH = Math.round(probeW * (srcH / srcW));
        const probe = document.createElement("canvas");
        probe.width = probeW;
        probe.height = probeH;
        const pctx = probe.getContext("2d");
        if (!pctx) return;
        pctx.drawImage(img, 0, 0, probeW, probeH);
        const probeData = pctx.getImageData(0, 0, probeW, probeH).data;

        let minX = probeW,
          minY = probeH,
          maxX = 0,
          maxY = 0;
        let anyDark = false;
        for (let y = 0; y < probeH; y++) {
          for (let x = 0; x < probeW; x++) {
            const i = (y * probeW + x) * 4;
            const lum =
              0.299 * probeData[i] +
              0.587 * probeData[i + 1] +
              0.114 * probeData[i + 2];
            if (lum < threshold) {
              anyDark = true;
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
          }
        }
        if (!anyDark) {
          minX = 0;
          minY = 0;
          maxX = probeW - 1;
          maxY = probeH - 1;
        }

        const marginPx = 6;
        const cropL = Math.max(0, (minX - marginPx) / probeW);
        const cropT = Math.max(0, (minY - marginPx) / probeH);
        const cropR = Math.min(1, (maxX + marginPx) / probeW);
        const cropB = Math.min(1, (maxY + marginPx) / probeH);
        const cropW = autoCrop ? cropR - cropL : 1;
        const cropH = autoCrop ? cropB - cropT : 1;
        const cropX = autoCrop ? cropL : 0;
        const cropY = autoCrop ? cropT : 0;

        const outAspect = (cropH * srcH) / (cropW * srcW);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssWidth = width;
        const cssHeight = Math.round(cssWidth * outAspect);

        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        sizeRef.current = { w: cssWidth, h: cssHeight, dpr };

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Resample ONLY the crop region into a mosaic-sized grid.
        const sampleHeight = Math.round(cssHeight / rowHeight);
        const sampleWidth = Math.round(cssWidth / (rowHeight * CHAR_ASPECT));
        const sampler = document.createElement("canvas");
        sampler.width = sampleWidth;
        sampler.height = sampleHeight;
        const sctx = sampler.getContext("2d");
        if (!sctx) return;
        sctx.drawImage(
          img,
          cropX * srcW,
          cropY * srcH,
          cropW * srcW,
          cropH * srcH,
          0,
          0,
          sampleWidth,
          sampleHeight,
        );
        const data = sctx.getImageData(0, 0, sampleWidth, sampleHeight).data;

        // Walk the grid and plan word placements, using a tmp 2D context for measurement.
        const measurer = sampler.getContext("2d");
        if (!measurer) return;

        const pool = words.length > 0 ? words : ["jovens", "ateus"];
        let wIdx = 0;
        const peek = () => pool[wIdx % pool.length];
        const consume = () => {
          const w = pool[wIdx % pool.length];
          wIdx++;
          return w;
        };

        const placed: PlacedWord[] = [];

        for (let row = 0; row < sampleHeight; row++) {
          const yPx = row * rowHeight;
          let x = 0;

          while (x < cssWidth) {
            const colSample = Math.min(
              sampleWidth - 1,
              Math.floor((x / cssWidth) * sampleWidth),
            );
            const idx = (row * sampleWidth + colSample) * 4;
            const lum =
              0.299 * data[idx] +
              0.587 * data[idx + 1] +
              0.114 * data[idx + 2];

            if (lum < threshold) {
              const darkness = (threshold - lum) / threshold;
              const fontSize = Math.round(rowHeight * (0.85 + darkness * 0.45));
              const weight = darkness > 0.55 ? 700 : darkness > 0.25 ? 500 : 400;
              measurer.font = `${weight} ${fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
              const text = peek();
              const wPx = measurer.measureText(text + " ").width;
              if (x + wPx > cssWidth) break;
              consume();
              placed.push({ text, x, y: yPx, fontSize, weight, width: wPx });
              x += wPx;
            } else {
              x += Math.max(2, rowHeight * 0.5);
            }
          }
        }

        wordsRef.current = placed;
        dirtyRef.current = true;
        setReady(true);
      } catch (e) {
        setFailed(e instanceof Error ? e.message : "render failed");
      }
    };

    build();
    return () => {
      cancelled = true;
    };
  }, [imageSrc, textSrc, width, rowHeight, threshold, autoCrop]);

  // === render loop ===
  useEffect(() => {
    if (!ready) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const paint = () => {
      const { w, h, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "top";

      const mouse = mouseRef.current;
      const r = repelRadius;
      const r2 = r * r;
      const strength = repelStrength;

      for (const word of wordsRef.current) {
        // anchor = word center
        const cx = word.x + word.width / 2;
        const cy = word.y + word.fontSize / 2;

        let dx = 0;
        let dy = 0;
        if (mouse.active) {
          const vx = cx - mouse.x;
          const vy = cy - mouse.y;
          const d2 = vx * vx + vy * vy;
          if (d2 < r2 && d2 > 0.01) {
            const d = Math.sqrt(d2);
            // falloff: 1 at center, 0 at edge, squared for a sharper bump
            const t = 1 - d / r;
            const push = strength * t * t;
            dx = (vx / d) * push;
            dy = (vy / d) * push;
          }
        }

        ctx.font = `${word.weight} ${word.fontSize}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
        ctx.fillText(word.text, word.x + dx, word.y + dy);
      }
    };

    const loop = () => {
      if (dirtyRef.current || mouseRef.current.active) {
        paint();
        dirtyRef.current = false;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, repelRadius, repelStrength]);

  // === mouse tracking ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      // map screen px → canvas CSS px (canvas may be scaled by CSS)
      const scaleX = sizeRef.current.w / rect.width;
      const scaleY = sizeRef.current.h / rect.height;
      mouseRef.current.x = (e.clientX - rect.left) * scaleX;
      mouseRef.current.y = (e.clientY - rect.top) * scaleY;
      mouseRef.current.active = true;
      dirtyRef.current = true;
    };
    const onLeave = () => {
      mouseRef.current.active = false;
      dirtyRef.current = true;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [ready]);

  return (
    <div className="hero-canvas-wrap">
      {!ready && !failed ? (
        <div className="hero-loader">RENDERING&nbsp;…</div>
      ) : null}
      {failed ? (
        <div className="hero-loader" style={{ color: "#ff2a2a" }}>
          error: {failed}
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        className={`hero-canvas ${ready ? "is-ready" : "is-loading"}`}
      />
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load image: ${src}`));
    img.src = src;
  });
}

async function loadWords(src: string): Promise<string[]> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`failed to load text: ${src}`);
  const raw = await res.text();
  return raw
    .toLowerCase()
    .replace(/[\n\r\t]+/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/[^a-záàâãéèêíïóôõöúçñ'-]/giu, ""))
    .filter((w) => w.length > 0);
}
