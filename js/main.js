/* Логика сайта. Обычно этот файл трогать не нужно — всё меняется в content.js */
const S = window.SITE;
const $ = (s) => document.querySelector(s);
const page = document.body.dataset.page;

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]
));

const ARROW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" '
  + 'stroke="currentColor" stroke-width="1.6"><path d="M4 12h16M14 6l6 6-6 6"/></svg>';

const isVideo = (p) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(p || "");

/* ---------- Иконки плеера ---------- */
const I = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
  vol: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path class="st" d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path class="st" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  fs: '<svg viewBox="0 0 24 24"><path class="st" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
};
const fmt = (t) => {
  if (!isFinite(t)) return "0:00";
  return Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
};

/* Приводит путь к рабочему виду: D:\...\media\a.mp4 -> media/a.mp4; пробелы и русские буквы кодируются */
const fixPath = (p) => encodeURI(
  String(p).trim().replace(/\\/g, "/").replace(/^.*?\/media\//i, "media/")
);

/* Картинка или видео по пути к файлу.
   Видео в карточке: свой плеер (играет в рамке, есть полный экран) */
function media(path, player) {
  if (!path) return "";
  const src = esc(fixPath(path));
  if (!isVideo(path)) return `<img class="m" src="${src}" alt="">`;
  if (!player) return `<video class="m" src="${src}" controls autoplay playsinline></video>`;
  return `<video class="m" src="${src}#t=0.1" preload="metadata" playsinline></video>
    <button class="fs" data-act="fs" aria-label="На весь экран" title="На весь экран">${I.fs}</button>
    <button class="bigplay" data-act="toggle" aria-label="Смотреть">${I.play}</button>
    <div class="spin"></div>
    <div class="ctl">
      <button class="cb pp" data-act="toggle" aria-label="Пауза">${I.pause}</button>
      <div class="seek" data-act="seek"><b></b><i></i></div>
      <span class="tm">0:00</span>
      <button class="cb mu" data-act="mute" aria-label="Звук">${I.vol}</button>
    </div>
    <div class="err" hidden><div>Не удалось загрузить видео</div><small>Проверьте, что файл лежит по пути:<br>${esc(path)}</small></div>`;
}

/* Превращает строку "media/a.mp4" или объект { file, title } в карточку */
function items(list, kind) {
  return (list || []).map((x) => {
    const o = typeof x === "string" ? { file: x } : x;
    return { media: o.file || "", title: o.title || "", kind };
  });
}

/* Логотип-картинка; если файла нет — показывается текст */
function logo() {
  const text = esc(S.logo.text);
  if (!S.logo.img) return `<span class="lt">${text}</span>`;
  return `<img src="${esc(fixPath(S.logo.img))}" alt="${text}" `
    + `onerror="this.outerHTML='<span class=&quot;lt&quot;>${text}</span>'">`;
}

/* Настройки размеров из content.js -> CSS-переменные */
function applyTheme() {
  const z = S.size, ok = /^#[0-9a-f]{6}$/i.test(S.accent);
  $("#theme").textContent = ":root{"
    + `--ac:${ok ? S.accent : "#f2ec00"};`
    + `--nav-logo:${+z.navLogo || 44}px;`
    + `--hero-logo:${+z.heroLogo || 230}px;`
    + `--photo-w:${+z.photoWidth || 70}%;`
    + `--photo-fade:${+z.photoFade || 60}%;`
    + `--photo-dim:${(+z.photoDim || 100) / 100};`
    + `--photo-pos:${z.photoPosition || "center"};}`;
}

/* ---------- Общие части ---------- */
function header(activeIndex) {
  const links = S.nav.map((n, i) =>
    `<a href="${esc(n.href)}" class="${i === activeIndex ? "on" : ""}">${esc(n.t)}</a>`
  ).join("");
  return `<header class="nav"><a class="logo" href="index.html">${logo()}</a><nav>${links}</nav></header>`;
}

function socialLink(s, cls) {
  const href = s.href ? `href="${esc(s.href)}" target="_blank" rel="noopener"` : "";
  return `<a class="${cls}" ${href}><span>${esc(s.name)}</span>${cls === "slink" ? ARROW : ""}</a>`;
}

function footer() {
  return `<footer class="foot"><a class="logo" href="index.html">${logo()}</a>`
    + `<span class="soc">${S.social.map((s) => socialLink(s, "sl")).join("")}</span>`
    + `<span class="sp">${esc(S.copy)}</span></footer>`;
}

/* ---------- Главная ---------- */
let filter = "all"; // all | reels | events | clips
let view = "grid";

function renderHome() {
  const reels = items(S.reels, "reels");
  const events = items(S.events, "events");
  const clips = items(S.clips, "clips");

  const tabs = [
    ["all", "Все работы"], ["reels", "Рилс"], ["events", "Мероприятия"], ["clips", "Клипы"]
  ];
  const shown = { all: [...events, ...clips], reels, events, clips }[filter];
  const isReels = filter === "reels";

  const card = (p, i) => `
    <article class="card" data-i="${i}" style="--g:${(i * 47 + 30) % 360}">
      ${media(p.media, true)}
      ${p.title ? `<div class="cap"><h3>${esc(p.title)}</h3></div>` : ""}
      <i class="ar">${isVideo(p.media) ? "▶" : "↗"}</i>
    </article>`;

  const tabsHtml = tabs.map(([k, t]) =>
    `<button data-f="${k}" class="${k === filter ? "on" : ""}">${t}</button>`).join("");

  const viewBtns = ["grid", "list"].map((v) =>
    `<button data-v="${v}" class="${view === v ? "on" : ""}" aria-label="${v}">${v === "grid" ? "▦" : "☰"}</button>`
  ).join("");

  window.SHOWN = shown;
  $("#app").innerHTML = `
    <section id="top" class="hero">
      ${S.size.photoFile ? `<img class="photo" src="${esc(fixPath(S.size.photoFile))}" alt="" onerror="this.remove()">` : ""}
      ${header(0)}
      <div class="hc"><a class="biglogo" href="index.html">${logo()}</a></div>
    </section>
    <div id="works" class="bar">
      <div class="f">${tabsHtml}</div>
      <div class="vw"${isReels ? ' style="visibility:hidden"' : ""}>${viewBtns}</div>
    </div>
    <div class="grid ${isReels ? "reels" : view}">${shown.map(card).join("")}</div>
    <section id="cta" class="cta">
      <div><h2>${esc(S.cta.title)}</h2><p>${esc(S.cta.sub)}</p></div>
      <a class="ghost" href="${esc(S.cta.href)}"><span>${esc(S.cta.button)}</span>${ARROW}</a>
    </section>
    ${footer()}`;
}

/* ---------- Страница «Контакты» ---------- */
function renderContact() {
  $("#app").innerHTML = `
    <div class="cpage">
      ${header(2)}
      <main class="cmain">
        <h1>${esc(S.contactTitle)}</h1>
        <p>${esc(S.contactSub)}</p>
        <div class="links">${S.social.map((s) => socialLink(s, "slink")).join("")}</div>
      </main>
      ${footer()}
    </div>`;
}

function render() {
  if (page === "contact") renderContact(); else { renderHome(); bindPlayers(); }
}

/* ---------- Плеер: видео играет в рамке + полный экран ---------- */
const closeLb = () => { $("#lb").hidden = true; $("#lb").innerHTML = ""; };

/* Подписываем видео в карточках на события (прогресс, время, ошибки) */
function bindPlayers() {
  document.querySelectorAll(".card").forEach((c) => {
    const v = c.querySelector("video");
    if (!v) return;
    const bar = c.querySelector(".seek i"), tm = c.querySelector(".tm");
    const pp = c.querySelector(".pp"), mu = c.querySelector(".mu");
    const upd = () => {
      bar.style.width = (v.duration ? (v.currentTime / v.duration) * 100 : 0) + "%";
      tm.textContent = fmt(v.currentTime) + " / " + fmt(v.duration);
    };
    v.addEventListener("loadedmetadata", upd);
    v.addEventListener("timeupdate", upd);
    v.addEventListener("play", () => { c.classList.add("playing"); pp.innerHTML = I.pause; });
    v.addEventListener("pause", () => { c.classList.remove("playing"); pp.innerHTML = I.play; });
    v.addEventListener("ended", () => { v.currentTime = 0; c.classList.remove("playing"); });
    v.addEventListener("waiting", () => c.classList.add("wait"));
    v.addEventListener("playing", () => c.classList.remove("wait"));
    v.addEventListener("canplay", () => c.classList.remove("wait"));
    v.addEventListener("volumechange", () => { mu.innerHTML = v.muted ? I.mute : I.vol; });
    v.addEventListener("error", () => { c.classList.remove("wait"); c.querySelector(".err").hidden = false; });
  });
}

/* Запускает видео в карточке, остальные ставит на паузу */
function activate(card) {
  document.querySelectorAll(".card.active").forEach((x) => {
    if (x === card) return;
    x.classList.remove("active");
    x.querySelector("video").pause();
  });
  card.classList.add("active");
  card.querySelector("video").play().catch(() => {});
}

function toggleFs(card) {
  const v = card.querySelector("video");
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    return;
  }
  const go = card.requestFullscreen || card.webkitRequestFullscreen;
  if (go) go.call(card); else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen(); /* iPhone */
}

function seekTo(e, track) {
  const r = track.getBoundingClientRect(), v = track.closest(".card").querySelector("video");
  if (v.duration) v.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * v.duration;
}

document.addEventListener("click", (e) => {
  const t = e.target;
  const f = t.closest("[data-f]"), v = t.closest("[data-v]"), c = t.closest(".card");
  if (t.closest("#lb")) { closeLb(); return; }
  if (f) { filter = f.dataset.f; render(); return; }
  if (v) { view = v.dataset.v; render(); return; }
  if (!c) return;
  const p = window.SHOWN[+c.dataset.i];
  if (!p || !p.media) return;
  const video = c.querySelector("video");
  if (!video) { $("#lb").hidden = false; $("#lb").innerHTML = media(p.media); return; }
  const act = (t.closest("[data-act]") || {}).dataset;
  if (act && act.act === "fs") { activate(c); toggleFs(c); }
  else if (act && act.act === "mute") video.muted = !video.muted;
  else if (act && act.act === "seek") { /* обрабатывается ниже */ }
  else if (!c.classList.contains("active")) activate(c);
  else if (video.paused) video.play(); else video.pause();
});

/* Перемотка: клик и перетаскивание по полосе */
document.addEventListener("pointerdown", (e) => {
  const s = e.target.closest(".seek");
  if (!s) return;
  seekTo(e, s);
  const move = (ev) => seekTo(ev, s);
  const up = () => { document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); };
  document.addEventListener("pointermove", move);
  document.addEventListener("pointerup", up);
});

/* Панель управления прячется, если мышь неподвижна */
document.addEventListener("mousemove", (e) => {
  const c = e.target.closest(".card.active");
  if (!c) return;
  c.classList.remove("idle");
  clearTimeout(c._t);
  c._t = setTimeout(() => c.classList.add("idle"), 2500);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLb();
  if (e.code === "Space") {
    const c = document.querySelector(".card.active video");
    if (c && !/BUTTON|A/.test(document.activeElement.tagName)) { e.preventDefault(); c.paused ? c.play() : c.pause(); }
  }
});

applyTheme();
render();
if (location.hash) {
  const el = document.getElementById(location.hash.slice(1));
  if (el) el.scrollIntoView();
}
