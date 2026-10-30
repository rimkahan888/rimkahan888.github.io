(function () {
  var projects = (globalThis.PORTFOLIO_PROJECTS || []).filter(function (project) {
    return project && project.id && project.name && project.summary;
  });

  var ICONS = {
    "prompt-folio": "i-prompt",
    sdlc: "i-flow",
    "rat-race-escape": "i-board",
    "ui-ux-pro-max": "i-swatch",
  };

  var app = document.getElementById("app");
  var list = document.getElementById("project-list");
  var panel = document.getElementById("panel");
  var panelTitle = document.getElementById("panel-title");
  var panelDetail = document.getElementById("panel-detail");
  var panelTags = document.getElementById("panel-tags");
  var panelLinks = document.getElementById("panel-links");
  var panelClose = document.getElementById("panel-close");
  var themeButton = document.getElementById("theme-toggle");
  var help = document.getElementById("help");
  var helpOpen = document.getElementById("help-open");
  var helpClose = document.getElementById("help-close");
  var cardSlider = document.getElementById("card-size");
  var panelSlider = document.getElementById("panel-size");
  var cardValue = document.getElementById("card-size-value");
  var panelValue = document.getElementById("panel-size-value");
  var toastOk = document.getElementById("toast-ok");
  var toastErr = document.getElementById("toast-err");
  var toastOkText = document.getElementById("toast-ok-text");
  var toastErrText = document.getElementById("toast-err-text");
  var themeColor = document.querySelector('meta[name="theme-color"]');

  var cards = [];
  var current = -1;
  var openIndex = -1;
  var restoreFocus = null;
  var toastTimer = 0;
  var resizeTimer = 0;
  var pendingOpen = 0;
  var flashTimers = new WeakMap();

  function icon(id) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function safeUrl(value) {
    try {
      var url = new URL(value);
      if (url.protocol === "https:" || url.protocol === "http:") return url.href;
    } catch (error) {
      return "";
    }
    return "";
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function narrow() {
    return window.matchMedia("(max-width: 599px)").matches;
  }

  function store(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      /* private mode and blocked storage still leave the control working */
    }
  }

  function readNumber(key, fallback, min, max) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null || raw === "") return fallback;
      var number = Number(raw);
      if (!Number.isFinite(number)) return fallback;
      return Math.min(max, Math.max(min, number));
    } catch (error) {
      return fallback;
    }
  }

  function paintSlider(input) {
    var min = Number(input.min);
    var max = Number(input.max);
    var pct = ((Number(input.value) - min) / (max - min)) * 100;
    input.style.setProperty("--fill", pct + "%");
    input.setAttribute("aria-valuenow", input.value);
  }

  var cardScaleMin = 80;
  var cardScaleMax = 140;

  function cardScaleFromPercent(percent) {
    return cardScaleMin + (Number(percent) / 100) * (cardScaleMax - cardScaleMin);
  }

  function cardPercentFromScale(size) {
    return ((Number(size) - cardScaleMin) / (cardScaleMax - cardScaleMin)) * 100;
  }

  function applyCardSize(value, persist) {
    var scale = Math.min(cardScaleMax, Math.max(cardScaleMin, Number(value)));
    document.documentElement.style.setProperty("--card-scale", String(scale / 100));
    var shown = Math.round(cardPercentFromScale(scale));
    if (Number(cardSlider.value) !== shown) cardSlider.value = String(shown);
    cardValue.textContent = cardSlider.value + "%";
    paintSlider(cardSlider);
    if (persist) store("jk-card-size", String(Math.round(scale * 10) / 10));
  }

  function applyPanelSize(value, persist) {
    var size = Math.min(70, Math.max(30, Number(value)));
    document.documentElement.style.setProperty("--panel-size", size + "%");
    document.documentElement.style.setProperty("--panel-h", size + "dvh");
    panelSlider.value = String(size);
    panelValue.textContent = size + "%";
    paintSlider(panelSlider);
    if (persist) store("jk-panel-size", String(size));
  }

  function markResizing() {
    document.documentElement.classList.add("is-resizing");
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      document.documentElement.classList.remove("is-resizing");
    }, 180);
  }

  function setTheme(theme) {
    var next = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    var toLight = next === "dark";
    themeButton.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
    themeButton.setAttribute("aria-label", toLight ? "Switch to light theme" : "Switch to dark theme");
    var use = themeButton.querySelector("use");
    if (use) use.setAttribute("href", toLight ? "#i-sun" : "#i-moon");
    if (themeColor) themeColor.setAttribute("content", next === "light" ? "#F4F1EA" : "#101412");
    store("jk-theme", next);
  }

  function toggleTheme() {
    var currentTheme = document.documentElement.getAttribute("data-theme");
    setTheme(currentTheme === "light" ? "dark" : "light");
  }

  function cardText(project) {
    var lines = [project.name, project.summary, "", (project.tags || []).join(", ")];
    var live = safeUrl(project.live);
    var repo = safeUrl(project.repo);
    if (live || repo) lines.push("");
    if (live) lines.push("Live: " + live);
    if (repo) lines.push("Repo: " + repo);
    return lines.join("\n");
  }

  function legacyCopy(text) {
    var previous = document.activeElement;
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (error) {
      ok = false;
    }
    area.remove();
    if (previous && typeof previous.focus === "function") previous.focus();
    return ok;
  }

  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return new Promise(function (resolve) {
        var settled = false;
        var timer = window.setTimeout(function () {
          if (settled) return;
          settled = true;
          resolve(legacyCopy(text));
        }, 1000);
        navigator.clipboard.writeText(text).then(
          function () {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            resolve(true);
          },
          function () {
            if (settled) return;
            settled = true;
            window.clearTimeout(timer);
            resolve(legacyCopy(text));
          }
        );
      });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function showToast(kind, message) {
    var box = kind === "ok" ? toastOk : toastErr;
    var text = kind === "ok" ? toastOkText : toastErrText;
    var other = kind === "ok" ? toastErr : toastOk;
    other.hidden = true;
    text.textContent = "";
    box.hidden = false;
    window.requestAnimationFrame(function () {
      text.textContent = message;
    });
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      box.hidden = true;
    }, 3200);
  }

  function flash(card) {
    card.classList.add("is-copied");
    window.clearTimeout(flashTimers.get(card));
    flashTimers.set(
      card,
      window.setTimeout(function () {
        card.classList.remove("is-copied");
      }, 700)
    );
  }

  function copyCard(project, card) {
    writeClipboard(cardText(project)).then(
      function (ok) {
        if (!ok) {
          showToast("err", "Could not copy");
          return;
        }
        flash(card);
        showToast("ok", "Copied");
      },
      function () {
        showToast("err", "Could not copy");
      }
    );
  }

  function linkAnchor(label, url, symbol) {
    var anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.appendChild(icon(symbol));
    var copy = document.createElement("span");
    copy.className = "link-copy";
    var name = document.createElement("span");
    name.className = "link-label";
    name.textContent = label;
    var address = document.createElement("span");
    address.className = "link-url";
    address.textContent = url;
    copy.appendChild(name);
    copy.appendChild(address);
    anchor.appendChild(copy);
    return anchor;
  }

  function fillPanel(project) {
    panelTitle.textContent = project.name;
    panelDetail.textContent = project.detail || project.summary;
    panelTags.replaceChildren();
    (project.tags || []).forEach(function (tag) {
      var item = document.createElement("li");
      item.className = "tag";
      item.textContent = tag;
      panelTags.appendChild(item);
    });
    panelLinks.replaceChildren();
    var live = safeUrl(project.live);
    var repo = safeUrl(project.repo);
    if (live) panelLinks.appendChild(linkAnchor("Live site", live, "i-external"));
    if (repo) panelLinks.appendChild(linkAnchor("Repository", repo, "i-github"));
  }

  function setCurrent(index) {
    current = index;
    cards.forEach(function (card, cardIndex) {
      card.classList.toggle("is-current", cardIndex === index);
    });
  }

  function scheduleOpen(index) {
    window.clearTimeout(pendingOpen);
    setCurrent(index);
    if (cards[index]) cards[index].focus({ preventScroll: true });
    pendingOpen = window.setTimeout(function () {
      openPanel(index);
    }, 220);
  }

  function openPanel(index, focusTarget) {
    window.clearTimeout(pendingOpen);
    var project = projects[index];
    if (!project) return;
    setCurrent(index);
    openIndex = index;
    fillPanel(project);
    cards.forEach(function (card, cardIndex) {
      var active = cardIndex === index;
      card.classList.toggle("is-active", active);
      card.setAttribute("aria-expanded", active ? "true" : "false");
    });
    panel.removeAttribute("inert");
    panel.setAttribute("aria-hidden", "false");
    app.classList.add("is-open");
    if (location.hash !== "#" + project.id) {
      history.replaceState(null, "", "#" + project.id);
    }
    var card = cards[index];
    restoreFocus = card;
    card.focus({ preventScroll: true });
    card.scrollIntoView({
      block: narrow() ? "start" : "nearest",
      inline: "nearest",
      behavior: reducedMotion() ? "auto" : "smooth",
    });
    if (focusTarget !== "card") {
      window.setTimeout(function () {
        if (openIndex === index) panelClose.focus();
      }, reducedMotion() ? 0 : 260);
    }
  }

  function closePanel() {
    if (openIndex < 0 && !app.classList.contains("is-open")) return;
    openIndex = -1;
    cards.forEach(function (card) {
      card.classList.remove("is-active");
      card.setAttribute("aria-expanded", "false");
    });
    panel.setAttribute("aria-hidden", "true");
    panel.setAttribute("inert", "");
    app.classList.remove("is-open");
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    var back = restoreFocus;
    restoreFocus = null;
    if (back && typeof back.focus === "function") back.focus({ preventScroll: true });
  }

  function move(delta) {
    if (!projects.length) return;
    var base = current < 0 ? (delta > 0 ? -1 : 0) : current;
    var next = (base + delta + projects.length) % projects.length;
    if (app.classList.contains("is-open")) {
      openPanel(next, "card");
      return;
    }
    setCurrent(next);
    var card = cards[next];
    card.focus({ preventScroll: true });
    card.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  }

  function render() {
    list.replaceChildren();
    cards = [];
    if (!projects.length) {
      var empty = document.createElement("li");
      empty.textContent = "No projects yet. Add one in js/projects.js.";
      list.appendChild(empty);
      return;
    }
    projects.forEach(function (project, index) {
      var item = document.createElement("li");
      var card = document.createElement("article");
      card.className = "card";
      card.id = project.id;
      card.tabIndex = 0;
      card.setAttribute("aria-labelledby", project.id + "-title");
      card.setAttribute("aria-expanded", "false");

      var top = document.createElement("div");
      top.className = "card-top";
      var mark = document.createElement("span");
      mark.className = "mark";
      mark.appendChild(icon(ICONS[project.id] || "i-code"));
      var tools = document.createElement("div");
      tools.className = "card-tools";

      var repo = safeUrl(project.repo);
      var live = safeUrl(project.live);
      if (repo) {
        var repoLink = document.createElement("a");
        repoLink.className = "icon-btn";
        repoLink.href = repo;
        repoLink.target = "_blank";
        repoLink.rel = "noopener noreferrer";
        repoLink.setAttribute("aria-label", project.name + " repository, opens in a new tab");
        repoLink.appendChild(icon("i-github"));
        tools.appendChild(repoLink);
      }
      if (live) {
        var liveLink = document.createElement("a");
        liveLink.className = "icon-btn";
        liveLink.href = live;
        liveLink.target = "_blank";
        liveLink.rel = "noopener noreferrer";
        liveLink.setAttribute("aria-label", project.name + " live site, opens in a new tab");
        liveLink.appendChild(icon("i-external"));
        tools.appendChild(liveLink);
      }
      top.appendChild(mark);
      top.appendChild(tools);

      var title = document.createElement("h3");
      title.id = project.id + "-title";
      title.textContent = project.name;
      var summary = document.createElement("p");
      summary.className = "summary";
      summary.textContent = project.summary;
      var tags = document.createElement("ul");
      tags.className = "tags";
      (project.tags || []).forEach(function (tag) {
        var tagItem = document.createElement("li");
        tagItem.className = "tag";
        tagItem.textContent = tag;
        tags.appendChild(tagItem);
      });
      var hint = document.createElement("span");
      hint.className = "visually-hidden";
      hint.textContent = "Press Enter for details. Double-click to copy.";
      var tick = document.createElement("span");
      tick.className = "copied-mark";
      tick.setAttribute("aria-hidden", "true");
      tick.appendChild(icon("i-check"));

      card.appendChild(top);
      card.appendChild(title);
      card.appendChild(summary);
      card.appendChild(tags);
      card.appendChild(hint);
      card.appendChild(tick);

      card.addEventListener("mousedown", function (event) {
        if (event.target.closest("a")) return;
        if (event.detail > 1) return;
        event.preventDefault();
      });
      card.addEventListener("click", function (event) {
        if (event.target.closest("a")) return;
        if (event.detail > 1) return;
        scheduleOpen(index);
      });
      card.addEventListener("dblclick", function (event) {
        if (event.target.closest("a")) return;
        event.preventDefault();
        window.clearTimeout(pendingOpen);
        copyCard(project, card);
        openPanel(index);
      });

      item.appendChild(card);
      list.appendChild(item);
      cards.push(card);
    });
  }

  function typingTarget(target) {
    if (!target || !target.tagName) return false;
    var tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
  }

  cardSlider.addEventListener("input", function () {
    markResizing();
    applyCardSize(cardScaleFromPercent(cardSlider.value), true);
  });
  panelSlider.addEventListener("input", function () {
    markResizing();
    applyPanelSize(panelSlider.value, true);
  });
  themeButton.addEventListener("click", toggleTheme);
  panelClose.addEventListener("click", closePanel);
  helpOpen.addEventListener("click", function () {
    help.showModal();
  });
  helpClose.addEventListener("click", function () {
    help.close();
  });

  document.addEventListener("keydown", function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    var key = event.key;

    if (key === "Escape") {
      if (help.open) return;
      closePanel();
      return;
    }

    if (help.open) {
      if (key === "?") {
        event.preventDefault();
        help.close();
      }
      return;
    }

    if (typingTarget(event.target) && key !== "?") return;

    if (key === "?") {
      event.preventDefault();
      if (help.open) help.close();
      else help.showModal();
      return;
    }

    if (key === "t" || key === "T") {
      event.preventDefault();
      toggleTheme();
      return;
    }

    if (key === "Enter" || key === " ") {
      if (event.target.closest && event.target.closest("a, button")) return;
      var focusedCard = event.target.closest ? event.target.closest(".card") : null;
      if (!focusedCard) return;
      event.preventDefault();
      openPanel(cards.indexOf(focusedCard));
      return;
    }

    var next = key === "j" || key === "J" || key === "ArrowDown" || key === "ArrowRight";
    var prev = key === "k" || key === "K" || key === "ArrowUp" || key === "ArrowLeft";
    if (next || prev) {
      event.preventDefault();
      move(next ? 1 : -1);
    }
  });

  render();
  applyCardSize(readNumber("jk-card-size", 100, cardScaleMin, cardScaleMax), false);
  applyPanelSize(readNumber("jk-panel-size", 50, 30, 70), false);
  setTheme(document.documentElement.getAttribute("data-theme"));

  var hashId = location.hash.replace(/^#/, "");
  var hashIndex = projects.findIndex(function (project) {
    return project.id === hashId;
  });
  if (hashIndex >= 0) openPanel(hashIndex);
})();
