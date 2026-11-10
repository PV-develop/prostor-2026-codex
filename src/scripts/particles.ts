// @ts-nocheck
// Ported from the page animation in the Claude Design export.
export function initParticles(el, shape = 'text') {
    const S = 4, DEP = 110, F = 1400, R = 240, COL = '#D4D7DC';
    // Resting pose of the figure. The pyramid sits upright with a slight 3/4 yaw
    // and a raised camera so two side faces and the base geometry read as volume.
    // Softer perspective keeps the near base vertex from spilling past the hero.
    const POSE = shape === 'pyramid' ? { rz: 0, ry: .26, rx: .36, f: 1900 } : { rz: 20, ry: -.18, rx: .06, f: F };
    const host = el.closest('[data-screen-label]') || el.parentElement;
    const capEl = host.querySelector('[data-cap]'), cap = capEl && { lines: [...capEl.querySelectorAll('[data-cap-line]')], plate: capEl.querySelector('[data-cap-plate]') };
    const cv = document.createElement('canvas'), ctx = cv.getContext('2d');
    if (capEl) {
      const cw = capEl.closest('[data-reveal]') || capEl;
      let g = cw.parentElement; while (g && g !== host && getComputedStyle(g).zIndex === 'auto') g = g.parentElement;
      if (g && g !== host) { [...g.children].forEach(c => { if (getComputedStyle(c).position === 'static') c.style.position = 'relative'; if (getComputedStyle(c).zIndex === 'auto') c.style.zIndex = '3'; }); g.style.zIndex = 'auto'; }
      if (getComputedStyle(cw).position === 'static') cw.style.position = 'relative'; cw.style.zIndex = '5';
    }
    let P = [], W = 0, H = 0, base = 1, dpr = 1, raf = 0, t0 = 0, alive = true, ocx = 0, ocy = 0, VERTS = null, proj = null;
    const mouse = { x: -1e4, y: -1e4, nx: 0, ny: 0, sx: 0, sy: 0 };
    const build = () => {
      const r = el.getBoundingClientRect(), hr = host.getBoundingClientRect(), cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
      const w = Math.round(r.width), pad = Math.round(fs * .25), mw = w + pad * 2, mh = Math.round(r.height) + pad * 2;
      W = Math.round(hr.width); H = Math.round(hr.height); dpr = Math.min(1.5, devicePixelRatio || 1);
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;pointer-events:none;z-index:4`;
      if (!cv.parentNode) host.appendChild(cv);
      const m = document.createElement('canvas'); m.width = mw; m.height = mh; const mc = m.getContext('2d');
      mc.font = `${cs.fontWeight} ${fs}px Steelfish`; mc.fillStyle = mc.strokeStyle = '#000'; mc.textBaseline = 'alphabetic';
      mc.lineWidth = fs * .04; mc.lineJoin = 'round';
      const met = mc.measureText('20'), asc = met.fontBoundingBoxAscent ?? fs * .8, desc = met.fontBoundingBoxDescent ?? fs * .2;
      const ls = parseFloat(cs.letterSpacing) || 0, chars = el.firstChild.textContent.trim().split('');
      const gap = mc.lineWidth * 1.4, adv = chars.map(c => mc.measureText(c).width), tot = adv.reduce((a, b) => a + b + ls, 0) + gap * (chars.length - 1);
      let x = pad + w - tot - mc.lineWidth / 2; const y = pad + (r.height - (asc + desc)) / 2 + asc;
      if (shape === 'pyramid') {
        // Tetrahedron in 3D: apex up, triangular base tilted back. Vertices are
        // figure-centred; the mask silhouette is projected with the same resting
        // rotation as the render loop, so bounds and glow track the real figure.
        // Narrow viewports get a slightly smaller figure so the tilted pyramid
        // keeps clear of the viewport edges around the compact hero column.
        const S3 = Math.min(mw, mh) * (mw < 560 ? .851 : .943), L = S3 * .88, rb = L / Math.sqrt(3), Hp = S3 * .72, cy0 = -S3 * .105, cx0 = mw < 560 ? S3 * .06 : 0;
        VERTS = [[cx0, -Hp * .54 + cy0, 0], [cx0, Hp * .46 + cy0, -rb], [cx0 - rb * .866, Hp * .46 + cy0, rb * .5], [cx0 + rb * .866, Hp * .46 + cy0, rb * .5]];
        const aZ = POSE.rz * Math.PI / 180, cZ0 = Math.cos(aZ), sZ0 = Math.sin(aZ);
        const cY0 = Math.cos(POSE.ry), sY0 = Math.sin(POSE.ry), cX0 = Math.cos(POSE.rx), sX0 = Math.sin(POSE.rx);
        proj = v => {
          const xz = v[0] * cZ0 - v[1] * sZ0, yz = v[0] * sZ0 + v[1] * cZ0;
          const x1 = xz * cY0 - v[2] * sY0, z1 = xz * sY0 + v[2] * cY0;
          const y1 = yz * cX0 - z1 * sX0, z2 = yz * sX0 + z1 * cX0, k = POSE.f / (POSE.f + z2);
          return [x1 * k, y1 * k];
        };
        mc.lineWidth = 2;
        for (const f of [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]]) {
          const q = f.map(i => proj(VERTS[i]));
          mc.beginPath(); mc.moveTo(mw / 2 + q[0][0], mh / 2 + q[0][1]);
          q.slice(1).forEach(p => mc.lineTo(mw / 2 + p[0], mh / 2 + p[1]));
          mc.closePath(); mc.fill();
        }
      } else chars.forEach((c, i) => { mc.fillText(c, x, y); mc.strokeText(c, x, y); x += adv[i] + ls + gap; });
      if (!(mw > 0 && mh > 0)) return;
      const d = mc.getImageData(0, 0, mw, mh).data, on = (xx, yy) => xx >= 0 && yy >= 0 && xx < mw && yy < mh && d[(yy * mw + xx) * 4 + 3] > 128;
      let x0 = mw, x1 = 0, y0 = mh, y1 = 0;
      for (let yy = 0; yy < mh; yy += 2) for (let xx = 0; xx < mw; xx += 2) if (on(xx, yy)) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
      const shiftY = Math.max(0, (y1 - pad) - r.height + fs * .02);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      ocx = r.left - hr.left - pad + cx; ocy = r.top - hr.top - pad + cy - shiftY + 40;
      // Pyramid on desktop: pin the figure to the hero's vertical midline (the
      // span-derived pose sat ~70px low of the block centre) and carry the
      // caption along so it stays glued to the pyramid's centre. Mobile keeps
      // the in-column placement of its own stacked row.
      if (shape === 'pyramid') {
        if (matchMedia('(min-width:769px)').matches) {
          const dy = H / 2 - ocy;
          ocy = H / 2;
          if (capEl) capEl.style.top = `calc(50% + ${dy.toFixed(1)}px)`;
        } else if (capEl) capEl.style.top = '50%';
      }
      base = hr.top + scrollY + ocy + (y1 - y0) / 2; GR = Math.max(x1 - x0, y1 - y0) * .85; P = [];
      const SRC = [], h1 = host.querySelector('h1');
      if (h1) {
        const sm = document.createElement('canvas'); sm.width = W; sm.height = H; const sc = sm.getContext('2d'); sc.textBaseline = 'bottom'; sc.fillStyle = '#000';
        const tw = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT), rg = document.createRange(); let tn;
        while ((tn = tw.nextNode())) {
          const st = getComputedStyle(tn.parentElement); sc.font = `${st.fontWeight} ${st.fontSize} Steelfish`; try { sc.fontStretch = 'ultra-condensed'; } catch (e) {}
          const re = /\S+/g, txt = tn.textContent; let mt;
          while ((mt = re.exec(txt))) {
            rg.setStart(tn, mt.index); rg.setEnd(tn, mt.index + mt[0].length); const rc = rg.getBoundingClientRect(); if (!rc.width) continue;
            const wd = mt[0].toUpperCase(), mm = sc.measureText(wd), sxk = mm.width ? rc.width / mm.width : 1, asc2 = mm.fontBoundingBoxAscent ?? parseFloat(st.fontSize) * .8, dsc2 = mm.fontBoundingBoxDescent ?? parseFloat(st.fontSize) * .2;
            const by = rc.top - hr.top + (rc.height - asc2 - dsc2) / 2 + asc2;
            sc.setTransform(sxk, 0, 0, 1, rc.left - hr.left, by); sc.textBaseline = 'alphabetic'; sc.fillText(wd, 0, 0); sc.setTransform(1, 0, 0, 1, 0, 0);
          }
        }
        if (!(W > 0 && H > 0)) return;
        const sd = sc.getImageData(0, 0, W, H).data;
        for (let yy = 0; yy < H; yy += 3) for (let xx = 0; xx < W; xx += 3) if (sd[(yy * W + xx) * 4 + 3] > 128) SRC.push(xx, yy);
      }
      const ns = SRC.length / 2;
      const add = (x, y, z, red = false, boost = 0) => {
        let sx, sy; if (ns) { const j = (Math.random() * ns | 0) * 2; sx = SRC[j]; sy = SRC[j + 1]; } else { sx = Math.random() * W; sy = Math.random() * H; }
        const j2 = ns ? (Math.random() * ns | 0) * 2 : 0;
      P.push({ hx: x - cx, hy: y - cy, hz: z, red, sx, sy, ex: ns ? SRC[j2] : sx, ey: ns ? SRC[j2 + 1] : sy, dl: Math.random() * .9,
          ax: (Math.random() - .5) * 260, ay: -80 - Math.random() * 220,
          th: Math.random(), ox: 0, oy: 0, pull: .55 + Math.random() * .4, spr: .05 + Math.random() * .09, sz: (red ? 1.2 + Math.random() * 2.2 : .8 + Math.random() * .8) + boost });
      };
      if (shape === 'pyramid' && VERTS) {
        const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        const nrm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
        const L = Math.hypot(...sub(VERTS[1], VERTS[2])), bw = L * .042;
        // Small screens render fewer, smaller dots: bump dot weight so the
        // beams stay legible at phone scale.
        const bScale = mw < 560 ? 1.35 : 1;
        // Open wireframe tetrahedron, reference-style: the near frame
        // apex → rear-left → front-bottom carries solid particle beams; every
        // edge leading to the far rear vertex is a ghosted translucent beam,
        // so the full 3D solid reads while the centre of the figure stays empty.
        // The rear (inner) edges run denser and wider than the outer frame, so
        // the inner geometry stays clearly legible through the open faces.
        // The rear base edge runs wider still, as a translucent inner band.
        for (const e of [[0, 2], [1, 2], [0, 1], [0, 3], [1, 3], [2, 3]]) {
          const a = VERTS[e[0]], b = VERTS[e[1]], d = nrm(sub(b, a));
          let u = nrm(cross(d, Math.abs(d[1]) < .9 ? [0, 1, 0] : [1, 0, 0]));
          const v = cross(d, u);
          const ghost = e[0] === 3 || e[1] === 3, ridge = e[0] === 0 && e[1] === 1;
          const band = e[0] === 2 && e[1] === 3;
          const ebw = bw * (band ? 1.7 : ghost ? 1.25 : ridge ? 1.25 : 1);
          const len = Math.hypot(...sub(b, a));
          const steps = Math.max(20, Math.round(len / (ghost ? 5 : ridge ? 4.4 : 4.8)));
          const per = ghost ? 10 : ridge ? 14 : 12;
          for (let s = 0; s <= steps; s++) {
            const t = (s + (Math.random() - .5) * .3) / steps;
            const px = a[0] + (b[0] - a[0]) * t, py = a[1] + (b[1] - a[1]) * t, pz = a[2] + (b[2] - a[2]) * t;
            for (let k = 0; k < per; k++) {
              const uu = (Math.random() * 2 - 1) * ebw * (.35 + .65 * Math.sqrt(Math.random()));
              const vv = (Math.random() * 2 - 1) * ebw * (.35 + .65 * Math.sqrt(Math.random()));
              add(mw / 2 + px + u[0] * uu + v[0] * vv, mh / 2 + py + u[1] * uu + v[1] * vv, pz + u[2] * uu + v[2] * vv,
                false, ghost ? .25 : (ridge ? .9 : .6) * bScale);
            }
          }
        }
      } else {
        for (let yy = 0; yy < mh; yy += S) for (let xx = 0; xx < mw; xx += S) {
          const jx = xx + (Math.random() - .5) * S * .9 | 0, jy = yy + (Math.random() - .5) * S * .9 | 0;
          if (!on(jx, jy)) continue;
          const edge = !on(jx - S, jy) || !on(jx + S, jy) || !on(jx, jy - S) || !on(jx, jy + S);
          add(jx, jy, -DEP / 2);
          if (edge) { for (let k = 1; k <= 5; k++) add(jx, jy, -DEP / 2 + DEP * k / 5); }
          else if (Math.random() < .25) add(jx, jy, DEP / 2);
        }
      }
      ctx.fillStyle = COL;
      if (!t0) t0 = performance.now();
      BX = new Float32Array(P.length); BY = new Float32Array(P.length); BS = new Float32Array(P.length); BB = new Uint8Array(P.length);
      wake();
    };
    let BX, BY, BS, BB, GR = 400, lastP = -1; const NB = 8;
    const wake = () => { if (!raf && alive) raf = requestAnimationFrame(loop); };
    const ease = t => 1 - Math.pow(1 - t, 3);
    const loop = now => {
      raf = 0; if (!alive || !P.length) return;
      const rb = cv.getBoundingClientRect();
      if (rb.bottom < 0 || rb.top > innerHeight) return;
      const p = Math.min(1, Math.max(0, scrollY / base)), T = (now - t0) / 1000;
      if (p >= 1 && lastP >= 1) return;
      const dsx = mouse.nx - mouse.sx, dsy = mouse.ny - mouse.sy;
      mouse.sx += dsx * .06; mouse.sy += dsy * .06;
      const ry = POSE.ry + mouse.sx * .2, rx = POSE.rx - mouse.sy * .1;
      const cl = cap ? cap.lines : [];
      for (let j = 0; j < cl.length; j++) {
        const ii = Math.min(1, Math.max(0, (T - 1.6 - j * .14) / .8)), ie = 1 - Math.pow(1 - ii, 4);
        const so = Math.min(1, Math.max(0, (p - j * .035) / .16)), se2 = so * so * (3 - 2 * so);
        cl[j].style.transform = `translateY(${((1 - ie) * 110 - se2 * 110).toFixed(2)}%)`;
      }
      if (cap && cap.plate) {
        const pi = Math.min(1, Math.max(0, (T - 2.2) / .55)), pe = 1 - Math.pow(1 - pi, 3), ps = Math.min(1, Math.max(0, p / .09));
        cap.plate.style.clipPath = `inset(0 ${((1 - pe) * 100).toFixed(1)}% 0 ${(ps * 100).toFixed(1)}%)`;
      }
      let moving = T < 3.6 || p !== lastP || Math.abs(dsx) + Math.abs(dsy) > .002; lastP = p;
      const R2 = R * R, iDep = 1 / (DEP * 2);
      const rz = POSE.rz * Math.PI / 180, cZ = Math.cos(rz), sZ = Math.sin(rz);
      const cY = Math.cos(ry), sY = Math.sin(ry), cX = Math.cos(rx), sX = Math.sin(rx);
      const ox0 = ocx, oy0 = ocy, mx = mouse.x - rb.left, my = mouse.y - rb.top;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const ga = Math.min(1, T / 2.6) * (1 - p);
      if (ga > .01) {
        const gr = ctx.createRadialGradient(ocx, ocy, 0, ocx, ocy, GR);
        gr.addColorStop(0, `rgba(233,235,239,${.085 * ga})`); gr.addColorStop(.45, `rgba(233,235,239,${.035 * ga})`); gr.addColorStop(1, 'rgba(233,235,239,0)');
        ctx.fillStyle = gr; ctx.fillRect(ocx - GR, ocy - GR, GR * 2, GR * 2); ctx.fillStyle = COL;
      }
      for (let i = 0, n = P.length; i < n; i++) {
        const q = P[i];
        const st = p <= q.th * .45 ? 0 : Math.min(1, (p - q.th * .45) / .5), se = st < 1 ? st * st * (3 - 2 * st) : 1;
        const it = T >= q.dl + 2 ? 1 : ease(Math.max(0, (T - q.dl) / 2));
        const a = (T < q.dl ? 0 : 1) * (1 - Math.max(0, se - .8) * 5);
        if (a <= .02) { BB[i] = 255; continue; }
        const x = q.hx, y = q.hy, z = q.hz;
        const xz = x * cZ - y * sZ, yz = x * sZ + y * cZ;
        let x1 = xz * cY - z * sY, z1 = xz * sY + z * cY; const y1 = yz * cX - z1 * sX; z1 = yz * sX + z1 * cX;
        const k = POSE.f / (POSE.f + z1), hx2 = ox0 + x1 * k, hy2 = oy0 + y1 * k;
        const ai = Math.sin(Math.PI * it), as = Math.sin(Math.PI * se);
        let px2 = q.sx + (hx2 - q.sx) * it + q.ax * ai, py2 = q.sy + (hy2 - q.sy) * it + q.ay * ai;
        if (se > 0) { px2 += (q.ex - px2) * se + q.ax * as; py2 += (q.ey - py2) * se + q.ay * as; }
        const dx = mx - px2, dy = my - py2, d2 = dx * dx + dy * dy;
        let tx = 0, ty = 0; if (d2 < R2) { const u = 1 - Math.sqrt(d2) / R, f = q.pull * u * Math.sqrt(u); tx = dx * f; ty = dy * f; }
        if (tx || ty || q.ox || q.oy) {
          const ex = tx - q.ox, ey = ty - q.oy;
          if (ex * ex + ey * ey < .01) { q.ox = tx; q.oy = ty; } else { q.ox += ex * q.spr; q.oy += ey * q.spr; moving = true; }
          px2 += q.ox; py2 += q.oy;
        }
        const l0 = Math.max(.22, Math.min(1, .8 - z1 * iDep)), fr = se > 0 ? Math.min(it, 1 - se) : it, light = l0 + (1 - l0) * (1 - fr) * (1 - fr), s2 = q.sz * k;
        BX[i] = px2 - s2 / 2; BY[i] = py2 - s2 / 2; BS[i] = s2; BB[i] = Math.min(NB - 1, a * light * NB | 0);
      }
      for (let b = 0; b < NB; b++) {
        for (const red of [false]) {
          ctx.globalAlpha = red ? .9 : .6 * (b + .5) / NB;
          ctx.fillStyle = red ? '#FA001E' : COL; ctx.beginPath();
          for (let i = 0, n = P.length; i < n; i++) if (BB[i] === b && P[i].red === red) ctx.rect(BX[i], BY[i], BS[i], BS[i]);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (moving) wake();
    };
    const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.nx = (e.clientX / innerWidth - .5) * 2; mouse.ny = (e.clientY / innerHeight - .5) * 2; wake(); };
    const onLeave = () => { mouse.x = mouse.y = -1e4; wake(); };
    const onScroll = () => wake(); window.addEventListener('scroll', onScroll, { passive: true });
    (document.fonts ? document.fonts.load('800 100px Steelfish').then(() => document.fonts.ready) : Promise.resolve()).then(build);
    window.addEventListener('mousemove', onMove, { passive: true }); document.addEventListener('mouseleave', onLeave); window.addEventListener('resize', () => build());
}
