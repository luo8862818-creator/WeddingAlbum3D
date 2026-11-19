export function createAutoplay(pageFlip, options) {
  const settings = options || {};
  const intervalMs = settings.intervalMs || 5200;
  const startDelayMs = settings.startDelayMs || 2000;
  let intervalId = null;
  let startTimeoutId = null;
  let playing = false;

  const isAtEnd = function () {
    return pageFlip.getCurrentPageIndex() >= pageFlip.getPageCount() - 1;
  };

  const stop = function () {
    if (intervalId) window.clearInterval(intervalId);
    if (startTimeoutId) window.clearTimeout(startTimeoutId);
    intervalId = null;
    startTimeoutId = null;
    playing = false;
  };

  const tick = function () {
    if (isAtEnd()) {
      stop();
      return;
    }
    if (pageFlip.getState() === "read") {
      pageFlip.flipNext();
    }
  };

  const start = function (delay) {
    stop();
    playing = true;
    const wait = typeof delay === "number" ? delay : 0;
    startTimeoutId = window.setTimeout(function () {
      startTimeoutId = null;
      tick();
      intervalId = window.setInterval(tick, intervalMs);
    }, wait);
  };

  const toggle = function () {
    if (playing) stop();
    else start(0);
    return playing;
  };

  pageFlip.on("flip", function () {
    if (isAtEnd()) stop();
  });

  if (settings.autoStart) start(startDelayMs);

  return {
    start: start,
    stop: stop,
    toggle: toggle,
    isPlaying: function () { return playing; }
  };
}
