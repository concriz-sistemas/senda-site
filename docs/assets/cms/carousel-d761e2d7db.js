// Browser script for the carousel component, published as its own hashed file.
// Without it every slide shows; with it, one slide at a time and manual controls.
// It only rotates with data-autoplay, pauses on hover, focus or the pause button,
// and never rotates for visitors who prefer reduced motion.
(function (enhance) {
  if (typeof module === 'object' && module.exports) module.exports = enhance;
  else document.querySelectorAll('[data-carousel]').forEach(function (root) { enhance(root); });
})(function enhance(root, env) {
  env = env || {
    setInterval: window.setInterval.bind(window),
    clearInterval: window.clearInterval.bind(window),
    reducedMotion: function () { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; },
  };
  var slides = root.querySelectorAll('.carousel__slide');
  if (slides.length < 2) return;
  var controls = root.querySelector('.carousel__controls');
  var indicators = root.querySelectorAll('.carousel__indicator');
  var pauseButton = root.querySelector('.carousel__pause');
  var autoplay = root.hasAttribute('data-autoplay') && !env.reducedMotion();
  var current = 0;
  var timer = null;
  var pausedByVisitor = false;

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, j) { s.hidden = j !== current; });
    indicators.forEach(function (b, j) { b.setAttribute('aria-current', String(j === current)); });
  }
  function start() {
    if (autoplay && !pausedByVisitor && !timer) timer = env.setInterval(function () { show(current + 1); }, 7000);
  }
  function stop() {
    if (timer) env.clearInterval(timer);
    timer = null;
  }

  controls.hidden = false;
  root.classList.add('carousel--enhanced');
  root.querySelector('.carousel__slides').setAttribute('aria-live', autoplay ? 'off' : 'polite');
  root.querySelector('.carousel__previous').addEventListener('click', function () { show(current - 1); });
  root.querySelector('.carousel__next').addEventListener('click', function () { show(current + 1); });
  indicators.forEach(function (b, j) { b.addEventListener('click', function () { show(j); }); });

  if (pauseButton) {
    pauseButton.addEventListener('click', function () {
      pausedByVisitor = !pausedByVisitor;
      pauseButton.textContent = pauseButton.getAttribute(pausedByVisitor ? 'data-play' : 'data-pause');
      if (pausedByVisitor) stop();
      else start();
    });
  }
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  show(0);
  start();
});
