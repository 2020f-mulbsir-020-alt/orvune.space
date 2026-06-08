/**
 * Orvune — Main journey interactions & animations
 */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Compass Navigation ---- */
  const compassTrigger = document.getElementById('compass-trigger');
  const transitMap = document.getElementById('transit-map');

  if (compassTrigger && transitMap) {
    compassTrigger.addEventListener('click', () => {
      const isOpen = transitMap.classList.toggle('open');
      compassTrigger.setAttribute('aria-expanded', String(isOpen));
      transitMap.setAttribute('aria-hidden', String(!isOpen));
    });

    document.addEventListener('click', (e) => {
      if (!compassTrigger.contains(e.target) && !transitMap.contains(e.target)) {
        transitMap.classList.remove('open');
        compassTrigger.setAttribute('aria-expanded', 'false');
        transitMap.setAttribute('aria-hidden', 'true');
      }
    });

    transitMap.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        transitMap.classList.remove('open');
        compassTrigger.setAttribute('aria-expanded', 'false');
        transitMap.setAttribute('aria-hidden', 'true');
      });
    });
  }

  /* ---- Scroll Reveal ---- */
  const revealElements = document.querySelectorAll('.reveal');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  /* ---- Railway Map Route Animation ---- */
  const routeTracks = document.querySelectorAll('.route-track');
  const routeButtons = document.querySelectorAll('.route-btn');

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const mapObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            routeTracks.forEach((track, i) => {
              setTimeout(() => track.classList.add('animated'), i * 400);
            });
            mapObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    const mapSection = document.querySelector('.railway-map-container');
    if (mapSection) mapObserver.observe(mapSection);
  } else {
    routeTracks.forEach((track) => track.classList.add('animated'));
  }

  routeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.route-card');
      const routeId = card?.dataset.route;

      routeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      routeTracks.forEach((track) => {
        track.classList.toggle('active', track.dataset.route === routeId);
      });
    });
  });

  /* ---- Comet Info Reveal ---- */
  const comets = document.querySelectorAll('.comet');
  const cometInfo = document.getElementById('comet-info');

  if (comets.length && cometInfo) {
    const infoText = cometInfo.querySelector('.comet-info-text');

    comets.forEach((comet) => {
      comet.addEventListener('animationiteration', () => {
        const info = comet.dataset.info;
        if (info && infoText) {
          infoText.style.opacity = '0';
          setTimeout(() => {
            infoText.textContent = info;
            infoText.style.opacity = '1';
          }, 300);
        }
      });
    });
  }

  /* ---- Observatory Dimension Routes ---- */
  const altRoutes = document.querySelectorAll('.alt-route');
  const dimensionReadout = document.getElementById('dimension-readout');

  const dimensionData = {
    alpha: 'Scanning Dimension Alpha… Mirror cosmos detected. Reflected starlines converge at coordinates unknown.',
    beta: 'Dimension Beta engaged. Inverted spiral confirmed. Gravity flows outward from the void center.',
    gamma: 'Dimension Gamma accessed. The Silent Expanse — no signals return. Proceed with wonder.'
  };

  altRoutes.forEach((btn) => {
    btn.addEventListener('click', () => {
      altRoutes.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const dim = btn.dataset.dimension;
      if (dimensionReadout && dimensionData[dim]) {
        dimensionReadout.textContent = dimensionData[dim];
      }
    });
  });

  /* ---- Board Button Constellation Effect ---- */
  const boardBtn = document.getElementById('board-btn');
  const constellationCanvas = document.getElementById('constellation-canvas');

  if (boardBtn && constellationCanvas) {
    const ctx = constellationCanvas.getContext('2d');
    let constellationActive = false;
    let animFrame = null;

    function resizeConstellationCanvas() {
      const section = boardBtn.closest('.final-platform');
      if (!section) return;
      constellationCanvas.width = section.offsetWidth;
      constellationCanvas.height = section.offsetHeight;
    }

    function drawConstellations() {
      if (!ctx || !constellationActive) return;

      const w = constellationCanvas.width;
      const h = constellationCanvas.height;
      ctx.clearRect(0, 0, w, h);

      const time = Date.now() * 0.001;
      const starCount = 12;
      const stars = [];

      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2 + time * 0.2;
        const radius = Math.min(w, h) * 0.35;
        stars.push({
          x: w / 2 + Math.cos(angle) * radius,
          y: h / 2 + Math.sin(angle) * radius * 0.6
        });
      }

      ctx.strokeStyle = 'rgba(246, 185, 77, 0.4)';
      ctx.lineWidth = 1;

      for (let i = 0; i < stars.length; i++) {
        const next = (i + 1) % stars.length;
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[next].x, stars[next].y);
        ctx.stroke();
      }

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(246, 185, 77, 0.8)';
        ctx.fill();
      });

      animFrame = requestAnimationFrame(drawConstellations);
    }

    boardBtn.addEventListener('mouseenter', () => {
      if (prefersReducedMotion) return;
      resizeConstellationCanvas();
      constellationActive = true;
      constellationCanvas.classList.add('active');
      drawConstellations();
    });

    boardBtn.addEventListener('mouseleave', () => {
      constellationActive = false;
      constellationCanvas.classList.remove('active');
      if (animFrame) cancelAnimationFrame(animFrame);
      if (ctx) ctx.clearRect(0, 0, constellationCanvas.width, constellationCanvas.height);
    });

    window.addEventListener('resize', resizeConstellationCanvas);
  }

  /* ---- Section Parallax for Floating Elements ---- */
  if (!prefersReducedMotion) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          document.querySelectorAll('.floating-platform').forEach((platform, i) => {
            const speed = 0.03 + i * 0.01;
            platform.style.transform = `translateY(${scrollY * speed * -0.1}px)`;
          });

          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---- Train Departure on Scroll from Terminus ---- */
  const terminusTrain = document.querySelector('.terminus .cosmic-train');
  const terminusSection = document.getElementById('terminus');

  if (terminusTrain && terminusSection && !prefersReducedMotion) {
    window.addEventListener('scroll', () => {
      const rect = terminusSection.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
      terminusTrain.style.transform = `translateX(calc(-50% + ${progress * 200}px))`;
      terminusTrain.style.opacity = String(1 - progress * 0.5);
    }, { passive: true });
  }

  /* ---- Smooth section transitions via CSS custom property ---- */
  document.querySelectorAll('.station').forEach((section, index) => {
    section.style.setProperty('--section-index', index);
  });

})();
