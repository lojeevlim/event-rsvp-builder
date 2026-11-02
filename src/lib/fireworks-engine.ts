/** A small canvas fireworks show: rockets climb with a spark trail, then burst into streaks that slow, fall and fade. Each firework is one colour. */
type Spark = { x: number; y: number; px: number; py: number; vx: number; vy: number; life: number; decay: number; h: number; s: number; l: number; size: number; grav: number; fric: number; glitter: boolean };
type Rocket = { x: number; y: number; vx: number; vy: number; ty: number; h: number };
type Flash = { x: number; y: number; r: number; life: number; h: number };

const HUES = [352, 18, 45, 150, 185, 212, 265, 305];
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export function startFireworks(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let wait = 8; // frames until the next rocket
  let visible = true;
  const sparks: Spark[] = [];
  const rockets: Rocket[] = [];
  const flashes: Flash[] = [];

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    w = r.width;
    h = r.height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const launch = () => {
    const ty = rand(0.14, 0.46) * h;
    rockets.push({ x: rand(0.1, 0.9) * w, y: h + 6, vx: rand(-0.35, 0.35), vy: -(h - ty) * 0.0152, ty, h: HUES[Math.floor(Math.random() * HUES.length)] });
  };

  const burst = (x: number, y: number, hue: number) => {
    const k = Math.max(0.65, Math.min(1.35, Math.min(w, h) / 480));
    const kind = Math.random();
    const add = (angle: number, speed: number, o: Partial<Spark> = {}) =>
      sparks.push({ x, y, px: x, py: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, decay: rand(0.011, 0.018), h: hue, s: 95, l: 60, size: rand(1.4, 2.2), grav: 0.045, fric: 0.965, glitter: Math.random() < 0.3, ...o });
    if (kind < 0.5) {
      // peony: a full sphere of streaks
      const n = 70;
      for (let i = 0; i < n; i++) add(rand(0, Math.PI * 2), rand(1.2, 1) * rand(3.4, 5.4) * k);
    } else if (kind < 0.75) {
      // ring
      const n = 46;
      const tilt = rand(0.45, 1);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * 4.4 * k, vy: Math.sin(a) * 4.4 * k * tilt, life: 1, decay: 0.014, h: hue, s: 95, l: 62, size: 2, grav: 0.03, fric: 0.968, glitter: false });
      }
    } else {
      // willow: slow golden streaks that droop long
      for (let i = 0; i < 64; i++) add(rand(0, Math.PI * 2), rand(1.4, 3.6) * k, { h: 42, s: 92, l: 64, decay: rand(0.006, 0.01), grav: 0.06, fric: 0.975, glitter: true });
    }
    // a few white-hot sparks in the middle of every burst
    for (let i = 0; i < 10; i++) add(rand(0, Math.PI * 2), rand(0.6, 2.2) * k, { s: 40, l: 92, size: 1.6, decay: 0.024 });
    flashes.push({ x, y, r: 90 * k, life: 1, h: hue });
  };

  const frame = (t: number) => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      last = t;
      return;
    }
    const dt = Math.min(2.5, last ? (t - last) / 16.67 : 1);
    last = t;

    // fade what was drawn (this is what makes the trails)
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = `rgba(0,0,0,${Math.min(0.5, 0.2 * dt)})`;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";

    wait -= dt;
    if (wait <= 0 && sparks.length < 1100 && rockets.length < 4) {
      launch();
      wait = rand(32, 85);
    }

    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.vy *= Math.pow(0.985, dt);
      r.x += r.vx * dt;
      r.y += r.vy * dt;
      sparks.push({ x: r.x, y: r.y, px: r.x, py: r.y, vx: rand(-0.25, 0.25), vy: rand(0.2, 0.9), life: 0.7, decay: 0.05, h: 40, s: 90, l: 78, size: 1.4, grav: 0.02, fric: 0.95, glitter: false });
      ctx.beginPath();
      ctx.arc(r.x, r.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "hsl(45 100% 85%)";
      ctx.fill();
      if (r.y <= r.ty || r.vy > -1.1) {
        burst(r.x, r.y, r.h);
        rockets.splice(i, 1);
      }
    }

    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
      g.addColorStop(0, `hsla(${f.h} 100% 85% / ${0.55 * f.life})`);
      g.addColorStop(1, `hsla(${f.h} 100% 60% / 0)`);
      ctx.fillStyle = g;
      ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
      f.life -= 0.1 * dt;
      if (f.life <= 0) flashes.splice(i, 1);
    }

    ctx.lineCap = "round";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.px = p.x;
      p.py = p.y;
      const f = Math.pow(p.fric, dt);
      p.vx *= f;
      p.vy = p.vy * f + p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;
      if (p.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      let a = Math.min(1, p.life * 1.4);
      if (p.glitter && p.life < 0.55) a *= Math.random() < 0.5 ? 0.25 : 1; // twinkle as it dies
      ctx.strokeStyle = `hsla(${p.h} ${p.s}% ${p.l}% / ${a})`;
      ctx.lineWidth = p.size * (0.5 + p.life * 0.7);
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
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
