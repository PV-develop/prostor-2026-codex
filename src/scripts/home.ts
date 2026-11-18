import { initParticles } from './particles';
import { initLogos } from './logos';

const actionSelector = '[data-action-click]';

function setMenuOpen(open: boolean): void {
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const trigger = document.querySelector<HTMLElement>('[data-mbtn]');
  if (!menu) return;

  if (open && trigger) {
    // The menu background grows out of the «Меню» button as an expanding
    // rectangle: its box is clipped to the button rect and opens up to the
    // full screen, sweeping down and to the left. Offsets are inset() edges
    // relative to the menu box.
    const b = trigger.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    menu.style.setProperty('--mt', `${(b.top - m.top).toFixed(1)}px`);
    menu.style.setProperty('--mrt', `${(m.right - b.right).toFixed(1)}px`);
    menu.style.setProperty('--mbt', `${(m.bottom - b.bottom).toFixed(1)}px`);
    menu.style.setProperty('--mlt', `${(b.left - m.left).toFixed(1)}px`);
  }

  menu.dataset.open = String(open);
  trigger?.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}

const menuGroups = [...document.querySelectorAll<HTMLDetailsElement>('[data-msnav] details')];
const syncMenuGroups = () => {
  const desktop = window.innerWidth > 768;
  menuGroups.forEach((group) => {
    group.open = desktop;
    const heading = group.querySelector<HTMLElement>('summary');
    if (!heading) return;
    heading.tabIndex = desktop ? -1 : 0;
    heading.setAttribute('aria-disabled', String(desktop));
  });
};
syncMenuGroups();
window.addEventListener('resize', syncMenuGroups);

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element) || window.innerWidth <= 768) return;
  const heading = target.closest<HTMLElement>('[data-msnav] details > summary');
  if (!heading) return;
  event.preventDefault();
  const group = heading.parentElement;
  if (group instanceof HTMLDetailsElement) group.open = true;
}, true);

function setFieldState(field: HTMLElement, active: boolean): void {
  const key = field.dataset.fieldGroup;
  if (!key) return;
  const input = field.querySelector<HTMLInputElement | HTMLTextAreaElement>('[data-field-input]');
  const label = field.querySelector<HTMLElement>('[data-field-label]');
  if (!input || !label) return;

  const floating = active || input.value.length > 0;
  label.style.top = floating ? '10px' : '20px';
  label.style.fontSize = floating ? '11px' : '16px';
  const phone = input instanceof HTMLInputElement && input.type === 'tel';
  if (phone) input.placeholder = active ? '+7 (___) ___-__-__' : '';
}

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const action = target.closest<HTMLElement>(actionSelector);
  if (action?.dataset.actionClick === 'toggleMenu') {
    event.preventDefault();
    setMenuOpen(document.querySelector('[data-menu]')?.getAttribute('data-open') !== 'true');
  } else if (action?.dataset.actionClick === 'closeMenu') {
    event.preventDefault();
    setMenuOpen(false);
  } else if (action?.dataset.actionClick === 'toTop') {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const menuLink = target.closest<HTMLAnchorElement>('[data-menu] a[href^="#"]');
  if (menuLink) {
    event.preventDefault();
    const id = menuLink.getAttribute('href');
    setMenuOpen(false);
    if (id && id.length > 1) document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  } else if (menu?.dataset.open === 'true' && !target.closest('[data-menu]') && !target.closest('[data-mbtn]')) {
    setMenuOpen(false);
  }
});

document.addEventListener('keydown', (event) => {
  const target = event.target;
  if (window.innerWidth > 768 && target instanceof Element && target.matches('[data-msnav] details > summary')) {
    event.preventDefault();
  }
  if (event.key === 'Escape') setMenuOpen(false);
});

document.addEventListener('focusin', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLElement) || !input.matches('[data-field-input]')) return;
  const group = input.closest<HTMLElement>('[data-field-group]');
  if (group) setFieldState(group, true);
});

document.addEventListener('input', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLElement) || !input.matches('[data-field-input]')) return;
  const group = input.closest<HTMLElement>('[data-field-group]');
  if (group) setFieldState(group, document.activeElement === input);
});

document.addEventListener('focusout', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLElement) || !input.matches('[data-field-input]')) return;
  const group = input.closest<HTMLElement>('[data-field-group]');
  if (group) setFieldState(group, false);
});

document.addEventListener('change', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || input.type !== 'file') return;
  const label = input.parentElement?.querySelector<HTMLElement>('span');
  if (label && input.files?.[0]) label.textContent = input.files[0].name;
});

document.addEventListener('submit', (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  const buttonLabel = form.querySelector<HTMLElement>('button[type="submit"] span');
  if (buttonLabel) buttonLabel.textContent = 'Заявка отправлена';
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add('in');
    observer.unobserve(entry.target);
  }
}, { threshold: 0.1 });

document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
  if (element.getBoundingClientRect().top < window.innerHeight) element.classList.add('in');
  else revealObserver.observe(element);
});

const countObserver = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    observer.unobserve(entry.target);
    const element = entry.target as HTMLElement;
    const target = Number(element.dataset.count ?? 0);
    const start = performance.now();
    const duration = 1500;
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      element.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}, { threshold: 0.4 });

document.querySelectorAll<HTMLElement>('[data-count]').forEach((element) => countObserver.observe(element));

const header = document.querySelector<HTMLElement>('[data-hdr]');
const updateHeader = () => {
  if (!header) return;
  const scrolled = window.scrollY > 24;
  // Stuck chrome (in-page nav revealed, phone and «Меню» label folded away)
  // flips on the same 40px threshold where the wordmark collapses to the
  // red icon, so the header changes state in one move.
  header.dataset.stuck = String(window.scrollY > 40);
  // Scrolled bar tint follows the header theme: paper glass on light, ink
  // glass on the dark variant.
  const tint = header.dataset.hdrTheme === 'dark' ? '15,15,15' : '233,235,239';
  header.style.background = scrolled ? `rgba(${tint},.92)` : 'rgba(15,15,15,0)';
  header.style.backdropFilter = scrolled ? 'blur(14px)' : 'none';
  header.style.setProperty('-webkit-backdrop-filter', scrolled ? 'blur(14px)' : 'none');
};
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const processSection = document.querySelector<HTMLElement>('[data-screen-label^="04"]');
if (processSection) {
  const arrows: Array<{ element: HTMLElement; from: string; to: string; duration: number }> = [];
  processSection.querySelectorAll<HTMLElement>('[data-arw], [data-arw-a]').forEach((element) => {
    if (element.hasAttribute('data-arw')) {
      arrows.push({ element, from: 'inset(-6px 100% -6px 0)', to: 'inset(-6px -6px -6px 0)', duration: 420 });
    } else {
      arrows.push({ element, from: 'inset(-6px 100% -6px 0)', to: 'inset(-6px -6px -6px 0)', duration: 360 });
      const opposite = element.parentElement?.querySelector<HTMLElement>('[data-arw-b]');
      if (opposite) arrows.push({ element: opposite, from: 'inset(-6px 0 -6px 100%)', to: 'inset(-6px -6px -6px -6px)', duration: 360 });
    }
  });
  const finalArrow = processSection.querySelector<HTMLElement>('[data-arw-c]');
  if (finalArrow) arrows.push({ element: finalArrow, from: 'inset(-6px 0 -20px 100%)', to: 'inset(-6px -6px -20px -6px)', duration: 420 });

  arrows.forEach(({ element, from }) => { element.style.clipPath = from; });
  let arrowsStarted = false;
  const startArrows = () => {
    if (arrowsStarted) return;
    arrowsStarted = true;
    let delay = 650;
    for (const arrow of arrows) {
      arrow.element.style.transition = `clip-path ${arrow.duration}ms cubic-bezier(.6,0,.3,1) ${delay}ms`;
      requestAnimationFrame(() => { arrow.element.style.clipPath = arrow.to; });
      delay += arrow.duration + 60;
    }
  };
  if (arrows.length) {
    const arrowObserver = new IntersectionObserver((entries, observer) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      startArrows();
      observer.disconnect();
    }, { threshold: 0.2 });
    arrowObserver.observe(arrows[0].element.closest<HTMLElement>('[data-reveal]')?.parentElement ?? processSection);
  }
}

const chipPhotos: Record<string, string> = {
  'Недвижимости': '1560518883-ce09059eeffa',
  'Строительства': '1504307651254-35680f356dfd',
  'Девелопмента': '1486406146926-c627a92ad1ab',
  'Медицины': '1519494026892-80bbd2d6fd0d',
  'Интернет-магазинов': '1441986300917-64674bd600d8',
  'B2B': '1497366216548-37526070297c',
};

document.querySelectorAll<HTMLAnchorElement>('a').forEach((link) => {
  const photo = chipPhotos[link.textContent?.trim() ?? ''];
  if (!photo || link.querySelector('[data-chip-ph]')) return;
  link.style.position = 'relative';
  link.style.isolation = 'isolate';
  link.style.overflow = 'hidden';
  const layer = document.createElement('span');
  layer.dataset.chipPh = '';
  layer.style.cssText = `position:absolute;inset:-1px;z-index:-1;pointer-events:none;background:linear-gradient(rgba(15,15,15,.5),rgba(15,15,15,.5)),url(/src/chips/photo-${photo}.jpg) center/cover #0F0F0F;clip-path:inset(0 100% 0 0);transition:clip-path .5s cubic-bezier(.7,0,.2,1)`;
  link.append(layer);
  link.addEventListener('mouseenter', () => { layer.style.clipPath = 'inset(0 0 0 0)'; });
  link.addEventListener('mouseleave', () => { layer.style.clipPath = 'inset(0 100% 0 0)'; });
});

document.querySelectorAll<HTMLElement>('[data-gs]').forEach((overlay) => {
  const card = overlay.parentElement;
  card?.addEventListener('mouseenter', () => { overlay.style.clipPath = 'inset(0 0 100% 0)'; });
  card?.addEventListener('mouseleave', () => { overlay.style.clipPath = 'inset(0 0 0 0)'; });
});

document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((element) => {
  initParticles(element, element.dataset.particleShape ?? 'text');
});
initLogos();

  // Page-wide dot field (lucaslima.design spec): a fixed canvas between the
  // page background and the content. Stateless grid pinned to the document,
  // cursor repulsion, click attraction, one path per frame, rAF on events.
  (() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.createElement('canvas');
    canvas.className = 'st-dots';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    document.body.classList.add('has-dots');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = 50, Wn = W * 6, Gn = W * .25, Kn = Wn * 1.25, qn = W * .32;
    let vw = 0, vh = 0, raf = 0, lastDraw = 0;
    let mx = -1e4, my = -1e4, cx = 0, cy = 0;
    let tween = { from: 0, to: 0, start: 0, ms: 1, power: 3 };
    const smoothstep = (x: number) => x * x * (3 - 2 * x);
    const dValue = (now: number) => {
      const t = Math.min(1, (now - tween.start) / tween.ms);
      return tween.from + (tween.to - tween.from) * (1 - Math.pow(1 - t, tween.power));
    };
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      vw = innerWidth; vh = innerHeight;
      canvas.width = vw * dpr; canvas.height = vh * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      raf = 0; lastDraw = performance.now();
      const now = lastDraw;
      const d = dValue(now);
      ctx.clearRect(0, 0, vw, vh);
      ctx.fillStyle = 'rgb(50 50 50 / .35)';
      ctx.beginPath();
      for (let y = -(scrollY % W); y < vh + W; y += W) {
        for (let x = 0; x < vw + W; x += W) {
          let px = x, py = y;
          let dx = px - mx, dy = py - my, s = Math.hypot(dx, dy);
          if (s > 0 && s < Wn) { const k = smoothstep(1 - s / Wn) * Gn; px += dx / s * k; py += dy / s * k; }
          if (d > 0) {
            dx = px - cx; dy = py - cy; s = Math.hypot(dx, dy);
            if (s > 0 && s < Kn) { const k = smoothstep(1 - s / Kn) * qn * d; px -= dx / s * k; py -= dy / s * k; }
          }
          ctx.moveTo(px + 1, py);
          ctx.arc(px, py, 1, 0, 6.2832);
        }
      }
      ctx.fill();
      if (d !== tween.to) raf = requestAnimationFrame(draw);
    };
    const wake = () => {
      // frozen-rAF webviews: paint the event frame synchronously
      if (performance.now() - lastDraw > 200) { if (raf) cancelAnimationFrame(raf); draw(); return; }
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const startTween = (to: number, ms: number, power: number) => {
      const now = performance.now();
      tween = { from: dValue(now), to, start: now, ms: reduced ? 1 : ms, power };
      wake();
    };
    addEventListener('resize', () => { size(); wake(); }, { passive: true });
    addEventListener('scroll', wake, { passive: true });
    addEventListener('pointermove', (e: Event) => { const pe = e as PointerEvent; if (pe.pointerType !== 'mouse') return; mx = pe.clientX; my = pe.clientY; wake(); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { mx = -1e4; my = -1e4; wake(); });
    addEventListener('pointerdown', (e: Event) => { const pe = e as PointerEvent; if (pe.pointerType !== 'mouse') return; cx = pe.clientX; cy = pe.clientY; startTween(1, 250, 2); }, { passive: true });
    addEventListener('pointerup', () => startTween(0, 600, 3), { passive: true });
    size(); draw();
  })();
