import { ALBUM_CONFIG } from "./config.js";
import { initAlbum } from "./album.js";
import { createAutoplay } from "./autoplay.js";
import { setupControls } from "./controls.js";

const boot = function () {
  try {
    const pageFlip = initAlbum();
    const autoplay = createAutoplay(pageFlip, {
      intervalMs: ALBUM_CONFIG.pageHoldMs,
      startDelayMs: ALBUM_CONFIG.autoPlayDelay,
      autoStart: ALBUM_CONFIG.autoPlay
    });
    setupControls(pageFlip, autoplay, ALBUM_CONFIG);
    window.weddingAlbum = { pageFlip: pageFlip, autoplay: autoplay };
  } catch (error) {
    console.error("Wedding Album 初始化失败：", error);
    const book = document.getElementById("book");
    if (book) {
      book.innerHTML = '<div style="padding:24px;color:#f4eee4;text-align:center">相册初始化失败，请检查控制台和依赖安装。</div>';
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
