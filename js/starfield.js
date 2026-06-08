/**
 * Orvune WebGL Starfield
 * Lightweight parallax star layer with depth tiers
 */
(function () {
  'use strict';

  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    initCanvas2DFallback(canvas);
    return;
  }

  const vertexSrc = `
    attribute vec2 a_position;
    attribute float a_size;
    attribute float a_depth;
    uniform vec2 u_resolution;
    uniform float u_scroll;
    varying float v_alpha;

    void main() {
      vec2 pos = a_position;
      pos.y += u_scroll * a_depth * 0.0003;
      pos.x += sin(u_scroll * 0.001 + a_depth) * a_depth * 0.02;

      vec2 clip = (pos / u_resolution) * 2.0 - 1.0;
      clip.y *= -1.0;
      gl_Position = vec4(clip, 0.0, 1.0);
      gl_PointSize = a_size * (1.0 + a_depth * 0.5);
      v_alpha = 0.3 + a_depth * 0.5;
    }
  `;

  const fragmentSrc = `
    precision mediump float;
    varying float v_alpha;

    void main() {
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;
      float glow = 1.0 - smoothstep(0.0, 0.5, dist);
      gl_FragColor = vec4(0.95, 0.96, 1.0, glow * v_alpha);
    }
  `;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = compileShader(gl.VERTEX_SHADER, vertexSrc);
  const fs = compileShader(gl.FRAGMENT_SHADER, fragmentSrc);
  if (!vs || !fs) {
    initCanvas2DFallback(canvas);
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    initCanvas2DFallback(canvas);
    return;
  }

  gl.useProgram(program);

  const STAR_COUNT = window.innerWidth < 768 ? 400 : 800;
  const positions = new Float32Array(STAR_COUNT * 2);
  const sizes = new Float32Array(STAR_COUNT);
  const depths = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 2] = Math.random();
    positions[i * 2 + 1] = Math.random();
    sizes[i] = Math.random() * 2.5 + 0.5;
    depths[i] = Math.random();
  }

  function createBuffer(data, attrib, size) {
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, attrib);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    return buf;
  }

  const posBuffer = createBuffer(positions, 'a_position', 2);
  createBuffer(sizes, 'a_size', 1);
  createBuffer(depths, 'a_depth', 1);

  const uResolution = gl.getUniformLocation(program, 'u_resolution');
  const uScroll = gl.getUniformLocation(program, 'u_scroll');

  let scrollY = 0;
  let width = 0;
  let height = 0;
  let animationId = null;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 2] = Math.random() * width;
      positions[i * 2 + 1] = Math.random() * height;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
  }

  function render() {
    gl.clearColor(0.008, 0.016, 0.039, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uResolution, width, height);
    gl.uniform1f(uScroll, scrollY);
    gl.drawArrays(gl.POINTS, 0, STAR_COUNT);
    animationId = requestAnimationFrame(render);
  }

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  window.addEventListener('resize', resize);
  resize();
  render();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      render();
    }
  });

  function initCanvas2DFallback(cvs) {
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const stars = [];
    const count = 300;

    function setup() {
      cvs.width = window.innerWidth * devicePixelRatio;
      cvs.height = window.innerHeight * devicePixelRatio;
      stars.length = 0;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * cvs.width,
          y: Math.random() * cvs.height,
          r: Math.random() * 1.5 + 0.5,
          d: Math.random()
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      const scroll = window.scrollY * devicePixelRatio;
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, (s.y + scroll * s.d * 0.1) % cvs.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 246, 255, ${0.2 + s.d * 0.5})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', setup);
    setup();
    draw();
  }
})();
