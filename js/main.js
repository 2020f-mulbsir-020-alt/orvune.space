/**
 * Orvune — Main Journey Controller
 */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── Compass Transit Map ─── */
  const compassToggle = document.querySelector('.compass-toggle');
  const transitMap = document.getElementById('transit-map');

  if (compassToggle && transitMap) {
    compassToggle.addEventListener('click', () => {
      const isOpen = compassToggle.getAttribute('aria-expanded') === 'true';
      compassToggle.setAttribute('aria-expanded', String(!isOpen));
      transitMap.hidden = isOpen;
      transitMap.classList.toggle('is-open', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.compass-nav')) {
        compassToggle.setAttribute('aria-expanded', 'false');
        transitMap.hidden = true;
        transitMap.classList.remove('is-open');
      }
    });

    transitMap.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        compassToggle.setAttribute('aria-expanded', 'false');
        transitMap.hidden = true;
        transitMap.classList.remove('is-open');
      });
    });
  }

  /* ─── Section Visibility (Intersection Observer) ─── */
  const stations = document.querySelectorAll('.station');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
  );

  stations.forEach(station => sectionObserver.observe(station));

  /* ─── Journey Progress Track ─── */
  const progressTrack = document.querySelector('.journey-progress__track');
  const progressTrain = document.querySelector('.journey-progress__train');

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressTrack) progressTrack.style.height = progress + '%';
    if (progressTrain) progressTrain.style.top = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ─── Parallax Layers ─── */
  if (!prefersReduced) {
    const farLayer = document.querySelector('.parallax-layer--far');
    const nearLayer = document.querySelector('.parallax-layer--near');

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (farLayer) farLayer.style.transform = `translateY(${y * 0.05}px)`;
      if (nearLayer) nearLayer.style.transform = `translateY(${y * 0.12}px)`;
    }, { passive: true });
  }

  /* ─── Starline Route Selection ─── */
  const routeBtns = document.querySelectorAll('.route-btn');
  const routeTracks = document.querySelectorAll('.route-track[data-route]');
  const routeSelected = document.querySelector('.route-selected');

  const routeMessages = {
    nebula: 'The Nebula Express — through violet clouds where newborn stars whisper secrets to passing trains.',
    eclipse: 'The Eclipse Line — a shadow route that exists only in the umbra between twin suns.',
    moonbound: 'The Moonbound Circuit — looping forgotten lunar stations orbiting silent worlds.',
    aurora: 'The Aurora Track — riding ribbons of polar light across the frozen edge of space.',
    phantom: 'The Phantom Route — a line visible only to those who have already departed once before.'
  };

  routeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const route = btn.dataset.route;

      routeBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');

      routeTracks.forEach(track => {
        track.classList.toggle('is-active', track.dataset.route === route);
      });

      if (routeSelected) {
        routeSelected.hidden = false;
        routeSelected.textContent = routeMessages[route] || '';
      }
    });
  });

  /* ─── Comet Reveals (Desert Section) ─── */
  const cometReveals = document.querySelectorAll('.comet-reveal');
  let cometIndex = 0;

  const cometObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !prefersReduced) {
          startCometCycle();
          cometObserver.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const desertSection = document.getElementById('comet-desert');
  if (desertSection) cometObserver.observe(desertSection);

  function startCometCycle() {
    if (cometReveals.length === 0) return;

    function revealNext() {
      if (cometIndex < cometReveals.length) {
        cometReveals[cometIndex].classList.add('is-revealed');
        cometIndex++;
        setTimeout(revealNext, 4000);
      }
    }

    setTimeout(revealNext, 2000);
  }

  if (prefersReduced) {
    cometReveals.forEach(el => el.classList.add('is-revealed'));
  }

  /* ─── Observatory Dimension Buttons ─── */
  const dimensionBtns = document.querySelectorAll('.dimension-btn');
  const dimensionReadout = document.querySelector('.dimension-readout');

  const dimensionMessages = {
    alpha: 'Scanning past echoes… ghost trains detected on routes abandoned centuries ago.',
    beta: 'Parallel lines converging — infinite versions of Orvune running simultaneously.',
    gamma: 'Unwritten tracks emerging — destinations that exist only in passenger imagination.'
  };

  dimensionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dimensionBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      if (dimensionReadout) {
        dimensionReadout.textContent = dimensionMessages[btn.dataset.dimension] || '';
      }
    });
  });

  /* ─── Board Button — Constellation Gate ─── */
  const boardBtn = document.getElementById('board-btn');
  const constellationGate = document.getElementById('constellation-gate');

  if (boardBtn && constellationGate) {
    boardBtn.addEventListener('mouseenter', drawConstellations);
    boardBtn.addEventListener('focus', drawConstellations);
    boardBtn.addEventListener('mouseleave', clearConstellations);
    boardBtn.addEventListener('blur', clearConstellations);
  }

  function drawConstellations() {
    if (prefersReduced) return;
    constellationGate.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 120');
    svg.setAttribute('width', '200');
    svg.setAttribute('height', '120');
    svg.style.opacity = '0';
    svg.style.transition = 'opacity 0.8s ease';

    const points = [
      [30, 20], [60, 35], [90, 15], [120, 40], [150, 25], [170, 55],
      [40, 70], [80, 85], [130, 75], [160, 95], [100, 100], [50, 55]
    ];

    const lines = [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
      [6, 7], [7, 8], [8, 9], [1, 11], [11, 6], [3, 10], [10, 8]
    ];

    lines.forEach(([a, b], i) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', points[a][0]);
      line.setAttribute('y1', points[a][1]);
      line.setAttribute('x2', points[b][0]);
      line.setAttribute('y2', points[b][1]);
      line.setAttribute('stroke', '#F6B94D');
      line.setAttribute('stroke-width', '0.5');
      line.setAttribute('opacity', '0');
      line.style.transition = `opacity 0.5s ease ${i * 0.08}s`;
      svg.appendChild(line);
      requestAnimationFrame(() => { line.setAttribute('opacity', '0.6'); });
    });

    points.forEach(([x, y], i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '2');
      circle.setAttribute('fill', '#F2F6FF');
      circle.setAttribute('opacity', '0');
      circle.style.transition = `opacity 0.4s ease ${i * 0.06}s`;
      svg.appendChild(circle);
      requestAnimationFrame(() => { circle.setAttribute('opacity', '0.9'); });
    });

    constellationGate.appendChild(svg);
    requestAnimationFrame(() => { svg.style.opacity = '1'; });
  }

  function clearConstellations() {
    if (constellationGate) {
      constellationGate.innerHTML = '';
    }
  }

  /* ─── Terminus Departure Signal ─── */
  const departureSignal = document.querySelector('.departure-signal__text');
  const terminusSection = document.getElementById('terminus');

  if (departureSignal && terminusSection) {
    const terminusObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              departureSignal.textContent = 'Departure imminent — all aboard';
            }, 4000);
          } else {
            departureSignal.textContent = 'Awaiting departure clearance';
          }
        });
      },
      { threshold: 0.5 }
    );
    terminusObserver.observe(terminusSection);
  }

  /* ─── Animated Route Trains on SVG ─── */
  if (!prefersReduced) {
    animateRouteTrains();
  }

  function animateRouteTrains() {
    const svg = document.querySelector('.route-map__svg');
    if (!svg) return;

    const routes = [
      { path: 'M400,250 Q200,180 80,250', color: '#7B61FF', duration: 4 },
      { path: 'M400,250 Q600,150 720,200', color: '#F6B94D', duration: 5 },
      { path: 'M400,250 Q300,350 120,420', color: '#4DD4F6', duration: 4.5 }
    ];

    routes.forEach((route, i) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', route.path);
      path.setAttribute('fill', 'none');
      path.setAttribute('id', `train-path-${i}`);

      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3');
      dot.setAttribute('fill', route.color);
      dot.setAttribute('filter', 'url(#glow)');

      const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      animate.setAttribute('dur', route.duration + 's');
      animate.setAttribute('repeatCount', 'indefinite');
      animate.setAttribute('path', route.path);
      if (i > 0) animate.setAttribute('begin', (i * 1.5) + 's');

      dot.appendChild(animate);
      svg.appendChild(dot);
    });
  }

  /* ─── Keyboard: Escape closes transit map ─── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && transitMap && transitMap.classList.contains('is-open')) {
      compassToggle.setAttribute('aria-expanded', 'false');
      transitMap.hidden = true;
      transitMap.classList.remove('is-open');
      compassToggle.focus();
    }
  });

})();
