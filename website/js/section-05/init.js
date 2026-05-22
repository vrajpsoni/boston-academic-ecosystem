/**
 * Section 05 — orchestrator (cinematic scroll climax).
 */
(function (global) {
  "use strict";

  var initialized = false;
  var cinemaApi = null;

  function setStatus(root, msg, isError) {
    var el = root.querySelector("[data-econ-status]");
    if (!el) {
      return;
    }
    el.textContent = msg;
    el.hidden = !msg;
    el.classList.toggle("econ-status--error", !!isError);
  }

  function initSection(root) {
    if (initialized || !root) {
      return;
    }
    initialized = true;
    root.classList.add("econ-cinema--loading");
    setStatus(root, "Loading financial data…", false);

    if (global.Section05Ambient) {
      global.Section05Ambient.bind(root);
    }

    global.Section05DataLoader.loadScale()
      .then(function (data) {
        setStatus(root, "", false);
        root.classList.remove("econ-cinema--loading");
        root.classList.add("econ-cinema--ready");

        if (global.Section05ScrollCinema) {
          cinemaApi = global.Section05ScrollCinema.bind(root, data);
        }
      })
      .catch(function (err) {
        console.error("[section-05]", err);
        setStatus(root, "Unable to load financial data.", true);
        root.classList.remove("econ-cinema--loading");
      });
  }

  global.Section05Init = {
    init: initSection,
  };
})(typeof window !== "undefined" ? window : this);
