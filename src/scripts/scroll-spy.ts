/**
 * Shared scroll-spy: highlights active nav link and animates a floating dot
 * between links in both side-nav and mobile-nav.
 */

const DOT_RADIUS = 2.5; // half of the 5px dot defined in global.css
const BOTTOM_THRESHOLD = 50; // px from bottom to snap to last section
const SECTION_TOP_OFFSET = 120; // px from viewport top to consider "entered"

export function initScrollSpy() {
  const sideNavInner = document.querySelector('.side-nav__inner');
  const mobileNav = document.querySelector('.mobile-nav');
  const allNavLinks = document.querySelectorAll<HTMLAnchorElement>(
    '.side-nav__link, .mobile-nav__link'
  );

  if (allNavLinks.length === 0) return;

  const linkIdMap = new Map<Element, string>();
  const uniqueIds: string[] = [];
  allNavLinks.forEach((link) => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) {
      linkIdMap.set(link, id);
      if (!uniqueIds.includes(id)) uniqueIds.push(id);
    }
  });

  const sections = uniqueIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  let sideDot: HTMLElement | null = null;
  let mobileDot: HTMLElement | null = null;

  if (sideNavInner) {
    sideDot = document.createElement('span');
    sideDot.className = 'nav-dot';
    sideNavInner.appendChild(sideDot);
  }
  if (mobileNav) {
    mobileDot = document.createElement('span');
    mobileDot.className = 'nav-dot';
    mobileNav.appendChild(mobileDot);
  }

  function positionDot(dot: HTMLElement, activeLink: HTMLAnchorElement, container: Element) {
    const linkRect = activeLink.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (container.classList.contains('side-nav__inner')) {
      dot.style.top = (linkRect.top - containerRect.top + linkRect.height / 2 - DOT_RADIUS) + 'px';
      dot.style.left = '';
      dot.style.right = '-12px';
    } else {
      dot.style.top = '';
      dot.style.bottom = '4px';
      dot.style.left = (linkRect.left - containerRect.left + linkRect.width / 2 - DOT_RADIUS) + 'px';
    }
  }

  const activeMap = new Map<string, boolean>();
  sections.forEach((section) => activeMap.set(section.id, false));

  const lastId = uniqueIds[uniqueIds.length - 1];
  const isAtBottom = () =>
    window.innerHeight + window.scrollY >= document.body.scrollHeight - BOTTOM_THRESHOLD;

  let lastCurrentId: string | null = null;

  function updateActiveNav() {
    let currentId = 'top';

    if (isAtBottom() && lastId) {
      currentId = lastId;
    } else {
      for (const section of sections) {
        if (activeMap.get(section.id)) {
          currentId = section.id;
        }
      }
    }

    if (currentId === lastCurrentId) return;
    lastCurrentId = currentId;

    allNavLinks.forEach((link) => {
      link.classList.toggle('is-active', linkIdMap.get(link) === currentId);
    });

    if (sideDot && sideNavInner) {
      const activeLink = sideNavInner.querySelector<HTMLAnchorElement>('.side-nav__link.is-active');
      if (activeLink) positionDot(sideDot, activeLink, sideNavInner);
    }

    if (mobileDot && mobileNav) {
      const activeLink = mobileNav.querySelector<HTMLAnchorElement>('.mobile-nav__link.is-active');
      if (activeLink) positionDot(mobileDot, activeLink, mobileNav);
    }
  }

  function repositionDots() {
    if (sideDot && sideNavInner) {
      const activeLink = sideNavInner.querySelector<HTMLAnchorElement>('.side-nav__link.is-active');
      if (activeLink) positionDot(sideDot, activeLink, sideNavInner);
    }
    if (mobileDot && mobileNav) {
      const activeLink = mobileNav.querySelector<HTMLAnchorElement>('.mobile-nav__link.is-active');
      if (activeLink) positionDot(mobileDot, activeLink, mobileNav);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        activeMap.set(entry.target.id, entry.isIntersecting);
      });
      updateActiveNav();
    },
    {
      rootMargin: `-${SECTION_TOP_OFFSET}px 0px -80% 0px`,
      threshold: 0,
    }
  );

  sections.forEach((section) => observer.observe(section));

  let wasAtBottom = false;
  window.addEventListener(
    'scroll',
    () => {
      const atBottom = isAtBottom();
      if (atBottom !== wasAtBottom) {
        wasAtBottom = atBottom;
        updateActiveNav();
      }
    },
    { passive: true }
  );

  let resizePending = false;
  window.addEventListener(
    'resize',
    () => {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(() => {
        resizePending = false;
        repositionDots();
      });
    },
    { passive: true }
  );

  updateActiveNav();
}
