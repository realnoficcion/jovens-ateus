"use client";

import { useEffect, useRef, useState } from "react";

export function KnifeCursor() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [slashing, setSlashing] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let targetX = -100;
    let targetY = -100;
    let curX = -100;
    let curY = -100;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);
    };
    const onDown = () => {
      setSlashing(true);
      window.setTimeout(() => setSlashing(false), 220);
    };
    const onLeave = () => setVisible(false);

    const tick = () => {
      // light smoothing so it feels less jittery
      curX += (targetX - curX) * 0.35;
      curY += (targetY - curY) * 0.35;
      el.style.transform = `translate(${curX}px, ${curY}px)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`knife-cursor ${visible ? "is-visible" : ""} ${slashing ? "is-slash" : ""}`}
    >
      <div className="knife-inner">
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          shapeRendering="crispEdges"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* blade (diagonal, light to dark) */}
          <rect x="2"  y="2"  width="4" height="4" fill="#ffffff" stroke="#000" strokeWidth="1" />
          <rect x="5"  y="5"  width="5" height="5" fill="#ffffff" stroke="#000" strokeWidth="1" />
          <rect x="9"  y="9"  width="5" height="5" fill="#f0f0f0" stroke="#000" strokeWidth="1" />
          <rect x="13" y="13" width="5" height="5" fill="#e0e0e0" stroke="#000" strokeWidth="1" />
          <rect x="17" y="17" width="5" height="5" fill="#d0d0d0" stroke="#000" strokeWidth="1" />
          <rect x="21" y="21" width="5" height="5" fill="#c0c0c0" stroke="#000" strokeWidth="1" />
          <rect x="25" y="25" width="6" height="6" fill="#a8a8a8" stroke="#000" strokeWidth="1" />

          {/* second row of blade — thicker look */}
          <rect x="9"  y="4"  width="4" height="5" fill="#b0b0b0" stroke="#000" strokeWidth="1" />
          <rect x="13" y="8"  width="4" height="5" fill="#a0a0a0" stroke="#000" strokeWidth="1" />
          <rect x="17" y="12" width="4" height="5" fill="#909090" stroke="#000" strokeWidth="1" />
          <rect x="21" y="16" width="4" height="5" fill="#808080" stroke="#000" strokeWidth="1" />
          <rect x="25" y="20" width="4" height="5" fill="#707070" stroke="#000" strokeWidth="1" />
          <rect x="29" y="24" width="4" height="5" fill="#606060" stroke="#000" strokeWidth="1" />

          {/* guard */}
          <rect x="28" y="28" width="8" height="4" fill="#444" stroke="#000" strokeWidth="1" />
          <rect x="26" y="30" width="4" height="4" fill="#444" stroke="#000" strokeWidth="1" />
          <rect x="34" y="30" width="4" height="4" fill="#444" stroke="#000" strokeWidth="1" />

          {/* handle */}
          <rect x="32" y="32" width="8" height="5" fill="#8b4513" stroke="#000" strokeWidth="1" />
          <rect x="36" y="36" width="8" height="5" fill="#734010" stroke="#000" strokeWidth="1" />
          <rect x="40" y="40" width="8" height="5" fill="#654321" stroke="#000" strokeWidth="1" />
          <rect x="44" y="44" width="6" height="5" fill="#5c3317" stroke="#000" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
