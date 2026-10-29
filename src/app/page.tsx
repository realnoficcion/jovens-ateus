"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";
import { WordMosaicHero } from "@/components/word-mosaic-hero";
import { TreeOfLife } from "@/components/tree-of-life";
import { KnifeCursor } from "@/components/knife-cursor";
import { DraggableWindow } from "@/components/draggable-window";
import { KinectCloud } from "@/components/kinect-cloud";
import { NightWater } from "@/components/night-water";
import type { Locale } from "@/lib/i18n";

/** flip to false to remove the 3D point cloud behind the bolo + yin-yang section. */
const ENABLE_KINECT_BG = true;

function FolderIcon({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <a className="folder" href={href ?? "#"} onClick={handleClick}>
      <svg
        className="folder-svg"
        width="96"
        height="80"
        viewBox="0 0 96 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* subtle ground shadow line */}
        <line x1="10" y1="76" x2="86" y2="76" stroke="#fff" strokeWidth="0.75" opacity="0.4" />

        {/* back folder body (behind the papers) */}
        <path
          d="M 6 20
             L 6 18 Q 6 14 10 14
             L 32 14
             Q 34 14 35.5 15.5
             L 40 20
             L 86 20
             Q 90 20 90 24
             L 90 68
             Q 90 72 86 72
             L 10 72
             Q 6 72 6 68
             Z"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* paper sticking out the top (two sheets, offset) */}
        <path
          d="M 16 28 L 16 22 L 80 22 L 80 28"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.85"
        />
        <path
          d="M 20 26 L 20 24 L 76 24 L 76 26"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.55"
        />

        {/* front flap of the folder (slightly shorter so paper peeks over) */}
        <path
          d="M 6 30
             L 6 28 Q 6 26 8 26
             L 88 26
             Q 90 26 90 28
             L 90 68
             Q 90 72 86 72
             L 10 72
             Q 6 72 6 68
             Z"
          fill="#000"
          stroke="#fff"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* tab label area on the front */}
        <line x1="14" y1="38" x2="40" y2="38" stroke="#fff" strokeWidth="1" />

        {/* small reinforcement rivet near top-left */}
        <circle cx="12" cy="18" r="1.2" fill="none" stroke="#fff" strokeWidth="0.75" />

        {/* fold line on the bottom-right corner */}
        <path
          d="M 82 66 L 88 72 L 82 72 Z"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.7"
        />
      </svg>
      <span className="folder-label">{label}</span>
    </a>
  );
}

function CdIcon({ label, onClick }: { label: string; onClick?: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <a className="folder" href="#" onClick={handleClick}>
      <svg
        className="folder-svg"
        width="96"
        height="80"
        viewBox="0 0 96 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* subtle ground shadow */}
        <ellipse cx="48" cy="74" rx="22" ry="2" fill="none" stroke="#fff" strokeWidth="0.75" opacity="0.35" />

        <g transform="translate(48 38)">
          {/* disc body — one strong outline */}
          <circle r="30" fill="#000" stroke="#fff" strokeWidth="1" />

          {/* inner hub ring (printed area edge) */}
          <circle r="12" fill="none" stroke="#fff" strokeWidth="1" />

          {/* mid data track hint — single thin ring, not many */}
          <circle r="22" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />

          {/* center hole */}
          <circle r="4.5" fill="#000" stroke="#fff" strokeWidth="1" />
          <circle r="1" fill="#fff" />

          {/* light highlight — a long diagonal gleam */}
          <path
            d="M -18 -22 A 30 30 0 0 1 22 -18"
            fill="none"
            stroke="#fff"
            strokeWidth="1.25"
            opacity="0.95"
            strokeLinecap="round"
          />
          {/* secondary short reflection on the opposite side */}
          <path
            d="M 10 22 A 30 30 0 0 1 22 14"
            fill="none"
            stroke="#fff"
            strokeWidth="0.75"
            opacity="0.65"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="folder-label">{label}</span>
    </a>
  );
}

function ExeIcon({ label, onClick }: { label: string; onClick?: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <a className="folder" href="#" onClick={handleClick}>
      <svg
        className="folder-svg"
        width="96"
        height="80"
        viewBox="0 0 96 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* subtle ground shadow */}
        <line x1="18" y1="76" x2="78" y2="76" stroke="#fff" strokeWidth="0.75" opacity="0.4" />

        {/* page/document shape with folded corner */}
        <path
          d="M 20 8
             L 62 8
             L 76 22
             L 76 72
             L 20 72
             Z"
          fill="#000"
          stroke="#fff"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* folded corner highlight */}
        <path
          d="M 62 8 L 62 22 L 76 22"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* little title bar on the document */}
        <line x1="26" y1="30" x2="54" y2="30" stroke="#fff" strokeWidth="0.75" opacity="0.6" />

        {/* ".EXE" text label at the bottom */}
        <text
          x="48"
          y="66"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fontWeight="700"
          fill="#fff"
          letterSpacing="0.1em"
        >
          .EXE
        </text>

      </svg>
      <span className="folder-label">{label}</span>
    </a>
  );
}

function GameIcon({ label, onClick }: { label: string; onClick?: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };
  return (
    <a className="folder" href="#" onClick={handleClick}>
      <svg
        className="folder-svg"
        width="96"
        height="80"
        viewBox="0 0 96 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* subtle ground shadow */}
        <ellipse cx="48" cy="72" rx="26" ry="2" fill="none" stroke="#fff" strokeWidth="0.75" opacity="0.4" />

        {/* main gamepad body — rounded rectangle */}
        <rect
          x="12"
          y="22"
          width="72"
          height="36"
          rx="12"
          ry="14"
          fill="#000"
          stroke="#fff"
          strokeWidth="1"
        />

        {/* left side: directional cross */}
        <g stroke="#fff" strokeWidth="1" fill="none">
          <line x1="26" y1="40" x2="34" y2="40" />
          <line x1="30" y1="36" x2="30" y2="44" />
          <rect x="27" y="37" width="6" height="6" />
        </g>

        {/* right side: 4 action buttons */}
        <g stroke="#fff" strokeWidth="0.75" fill="none">
          <circle cx="68" cy="36" r="2.5" />
          <circle cx="74" cy="40" r="2.5" />
          <circle cx="62" cy="40" r="2.5" />
          <circle cx="68" cy="44" r="2.5" />
        </g>

        {/* center: start/select pills + tiny screen */}
        <line x1="44" y1="34" x2="48" y2="34" stroke="#fff" strokeWidth="0.75" />
        <line x1="50" y1="34" x2="54" y2="34" stroke="#fff" strokeWidth="0.75" />
        <rect x="43" y="40" width="12" height="7" fill="none" stroke="#fff" strokeWidth="0.75" opacity="0.75" />

        {/* top shoulder buttons */}
        <path d="M 18 22 Q 20 16 28 16 L 36 16" fill="none" stroke="#fff" strokeWidth="0.75" opacity="0.75" />
        <path d="M 78 22 Q 76 16 68 16 L 60 16" fill="none" stroke="#fff" strokeWidth="0.75" opacity="0.75" />
      </svg>
      <span className="folder-label">{label}</span>
    </a>
  );
}

function EmailIcon({ label, href }: { label: string; href: string }) {
  return (
    <a className="folder" href={href}>
      <svg
        className="folder-svg"
        width="96"
        height="80"
        viewBox="0 0 96 80"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* subtle ground shadow */}
        <line x1="10" y1="76" x2="86" y2="76" stroke="#fff" strokeWidth="0.75" opacity="0.4" />

        {/* envelope body */}
        <rect
          x="8"
          y="20"
          width="80"
          height="48"
          rx="2"
          ry="2"
          fill="#000"
          stroke="#fff"
          strokeWidth="1"
        />

        {/* flap triangle on the back (behind, soft) */}
        <path
          d="M 8 20 L 48 50 L 88 20"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          opacity="0.9"
        />

        {/* side folds */}
        <line x1="8"  y1="68" x2="38" y2="44" stroke="#fff" strokeWidth="1" opacity="0.55" />
        <line x1="88" y1="68" x2="58" y2="44" stroke="#fff" strokeWidth="1" opacity="0.55" />

        {/* small stamp outline, top-right */}
        <rect
          x="70"
          y="24"
          width="12"
          height="10"
          fill="none"
          stroke="#fff"
          strokeWidth="0.75"
          opacity="0.7"
        />
        <line x1="70" y1="27" x2="82" y2="27" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
        <line x1="70" y1="30" x2="82" y2="30" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
      </svg>
      <span className="folder-label">{label}</span>
    </a>
  );
}

function BoloSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const boloRef = useRef<HTMLImageElement | null>(null);
  const leftRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      // normalized -1..1 relative to the section center
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };

    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;

      // aggressive parallax — big tilt + translate for a "almost turning around" feel
      const tiltY = current.x * 40;   // degrees of rotation around Y axis
      const tiltX = -current.y * 25;  // degrees of rotation around X axis
      const tx = current.x * 120;
      const ty = current.y * 80;

      if (boloRef.current) {
        boloRef.current.style.transform =
          `perspective(900px) translate3d(${tx}px, ${ty}px, 0) rotateY(${tiltY}deg) rotateX(${tiltX}deg)`;
      }
      // yin-yangs drift in the opposite direction with their own tilt
      if (leftRef.current) {
        leftRef.current.style.transform =
          `perspective(900px) translate3d(${-current.x * 70}px, ${-current.y * 50}px, 0) rotateY(${-tiltY * 0.6}deg)`;
      }
      if (rightRef.current) {
        rightRef.current.style.transform =
          `perspective(900px) translate3d(${-current.x * 70}px, ${-current.y * 50}px, 0) rotateY(${-tiltY * 0.6}deg)`;
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="bolo-section" ref={sectionRef}>
      {ENABLE_KINECT_BG && (
        <KinectCloud
          imageSrc="/assets/bolofinal.png"
          density={110}
          depth={550}
          className="bolo-bg-cloud"
        />
      )}
      <div ref={leftRef} className="yy-wrap">
        <YingYangColumn side="left" />
      </div>
      <div className="bolo-wrap">
        <img ref={boloRef} src="/assets/bolofinal.png" alt="bolo" className="bolo-img" />
      </div>
      <div ref={rightRef} className="yy-wrap">
        <YingYangColumn side="right" />
      </div>
    </section>
  );
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + "T20:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const mm = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}·${mm}·${yy}`;
}

function ShortLoopVideo({ src, trimEnd = 2 }: { src: string; trimEnd?: number }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    const onTime = () => {
      if (!Number.isFinite(v.duration)) return;
      if (v.currentTime >= v.duration - trimEnd) {
        v.currentTime = 0;
      }
    };

    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [trimEnd]);

  return (
    <video
      ref={ref}
      className="video-el"
      src={src}
      autoPlay
      loop
      muted
      playsInline
    />
  );
}

function YinYang({ size = 72 }: { size?: number }) {
  // simple geometric yin-yang in two colors.
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="49" fill="#ffffff" stroke="#ffffff" strokeWidth="1" />
      <path
        d="M50 1 A 49 49 0 0 1 50 99 A 24.5 24.5 0 0 1 50 50 A 24.5 24.5 0 0 0 50 1 Z"
        fill="#000000"
      />
      <circle cx="50" cy="25.5" r="7" fill="#000000" />
      <circle cx="50" cy="74.5" r="7" fill="#ffffff" />
    </svg>
  );
}

function YingYangColumn({ side }: { side: "left" | "right" }) {
  return (
    <div className={`yy-col yy-col-${side}`} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`yy-item ${i % 2 === 0 ? "yy-cw" : "yy-ccw"}`}
        >
          <YinYang size={96} />
        </div>
      ))}
    </div>
  );
}

interface VideoItem {
  id: string;
  name: string;
  type: "clipe" | "ao vivo";
  year: string;
  youtubeId: string;
}

const VIDEOS: VideoItem[] = [
  { id: "magoas",       name: "Mágoas (Clipe Oficial)",            type: "clipe",   year: "2024", youtubeId: "TkAvxjh2f4Y" },
  { id: "correntes",    name: "Correntes (Clipe Oficial)",         type: "clipe",   year: "2024", youtubeId: "poFkbwJPFJs" },
  { id: "passos",       name: "Passos Lentos @ Balaclava Fest",    type: "ao vivo", year: "2025", youtubeId: "aF7cTWgkmqA" },
  { id: "74club",       name: "74 Club (set completo)",            type: "ao vivo", year: "2023", youtubeId: "pnul-13jZ7s" },
  { id: "podthunder",   name: "Podcast do Thunder #115",           type: "ao vivo", year: "2024", youtubeId: "cCNqsPixYVo" },
];

interface Show {
  date: string;
  city: string;
  venue: string;
  note?: string;
}

const UPCOMING: Show[] = [
  { date: "2026-10-10", city: "São Paulo", venue: "Bela Vista",        note: "Post-Punk Brasil · c/ Gótia" },
  { date: "2026-11-25", city: "São Paulo", venue: "Espaço Unimed",     note: "abertura · New Order" },
];

const PAST: Show[] = [
  { date: "2026-08-14", city: "São Paulo", venue: "Casa Rockambole",   note: "SPIM 2026" },
  { date: "2026-02-27", city: "São Paulo", venue: "Sesc Belenzinho" },
  { date: "2025-11-09", city: "São Paulo", venue: "Tokio Marine Hall", note: "Balaclava Fest" },
  { date: "2023-03-11", city: "Curitiba",  venue: "74 Club" },
];

export default function Home() {
  const { locale, setLocale } = useLocale();
  const toggle = (next: Locale) => () => setLocale(next);
  const [vinilOpen, setVinilOpen] = useState(false);
  const [showsOpen, setShowsOpen] = useState(false);
  const [merchOpen, setMerchOpen] = useState(false);
  const [videosOpen, setVideosOpen] = useState(false);
  const [musicasOpen, setMusicasOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);

  return (
    <main>
      <KnifeCursor />
      <DraggableWindow
        title="~/jovens-ateus/catalog/vinil-vol-1.json"
        open={vinilOpen}
        onClose={() => setVinilOpen(false)}
        initialX={typeof window !== "undefined" ? Math.max(40, window.innerWidth / 2 - 280) : 120}
        initialY={80}
        width={580}
      >
        <div className="vinil-pop">
          <div className="vinil-left">
            <img src="/assets/disco2.jpg" alt="vinil jovens ateus vol. 1" className="vinil-img" />
            <div className="vinil-meta">
              <div className="vinil-row"><span className="k">sku</span><span className="v">9817F7</span></div>
              <div className="vinil-row"><span className="k">format</span><span className="v">12&quot; LP · 180g · preto</span></div>
              <div className="vinil-row"><span className="k">capa</span><span className="v">triplex 300g · laminação fosca</span></div>
              <div className="vinil-row"><span className="k">extras</span><span className="v">encarte com letras</span></div>
              <div className="vinil-row"><span className="k">selo</span><span className="v">Rocinante</span></div>
              <div className="vinil-row"><span className="k">devolução</span><span className="v">7 dias após recebimento</span></div>
              <div className="vinil-row"><span className="k">stock</span><span className="v stock-out">esgotado</span></div>
            </div>
          </div>
          <div className="vinil-right">
            <div>
              <div className="vinil-label">// product</div>
              <div className="vinil-h">Vinil Jovens Ateus — Vol. 1</div>
              <div className="vinil-sub">loja balaclava · rocinante</div>
            </div>

            <div>
              <div className="vinil-label">// tracklist</div>
              <pre className="vinil-tracks">{`▸ side A
  01 Vultos
  02 Homem em Ruínas
  03 Espelhos
  04 Mágoas
  05 Correntes
  06 Saboteur Got Me Bloody

▸ side B
  07 Passos Lentos
  08 Introspecto
  09 Flores Mortas
  10 Cedo Demais
  11 Twinturbo Mixtape`}</pre>
            </div>

            <div className="vinil-price-block">
              <div className="vinil-label">// price</div>
              <div className="vinil-price">R$ 199,00</div>
            </div>
            <a
              className="vinil-buy vinil-buy-disabled"
              href="https://www.lojabalaclava.com.br/pd-9817f7-vinil-jovens-ateus-vol-1.html"
              target="_blank"
              rel="noreferrer"
            >
              <span className="vinil-buy-arrow">{">"}</span> esgotado · ver na loja
            </a>
          </div>
        </div>
      </DraggableWindow>

      <DraggableWindow
        title="~/jovens-ateus/shows/agenda.log"
        open={showsOpen}
        onClose={() => setShowsOpen(false)}
        initialX={120}
        initialY={110}
        width={520}
      >
        <div className="shows-pop">
          <div className="shows-block">
            <div className="vinil-label">// upcoming</div>
            {UPCOMING.length === 0 ? (
              <div className="shows-empty">no shows scheduled</div>
            ) : (
              <ul className="shows-list">
                {UPCOMING.map((s) => (
                  <li key={`u-${s.date}-${s.city}`}>
                    <span className="show-date">{formatShortDate(s.date)}</span>
                    <span className="show-main">
                      <span className="show-city">{s.city}</span>
                      <span className="show-venue">· {s.venue}</span>
                    </span>
                    {s.note && <span className="show-note">{s.note}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="shows-block">
            <div className="vinil-label">// archive</div>
            <ul className="shows-list shows-list-past">
              {PAST.map((s) => (
                <li key={`p-${s.date}-${s.city}`}>
                  <span className="show-date">{formatShortDate(s.date)}</span>
                  <span className="show-main">
                    <span className="show-city">{s.city}</span>
                    <span className="show-venue">· {s.venue}</span>
                  </span>
                  {s.note && <span className="show-note">{s.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DraggableWindow>

      <DraggableWindow
        title="~/jovens-ateus/merch/index.html"
        open={merchOpen}
        onClose={() => setMerchOpen(false)}
        initialX={200}
        initialY={160}
        width={420}
      >
        <div className="merch-pop">
          <div className="vinil-label">// status</div>
          <div className="merch-h">coming soon</div>
          <p className="merch-p">
            camisetas, posters e outros objetos chegando em breve.
            fica de olho.
          </p>
          <div className="merch-cursor">█</div>
        </div>
      </DraggableWindow>

      <DraggableWindow
        title="~/jovens-ateus/musicas/vol-1.bc"
        open={musicasOpen}
        onClose={() => setMusicasOpen(false)}
        initialX={typeof window !== "undefined" ? Math.max(20, (window.innerWidth - 500) / 2) : 60}
        initialY={60}
        width={500}
      >
        <div className="musicas-pop">
          <iframe
            className="bandcamp-frame"
            src="https://bandcamp.com/EmbeddedPlayer/album=1398107213/size=large/bgcol=0b0b0b/linkcol=e8e8e8/artwork=small/transparent=true/"
            title="Vol. 1 — Jovens Ateus (Bandcamp)"
            seamless
          />
          <a
            className="musicas-link"
            href="https://balaclavarecords.bandcamp.com/album/vol-1"
            target="_blank"
            rel="noreferrer"
          >
            {">"} abrir no bandcamp
          </a>
        </div>
      </DraggableWindow>

      <DraggableWindow
        title="~/jovens-ateus/game/importante.app"
        open={gameOpen}
        onClose={() => setGameOpen(false)}
        initialX={typeof window !== "undefined" ? Math.max(20, (window.innerWidth - 1280) / 2) : 60}
        initialY={typeof window !== "undefined" ? Math.max(20, (window.innerHeight - 820) / 2) : 60}
        width={1280}
      >
        <div className="game-pop">
          <div className="game-stage">
            <NightWater />
            <div className="game-overlay">
              <div className="game-title">importante</div>
              <div className="game-sub">drag to look · splash on hover</div>
            </div>
            <div className="game-hud" aria-hidden="true">
              <div className="hud-row"><span className="key">W</span></div>
              <div className="hud-row">
                <span className="key">A</span>
                <span className="key">S</span>
                <span className="key">D</span>
              </div>
              <div className="hud-caption">move · hold <span className="key sm">shift</span> to sprint</div>
            </div>
          </div>
        </div>
      </DraggableWindow>

      <DraggableWindow
        title="~/jovens-ateus/videos/"
        open={videosOpen}
        onClose={() => setVideosOpen(false)}
        initialX={150}
        initialY={90}
        width={620}
      >
        <div className="videos-pop">
          <div className="vinil-label">// {VIDEOS.length} files</div>
          <div className="file-grid">
            {VIDEOS.map((v) => (
              <button
                type="button"
                key={v.id}
                className="file-tile"
                onClick={() => setCurrentVideo(v)}
              >
                <span className="file-tile-ico" aria-hidden="true">
                  <svg width="56" height="48" viewBox="0 0 56 48" xmlns="http://www.w3.org/2000/svg">
                    {/* film reel body */}
                    <rect x="3" y="4" width="50" height="40" rx="2" fill="none" stroke="#e8e8e8" strokeWidth="1" />
                    {/* perforations left */}
                    <rect x="6"  y="8"  width="4" height="4" fill="none" stroke="#e8e8e8" strokeWidth="1" />
                    <rect x="6"  y="22" width="4" height="4" fill="none" stroke="#e8e8e8" strokeWidth="1" />
                    <rect x="6"  y="36" width="4" height="4" fill="none" stroke="#e8e8e8" strokeWidth="1" />
                    {/* perforations right */}
                    <rect x="46" y="8"  width="4" height="4" fill="none" stroke="#e8e8e8" strokeWidth="1" />
                    <rect x="46" y="22" width="4" height="4" fill="none" stroke="#e8e8e8" strokeWidth="1" />
                    <rect x="46" y="36" width="4" height="4" fill="none" stroke="#e8e8e8" strokeWidth="1" />
                    {/* play triangle in the middle */}
                    <path d="M 24 16 L 36 24 L 24 32 Z" fill="#e8e8e8" />
                  </svg>
                </span>
                <span className="file-tile-name">{v.name}</span>
                <span className="file-tile-meta">
                  <span>[{v.type}]</span>
                  <span>{v.year}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </DraggableWindow>

      {currentVideo && (
        <DraggableWindow
          title={`~/jovens-ateus/videos/${currentVideo.id}.mp4`}
          open={true}
          onClose={() => setCurrentVideo(null)}
          initialX={typeof window !== "undefined" ? Math.max(20, (window.innerWidth - 640) / 2) : 60}
          initialY={typeof window !== "undefined" ? Math.max(20, (window.innerHeight - 420) / 2) : 40}
          width={640}
        >
          <div className="video-pop-bare">
            <div className="video-frame-wrap">
              <iframe
                className="video-frame"
                src={`https://www.youtube.com/embed/${currentVideo.youtubeId}?autoplay=1&rel=0`}
                title={currentVideo.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </DraggableWindow>
      )}

      <section className="hero">
        <img
          src="/assets/logo-preto.jpg"
          alt=""
          className="hero-bg-logo"
          aria-hidden="true"
        />

        <WordMosaicHero
          imageSrc="/assets/foto3.png"
          textSrc="/assets/lyrics.txt"
          width={1600}
          rowHeight={12}
          threshold={135}
        />

        <div className="hero-bottom">
          <div className="lang-toggle">
            <button
              type="button"
              onClick={toggle("pt")}
              className={locale === "pt" ? "active" : "inactive"}
              aria-pressed={locale === "pt"}
            >
              PT
            </button>
            <span>&nbsp;/&nbsp;</span>
            <button
              type="button"
              onClick={toggle("en")}
              className={locale === "en" ? "active" : "inactive"}
              aria-pressed={locale === "en"}
            >
              EN
            </button>
          </div>
          <div className="scroll-hint">↓ scroll</div>
        </div>
      </section>

      <section className="tree-section">
        <div className="folders folders-left">
          <FolderIcon label="vinil" onClick={() => setVinilOpen(true)} />
          <EmailIcon label="e-mail" href="mailto:contato@jovensateus.com" />
          <div className="folder-spacer" aria-hidden="true" />
          <div className="folder-spacer" aria-hidden="true" />
          <div className="folder-spacer" aria-hidden="true" />
          <GameIcon label="importante" onClick={() => setGameOpen(true)} />
        </div>
        <div className="tree-stage">
          <img src="/assets/foto1.avif" alt="" className="tree-photo-base" />
          <div className="tree-overlay" aria-hidden="true">
            <TreeOfLife />
          </div>
        </div>
        <div className="folders folders-right">
          <FolderIcon label="músicas" onClick={() => setMusicasOpen(true)} />
          <FolderIcon label="videos" onClick={() => setVideosOpen(true)} />
          <ExeIcon label="shows" onClick={() => setShowsOpen(true)} />
          <FolderIcon label="merch" onClick={() => setMerchOpen(true)} />
        </div>
      </section>

      <section className="video-section">
        <ShortLoopVideo src="/assets/vid.webm" trimEnd={2} />
      </section>

      <BoloSection />

    </main>
  );
}
