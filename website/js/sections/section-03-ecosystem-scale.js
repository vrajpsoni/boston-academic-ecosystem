/**
 * Section 03: Ecosystem-scale enrollment — hero counter + supporting metrics.
 * @global
 */
(function (global) {
  "use strict";

  var METRIC_DISPLAY = {
    international_students: {
      label: "International students",
      sublabel: "Nonresident enrollment where reported",
      group: "primary",
    },
    domestic_students: {
      label: "Domestic students",
      sublabel: "Complements international to match total",
      group: "primary",
    },
    out_of_state_students: {
      label: "Out-of-state students",
      sublabel: "Separate context · not added to total above",
      group: "context",
    },
  };

  var PRIMARY_METRICS = ["international_students", "domestic_students"];
  var CONTEXT_METRICS = ["out_of_state_students"];

  var counterRaf = null;
  var counterToken = 0;

  function parseMetrics(rows) {
    var map = {};
    rows.forEach(function (row) {
      var key = (row.Metric || "").trim();
      var raw = String(row.Value || "").trim();
      if (!key || raw === "") {
        return;
      }
      var num = parseInt(raw.replace(/,/g, ""), 10);
      map[key] = {
        value: isNaN(num) ? raw : num,
        isNumeric: !isNaN(num),
        institutionCount: row.InstitutionCount,
        yearRange: row.DataYearRange || "",
        source: row.Source || "",
        notes: row.Notes || "",
      };
    });
    return map;
  }

  function formatInteger(n) {
    return n.toLocaleString("en-US");
  }

  function parseDisplayedInteger(el) {
    if (!el || !el.textContent) {
      return 0;
    }
    var n = parseInt(String(el.textContent).replace(/[^0-9]/g, ""), 10);
    return isNaN(n) ? 0 : n;
  }

  function cancelCounterAnimation() {
    counterToken += 1;
    if (counterRaf) {
      global.cancelAnimationFrame(counterRaf);
      counterRaf = null;
    }
  }

  function animateCounter(el, target, durationMs, startValue) {
    if (!el || target === null || isNaN(target)) {
      return;
    }

    cancelCounterAnimation();
    var token = counterToken;

    var reduced =
      global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      el.textContent = formatInteger(target);
      return;
    }

    var start =
      startValue != null && !isNaN(startValue)
        ? Math.max(0, Math.min(startValue, target))
        : 0;
    var startTime = null;
    el.classList.add("is-counting");

    function step(timestamp) {
      if (token !== counterToken) {
        return;
      }
      if (!startTime) {
        startTime = timestamp;
      }
      var progress = Math.min((timestamp - startTime) / durationMs, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = formatInteger(current);

      if (progress < 1) {
        counterRaf = global.requestAnimationFrame(step);
      } else {
        counterRaf = null;
        el.classList.remove("is-counting");
      }
    }

    counterRaf = global.requestAnimationFrame(step);
  }

  function normalizeMetrics(metrics) {
    var total = metrics.total_students;
    if (!total || !total.isNumeric) {
      return metrics;
    }

    var intl = metrics.international_students;
    var intlVal = intl && intl.isNumeric ? intl.value : 0;

    metrics.domestic_students = {
      value: Math.max(0, total.value - intlVal),
      isNumeric: true,
    };

    return metrics;
  }

  function renderMetricCard(key, data, meta) {
    var card = document.createElement("div");
    card.className =
      "ecosystem-scale-metric story-reveal" +
      (meta.group === "context" ? " ecosystem-scale-metric--context" : "");
    card.setAttribute("data-story-reveal", "");
    card.setAttribute("role", "listitem");

    var valueEl = document.createElement("span");
    valueEl.className = "ecosystem-scale-metric__value";
    valueEl.textContent = formatInteger(data.value);

    var labelEl = document.createElement("span");
    labelEl.className = "ecosystem-scale-metric__label";
    labelEl.textContent = meta.label;

    card.appendChild(valueEl);
    card.appendChild(labelEl);

    if (meta.sublabel) {
      var subEl = document.createElement("span");
      subEl.className = "ecosystem-scale-metric__sublabel";
      subEl.textContent = meta.sublabel;
      card.appendChild(subEl);
    }

    return card;
  }

  function renderSupportingMetrics(container, metrics) {
    if (!container) {
      return;
    }

    container.innerHTML = "";
    metrics = normalizeMetrics(metrics);

    var primary = document.createElement("div");
    primary.className = "ecosystem-scale-metrics__grid ecosystem-scale-metrics__grid--primary";
    primary.setAttribute("role", "list");
    primary.setAttribute("aria-label", "Enrollment split that matches ecosystem total");

    PRIMARY_METRICS.forEach(function (key) {
      var data = metrics[key];
      var meta = METRIC_DISPLAY[key];
      if (!data || !meta || !data.isNumeric) {
        return;
      }
      primary.appendChild(renderMetricCard(key, data, meta));
    });

    container.appendChild(primary);

    var sumNote = document.createElement("p");
    sumNote.className = "ecosystem-scale-metrics__sum story-reveal";
    sumNote.setAttribute("data-story-reveal", "");
    var intl = metrics.international_students.value;
    var dom = metrics.domestic_students.value;
    sumNote.textContent =
      "International + domestic = " +
      formatInteger(intl + dom) +
      " (matches ecosystem total)";
    container.appendChild(sumNote);

    var context = document.createElement("div");
    context.className = "ecosystem-scale-metrics__context";
    CONTEXT_METRICS.forEach(function (key) {
      var data = metrics[key];
      var meta = METRIC_DISPLAY[key];
      if (!data || !meta || !data.isNumeric) {
        return;
      }
      context.appendChild(renderMetricCard(key, data, meta));
    });
    if (context.childNodes.length) {
      container.appendChild(context);
    }
  }

  /**
   * Replay hero counter whenever Section 03 re-enters view (from §02 or §04).
   */
  function observeSectionCounter(heroEl, sectionEl, target) {
    if (!heroEl || !sectionEl || target == null || isNaN(target)) {
      return;
    }

    var sectionActive = false;
    var playLock = false;

    function play() {
      if (playLock) {
        return;
      }
      playLock = true;

      var current = parseDisplayedInteger(heroEl);
      var isReplay = current > 0 && current < target;
      var startVal = isReplay ? Math.round(target * 0.88) : 0;
      var duration = isReplay ? 1500 : 2200;

      animateCounter(heroEl, target, duration, startVal);

      global.setTimeout(function () {
        playLock = false;
      }, duration + 200);
    }

    if (!("IntersectionObserver" in global)) {
      play();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.22) {
            if (!sectionActive) {
              sectionActive = true;
              play();
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.04) {
            if (sectionActive) {
              sectionActive = false;
            }
          }
        });
      },
      {
        threshold: [0, 0.04, 0.12, 0.22, 0.4],
        rootMargin: "0px 0px -5% 0px",
      }
    );

    observer.observe(sectionEl);
  }

  function spawnParticles(container, count) {
    if (!container) {
      return;
    }

    for (var i = 0; i < count; i += 1) {
      var dot = document.createElement("span");
      dot.className = "ecosystem-scale__particle";
      dot.setAttribute("aria-hidden", "true");
      dot.style.left = Math.random() * 100 + "%";
      dot.style.top = Math.random() * 100 + "%";
      dot.style.animationDelay = Math.random() * 8 + "s";
      container.appendChild(dot);
    }
  }

  async function initEcosystemScaleSection() {
    var config = global.SiteConfig;
    var sectionEl = document.getElementById(config.sections.ecosystemScale);
    var heroEl = document.getElementById("ecosystem-scale-hero-value");
    var metricsEl = document.getElementById("ecosystem-scale-metrics");
    var yearEl = document.getElementById("ecosystem-scale-hero-year");
    var countEl = document.getElementById("ecosystem-scale-institution-count");
    var particlesEl = document.getElementById("ecosystem-scale-particles");

    spawnParticles(particlesEl, 28);

    try {
      var url = config.ecosystemEnrollmentCsv;
      var response = await fetch(url);
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      var text = await response.text();
      if (typeof Papa === "undefined") {
        throw new Error("CSV parser (Papa Parse) failed to load");
      }
      var parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      var metrics = normalizeMetrics(parseMetrics(parsed.data));
      var total = metrics.total_students;

      if (!total) {
        throw new Error("Missing total_students metric");
      }

      var reporting = metrics.reporting_label;
      var yearRange = metrics.data_year_range;

      if (yearEl) {
        if (reporting && !reporting.isNumeric) {
          yearEl.textContent = reporting.value;
        } else if (yearRange && !yearRange.isNumeric) {
          yearEl.textContent =
            "Most recent publicly available records (" + yearRange.value + ")";
        } else {
          yearEl.textContent = "Latest reported enrollment · official sources";
        }
      }
      if (countEl && total.institutionCount) {
        countEl.textContent =
          total.institutionCount + " institutions on the ecosystem map";
      }

      if (heroEl && sectionEl) {
        heroEl.textContent = "0";
        observeSectionCounter(heroEl, sectionEl, total.value);
      }

      renderSupportingMetrics(metricsEl, metrics);

      if (typeof global.observeStoryRevealNodes === "function") {
        global.observeStoryRevealNodes(metricsEl);
      }
    } catch (err) {
      console.error("[section-03-ecosystem-scale]", err);
      if (heroEl) {
        heroEl.textContent = "—";
      }
    }
  }

  global.initEcosystemScaleSection = initEcosystemScaleSection;
})(typeof window !== "undefined" ? window : this);
