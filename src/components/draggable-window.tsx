"use client";

import { useEffect, useRef, useState } from "react";

interface DraggableWindowProps {
  title: string;
  open: boolean;
  onClose: () => void;
  initialX?: number;
  initialY?: number;
  width?: number;
  children: React.ReactNode;
}

export function DraggableWindow({
  title,
  open,
  onClose,
  initialX = 120,
  initialY = 120,
  width = 320,
  children,
}: DraggableWindowProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  // start drag on title bar
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
    };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const nx = d.originX + (e.clientX - d.startX);
    const ny = d.originY + (e.clientY - d.startY);
    setPos({ x: nx, y: ny });
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="win"
      style={{ left: pos.x, top: pos.y, width }}
      role="dialog"
      aria-label={title}
    >
      <div
        className="win-bar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="win-dots" aria-hidden="true">
          <button
            type="button"
            className="win-dot win-dot-close"
            onClick={onClose}
            aria-label="fechar"
          />
          <span className="win-dot win-dot-min" />
          <span className="win-dot win-dot-max" />
        </div>
        <span className="win-title">{title}</span>
        <span className="win-bar-spacer" aria-hidden="true" />
      </div>
      <div className="win-tabs" aria-hidden="true">
        <span className="win-tab win-tab-active">main</span>
        <span className="win-tab">meta</span>
        <span className="win-tab">logs</span>
      </div>
      <div className="win-body">{children}</div>
      <div className="win-status" aria-hidden="true">
        <span>utf-8</span>
        <span>readonly</span>
        <span>ln 1, col 1</span>
      </div>
    </div>
  );
}
