import { initParticles } from './particles';
import { initThread } from './thread';

const actionSelector = '[data-action-click]';

function setMenuOpen(open: boolean): void {
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const trigger = document.querySelector<HTMLElement>('[data-mbtn]');
  if (!menu) return;

  if (open && trigger) {
    // The menu background expands out of the «Меню» button as a growing
    // circle; anchor it at the button centre and cover the farthest corner.
    // Coordinates are relative to the menu box, which is centred and capped
    // at 1440px on wide screens.
    const b = trigger.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    const x = b.left + b.width / 2 - m.left;
    const y = b.top + b.height / 2 - m.top;
    menu.style.setProperty('--mx', `${x.toFixed(1)}px`);
    menu.style.setProperty('--my', `${y.toFixed(1)}px`);
    menu.style.setProperty('--mr', `${(Math.hypot(Math.max(x, m.width - x), Math.max(y, m.height - y)) + 40).toFixed(0)}px`);
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
const headerConnector = header?.querySelector<HTMLElement>('[data-hconn]');
const updateHeader = () => {
  if (!header) return;
  const scrolled = window.scrollY > 24;
  header.style.background = scrolled ? 'rgba(15,15,15,.92)' : 'rgba(15,15,15,0)';
  header.style.backdropFilter = scrolled ? 'blur(14px)' : 'none';
  header.style.setProperty('-webkit-backdrop-filter', scrolled ? 'blur(14px)' : 'none');
  if (headerConnector) headerConnector.style.transform = scrolled ? 'scaleY(1)' : 'scaleY(0)';
};
window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const threadObserver = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const element = entry.target as HTMLElement;
    element.style.transition = 'clip-path .6s cubic-bezier(.7,0,.2,1)';
    element.style.clipPath = element.dataset.tl === 'v' ? 'inset(-2px 0 -2px 0)' : 'inset(0 -2px 0 -2px)';
    observer.unobserve(element);
  }
}, { threshold: 0.15 });
document.querySelectorAll<HTMLElement>('[data-tl]').forEach((element) => threadObserver.observe(element));

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

const particleText = document.querySelector<HTMLElement>('[data-parallax]');
if (particleText) initParticles(particleText, particleText.dataset.particleShape ?? 'text');
initThread();
