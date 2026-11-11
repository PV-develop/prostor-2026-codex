// @ts-nocheck
// Ported from the page scroll-line and footer-logo animation in the Claude Design export.
export function initThread() {
    const hero = document.querySelector('[data-screen-label^="01"], [data-service-hero]'); if (!hero) return;
    const root = hero.parentElement, logo = document.querySelector('[data-logo]') || hero.querySelector('img'); root.style.position = 'relative';
    // The thread sits near the content column edge: at viewport widths beyond
    // the 1600px column it follows the gutter instead of hugging the screen.
    const gutterX = () => Math.max(22, (innerWidth - 1600) / 2 - 26);
    let X = gutterX(), RED = '#FA001E', TR = 'rgba(128,128,128,.42)'; 
    const wrap = document.createElement('div'); wrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:6'; wrap.dataset.thread = '1';
    const mk = css => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;' + css; wrap.appendChild(d); return d; };
    const stub = mk(`left:${X}px;height:1px;background:${RED};transform:scaleX(0);transform-origin:right;transition:transform .6s cubic-bezier(.6,0,.2,1)`), track = mk(`left:${X}px;width:1px;background:${TR}`), fill = mk(`left:${X}px;width:1px;background:${RED};height:0`);
    const head = mk(`left:${X - 3}px;width:7px;height:7px;background:${RED};opacity:0;transition:opacity .2s`);
    root.appendChild(wrap);
    let intro = false, live = false, iT = 0; stub.style.display = 'none'; head.style.opacity = '1';
    wrap.style.transition = 'opacity .35s'; wrap.style.opacity = '0';
    const hdr = document.querySelector('[data-hdr]'), logoA = hdr && hdr.querySelector('[data-logo]'), conn = hdr && hdr.querySelector('[data-hconn]');
    let lg = null;
    const EZ = 'cubic-bezier(.7,0,.2,1)';
    const applyLogo = c => {
      if (!lg) return; const n = lg.letters.length;
      lg.letters.forEach((it, i) => {
        const d = c ? i * 55 : (n - 1 - i) * 40;
        it.g.style.transition = `transform .6s ${EZ} ${d}ms, opacity .25s ${c ? d + 420 : d}ms`;
        it.g.style.transform = `translate(${c ? 3 - it.b.x : -48}px,0)`;
        it.g.style.opacity = c ? '0' : '1';
      });
      const id = c ? (n - 1) * 55 + 480 : 0;
      lg.icon.style.transition = `transform .45s cubic-bezier(.3,1.3,.5,1) ${id}ms, opacity .3s ${id}ms`;
      lg.icon.style.transform = c ? 'scale(1)' : 'scale(.82)'; lg.icon.style.opacity = c ? '1' : '0';
      lg.icon.querySelectorAll('path').forEach(p => { p.style.transition = c ? `fill .5s ${id + 320}ms` : 'fill .25s'; p.style.fill = c ? '#FA001E' : ''; });
    };
    const fmEl = root.querySelector('[data-fmark]');
    let fm = null, fmY = -1, fmOn = false, fmBr = null, fmRaf = 0, fmT = [];
    const buildFM = t => {
      if (!fmEl) return;
      const NS = 'http://www.w3.org/2000/svg', ps = [...new DOMParser().parseFromString(t, 'image/svg+xml').querySelectorAll('path')];
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 219 34'); svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible';
      const id = 'fmc' + Math.random().toString(36).slice(2, 7);
      const defs = document.createElementNS(NS, 'defs'), cp = document.createElementNS(NS, 'clipPath'), rc = document.createElementNS(NS, 'rect');
      cp.setAttribute('id', id); rc.setAttribute('x', '-2'); rc.setAttribute('y', '-4'); rc.setAttribute('height', '42'); rc.setAttribute('width', '0'); cp.appendChild(rc); defs.appendChild(cp); svg.appendChild(defs);
      const LW = document.createElementNS(NS, 'g'), LR = document.createElementNS(NS, 'g'); LR.setAttribute('clip-path', 'url(#' + id + ')'); svg.appendChild(LW); svg.appendChild(LR);
      fmEl.appendChild(svg);
      const letters = [], icon = [];
      ps.forEach(p => {
        const gw = document.createElementNS(NS, 'g'), gr = document.createElementNS(NS, 'g');
        const pw = document.importNode(p, true), pr = document.importNode(p, true); pw.setAttribute('fill', '#E9EBEF'); pr.setAttribute('fill', '#FA001E');
        gw.appendChild(pw); gr.appendChild(pr); LW.appendChild(gw); LR.appendChild(gr);
        const b = gw.getBBox(); if (b.x + b.width >= 40) letters.push({ gw, gr, b }); else icon.push(gw, gr);
      });
      icon.forEach(g => { g.style.transformBox = 'view-box'; g.style.transformOrigin = '17px 17px'; });
      letters.sort((a, b) => a.b.x - b.b.x);
      letters.forEach(it => [it.gw, it.gr].forEach(g => { g.style.transform = `translate(${3 - it.b.x}px,0)`; g.style.opacity = '0'; }));
      fm = { rc, letters, icon, w: 0, maxX: letters.length ? Math.max(...letters.map((it) => it.b.x + it.b.width)) : 176 };
      if (fmOn) playFM(true);
    };
    const tweenW = (to, dur, delay) => {
      const from = fm.w, t0 = performance.now() + delay; cancelAnimationFrame(fmRaf);
      const st = now => { const k = Math.max(0, Math.min(1, (now - t0) / dur)), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; fm.w = from + (to - from) * e; fm.rc.setAttribute('width', fm.w.toFixed(2)); if (k < 1) fmRaf = requestAnimationFrame(st); };
      fmRaf = requestAnimationFrame(st);
    };
    const playFM = on => {
      if (!fm) return; fmT.forEach(clearTimeout); fmT = []; const n = fm.letters.length;
      if (on) {
        fm.icon.forEach(g => { g.style.transition = 'none'; g.style.transform = 'none'; g.style.opacity = '1'; });
        tweenW(36, 560, 0);
        fmT.push(setTimeout(() => {
          fm.icon.forEach(g => { g.style.transition = `transform .5s ${EZ}, opacity .35s ease .1s`; g.style.transform = 'scale(.55)'; g.style.opacity = '0'; });
          tweenW((fm.maxX || 176) + 2, 1100, 120);
        }, 600));
        fm.letters.forEach((it, i) => { const d = 640 + i * 70; [it.gw, it.gr].forEach(g => { g.style.transition = `transform .8s ${EZ} ${d}ms, opacity .25s ${d}ms`; g.style.transform = 'translate(-48px,0)'; g.style.opacity = '1'; }); });
      } else {
        fm.letters.forEach((it, i) => { const d = (n - 1 - i) * 40; [it.gw, it.gr].forEach(g => { g.style.transition = `transform .55s ${EZ} ${d}ms, opacity .2s ${d + 340}ms`; g.style.transform = `translate(${3 - it.b.x}px,0)`; g.style.opacity = '0'; }); });
        fm.icon.forEach(g => { g.style.transition = `transform .45s ${EZ} .35s, opacity .3s .35s`; g.style.transform = 'none'; g.style.opacity = '1'; });
        tweenW(0, 500, 650);
      }
    };
    if (logoA || fmEl) fetch('/src/logo-white.svg').then(r => { if (!r.ok) throw 0; return r.text(); }).then(t => { buildFM(t); if (!logoA) throw 0; return t; }).then(t => {
      const NS = 'http://www.w3.org/2000/svg', ps = [...new DOMParser().parseFromString(t, 'image/svg+xml').querySelectorAll('path')];
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 219 34'); svg.setAttribute('width', (219 * 26 / 34).toFixed(2)); svg.setAttribute('height', '26');
      svg.style.cssText = 'position:absolute;top:0;left:-28px;overflow:visible';
      logoA.appendChild(svg);
      const icon = document.createElementNS(NS, 'g'); icon.style.cssText = 'transform-box:view-box;transform-origin:17px 17px;opacity:0;transform:scale(.82)'; svg.appendChild(icon);
      const letters = [];
      ps.forEach(p => { const g = document.createElementNS(NS, 'g'); g.appendChild(document.importNode(p, true)); svg.appendChild(g); const b = g.getBBox(); if (b.x + b.width < 40) icon.appendChild(g.firstChild), g.remove(); else letters.push({ g, b }); });
      letters.sort((a, b) => a.b.x - b.b.x);
      letters.forEach(it => { it.g.style.transform = 'translate(-48px,0)'; });
      logoA.querySelectorAll('img').forEach(i => i.remove());
      const per = document.createElementNS(NS, 'path'); per.setAttribute('d', 'M3 31H31V3H3V31'); per.setAttribute('fill', 'none'); per.setAttribute('stroke', '#FA001E'); per.setAttribute('stroke-width', '1.4'); per.setAttribute('stroke-linecap', 'square');
      per.style.strokeDasharray = '112'; per.style.strokeDashoffset = '112'; svg.appendChild(per);
      lg = { icon, letters, per }; requestAnimationFrame(() => applyLogo(intro));
    }).catch(() => {});
    let nodes = [], invs = [], y0 = 0, y1 = 0, raf = 0, disp = 0;
    const setC = c => {
      if (c === intro || !hdr) return; intro = c; clearTimeout(iT);
      hdr.style.background = c ? 'rgba(15,15,15,.62)' : 'rgba(15,15,15,0)';
      hdr.style.backdropFilter = hdr.style.webkitBackdropFilter = c ? 'blur(18px) saturate(1.4)' : 'blur(0px)';
      applyLogo(c);
      conn.style.transitionDelay = c ? '1.82s' : '0s'; conn.style.transform = c ? 'scaleY(1)' : 'scaleY(0)';
      wrap.style.transitionDelay = c ? '2.05s' : '0s'; wrap.style.opacity = c ? '1' : '0';
      live = false; if (c) { disp = 0; iT = setTimeout(() => { live = true; req(); }, 2050); } else req();
    };
    const onHdr = () => setC(scrollY > 40);
    window.addEventListener('scroll', onHdr, { passive: true }); onHdr();
    const off = e => { let t = 0, l = 0; while (e && e !== root) { t += e.offsetTop; l += e.offsetLeft; e = e.offsetParent; } return { t, l }; };
    let pT = [], pDone = false;
    const pRow = root.querySelector('[data-tl="x"]'), pCards = pRow ? [...pRow.querySelectorAll('[data-pcard]')] : [];
    pCards.forEach(c => { c.dataset.tr = c.style.transition; c.removeAttribute('data-reveal'); c.classList.remove('in'); c.style.transition = 'opacity .6s, transform .75s cubic-bezier(.2,.7,.2,1)'; c.style.opacity = '0'; c.style.transform = 'translateY(48px)'; });
    const proc = (row, on) => {
      if (!on || pDone) return; pDone = true;
      pT.forEach(clearTimeout); pT = [];
      const bars = [...row.querySelectorAll('[data-pbar]')], labs = [...row.querySelectorAll('[data-plab]')], icon = row.querySelector('[data-picon]');
      const ret = row.querySelector('[data-pret]'), arw = row.querySelector('[data-parrow]'), bar2 = row.querySelector('[data-pbar2]');
      const cards = pCards;
      const act = c => { if (!c) return; c.style.opacity = '1'; c.style.transform = ''; setTimeout(() => { c.style.transition = c.dataset.tr; }, 800); };
      const at = (ms, fn) => pT.push(setTimeout(fn, ms));
      const bar = (i, d) => { bars[i].style.transition = `transform ${d}ms linear`; bars[i].style.transform = 'scaleX(1)'; labs[i].style.opacity = '1'; };
      const sweep = (el, d) => { el.style.transition = `transform ${d}ms cubic-bezier(.4,0,.2,1)`; el.style.transform = 'scaleX(1)'; };
      at(125, () => { bar(0, 750); act(cards[0]); }); at(500, () => act(cards[1]));
      at(900, () => { bar(1, 650); act(cards[2]); if (icon) icon.style.animationDuration = '.9s'; }); at(1225, () => act(cards[3]));
      at(1575, () => sweep(ret, 525)); at(2050, () => arw && (arw.style.opacity = '1'));
      at(2200, () => sweep(bar2, 650));
      at(2900, () => { bar(2, 475); act(cards[4]); if (icon) icon.style.animationDuration = '6s'; });
    };
    const layout = () => {
      X = gutterX();
      const rr = root.getBoundingClientRect(), lr = logo.getBoundingClientRect();
      if (hdr) {
        const sp = document.querySelector('[data-hsp]'); if (sp) sp.style.height = hdr.offsetHeight + 'px';
        const ir = logoA.getBoundingClientRect(), hb = hdr.getBoundingClientRect(), k = logoA.offsetHeight / 34;
        conn.style.top = Math.round(ir.top - hb.top + 31 * k) + 'px';
      }
      y0 = hdr ? hdr.offsetHeight : Math.round(lr.bottom - rr.top) - 1;
      stub.style.top = y0 + 'px'; stub.style.width = Math.max(0, Math.round(lr.left - rr.left) - X) + 'px';
      nodes.forEach(n => n.br.remove()); nodes = [];
      invs.forEach(z => z.d.remove()); invs = [];
      root.querySelectorAll('[data-tl-inv]').forEach(e => { const o = off(e); invs.push({ t: o.t, h: e.offsetHeight, d: mk(`left:${X}px;top:${o.t}px;width:1px;height:0;background:#0F0F0F`) }); });
      root.querySelectorAll('[data-tl]').forEach(l => {
        const o = off(l), v = l.dataset.tl === 'v', h = l.offsetHeight, lb = l.getBoundingClientRect();
        const sq = [...l.children].find(c => c.tagName === 'SPAN' && /background:\s*(#FA001E|rgb\(250, 0, 30\))/i.test(c.getAttribute('style') || '')), sr = sq ? sq.getBoundingClientRect() : lb;
        const x = l.dataset.tl === 'x';
        const y = x ? o.t - 1 : Math.round(o.t + (sr.top - lb.top) + sr.height / 2), sx = x ? o.l : Math.round(o.l + (sr.left - lb.left));
        const br = mk(`${x ? 'display:none;' : ''}left:${X + 1}px;top:${y}px;height:${x ? 2 : 1}px;width:${Math.max(0, sx - X - 1)}px;background:${x || l.closest('[data-tl-inv]') ? '#0F0F0F' : RED};transform:scaleX(0);transform-origin:left;transition:transform .45s cubic-bezier(.7,0,.2,1)`);
        nodes.push({ l, v, x, p: l.dataset.tl === 'p' || x, t: o.t, y, h, br, on: false, last: -1 });
      });
      y1 = Math.round(rr.height - 60);
      if (fmEl) {
        fmEl.style.marginLeft = '0px'; fmEl.style.width = '100%';
        const o0 = off(fmEl), s = (o0.l + fmEl.offsetWidth - X) / 165;
        fmEl.style.width = (219 * s) + 'px'; fmEl.style.maxWidth = 'none';
        fmEl.style.marginLeft = (X - o0.l - 3 * s) + 'px';
        const o = off(fmEl); fmY = Math.round(o.t + 3 * s); y1 = fmY;
      }
      track.style.left = X + 'px'; fill.style.left = X + 'px'; stub.style.left = X + 'px'; head.style.left = (X - 3) + 'px';
      track.style.top = y0 + 'px'; track.style.height = (y1 - y0) + 'px'; fill.style.top = y0 + 'px';
      upd();
    };
    const upd = () => {
      raf = 0; const rr = root.getBoundingClientRect();
      const rem = rr.bottom - innerHeight, lead = innerHeight * (.6 + .36 * Math.max(0, Math.min(1, 1 - rem / (innerHeight * .5))));
      const tgt = live ? Math.max(0, Math.min(y1, lead - rr.top) - y0) : 0;
      disp += (tgt - disp) * (disp < 200 && tgt > disp ? .07 : .12); if (Math.abs(tgt - disp) < .5) disp = tgt;
      const fy = y0 + disp;
      fill.style.height = disp + 'px'; head.style.top = (fy - 3) + 'px';
      let inZ = false;
      invs.forEach(z => { const hh = Math.max(0, Math.min(z.h, fy - z.t)); z.d.style.height = hh + 'px'; if (fy > z.t && fy < z.t + z.h) inZ = true; });
      head.style.background = inZ ? '#0F0F0F' : RED;
      nodes.forEach(n => {
        const on = fy >= n.y;
        if (on !== n.on) { n.on = on; n.br.style.transform = on ? 'scaleX(1)' : 'scaleX(0)'; if (n.x) proc(n.l, on); if (!n.v && !n.p) n.l.style.clipPath = on ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)'; }
        if (n.v) { const fr = Math.max(0, Math.min(1, (fy - n.t) / n.h)); if (fr !== n.last) { n.last = fr; n.l.style.clipPath = `inset(${((1 - fr) * 100).toFixed(2)}% 0 0 0)`; } }
      });
      if (fmEl && fmY > 0) {
        const on = fy >= fmY - 1;
        if (on !== fmOn) { fmOn = on; if (fmBr) fmBr.style.transform = on ? 'scaleX(1)' : 'scaleX(0)'; fmT.forEach(clearTimeout); fmT = []; if (on) fmT.push(setTimeout(() => playFM(true), 380)); else playFM(false); }
        head.style.opacity = on ? '0' : '1';
      }
      if (disp !== tgt) req();
    };
    const req = () => { if (!raf) raf = requestAnimationFrame(upd); };
    
    window.addEventListener('scroll', req, { passive: true }); window.addEventListener('resize', () => layout());
    layout(); setTimeout(layout, 1200); if (document.fonts) document.fonts.ready.then(layout);
    [...root.querySelectorAll('img')].forEach(im => { if (!im.complete) im.addEventListener('load', () => layout(), { once: true }); });
}
