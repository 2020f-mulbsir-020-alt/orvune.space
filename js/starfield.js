/**
 * Orvune — WebGL Starfield with parallax depth layers
 */
(function () {
  'use strict';

  const canvas = document.getElementById('starfield-canvas');
  if (!canvas) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const gl = canvas.getContext('webgl', { alpha: true, antialias: false })
    || canvas.getContext('experimental-webgl');

  if (!gl) {
    canvas.style.display = 'none';
    return;
  }

  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute float a_size;
    attribute float a_alpha;
    attribute float a_layer;
    uniform vec2 u_resolution;
    uniform float u_scroll;
    varying float v_alpha;

    void main() {
      vec2 pos = a_position;
      pos.y += u_scroll * a_layer * 0.0003;
      pos.x += sin(u_scroll * 0.001 + a_position.y * 0.01) * a_layer * 2.0;

      vec2 clip = ((pos / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
      gl_Position = vec4(clip, 0, 1);
      gl_PointSize = a_size;
      v_alpha = a_alpha;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    varying float v_alpha;

    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      float glow = 1.0 - smoothstep(0.0, 0.5, dist);
      gl_FragColor = vec4(0.95, 0.96, 1.0, glow * v_alpha);
    }
  `;

  function createShader(type, source) {
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

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Program link error:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  const STAR_COUNT = 800;
  const positions = new Float32Array(STAR_COUNT * 2);
  const sizes = new Float32Array(STAR_COUNT);
  const alphas = new Float32Array(STAR_COUNT);
  const layers = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    positions[i * 2] = Math.random() * window.innerWidth;
    positions[i * 2 + 1] = Math.random() * window.innerHeight * 3;
    sizes[i] = Math.random() * 2.5 + 0.5;
    alphas[i] = Math.random() * 0.6 + 0.2;
    layers[i] = Math.random() * 3 + 0.5;
  }

  function createBuffer(data, attribute, size) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, attribute);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
    return buffer;
  }

  createBuffer(positions, 'a_position', 2);
  createBuffer(sizes, 'a_size', 1);
  createBuffer(alphas, 'a_alpha', 1);

  const layerBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, layerBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, layers, gl.STATIC_DRAW);
  const layerLoc = gl.getAttribLocation(program, 'a_layer');
  gl.enableVertexAttribArray(layerLoc);
  gl.vertexAttribPointer(layerLoc, 1, gl.FLOAT, false, 0, 0);

  const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
  const scrollLoc = gl.getUniformLocation(program, 'u_scroll');

  let scrollY = 0;
  let animationId = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
  }

  function render() {
    gl.clearColor(0.008, 0.016, 0.039, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.uniform1f(scrollLoc, scrollY);
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
})();
