import { PageFlip } from "page-flip";
import { ALBUM_CONFIG } from "./config.js";

const escapeHtml = function (value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const photoMarkup = function (page, index) {
  const src = page.src || ALBUM_CONFIG.placeholderImage;
  const alt = page.alt || "婚纱照片占位图";
  const variant = page.variant ? " photo-" + page.variant : "";
  return (
    '<div class="page-paper photo-page' + variant + '">' +
      '<div class="photo-mat">' +
        '<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt) + '" ' +
          'onerror="this.onerror=null;this.src=\\'' + ALBUM_CONFIG.placeholderImage + '\\';">' +
      '</div>' +
      '<div class="photo-caption">' +
        '<span>' + escapeHtml(page.caption || "A MOMENT TO REMEMBER") + '</span>' +
        '<span>' + escapeHtml(page.number || String(index + 1).padStart(2, "0")) + '</span>' +
      '</div>' +
    '</div>'
  );
};

const storyMarkup = function (page) {
  return (
    '<div class="page-paper story-page">' +
      '<div class="page-running-head"><span>OUR WEDDING</span><span>THE STORY</span></div>' +
      '<div class="story-mark"></div>' +
      '<p class="story-eyebrow">' + escapeHtml(page.eyebrow || "OUR STORY") + '</p>' +
      '<h2 class="story-title">' + escapeHtml(page.title || "Our story") + '</h2>' +
      '<p class="story-body">' + escapeHtml(page.body || "") + '</p>' +
      '<div class="story-signature">' + escapeHtml(page.signature || "With love") + '</div>' +
      '<div class="page-folio">W · A</div>' +
    '</div>'
  );
};

const quoteMarkup = function (page) {
  return (
    '<div class="page-paper story-page quote-page">' +
      '<div class="page-running-head"><span>OUR WEDDING</span><span>A LITTLE NOTE</span></div>' +
      '<div class="story-mark"></div>' +
      '<p class="story-eyebrow">' + escapeHtml(page.eyebrow || "A LITTLE NOTE") + '</p>' +
      '<h2 class="quote-text">' + escapeHtml(page.title || "A story worth keeping.") + '</h2>' +
      '<p class="quote-sub">FOREVER STARTS HERE</p>' +
      '<div class="page-folio">W · A</div>' +
    '</div>'
  );
};

const createPage = function (className, content, density) {
  const page = document.createElement("div");
  page.className = "album-page " + className;
  if (density) page.dataset.density = density;
  page.innerHTML = content;
  return page;
};

const createCover = function () {
  const cover = document.createElement("div");
  cover.className = "album-page cover-page";
  cover.dataset.density = "hard";
  const names = ALBUM_CONFIG.names.map(escapeHtml).join(" & ");
  cover.innerHTML =
    '<div class="cover-panel">' +
      '<div class="cover-photo">' +
        '<img src="' + escapeHtml(ALBUM_CONFIG.coverImage) + '" alt="婚纱相册封面" ' +
          'onerror="this.onerror=null;this.src=\\'' + ALBUM_CONFIG.placeholderImage + '\\';">' +
      '</div>' +
      '<div class="cover-title-block">' +
        '<p class="cover-kicker">THE WEDDING COLLECTION</p>' +
        '<h1 class="cover-title">OUR LOVE<br>STORY</h1>' +
        '<div class="cover-ornament"></div>' +
        '<p class="cover-names">' + names + '</p>' +
        '<p class="cover-date">' + escapeHtml(ALBUM_CONFIG.date) + '</p>' +
      '</div>' +
    '</div>';
  return cover;
};

const createBackCover = function () {
  return createPage(
    "back-cover-page",
    '<div class="back-cover-inner"><div><strong>To be continued...</strong><small>THANK YOU FOR BEING PART OF OUR STORY</small></div></div>',
    "hard"
  );
};

const renderSide = function (page, index) {
  if (page.type === "story") return storyMarkup(page);
  if (page.type === "quote") return quoteMarkup(page);
  return photoMarkup(page, index);
};

export function initAlbum() {
  const bookElement = document.getElementById("book");
  if (!bookElement) throw new Error("找不到 #book 相册容器。");

  bookElement.replaceChildren();
  bookElement.appendChild(createCover());

  ALBUM_CONFIG.spreads.forEach(function (spread, index) {
    bookElement.appendChild(createPage("spread-page", renderSide(spread.left, index * 2), null));
    bookElement.appendChild(createPage("spread-page", renderSide(spread.right, index * 2 + 1), null));
  });

  bookElement.appendChild(createBackCover());

  const pageFlip = new PageFlip(bookElement, {
    width: ALBUM_CONFIG.pageWidth,
    height: ALBUM_CONFIG.pageHeight,
    size: "stretch",
    minWidth: 300,
    maxWidth: ALBUM_CONFIG.pageWidth,
    minHeight: 360,
    maxHeight: ALBUM_CONFIG.pageHeight,
    drawShadow: true,
    flippingTime: ALBUM_CONFIG.flipDuration,
    usePortrait: false,
    startZIndex: 20,
    autoSize: true,
    maxShadowOpacity: 0.34,
    showCover: true,
    mobileScrollSupport: false,
    swipeDistance: 28,
    clickEventForward: true,
    useMouseEvents: true,
    disableFlipByClick: false
  });

  pageFlip.loadFromHTML(bookElement.querySelectorAll(".album-page"));
  return pageFlip;
}
