(function () {
  const gsap = window.gsap;
  const root = document.getElementById("root");
  if (!gsap || !root) {
    console.error("HyperFrames export requires GSAP and #root.");
    return;
  }

  const scenes = Array.from(document.querySelectorAll(".spread-scene"));
  const cover = document.getElementById("export-cover");
  const closedLeft = document.querySelector(".closed-left");
  const finalMessage = document.getElementById("final-message");
  const timeline = gsap.timeline({ paused: true });

  timeline.set(scenes, { autoAlpha: 0 });
  timeline.set(cover, { autoAlpha: 1, rotateY: 0 });
  timeline.set(closedLeft, { autoAlpha: 1 });
  timeline.set(finalMessage, { autoAlpha: 0, y: 18 });

  // The cover opens first; the first double-page spread is revealed underneath.
  timeline.set(scenes[0], { autoAlpha: 1 }, 0.55);
  timeline.to(cover, {
    rotateY: -178,
    duration: 1.72,
    ease: "power2.inOut"
  }, 0.58);
  timeline.to(closedLeft, {
    autoAlpha: 0,
    duration: 1.25,
    ease: "power1.out"
  }, 0.92);
  timeline.set(cover, { autoAlpha: 0 }, 2.36);

  const firstSpreadStart = 2.4;
  const spreadInterval = 5.9;
  const flipOffset = 4.15;

  scenes.forEach(function (scene, index) {
    const start = firstSpreadStart + index * spreadInterval;
    timeline.set(scene, { autoAlpha: 1 }, start);

    if (index < scenes.length - 1) {
      const sheet = scene.querySelector(".flip-sheet");
      timeline.fromTo(
        sheet,
        { rotateY: 0 },
        {
          rotateY: -180,
          duration: 1.4,
          ease: "power2.inOut"
        },
        start + flipOffset
      );
      timeline.set(scene, { autoAlpha: 0 }, start + 5.82);
      timeline.set(scenes[index + 1], { autoAlpha: 1 }, start + spreadInterval);
    }
  });

  timeline.to(finalMessage, {
    autoAlpha: 1,
    y: 0,
    duration: 1.1,
    ease: "power2.out"
  }, 30.15);

  // Keep the closing spread on screen through the full 34.5-second composition.
  timeline.to({}, { duration: 3.25 }, 31.25);

  window.__timelines = window.__timelines || {};
  window.__timelines["wedding-album-export"] = timeline;

  // Normal browser preview plays automatically. HyperFrames keeps the timeline
  // paused and seeks it frame by frame for deterministic rendering.
  if (!window.__hyperframes) {
    timeline.play(0);
  }
})();
