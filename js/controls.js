export function setupControls(pageFlip, autoplay, config) {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const playBtn = document.getElementById("playBtn");
  const playIcon = playBtn.querySelector(".play-icon");
  const playLabel = playBtn.querySelector(".play-label");
  const pageCounter = document.getElementById("pageCounter");
  const pageTotal = document.getElementById("pageTotal");
  const progressFill = document.getElementById("progressFill");
  const musicBtn = document.getElementById("musicBtn");
  const audio = document.getElementById("backgroundMusic");

  const spreadCount = config.spreads.length;
  pageTotal.textContent = String(spreadCount).padStart(2, "0") + " SPREADS";

  const update = function () {
    const current = pageFlip.getCurrentPageIndex();
    const pageCount = pageFlip.getPageCount();
    const atCover = current === 0;
    const spreadIndex = atCover ? 0 : Math.min(Math.floor((current - 1) / 2) + 1, spreadCount);
    pageCounter.textContent = atCover
      ? "COVER"
      : "SPREAD " + String(spreadIndex).padStart(2, "0") + " / " + String(spreadCount).padStart(2, "0");
    const ratio = pageCount > 1 ? current / (pageCount - 1) : 0;
    progressFill.style.width = Math.max(0, Math.min(100, ratio * 100)) + "%";
    prevBtn.disabled = current <= 0;
    nextBtn.disabled = current >= pageCount - 1;
    playBtn.disabled = false;
    if (autoplay.isPlaying()) {
      playIcon.textContent = "Ⅱ";
      playLabel.textContent = "暂停自动播放";
      playBtn.setAttribute("aria-label", "暂停自动翻页");
    } else {
      playIcon.textContent = "▶";
      playLabel.textContent = "继续自动播放";
      playBtn.setAttribute("aria-label", "继续自动翻页");
    }
  };

  prevBtn.addEventListener("click", function () {
    autoplay.stop();
    pageFlip.flipPrev();
    update();
  });

  nextBtn.addEventListener("click", function () {
    autoplay.stop();
    pageFlip.flipNext();
    update();
  });

  playBtn.addEventListener("click", function () {
    if (pageFlip.getCurrentPageIndex() >= pageFlip.getPageCount() - 1) {
      pageFlip.turnToPage(0);
    }
    autoplay.toggle();
    update();
  });

  pageFlip.on("flip", update);
  pageFlip.on("changeState", update);

  document.addEventListener("keydown", function (event) {
    const target = event.target;
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
    if (event.key === "ArrowRight") {
      autoplay.stop();
      pageFlip.flipNext();
    } else if (event.key === "ArrowLeft") {
      autoplay.stop();
      pageFlip.flipPrev();
    } else if (event.code === "Space") {
      event.preventDefault();
      autoplay.toggle();
    }
    update();
  });

  if (config.music) {
    audio.src = config.music;
    musicBtn.disabled = false;
    musicBtn.innerHTML = "<span aria-hidden='true'>♫</span><span>开启音乐</span>";
    musicBtn.addEventListener("click", async function () {
      try {
        if (audio.paused) {
          await audio.play();
          musicBtn.innerHTML = "<span aria-hidden='true'>♫</span><span>关闭音乐</span>";
        } else {
          audio.pause();
          musicBtn.innerHTML = "<span aria-hidden='true'>♫</span><span>开启音乐</span>";
        }
      } catch (error) {
        console.warn("音乐播放被浏览器阻止，请再次点击音乐按钮。", error);
      }
    });
  }

  update();
  return { update: update };
}
