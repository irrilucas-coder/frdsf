import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useState } from "react";
import TL from "./timeline.json";

// Load the display font once, before the first frame is captured.
const FONT = "InterBlack";
let fontLoaded = false;
export const useFont = () => {
  const [handle] = useState(() => (fontLoaded ? null : delayRender("font")));
  useState(() => {
    if (fontLoaded || handle === null) return;
    const f = new FontFace(FONT, `url(${staticFile("Inter-Black.otf")})`);
    f.load().then((ff) => { (document.fonts as unknown as { add: (f: FontFace) => void }).add(ff); fontLoaded = true; continueRender(handle); });
  });
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const backOut = (x: number) => { const t = clamp01(x) - 1; return 1 + 2.7 * t * t * t + 1.7 * t * t; };

const STYLES: Record<string, { bg: string; fg: string; size: number; top: number; rot: number; border: string }> = {
  hook: { bg: "#2f7bff", fg: "#ffffff", size: 96, top: 300, rot: -3, border: "#1747a6" },
  alert: { bg: "#ff2d3d", fg: "#ffffff", size: 92, top: 300, rot: 2, border: "#a3121f" },
  alert2: { bg: "#ffcc00", fg: "#1d1a26", size: 88, top: 450, rot: -2, border: "#b88f00" },
  title: { bg: "#ffffff", fg: "#1d1a26", size: 70, top: 300, rot: -1.5, border: "#14c79a" },
  chip: { bg: "#14c79a", fg: "#ffffff", size: 60, top: 1420, rot: -2, border: "#0b7f62" },
  chip2: { bg: "#ff7a52", fg: "#ffffff", size: 60, top: 1560, rot: 2, border: "#b8462a" },
  tag: { bg: "#22d65c", fg: "#ffffff", size: 58, top: 420, rot: -2, border: "#13843a" },
  tag2: { bg: "#ffffff", fg: "#1d1a26", size: 56, top: 540, rot: 1.5, border: "#22d65c" },
  good: { bg: "#22d65c", fg: "#ffffff", size: 66, top: 1700, rot: -1.5, border: "#13843a" },
};

const Label: React.FC<{ text: string; style: string; age: number; left: number }> = ({ text, style, age, left }) => {
  const s = STYLES[style];
  const inK = backOut(age / 0.32);
  const outK = clamp01(left / 0.2);
  const wobble = Math.sin(age * 3) * 0.6;
  return (
    <div style={{
      position: "absolute", top: s.top, left: 0, right: 0, display: "flex", justifyContent: "center",
      transform: `scale(${inK * (0.6 + 0.4 * outK)}) rotate(${s.rot + wobble}deg)`, opacity: outK,
    }}>
      <div style={{
        fontFamily: FONT, fontSize: s.size, color: s.fg, background: s.bg, padding: "18px 34px 22px",
        borderRadius: 28, border: `6px solid ${s.border}`, boxShadow: `0 12px 0 ${s.border}, 0 22px 40px rgba(0,0,0,0.25)`,
        letterSpacing: 1, textAlign: "center", maxWidth: 940, lineHeight: 1.05,
      }}>{text}</div>
    </div>
  );
};

const STEP_NAMES = ["¿SABÍAS?", "EL MÉDICO", "LA BANDA", "CONSULTORIO", "ALIVIO", "PREVENCIÓN", "RESUMEN"];

export const Hud: React.FC = () => {
  useFont();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sceneIdx = Math.max(0, TL.scenes.findIndex((s) => t >= s.from && t < s.to));
  const progress = clamp01(t / TL.events.endCard);
  const symptoms = 1 - clamp01((t - TL.events.bandSnap) / (TL.events.endCard - TL.events.bandSnap));
  const prevent = TL.scenes[5];
  const band = TL.scenes[2];
  const end = t - TL.events.endCard;

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      {/* top HUD */}
      <div style={{
        position: "absolute", top: 40, left: 36, right: 36, height: 200, borderRadius: 34,
        background: "rgba(29,26,38,0.82)", border: "5px solid rgba(255,255,255,0.9)", boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
        padding: "22px 30px", color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 44 }}>
          <span>MISIÓN: <span style={{ color: "#5ee6bf" }}>ALIVIO</span></span>
          <span style={{ color: "#ffcc00" }}>PASO {sceneIdx + 1}/7</span>
        </div>
        <div style={{ fontSize: 30, color: "#b8c4d2", marginTop: 4 }}>{STEP_NAMES[sceneIdx]}</div>
        <div style={{ display: "flex", gap: 24, marginTop: 14, alignItems: "center", fontSize: 28 }}>
          <span style={{ width: 150 }}>PROGRESO</span>
          <div style={{ flex: 1, height: 26, borderRadius: 13, background: "#3a3550", overflow: "hidden" }}>
            <div style={{ width: `${progress * 100}%`, height: "100%", background: "linear-gradient(90deg,#22d65c,#5ee6bf)", borderRadius: 13 }} />
          </div>
          <span style={{ width: 150, textAlign: "right" }}>SÍNTOMAS</span>
          <div style={{ width: 160, height: 26, borderRadius: 13, background: "#3a3550", overflow: "hidden" }}>
            <div style={{ width: `${symptoms * 100}%`, height: "100%", background: "linear-gradient(90deg,#ff2d3d,#ff7a52)", borderRadius: 13 }} />
          </div>
        </div>
      </div>

      {TL.labels.map((l, i) => (t >= l.t && t < l.until ? <Label key={i} text={l.text} style={l.style} age={t - l.t} left={l.until - t} /> : null))}

      {/* day counter while the tissue shrinks */}
      {t > TL.events.shrinkStart && t < band.to - 0.1 && (
        <div style={{ position: "absolute", top: 820, left: 60, transform: `scale(${backOut((t - TL.events.shrinkStart) / 0.3)})` }}>
          <div style={{ fontSize: 34, color: "#fff", background: "#ff4d5e", padding: "10px 26px", borderRadius: "22px 22px 0 0", textAlign: "center" }}>DÍA</div>
          <div style={{ fontSize: 110, color: "#1d1a26", background: "#fff", padding: "6px 40px", borderRadius: "0 0 22px 22px", textAlign: "center", border: "5px solid #ff4d5e" }}>
            {Math.min(7, 1 + Math.floor((t - TL.events.shrinkStart) / ((TL.events.detach - TL.events.shrinkStart) / 6.5)))}
          </div>
        </div>
      )}

      {/* prevention quest checklist */}
      {t > prevent.from + 0.4 && t < prevent.to - 0.1 && (
        <div style={{
          position: "absolute", top: 1330, left: 60, right: 60, padding: "26px 34px", borderRadius: 30,
          background: "rgba(255,255,255,0.94)", border: "6px solid #14c79a", boxShadow: "0 12px 0 #0b7f62",
          transform: `scale(${backOut((t - prevent.from - 0.4) / 0.35)})`,
        }}>
          {TL.checklist.map((c, i) => {
            const on = t >= c.t;
            const k = backOut((t - c.t) / 0.3);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 50, color: on ? "#1d1a26" : "#9aa3b0", margin: "8px 0" }}>
                <div style={{ width: 62, height: 62, borderRadius: 16, border: "5px solid #14c79a", background: on ? "#22d65c" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 46 }}>
                  {on && <span style={{ transform: `scale(${k})` }}>✓</span>}
                </div>
                {c.text}
              </div>
            );
          })}
        </div>
      )}

      {/* end card */}
      {end > 0 && (
        <AbsoluteFill style={{ background: `rgba(29,26,38,${0.75 * clamp01(end / 0.4)})`, alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${backOut(end / 0.4)})`, textAlign: "center" }}>
            <div style={{ fontSize: 120, color: "#ffcc00", textShadow: "0 10px 0 #b88f00" }}>¡MISIÓN</div>
            <div style={{ fontSize: 120, color: "#ffcc00", textShadow: "0 10px 0 #b88f00" }}>COMPLETA!</div>
            <div style={{ marginTop: 50, fontSize: 56, color: "#fff", background: "#14c79a", padding: "22px 40px", borderRadius: 28, border: "6px solid #0b7f62",
              transform: `scale(${backOut((end - 0.4) / 0.35)})` }}>
              CONSULTA A UN ESPECIALISTA
            </div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
