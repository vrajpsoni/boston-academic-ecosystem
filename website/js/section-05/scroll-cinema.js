/**
 * Section 05 — auto-play cinematic build-up (viewport-triggered).
 */
(function (global) {
  "use strict";

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function shortName(name) {
    return name
      .replace("University of Massachusetts Boston", "UMass Boston")
      .replace("Massachusetts Institute of Technology", "MIT")
      .replace("All other map institutions", "All Other Institutions");
  }

  function categoryValue(inst, cat) {
    if (cat.key === "other") {
      return inst.otherOpex || 0;
    }
    return inst[cat.key] || 0;
  }

  function categoryColor(cfg, key) {
    var found = cfg.categories.filter(function (c) {
      return c.key === key;
    })[0];
    return found ? found.color : "rgba(148, 163, 184, 0.5)";
  }

  function appendLaneSegments(bar, inst, cfg) {
    cfg.categories.forEach(function (cat) {
      var val = categoryValue(inst, cat);
      if (!val || val <= 0) {
        return;
      }
      var seg = document.createElement("span");
      seg.className = "econ-lane__segment";
      seg.style.width = ((val / inst.opex) * 100) + "%";
      seg.style.background = cat.color;
      bar.appendChild(seg);
    });
  }

  function categoryNoteText(inst, cfg) {
    if (inst.unitid === cfg.othersId) {
      return (
        "Twenty-two map-scope schools aggregated; IPEDS functional lines are not shown per institution."
      );
    }
    if (inst.unitid === 167987) {
      return (
        "Category mapping is partial; most reported operating expenses remain in Other."
      );
    }
    if (inst.partialCategoryNote) {
      return (
        "Functional expense categories are partially reported in IPEDS public (F1A) forms."
      );
    }
    return "";
  }

  function ringStrokeColor(color) {
    return color.replace(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/,
      function (_, r, g, b, a) {
        var alpha = Math.min(1, parseFloat(a, 10) * 1.06 + 0.16);
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha.toFixed(2) + ")";
      }
    );
  }

  function buildRingGradient(categories) {
    var n = categories.length;
    var step = 100 / n;
    var stops = [];

    categories.forEach(function (cat, i) {
      var color = ringStrokeColor(cat.color);
      var start = (i * step).toFixed(2);
      var end = ((i + 1) * step).toFixed(2);
      stops.push(color + " " + start + "% " + end + "%");
    });

    return "conic-gradient(from -90deg, " + stops.join(", ") + ")";
  }

  function progressToRingDegrees(progress, count, fmt) {
    var step = 360 / count;
    var deg = 0;
    var i;

    for (i = 0; i < count; i += 1) {
      var t = clamp(progress * count - i, 0, 1);
      deg += step * fmt.easeOutCubic(t);
    }

    return deg;
  }

  function buildContinuousProgressRing(progressEl, compositionEl, ghostEl, cfg) {
    var categories = cfg.categories;
    var gradient = buildRingGradient(categories);

    progressEl.style.setProperty("--econ-ring-gradient", gradient);
    compositionEl.style.setProperty("--econ-ring-progress", "0deg");
    ghostEl.style.setProperty("opacity", "0.38");

    return {
      progressEl: progressEl,
      compositionEl: compositionEl,
      ghostEl: ghostEl,
      count: categories.length,
    };
  }

  function updateContinuousProgress(ringState, progress, complete, fmt) {
    var deg = progressToRingDegrees(progress, ringState.count, fmt);

    ringState.compositionEl.style.setProperty("--econ-ring-progress", deg + "deg");
    ringState.compositionEl.classList.toggle("is-active", progress > 0.02);
    ringState.compositionEl.classList.toggle("is-complete", complete || progress >= 0.995);

    if (complete) {
      ringState.ghostEl.style.opacity = "0.22";
    } else {
      ringState.ghostEl.style.opacity = String(0.42 - 0.24 * clamp(progress, 0, 1));
    }
  }

  function totalPlaybackMs(cfg, buildCount) {
    var p = cfg.playback;
    return (
      p.introMs +
      buildCount * p.institutionMs +
      p.othersPulseMs +
      p.lockupHoldMs
    );
  }

  function buildLanes(container, data, cfg) {
    var fmt = global.Section05Format;
    var frag = document.createDocumentFragment();

    data.build.forEach(function (inst) {
      var isOthers = inst.unitid === cfg.othersId;
      var lane = document.createElement("div");
      lane.className = "econ-lane" + (isOthers ? " econ-lane--others" : "");
      lane.setAttribute("role", "listitem");
      lane.dataset.unitid = String(inst.unitid);

      var name = document.createElement("p");
      name.className = "econ-lane__name";
      name.textContent = shortName(inst.name);

      var track = document.createElement("div");
      track.className = "econ-lane__track";

      var fill = document.createElement("div");
      fill.className = "econ-lane__fill";
      fill.style.setProperty("--lane-scale", String(inst.widthShare));

      var bar = document.createElement("div");
      bar.className = "econ-lane__bar";
      bar.style.setProperty("--lane-progress", "0");

      appendLaneSegments(bar, inst, cfg);

      track.appendChild(fill);
      track.appendChild(bar);

      var amountWrap = document.createElement("div");
      var amount = document.createElement("p");
      amount.className = "econ-lane__amount";
      amount.textContent = fmt.formatUsdCompact(inst.opex);
      amountWrap.appendChild(amount);

      if (isOthers) {
        var sub = document.createElement("p");
        sub.className = "econ-lane__sub";
        sub.textContent =
          cfg.othersSchoolCount +
          " additional institutions · " +
          fmt.formatUsdCompact(inst.opex) +
          " combined";
        amountWrap.appendChild(sub);
      }

      lane.appendChild(name);
      lane.appendChild(track);
      lane.appendChild(amountWrap);
      frag.appendChild(lane);
    });

    container.appendChild(frag);
    return container.querySelectorAll(".econ-lane");
  }

  function renderDetail(detailEl, inst, cfg) {
    var fmt = global.Section05Format;
    var nameEl = detailEl.querySelector("[data-econ-detail-name]");
    var opexEl = detailEl.querySelector("[data-econ-detail-opex]");
    var noteEl = detailEl.querySelector("[data-econ-detail-note]");
    var catsEl = detailEl.querySelector("[data-econ-detail-cats]");

    nameEl.textContent = inst.name;
    opexEl.textContent =
      fmt.formatUsdCompact(inst.opex) + " operating expenses · " + cfg.fiscalLabel;

    var note = categoryNoteText(inst, cfg);
    if (note) {
      noteEl.hidden = false;
      noteEl.textContent = note;
    } else {
      noteEl.hidden = true;
      noteEl.textContent = "";
    }

    catsEl.innerHTML = "";
    cfg.categories.forEach(function (cat) {
      var val = categoryValue(inst, cat);
      var share = inst.opex ? val / inst.opex : 0;
      var color = categoryColor(cfg, cat.key);
      var li = document.createElement("li");
      li.className = "econ-cinema__detail-cat";
      if (cat.key === "other") {
        li.classList.add("econ-cinema__detail-cat--other");
      }
      li.dataset.catKey = cat.key;
      li.innerHTML =
        '<p class="econ-cinema__detail-cat-label">' +
        cat.label +
        '</p><p class="econ-cinema__detail-cat-val">' +
        (val > 0 ? fmt.formatUsdCompact(val) : "$0") +
        '</p><div class="econ-cinema__detail-cat-bar"><span class="econ-cinema__detail-cat-bar-fill" style="--cat-fill:' +
        share +
        "; --cat-color:" +
        color +
        '"></span></div>';
      catsEl.appendChild(li);
    });
  }

  function bindCinema(root, data) {
    var cfg = global.Section05Config;
    var fmt = global.Section05Format;
    var reduced =
      global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var sectionEl =
      root.closest("#academic-economy") ||
      root.closest("article") ||
      root;
    var stageEl = root.querySelector("[data-econ-sticky]") || root;
    var heroValue = root.querySelector("[data-econ-hero-value]");
    var lanesEl = root.querySelector("[data-econ-lanes]");
    var detailEl = root.querySelector("[data-econ-detail]");
    var lockupEl = root.querySelector("[data-econ-lockup]");
    var progressRing = root.querySelector("[data-econ-progress]");
    var progressComposition = root.querySelector("[data-econ-progress-composition]");
    var progressGhost = root.querySelector("[data-econ-progress-ghost]");
    var ringState =
      progressRing && progressComposition && progressGhost
        ? buildContinuousProgressRing(
            progressRing,
            progressComposition,
            progressGhost,
            cfg
          )
        : null;

    var laneEls = buildLanes(lanesEl, data, cfg);
    var buildCount = data.build.length;
    var phases = cfg.phases;
    var introEnd = phases.introEnd;
    var buildEnd = phases.buildEnd;
    var othersEnd = phases.othersEnd;
    var instSlice = (buildEnd - introEnd) / buildCount;
    var durationMs = totalPlaybackMs(cfg, buildCount);

    var progress = 0;
    var displayedTotal = 0;
    var targetTotal = 0;
    var playing = false;
    var complete = false;
    var sectionActive = false;
    var lastFrameTime = 0;
    var rafId = null;
    var io = null;

    function institutionProgress(index) {
      if (progress < introEnd) {
        return 0;
      }
      var start = introEnd + index * instSlice;
      var end = start + instSlice;
      return clamp((progress - start) / (end - start), 0, 1);
    }

    function computeTarget() {
      if (progress >= buildEnd) {
        return data.totalOpex;
      }
      if (progress < introEnd) {
        return 0;
      }
      for (var i = 0; i < buildCount; i += 1) {
        var ip = institutionProgress(i);
        var eased = fmt.easeOutCubic(ip);
        if (ip >= 1) {
          continue;
        }
        if (ip > 0) {
          var prev = i > 0 ? data.build[i - 1].cumulativeOpex : 0;
          return lerp(prev, data.build[i].cumulativeOpex, eased);
        }
        return i > 0 ? data.build[i - 1].cumulativeOpex : 0;
      }
      return data.build[buildCount - 1].cumulativeOpex;
    }

    function ensureDetailPlaceholder() {
      if (detailEl.querySelector(".econ-cinema__detail-placeholder")) {
        return;
      }
      var ph = document.createElement("p");
      ph.className = "econ-cinema__detail-placeholder";
      ph.textContent =
        "Hover an institution to explore where operating expenses concentrate.";
      detailEl.appendChild(ph);
    }

    function applyFrame() {
      targetTotal = computeTarget();

      laneEls.forEach(function (lane, i) {
        var inst = data.build[i];
        var ip = institutionProgress(i);
        var visible = ip > 0.02;
        var laneComplete = ip >= 0.98;

        lane.classList.toggle("is-visible", visible);
        lane.classList.toggle("is-complete", laneComplete);
        lane.querySelector(".econ-lane__bar").style.setProperty(
          "--lane-progress",
          String(fmt.easeOutCubic(ip))
        );

        if (inst.unitid === cfg.othersId) {
          lane.classList.toggle(
            "is-complete",
            progress >= buildEnd - instSlice * 0.45
          );
        }
      });

      root.classList.toggle(
        "econ-cinema--others-pulse",
        progress >= buildEnd && progress < othersEnd
      );
      root.classList.toggle("econ-cinema--playing", playing);
      root.classList.toggle("econ-cinema--interact", progress >= othersEnd);
      root.classList.toggle("econ-cinema--complete", complete);
      lockupEl.classList.toggle("is-visible", progress >= othersEnd);

      if (progress >= othersEnd) {
        ensureDetailPlaceholder();
      }
      detailEl.classList.toggle("is-open", progress >= othersEnd);
      detailEl.hidden = progress < othersEnd * 0.85;
      detailEl.setAttribute(
        "aria-hidden",
        progress < othersEnd ? "true" : "false"
      );

      heroValue.classList.toggle("is-settled", progress >= buildEnd);

      laneEls.forEach(function (lane) {
        lane.setAttribute("tabindex", progress >= othersEnd ? "0" : "-1");
      });

      if (ringState) {
        updateContinuousProgress(ringState, progress, complete, fmt);
      }
      if (progressRing) {
        var showRing = progress > 0.02 || playing || complete;
        progressRing.classList.toggle("is-visible", showRing);
        progressRing.classList.toggle("is-resolved", complete);
      }
    }

    function setProgress(value) {
      progress = clamp(value, 0, 1);
      applyFrame();
    }

    function finishPlayback() {
      playing = false;
      complete = true;
      setProgress(1);
      displayedTotal = data.totalOpex;
      targetTotal = data.totalOpex;
      heroValue.textContent = fmt.formatUsdHero(data.totalOpex);
      root.dispatchEvent(
        new CustomEvent("econ-playback-complete", { bubbles: true })
      );
    }

    function tick(now) {
      if (!lastFrameTime) {
        lastFrameTime = now;
      }
      var dt = now - lastFrameTime;
      lastFrameTime = now;

      if (playing && !complete) {
        progress += dt / durationMs;
        if (progress >= 1) {
          finishPlayback();
        } else {
          applyFrame();
        }
      }

      displayedTotal = lerp(displayedTotal, targetTotal, 0.22);
      if (Math.abs(displayedTotal - targetTotal) < 8000) {
        displayedTotal = targetTotal;
      }
      heroValue.textContent = fmt.formatUsdHero(displayedTotal);

      rafId = global.requestAnimationFrame(tick);
    }

    function startPlayback(isReplay) {
      if (playing) {
        return;
      }
      if (complete && !isReplay) {
        setProgress(1);
        return;
      }

      playing = true;
      root.classList.add("econ-cinema--ready");

      if (isReplay && complete) {
        complete = false;
        progress = cfg.playback.replayFromProgress;
        durationMs = cfg.playback.replayDurationMs;
      } else if (!complete && progress > 0 && progress < 1) {
        durationMs = (1 - progress) * totalPlaybackMs(cfg, buildCount);
      } else {
        progress = 0;
        displayedTotal = 0;
        durationMs = totalPlaybackMs(cfg, buildCount);
        laneEls.forEach(function (lane) {
          lane.classList.remove("is-visible", "is-complete", "is-active");
          lane.querySelector(".econ-lane__bar").style.setProperty(
            "--lane-progress",
            "0"
          );
        });
      }

      applyFrame();
    }

    function pausePlayback() {
      playing = false;
      root.classList.remove("econ-cinema--playing");
    }

    function setReducedState() {
      finishPlayback();
      bindHover();
    }

    function bindHover() {
      laneEls.forEach(function (lane) {
        var uid = lane.dataset.unitid;
        var inst = data.build.filter(function (d) {
          return String(d.unitid) === uid;
        })[0];
        if (!inst) {
          return;
        }

        function focus() {
          if (progress < othersEnd) {
            return;
          }
          laneEls.forEach(function (l) {
            var on = l.dataset.unitid === uid;
            l.classList.toggle("is-active", on);
            l.classList.toggle("is-hovered", on);
            l.classList.toggle("is-dimmed", !on);
          });
          var ph = detailEl.querySelector(".econ-cinema__detail-placeholder");
          if (ph) {
            ph.remove();
          }
          renderDetail(detailEl, inst, cfg);
        }

        function blur() {
          laneEls.forEach(function (l) {
            l.classList.remove("is-active", "is-hovered", "is-dimmed");
          });
          if (progress >= othersEnd) {
            ensureDetailPlaceholder();
          }
        }

        lane.addEventListener("mouseenter", focus);
        lane.addEventListener("focus", focus);
        lane.addEventListener("mouseleave", blur);
        lane.addEventListener("blur", blur);
        lane.setAttribute("tabindex", progress >= othersEnd ? "0" : "-1");
      });
    }

    function observeSection() {
      if (!("IntersectionObserver" in global)) {
        startPlayback(false);
        return;
      }

      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (
              entry.isIntersecting &&
              entry.intersectionRatio >= cfg.observe.startRatio
            ) {
              if (!sectionActive) {
                sectionActive = true;
                if (complete) {
                  setProgress(1);
                } else {
                  startPlayback(false);
                }
              } else if (complete) {
                setProgress(1);
              } else if (!playing && progress > 0 && progress < 1) {
                startPlayback(false);
              }
            } else if (
              !entry.isIntersecting ||
              entry.intersectionRatio < cfg.observe.stopRatio
            ) {
              if (sectionActive) {
                sectionActive = false;
                pausePlayback();
              }
            }
          });
        },
        {
          threshold: [0, 0.06, 0.12, 0.22, 0.28, 0.4, 0.55],
          rootMargin: "0px 0px -8% 0px",
        }
      );

      io.observe(stageEl);
    }

    root.classList.add("econ-cinema--ready");
    bindHover();

    if (reduced) {
      setReducedState();
      return {
        destroy: function () {
          if (io) {
            io.disconnect();
          }
          if (rafId) {
            global.cancelAnimationFrame(rafId);
          }
        },
      };
    }

    rafId = global.requestAnimationFrame(tick);
    observeSection();

    return {
      destroy: function () {
        pausePlayback();
        if (io) {
          io.disconnect();
        }
        if (rafId) {
          global.cancelAnimationFrame(rafId);
        }
      },
    };
  }

  global.Section05ScrollCinema = { bind: bindCinema };
})(typeof window !== "undefined" ? window : this);
