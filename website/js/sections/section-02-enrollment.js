/**
 * Section 02: Enrollment trends — CSV, metric toggles, Plotly timeline.
 * @global
 */
(function (global) {
  "use strict";

  var METRIC_KEYS = ["total", "domestic", "outOfState", "international"];

  var CSV_FIELDS = {
    total: "Total",
    domestic: "Domestic",
    international: "International",
    outOfState: "OutOfState",
  };

  var ATTRIBUTION_NOTES = {
    total: "Total fall enrollment",
    domestic: "Domestic students, where reported",
    outOfState: "Out-of-state students among first-time undergraduates, where reported",
    international: "International students, where reported",
  };

  function parseValue(raw) {
    if (raw === null || raw === undefined) {
      return null;
    }
    var trimmed = String(raw).trim();
    if (trimmed === "") {
      return null;
    }
    var n = parseInt(trimmed, 10);
    return isNaN(n) ? null : n;
  }

  function parseEnrollmentData(rows) {
    var dataByMetric = {};

    METRIC_KEYS.forEach(function (key) {
      dataByMetric[key] = {};
    });

    rows.forEach(function (row) {
      var university = (row.University || "").trim();
      var year = parseInt(row.Year, 10);

      if (!university || !year) {
        return;
      }

      METRIC_KEYS.forEach(function (key) {
        var value = parseValue(row[CSV_FIELDS[key]]);

        if (!dataByMetric[key][university]) {
          dataByMetric[key][university] = { years: [], values: [] };
        }

        dataByMetric[key][university].years.push(year);
        dataByMetric[key][university].values.push(value);
      });
    });

    METRIC_KEYS.forEach(function (key) {
      Object.keys(dataByMetric[key]).forEach(function (name) {
        var series = dataByMetric[key][name];
        var combined = series.years.map(function (y, i) {
          return { year: y, value: series.values[i] };
        });
        combined.sort(function (a, b) {
          return a.year - b.year;
        });
        series.years = combined.map(function (d) {
          return d.year;
        });
        series.values = combined.map(function (d) {
          return d.value;
        });
      });
    });

    return dataByMetric;
  }

  function hasMetricData(dataByMetric, key) {
    var series = dataByMetric[key];
    if (!series) {
      return false;
    }
    return Object.keys(series).some(function (name) {
      return series[name].values.some(function (v) {
        return v !== null;
      });
    });
  }

  function loadEnrollmentCsv(url) {
    return new Promise(function (resolve, reject) {
      if (typeof global.Papa === "undefined") {
        reject(new Error("Papa Parse is not loaded"));
        return;
      }

      global.Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          if (results.errors && results.errors.length) {
            console.warn("[section-02] CSV parse warnings:", results.errors);
          }
          resolve(results.data || []);
        },
        error: function (err) {
          reject(err);
        },
      });
    });
  }

  function initMetricToggles(toggleRoot, chartController, attributionEl) {
    if (!toggleRoot) {
      return;
    }

    var buttons = toggleRoot.querySelectorAll(".enrollment-metric-toggle__btn");

    function setActive(metricKey) {
      buttons.forEach(function (btn) {
        var isActive = btn.getAttribute("data-metric") === metricKey;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-selected", isActive ? "true" : "false");
        btn.tabIndex = isActive ? 0 : -1;
      });

      if (attributionEl && global.EnrollmentChart.METRICS[metricKey]) {
        var note = ATTRIBUTION_NOTES[metricKey] || "";
        attributionEl.textContent = note + ".";
      }

      var chart = document.getElementById(global.SiteConfig.enrollmentChartId);
      if (chart) {
        var label =
          global.EnrollmentChart.METRICS[metricKey].label + " enrollment by university, 2004 to 2023";
        chart.setAttribute("aria-label", label);
      }
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var metric = btn.getAttribute("data-metric");
        if (!metric || btn.disabled) {
          return;
        }
        chartController.setMetric(metric, true);
        setActive(metric);
      });

      btn.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
          return;
        }
        event.preventDefault();
        var list = Array.prototype.slice.call(buttons).filter(function (b) {
          return !b.disabled;
        });
        var idx = list.indexOf(btn);
        var next =
          event.key === "ArrowRight"
            ? list[(idx + 1) % list.length]
            : list[(idx - 1 + list.length) % list.length];
        next.focus();
        next.click();
      });
    });

    return setActive;
  }

  async function initEnrollmentSection() {
    var config = global.SiteConfig;
    var container = document.getElementById(config.enrollmentChartId);
    var statusEl = document.getElementById(config.enrollmentChartStatusId);
    var toggleRoot = document.getElementById("enrollment-metric-toggle");
    var attributionDetail = document.getElementById("enrollment-attribution-detail");

    if (!container) {
      console.warn("[section-02] Chart container not found:", config.enrollmentChartId);
      return;
    }

    if (typeof global.EnrollmentChart === "undefined") {
      if (statusEl) {
        statusEl.textContent = "Chart module failed to load. Please refresh the page.";
      }
      return;
    }

    try {
      if (statusEl) {
        statusEl.textContent = "Loading enrollment data…";
      }

      var rows = await loadEnrollmentCsv(config.enrollmentCsv);
      var dataByMetric = parseEnrollmentData(rows);

      if (!hasMetricData(dataByMetric, "total")) {
        if (statusEl) {
          statusEl.textContent = "No enrollment data found in the dataset.";
        }
        return;
      }

      if (toggleRoot) {
        toggleRoot.querySelectorAll(".enrollment-metric-toggle__btn").forEach(function (btn) {
          var key = btn.getAttribute("data-metric");
          if (!hasMetricData(dataByMetric, key)) {
            btn.disabled = true;
            btn.setAttribute("aria-disabled", "true");
            btn.title = "Limited data for this category in the dataset";
          }
        });
      }

      var chartController = global.EnrollmentChart.create(container, dataByMetric);
      await chartController.initialRender();

      if (statusEl) {
        statusEl.remove();
      }

      var setActive = initMetricToggles(toggleRoot, chartController, attributionDetail);
      if (setActive) {
        setActive("total");
      }
    } catch (err) {
      console.error("[section-02] Enrollment chart failed:", err);
      if (statusEl) {
        statusEl.textContent = "Unable to load enrollment chart. Please refresh the page.";
      }
      container.classList.remove("enrollment-chart--ready");
      container.setAttribute("aria-busy", "false");
    }
  }

  global.initEnrollmentSection = initEnrollmentSection;
})(typeof window !== "undefined" ? window : this);
