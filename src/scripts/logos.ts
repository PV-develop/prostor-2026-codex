// @ts-nocheck
// Logo animations ported from the page scroll-line script in the Claude
// Design export: the header wordmark collapses into its red icon while the
// page is scrolled, and the footer mark assembles its letters once the page
// bottom enters the viewport. The scroll line itself is gone; both marks sit
// flush with the shared --gutter content column edge.
export function initLogos() {
    const hdr = document.querySelector('[data-hdr]'), logoA = hdr && hdr.querySelector('[data-logo]');
    const fmEl = document.querySelector('[data-fmark]');
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
    let fm = null, fmOn = false, fmRaf = 0, fmT = [];
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
    // The footer mark always stays paper-on-dark; the header wordmark follows
    // the header theme — black letters on the light bar, white on the dark one.
    const hdrLogo = hdr && hdr.dataset.hdrTheme === 'dark' ? '/src/logo-white.svg' : '/src/logo-black.svg';
    if (logoA || fmEl) fetch('/src/logo-white.svg').then(r => { if (!r.ok) throw 0; return r.text(); }).then(t => { buildFM(t); if (!logoA) throw 0; return fetch(hdrLogo).then(r => { if (!r.ok) throw 0; return r.text(); }); }).then(t => {
      const NS = 'http://www.w3.org/2000/svg', ps = [...new DOMParser().parseFromString(t, 'image/svg+xml').querySelectorAll('path')];
      const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 219 34'); svg.setAttribute('width', (219 * 26 / 34).toFixed(2)); svg.setAttribute('height', '26');
      svg.style.cssText = 'position:absolute;top:0;left:-2px;overflow:visible';
      logoA.appendChild(svg);
      const icon = document.createElementNS(NS, 'g'); icon.style.cssText = 'transform-box:view-box;transform-origin:17px 17px;opacity:0;transform:scale(.82)'; svg.appendChild(icon);
      const letters = [];
      ps.forEach(p => { const g = document.createElementNS(NS, 'g'); g.appendChild(document.importNode(p, true)); svg.appendChild(g); const b = g.getBBox(); if (b.x + b.width < 40) icon.appendChild(g.firstChild), g.remove(); else letters.push({ g, b }); });
      letters.sort((a, b) => a.b.x - b.b.x);
      letters.forEach(it => { it.g.style.transform = 'translate(-48px,0)'; });
      logoA.querySelectorAll('img').forEach(i => i.remove());
      const per = document.createElementNS(NS, 'path'); per.setAttribute('d', 'M3 31H31V3H3V31'); per.setAttribute('fill', 'none'); per.setAttribute('stroke', '#FA001E'); per.setAttribute('stroke-width', '1.4'); per.setAttribute('stroke-linecap', 'square');
      per.style.strokeDasharray = '112'; per.style.strokeDashoffset = '112'; svg.appendChild(per);
      lg = { icon, letters, per }; requestAnimationFrame(() => applyLogo(scrolled));
    }).catch(() => {});
    // The footer mark spans from the content-column left edge to past the
    // right screen edge, scaling with the page width; the drawn wordmark
    // starts at the shared --gutter container edge.
    const gutterX = () => Math.max(48, (innerWidth - 1600) / 2);
    const off = e => { let t = 0, l = 0; while (e && e !== document.body) { t += e.offsetTop; l += e.offsetLeft; e = e.offsetParent; } return { t, l }; };
    const layout = () => {
      const sp = document.querySelector('[data-hsp]'); if (sp && hdr) sp.style.height = hdr.offsetHeight + 'px';
      if (!fmEl) return;
      fmEl.style.marginLeft = '0px'; fmEl.style.width = '100%';
      const X = gutterX(), o0 = off(fmEl), s = (o0.l + fmEl.offsetWidth - X) / 165;
      fmEl.style.width = (219 * s) + 'px'; fmEl.style.maxWidth = 'none';
      fmEl.style.marginLeft = (X - o0.l - 3 * s) + 'px';
    };
    let scrolled = false;
    const checkFM = () => {
      if (!fmEl) return;
      const r = fmEl.getBoundingClientRect();
      const on = r.top < innerHeight * .92 && r.bottom > 0;
      if (on !== fmOn) { fmOn = on; fmT.forEach(clearTimeout); fmT = []; if (on) fmT.push(setTimeout(() => playFM(true), 380)); else playFM(false); }
    };
    const onScroll = () => {
      const c = scrollY > 40;
      if (c !== scrolled) { scrolled = c; applyLogo(c); }
      checkFM();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { layout(); checkFM(); });
    onScroll();
    layout(); setTimeout(layout, 1200); if (document.fonts) document.fonts.ready.then(layout);
    [...document.querySelectorAll('img')].forEach(im => { if (!im.complete) im.addEventListener('load', () => layout(), { once: true }); });
    checkFM();
}
