/**
 * Section 05 — subtle ambient canvas (particles + grid drift).
 */
(function (global) {
  "use strict";

  function bindAmbient(root) {
    var host = root.querySelector("[data-econ-ambient]");
    if (!host) {
      return;
    }

    var reduced =
      global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      return;
    }

    var canvas = document.createElement("canvas");
    canvas.className = "econ-ambient__canvas";
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var particles = [];
    var count = 36;
    var running = true;

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
          r: 0.4 + Math.random() * 1.2,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.08,
          a: 0.04 + Math.random() * 0.1,
        });
      }
    }

    function drawGrid(w, h, t) {
      ctx.strokeStyle = "rgba(61, 158, 255, 0.03)";
      ctx.lineWidth = 1;
      var spacing = 72;
      var offset = (t * 0.008) % spacing;
      for (var x = -spacing; x < w + spacing; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x + offset, 0);
        ctx.lineTo(x + offset, h);
        ctx.stroke();
      }
      for (var y = -spacing; y < h + spacing; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y + offset * 0.6);
        ctx.lineTo(w, y + offset * 0.6);
        ctx.stroke();
      }
    }

    function frame(t) {
      if (!running) {
        return;
      }
      var w = host.clientWidth;
      var h = host.clientHeight;
      ctx.clearRect(0, 0, w, h);
      drawGrid(w, h, t);

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
        ctx.fillStyle = "rgba(201, 162, 39, " + p.a + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      global.requestAnimationFrame(frame);
    }

    resize();
    seed();
    global.requestAnimationFrame(frame);

    if ("ResizeObserver" in global) {
      var ro = new ResizeObserver(function () {
        resize();
        seed();
      });
      ro.observe(host);
    } else {
      global.addEventListener("resize", resize);
    }
  }

  global.Section05Ambient = { bind: bindAmbient };
})(typeof window !== "undefined" ? window : this);
