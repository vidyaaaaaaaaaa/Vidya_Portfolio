import Lenis from 'lenis';

const TOTAL_FRAMES = 300;
const frames = [];
let loadedCount = 0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderText = document.getElementById('loader-text');

let targetFrameIndex = 0;
let currentFrameIndex = 0;
let lastDrawnFrameIndex = -1;

function getFramePath(index) {
  const frameNum = String(index + 1).padStart(3, '0');
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}frames/ezgif-frame-${frameNum}.jpg`;
}

function resizeCanvas() {
  const dpr = Math.max(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  
  lastDrawnFrameIndex = -1;
  renderFrame(currentFrameIndex);
}

window.addEventListener('resize', resizeCanvas);

// Initialize Lenis smooth scroll engine
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 2,
});

lenis.on('scroll', (e) => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;
  const progress = Math.max(0, Math.min(1, e.scroll / maxScroll));
  targetFrameIndex = progress * (TOTAL_FRAMES - 1);
  setActiveLink();
});

function updateTargetFrameFromWindow() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return;
  const scrollFraction = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  targetFrameIndex = scrollFraction * (TOTAL_FRAMES - 1);
  setActiveLink();
}

window.addEventListener('scroll', updateTargetFrameFromWindow, { passive: true });

function preloadFrames() {
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    
    img.onload = () => {
      loadedCount++;
      const progress = Math.floor((loadedCount / TOTAL_FRAMES) * 100);
      if (loaderBar) loaderBar.style.width = `${progress}%`;
      if (loaderText) loaderText.textContent = `Loading ${progress}%`;

      if (i === 0) {
        resizeCanvas();
        renderFrame(0);
      }

      if (loadedCount >= TOTAL_FRAMES) {
        hideLoader();
      }
    };

    img.onerror = () => {
      loadedCount++;
      if (loadedCount >= TOTAL_FRAMES) {
        hideLoader();
      }
    };

    frames.push(img);
  }

  setTimeout(() => {
    hideLoader();
  }, 2500);
}

function hideLoader() {
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
  }
}

// Render seamless dark cinematic studio hero background (Full-width subject integration, deep red/magenta rim lighting, zero box boundaries)
function renderFrame(index) {
  const intIndex = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(index)));
  
  if (intIndex === lastDrawnFrameIndex) return;

  const img = frames[intIndex];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  lastDrawnFrameIndex = intIndex;
  const cw = canvas.width;
  const ch = canvas.height;

  // Maximum Quality Settings
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. PURE NEAR-BLACK STUDIO BACKGROUND BASE (Zero blue/cyan/teal/cool haze)
  ctx.fillStyle = '#020103';
  ctx.fillRect(0, 0, cw, ch);

  // 2. SOFT DEEP RED & MAGENTA STUDIO GLOW (Fading smoothly into black behind subject)
  const glowX = cw * 0.5;
  const glowY = ch * 0.40;
  const glowRadius = Math.max(cw, ch) * 0.48;

  const radialGlow = ctx.createRadialGradient(glowX, glowY, 30, glowX, glowY, glowRadius);
  radialGlow.addColorStop(0, 'rgba(120, 10, 32, 0.42)');
  radialGlow.addColorStop(0.40, 'rgba(38, 4, 12, 0.24)');
  radialGlow.addColorStop(1, 'rgba(2, 1, 3, 0)');
  
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, cw, ch);

  // 3. SUBJECT SIZING & POSITIONING (Reference Hero Alignment: face & hair top, cropped mid-hand)
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = cw / ch;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (canvasRatio > imgRatio) {
    drawHeight = ch * 1.16;
    drawWidth = drawHeight * imgRatio;
    offsetX = (cw - drawWidth) / 2;
    offsetY = -(drawHeight * 0.13);
  } else {
    drawWidth = cw;
    drawHeight = cw / imgRatio;
    offsetX = 0;
    offsetY = (ch - drawHeight) / 2;
  }

  // 4. DRAW UNCHANGED SUBJECT WITH DRAMATIC CINEMATIC CONTRAST & SHARP DETAILS
  ctx.save();
  ctx.filter = 'contrast(1.16) saturate(1.08) brightness(0.95)';
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  // 5. SEAMLESS FULL-WIDTH INTEGRATION (Eliminate all rectangular photo boundaries & box edges)
  const fadeLeftW = drawWidth * 0.32;
  const fadeRightW = drawWidth * 0.32;
  
  // Left edge soft alpha blend
  const maskLeft = ctx.createLinearGradient(offsetX - 2, 0, offsetX + fadeLeftW, 0);
  maskLeft.addColorStop(0, 'rgba(0, 0, 0, 1)');
  maskLeft.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
  maskLeft.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = maskLeft;
  ctx.fillRect(offsetX - 5, offsetY - 5, fadeLeftW + 5, drawHeight + 10);

  // Right edge soft alpha blend
  const maskRight = ctx.createLinearGradient(offsetX + drawWidth - fadeRightW, 0, offsetX + drawWidth + 2, 0);
  maskRight.addColorStop(0, 'rgba(0, 0, 0, 0)');
  maskRight.addColorStop(0.3, 'rgba(0, 0, 0, 0.3)');
  maskRight.addColorStop(1, 'rgba(0, 0, 0, 1)');
  ctx.fillStyle = maskRight;
  ctx.fillRect(offsetX + drawWidth - fadeRightW, offsetY - 5, fadeRightW + 10, drawHeight + 10);

  ctx.restore();

  // 6. DEEP RED & MAGENTA RIM LIGHTING FROM SIDES
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  
  // Right rim highlight
  const rightRim = ctx.createLinearGradient(cw * 0.45, 0, cw, 0);
  rightRim.addColorStop(0, 'rgba(0, 0, 0, 0)');
  rightRim.addColorStop(0.85, 'rgba(130, 12, 30, 0.16)');
  rightRim.addColorStop(1, 'rgba(175, 18, 42, 0.30)');
  ctx.fillStyle = rightRim;
  ctx.fillRect(0, 0, cw, ch);

  // Left subtle rim accent
  const leftRim = ctx.createLinearGradient(0, 0, cw * 0.35, 0);
  leftRim.addColorStop(0, 'rgba(110, 10, 25, 0.18)');
  leftRim.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = leftRim;
  ctx.fillRect(0, 0, cw, ch);

  ctx.restore();
}

function animationLoop(time) {
  lenis.raf(time);

  const lerpFactor = 0.12;
  const diff = targetFrameIndex - currentFrameIndex;

  if (Math.abs(diff) > 0.001) {
    currentFrameIndex += diff * lerpFactor;
  } else {
    currentFrameIndex = targetFrameIndex;
  }

  renderFrame(currentFrameIndex);
  requestAnimationFrame(animationLoop);
}

// PORTFOLIO INTERACTIVITY
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const sections = document.querySelectorAll('main section[id]');
const navItems = document.querySelectorAll('[data-nav]');

function setActiveLink() {
  let current = '';
  const scrollPos = window.scrollY + window.innerHeight * 0.3;

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop) {
      current = section.id;
    }
  });

  navItems.forEach(link => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll(
  '.section__head, .about__copy, .skill-card, .cert-card, .hobbies__copy, .project-card, .contact__inner'
);
revealTargets.forEach(el => el.classList.add('reveal'));

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => observer.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}

preloadFrames();
requestAnimationFrame(animationLoop);
