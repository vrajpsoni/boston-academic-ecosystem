/**
 * Cinematic outro — ambient atmosphere + configurable source links.
 * Wire hrefs via SiteConfig.sources (empty href = placeholder until final URLs).
 */
(function (global) {
  "use strict";

  function getSourcesConfig() {
    var cfg = global.SiteConfig || {};
    return cfg.sources || {};
  }

  function resolveLink(entry) {
    if (!entry || typeof entry !== "object") {
      return { href: "#", external: true, placeholder: true };
    }
    var href = entry.href != null ? String(entry.href).trim() : "";
    var placeholder = !href || href === "#";
    return {
      href: placeholder ? "#" : href,
      label: entry.label,
      external: entry.external !== false,
      placeholder: placeholder,
    };
  }

  function applySourceLink(el, entry) {
    if (!el) {
      return;
    }
    var link = resolveLink(entry);
    if (link.label && !el.textContent.trim()) {
      el.textContent = link.label;
    }
    el.setAttribute("href", link.href);
    if (link.placeholder) {
      el.setAttribute("data-source-placeholder", "true");
      el.setAttribute("aria-disabled", "true");
      el.removeAttribute("target");
      el.removeAttribute("rel");
    } else {
      el.removeAttribute("data-source-placeholder");
      el.removeAttribute("aria-disabled");
      if (link.external) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      } else {
        el.removeAttribute("target");
        el.removeAttribute("rel");
      }
    }
  }

  function wireSourceLinks(root) {
    var sources = getSourcesConfig();
    var outroLinks = sources.outro || {};

    root.querySelectorAll("[data-source-key]").forEach(function (el) {
      var key = el.getAttribute("data-source-key");
      applySourceLink(el, outroLinks[key]);
    });
  }

  function bindOutroAmbient(root) {
    var host = root.querySelector("[data-outro-ambient]");
    if (!host) {
      return;
    }

    if (
      global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    var canvas = document.createElement("canvas");
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var particles = [];
    var count = 22;
    var running = true;
    var io = null;

    function resize() {
      var rect = host.getBoundingClientRect();
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles = [];
      var w = host.clientWidth;
      var h = host.clientHeight;
      for (var i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.35 + Math.random() * 1,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.05,
          a: 0.03 + Math.random() * 0.07,
        });
      }
    }

    function frame(t) {
      if (!running) {
        return;
      }
      var w = host.clientWidth;
      var h = host.clientHeight;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) {
          p.x = w;
        }
        if (p.x > w) {
          p.x = 0;
        }
        if (p.y < 0) {
          p.y = h;
        }
        if (p.y > h) {
          p.y = 0;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(201, 162, 39, " + p.a + ")";
        ctx.fill();
      });
      global.requestAnimationFrame(frame);
    }

    function start() {
      resize();
      seed();
      global.requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
    }

    if ("IntersectionObserver" in global) {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (!running) {
                running = true;
                start();
              }
            } else {
              stop();
            }
          });
        },
        { threshold: 0.05 }
      );
      io.observe(root);
    } else {
      start();
    }

    global.addEventListener("resize", function () {
      resize();
      seed();
    });
  }

  function initStoryOutro() {
    var root = document.getElementById("story-outro");
    if (!root) {
      wireSourceLinks(document);
      return;
    }

    wireSourceLinks(document);
    bindOutroAmbient(root);

    document.querySelectorAll("[data-source-placeholder='true']").forEach(function (el) {
      el.addEventListener("click", function (event) {
        event.preventDefault();
      });
    });
  }

  global.initStoryOutro = initStoryOutro;
})(typeof window !== "undefined" ? window : this);
