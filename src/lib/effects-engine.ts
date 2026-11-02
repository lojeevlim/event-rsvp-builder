/** Canvas background effects (confetti, snow, rain, stars, fireflies, bubbles, hearts): smooth, depth-aware particles drawn with 2D canvas. */
export type EffectKind = "confetti" | "snow" | "rain" | "stars" | "fireflies" | "bubbles" | "hearts";

type Env = { ctx: CanvasRenderingContext2D; size: () => { w: number; h: number }; pal: () => string[] };
type Sim = { reset: () => void; step: (dt: number, t: number) => void };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const FALLBACK = ["#a5b4fc", "#818cf8", "#6366f1", "#4f46e5", "#4338ca"];

/** The theme's accent shades (300–700), read from the canvas so the effect follows the site colour. */
function readPalette(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return [300, 400, 500, 600, 700].map((s, i) => cs.getPropertyValue(`--color-accent-${s}`).trim() || FALLBACK[i]);
}

const heart = (ctx: CanvasRenderingContext2D, s: number) => {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.5, -s * 0.95, 0, -s * 0.45);
  ctx.bezierCurveTo(s * 0.5, -s * 0.95, s * 0.9, -s * 0.2, 0, s * 0.35);
  ctx.closePath();
};

const sparkle = (ctx: CanvasRenderingContext2D, r: number) => {
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.quadraticCurveTo(0, 0, 0, r);
  ctx.quadraticCurveTo(0, 0, -r, 0);
  ctx.quadraticCurveTo(0, 0, 0, -r);
  ctx.closePath();
};

const confetti = (e: Env): Sim => {
  type P = { x: number; y: number; vy: number; sw: number; ph: number; rot: number; vr: number; cw: number; ch: number; fp: number; fv: number; col: string };
  let ps: P[] = [];
  const make = (spread: boolean): P => {
    const { w, h } = e.size();
    const cols = [...e.pal(), "#fbbf24", "#f472b6", "#38bdf8", "#34d399"];
    return { x: rand(0, w), y: spread ? rand(-0.1 * h, h) : rand(-40, -10), vy: rand(0.9, 2.1), sw: rand(0.8, 2), ph: rand(0, 6.3), rot: rand(0, 6.3), vr: rand(-0.08, 0.08), cw: rand(8, 14), ch: rand(4, 8), fp: rand(0, 6.3), fv: rand(0.05, 0.14), col: pick(cols) };
  };
  return {
    reset() {
      const { w, h } = e.size();
      ps = Array.from({ length: Math.round(clamp((w * h) / 7000, 34, 110)) }, () => make(true));
    },
    step(dt, t) {
      const { h } = e.size();
      for (const p of ps) {
        p.y += p.vy * dt;
        p.x += Math.sin(t * p.sw + p.ph) * 0.9 * dt;
        p.rot += p.vr * dt;
        p.fp += p.fv * dt;
        if (p.y > h + 16) Object.assign(p, make(false));
        e.ctx.save();
        e.ctx.translate(p.x, p.y);
        e.ctx.rotate(p.rot);
        e.ctx.scale(1, Math.cos(p.fp)); // tumbling: the paper flips edge-on and back
        e.ctx.fillStyle = p.col;
        e.ctx.globalAlpha = 0.75 + 0.25 * Math.abs(Math.cos(p.fp));
        e.ctx.fillRect(-p.cw / 2, -p.ch / 2, p.cw, p.ch);
        e.ctx.restore();
      }
    },
  };
};

const snow = (e: Env): Sim => {
  type P = { x: number; y: number; r: number; vy: number; ph: number; sw: number };
  let ps: P[] = [];
  const make = (spread: boolean): P => {
    const { w, h } = e.size();
    const r = rand(1, 4.4); // bigger flakes are "closer": they fall faster and sway more
    return { x: rand(0, w), y: spread ? rand(0, h) : rand(-12, -2), r, vy: 0.35 + r * 0.28, ph: rand(0, 6.3), sw: rand(0.4, 1.2) };
  };
  return {
    reset() {
      const { w, h } = e.size();
      ps = Array.from({ length: Math.round(clamp((w * h) / 6500, 34, 150)) }, () => make(true));
    },
    step(dt, t) {
      const { w, h } = e.size();
      const wind = Math.sin(t * 0.35) * 0.45;
      e.ctx.shadowColor = "rgba(96,165,250,0.65)";
      for (const p of ps) {
        p.y += p.vy * dt;
        p.x += (Math.sin(t * p.sw + p.ph) * 0.35 + wind * (p.r / 3)) * dt;
        if (p.y > h + 8) Object.assign(p, make(false));
        if (p.x > w + 8) p.x = -8;
        if (p.x < -8) p.x = w + 8;
        e.ctx.shadowBlur = p.r * 1.6;
        e.ctx.fillStyle = `rgba(255,255,255,${0.55 + p.r * 0.1})`;
        e.ctx.beginPath();
        e.ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        e.ctx.fill();
      }
      e.ctx.shadowBlur = 0;
    },
  };
};

const rain = (e: Env): Sim => {
  type P = { x: number; y: number; len: number; v: number; a: number };
  type R = { x: number; y: number; r: number; life: number };
  let ps: P[] = [];
  const ripples: R[] = [];
  const make = (spread: boolean): P => {
    const { w, h } = e.size();
    return { x: rand(-30, w + 30), y: spread ? rand(-h, h) : rand(-h * 0.3, -10), len: rand(10, 24), v: rand(13, 21), a: rand(0.25, 0.65) };
  };
  return {
    reset() {
      const { w } = e.size();
      ps = Array.from({ length: Math.round(clamp(w / 5, 50, 170)) }, () => make(true));
      ripples.length = 0;
    },
    step(dt) {
      const { h } = e.size();
      const slant = 0.18;
      e.ctx.lineCap = "round";
      for (const p of ps) {
        p.y += p.v * dt;
        p.x -= p.v * slant * dt;
        if (p.y > h - 2) {
          if (Math.random() < 0.28) ripples.push({ x: p.x, y: h - rand(2, 10), r: 1, life: 1 });
          Object.assign(p, make(false));
        }
        e.ctx.strokeStyle = `rgba(147,197,253,${p.a})`;
        e.ctx.lineWidth = 0.8 + p.a * 1.1;
        e.ctx.beginPath();
        e.ctx.moveTo(p.x, p.y);
        e.ctx.lineTo(p.x + p.len * slant, p.y - p.len);
        e.ctx.stroke();
      }
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 0.7 * dt;
        r.life -= 0.045 * dt;
        if (r.life <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        e.ctx.strokeStyle = `rgba(147,197,253,${r.life * 0.45})`;
        e.ctx.lineWidth = 1;
        e.ctx.beginPath();
        e.ctx.ellipse(r.x, r.y, r.r * 2.2, r.r * 0.7, 0, 0, 6.2832);
        e.ctx.stroke();
      }
    },
  };
};

const stars = (e: Env): Sim => {
  type S = { x: number; y: number; r: number; ph: number; sp: number; col: string; cross: boolean };
  type Shoot = { x: number; y: number; vx: number; vy: number; life: number } | null;
  let ss: S[] = [];
  let shoot: Shoot = null;
  let next = 90;
  return {
    reset() {
      const { w, h } = e.size();
      const cols = ["#ffffff", "#fde68a", "#ffffff", "#bae6fd", ...e.pal().slice(0, 2)];
      ss = Array.from({ length: Math.round(clamp((w * h) / 5200, 28, 120)) }, () => {
        const big = Math.random() < 0.22;
        return { x: rand(0, w), y: rand(0, h), r: big ? rand(5, 9) : rand(0.8, 2.2), ph: rand(0, 6.3), sp: rand(0.8, 2.4), col: pick(cols), cross: big };
      });
    },
    step(dt, t) {
      const { w, h } = e.size();
      for (const s of ss) {
        const tw = 0.5 + 0.5 * Math.sin(t * s.sp + s.ph);
        e.ctx.save();
        e.ctx.translate(s.x, s.y);
        e.ctx.fillStyle = s.col;
        e.ctx.shadowColor = s.col;
        e.ctx.shadowBlur = s.r * 2.2;
        e.ctx.globalAlpha = 0.25 + 0.75 * tw;
        if (s.cross) {
          e.ctx.rotate(t * 0.15 + s.ph);
          sparkle(e.ctx, s.r * (0.7 + 0.5 * tw));
          e.ctx.fill();
        } else {
          e.ctx.beginPath();
          e.ctx.arc(0, 0, s.r * (0.7 + 0.4 * tw), 0, 6.2832);
          e.ctx.fill();
        }
        e.ctx.restore();
      }
      // now and then a shooting star crosses the section
      next -= dt;
      if (!shoot && next <= 0) {
        shoot = { x: rand(0.1, 0.8) * w, y: rand(0, 0.35) * h, vx: rand(7, 10), vy: rand(3, 5), life: 1 };
        next = rand(200, 420);
      }
      if (shoot) {
        const s = shoot;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= 0.02 * dt;
        const g = e.ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
        g.addColorStop(0, `rgba(255,255,255,${s.life})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        e.ctx.strokeStyle = g;
        e.ctx.lineWidth = 2;
        e.ctx.lineCap = "round";
        e.ctx.beginPath();
        e.ctx.moveTo(s.x, s.y);
        e.ctx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9);
        e.ctx.stroke();
        if (s.life <= 0 || s.x > w + 40 || s.y > h + 40) shoot = null;
      }
    },
  };
};

const fireflies = (e: Env): Sim => {
  type F = { x: number; y: number; a: number; va: number; sp: number; r: number; ph: number; sp2: number };
  let fs: F[] = [];
  return {
    reset() {
      const { w, h } = e.size();
      fs = Array.from({ length: Math.round(clamp((w * h) / 16000, 14, 40)) }, () => ({ x: rand(0, w), y: rand(0, h), a: rand(0, 6.3), va: 0, sp: rand(0.25, 0.7), r: rand(7, 15), ph: rand(0, 6.3), sp2: rand(0.5, 1.4) }));
    },
    step(dt, t) {
      const { w, h } = e.size();
      for (const f of fs) {
        f.va += rand(-0.02, 0.02) * dt; // wander: the heading drifts a little each frame
        f.va *= 0.96;
        f.a += f.va * dt;
        f.x += Math.cos(f.a) * f.sp * dt;
        f.y += Math.sin(f.a) * f.sp * dt - 0.05 * dt;
        if (f.x < -20) f.x = w + 20;
        if (f.x > w + 20) f.x = -20;
        if (f.y < -20) f.y = h + 20;
        if (f.y > h + 20) f.y = -20;
        const glow = 0.15 + 0.85 * Math.max(0, Math.sin(t * f.sp2 + f.ph)) ** 1.5; // slow pulse, off between flashes
        const g = e.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2.4);
        g.addColorStop(0, `rgba(254,249,195,${0.95 * glow})`);
        g.addColorStop(0.25, `rgba(253,224,71,${0.55 * glow})`);
        g.addColorStop(1, "rgba(253,224,71,0)");
        e.ctx.fillStyle = g;
        e.ctx.fillRect(f.x - f.r * 2.4, f.y - f.r * 2.4, f.r * 4.8, f.r * 4.8);
      }
    },
  };
};

const bubbles = (e: Env): Sim => {
  type B = { x: number; y: number; r: number; vy: number; ph: number; sw: number; col: string };
  let bs: B[] = [];
  const make = (spread: boolean): B => {
    const { w, h } = e.size();
    const r = rand(7, 32);
    return { x: rand(0, w), y: spread ? rand(0, h) : h + r + rand(0, 40), r, vy: 0.3 + 26 / (r + 10) * 0.35, ph: rand(0, 6.3), sw: rand(0.5, 1.3), col: pick(e.pal()) };
  };
  return {
    reset() {
      const { w, h } = e.size();
      bs = Array.from({ length: Math.round(clamp((w * h) / 17000, 10, 32)) }, () => make(true));
    },
    step(dt, t) {
      for (const b of bs) {
        b.y -= b.vy * dt;
        b.x += Math.sin(t * b.sw + b.ph) * 0.45 * dt;
        if (b.y < -b.r - 4) Object.assign(b, make(false));
        const g = e.ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
        g.addColorStop(0, "rgba(255,255,255,0.05)");
        g.addColorStop(0.75, "rgba(255,255,255,0.1)");
        g.addColorStop(1, "rgba(255,255,255,0.32)");
        e.ctx.fillStyle = g;
        e.ctx.beginPath();
        e.ctx.arc(b.x, b.y, b.r, 0, 6.2832);
        e.ctx.fill();
        e.ctx.strokeStyle = b.col;
        e.ctx.globalAlpha = 0.55;
        e.ctx.lineWidth = 1.5;
        e.ctx.stroke();
        e.ctx.globalAlpha = 1;
        // the shine in the top-left
        e.ctx.fillStyle = "rgba(255,255,255,0.8)";
        e.ctx.beginPath();
        e.ctx.ellipse(b.x - b.r * 0.38, b.y - b.r * 0.42, b.r * 0.24, b.r * 0.13, -0.7, 0, 6.2832);
        e.ctx.fill();
      }
    },
  };
};

const hearts = (e: Env): Sim => {
  type H = { x: number; y: number; s: number; vy: number; ph: number; sw: number; col: string; a: number };
  let hs: H[] = [];
  const make = (spread: boolean): H => {
    const { w, h } = e.size();
    const s = rand(9, 26);
    return { x: rand(0, w), y: spread ? rand(0, h) : h + s + rand(0, 40), s, vy: rand(0.5, 1.3), ph: rand(0, 6.3), sw: rand(0.6, 1.4), col: pick([...e.pal(), "#fb7185", "#f472b6"]), a: rand(0.55, 0.9) };
  };
  return {
    reset() {
      const { w, h } = e.size();
      hs = Array.from({ length: Math.round(clamp((w * h) / 15000, 10, 34)) }, () => make(true));
    },
    step(dt, t) {
      const { h } = e.size();
      for (const p of hs) {
        p.y -= p.vy * dt;
        p.x += Math.sin(t * p.sw + p.ph) * 0.6 * dt;
        if (p.y < -p.s * 2) Object.assign(p, make(false));
        const fade = clamp(p.y / (h * 0.25), 0, 1); // fades out as it nears the top
        e.ctx.save();
        e.ctx.translate(p.x, p.y);
        e.ctx.rotate(Math.sin(t * p.sw + p.ph) * 0.25);
        const beat = 1 + 0.06 * Math.sin(t * 5 + p.ph);
        e.ctx.scale(beat, beat);
        e.ctx.globalAlpha = p.a * fade;
        e.ctx.fillStyle = p.col;
        e.ctx.shadowColor = p.col;
        e.ctx.shadowBlur = 8;
        heart(e.ctx, p.s);
        e.ctx.fill();
        e.ctx.shadowBlur = 0;
        e.ctx.fillStyle = "rgba(255,255,255,0.45)";
        e.ctx.beginPath();
        e.ctx.ellipse(-p.s * 0.38, -p.s * 0.38, p.s * 0.16, p.s * 0.09, -0.6, 0, 6.2832);
        e.ctx.fill();
        e.ctx.restore();
      }
    },
  };
};

const SIMS: Record<EffectKind, (e: Env) => Sim> = { confetti, snow, rain, stars, fireflies, bubbles, hearts };

export function startEffect(canvas: HTMLCanvasElement, kind: EffectKind): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let t = 0;
  let palAge = 0;
  let visible = true;
  let pal = readPalette(canvas);
  const sim = SIMS[kind]({ ctx, size: () => ({ w, h }), pal: () => pal });

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = r.width;
    h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sim.reset();
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      last = now;
      return;
    }
    const dt = Math.min(2.5, last ? (now - last) / 16.67 : 1);
    last = now;
    t += dt / 60;
    palAge += dt;
    if (palAge > 120) {
      pal = readPalette(canvas); // follows the accent colour if it is changed while editing
      palAge = 0;
    }
    ctx.clearRect(0, 0, w, h);
    sim.step(dt, t);
  };

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(canvas);
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
  };
}
