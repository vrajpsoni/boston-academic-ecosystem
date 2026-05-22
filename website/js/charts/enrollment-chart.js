/**
 * Section 02 — Plotly enrollment timeline with metric switching.
 * @global
 */
(function (global) {
  "use strict";

  var UNIVERSITY_COLORS = {
    "Harvard University": "#1f4e79",
    MIT: "#2563eb",
    "Boston University": "#c2410c",
    "Northeastern University": "#0d9488",
    "UMass Boston": "#7c3aed",
    "Boston College": "#b45309",
  };

  var LEGEND_ORDER = [
    "Harvard University",
    "MIT",
    "Boston University",
    "Northeastern University",
    "UMass Boston",
    "Boston College",
  ];

  var METRICS = {
    total: {
      key: "total",
      label: "Total",
      yAxis: "Student population",
      hoverLabel: "Students",
      tooltipNote: "Total fall enrollment",
    },
    domestic: {
      key: "domestic",
      label: "Domestic",
      yAxis: "Student population",
      hoverLabel: "Domestic students",
      tooltipNote: "Domestic students",
    },
    international: {
      key: "international",
      label: "International",
      yAxis: "Student population",
      hoverLabel: "International students",
      tooltipNote: "International students",
    },
    outOfState: {
      key: "outOfState",
      label: "Out-of-state",
      yAxis: "Student population",
      hoverLabel: "Out-of-state students",
      tooltipNote: "First-time FT undergrads (out-of-state)",
    },
  };

  var BASE_LINE_WIDTH = 2.5;
  var HOVER_LINE_WIDTH = 4.5;
  var BASE_MARKER = 6;
  var HOVER_MARKER = 9;
  var BASE_OPACITY = 1;
  var DIM_OPACITY = 0.2;

  var TRANSITION = { duration: 380, easing: "cubic-in-out" };

  function buildTraces(seriesByUniversity, metricKey) {
    var metric = METRICS[metricKey] || METRICS.total;

    return LEGEND_ORDER.filter(function (name) {
      return seriesByUniversity[name];
    }).map(function (name) {
      var series = seriesByUniversity[name];
      var color = UNIVERSITY_COLORS[name] || "#4b5563";
      var points = series.years.map(function (year, i) {
        return { year: year, value: series.values[i] };
      }).filter(function (p) {
        return p.value !== null && p.value !== undefined && !isNaN(p.value);
      });

      return {
        type: "scatter",
        mode: "lines+markers",
        name: name,
        x: points.map(function (p) {
          return p.year;
        }),
        y: points.map(function (p) {
          return p.value;
        }),
        line: {
          color: color,
          width: BASE_LINE_WIDTH,
          shape: "spline",
          smoothing: 0.65,
        },
        marker: {
          color: color,
          size: BASE_MARKER,
          line: { color: "#ffffff", width: 1.5 },
        },
        hovertemplate:
          "<b>%{fullData.name}</b><br>" +
          "<span style='color:#6b7280;font-size:12px'>%{x}</span><br>" +
          "<b style='font-size:15px'>%{y:,}</b> " +
          metric.hoverLabel.toLowerCase() +
          "<extra></extra>",
        connectgaps: false,
      };
    });
  }

  function buildLayout(metricKey) {
    var metric = METRICS[metricKey] || METRICS.total;

    return {
      autosize: true,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: {
        family: 'Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
        color: "#4b5563",
        size: 13,
      },
      margin: { t: 16, r: 20, b: 52, l: 68, pad: 4 },
      xaxis: {
        title: {
          text: "2004 → 2023",
          font: { size: 12, color: "#6b7280", weight: 500 },
          standoff: 10,
        },
        tickfont: { size: 12, color: "#6b7280" },
        gridcolor: "rgba(31, 78, 121, 0.06)",
        gridwidth: 1,
        zeroline: false,
        linecolor: "rgba(31, 78, 121, 0.12)",
        linewidth: 1,
        dtick: 2,
        fixedrange: false,
      },
      yaxis: {
        title: {
          text: metric.yAxis,
          font: { size: 12, color: "#6b7280", weight: 500 },
          standoff: 6,
        },
        tickfont: { size: 12, color: "#6b7280" },
        gridcolor: "rgba(31, 78, 121, 0.06)",
        gridwidth: 1,
        zeroline: false,
        linecolor: "rgba(31, 78, 121, 0.12)",
        linewidth: 1,
        tickformat: ",",
        separatethousands: true,
        fixedrange: false,
      },
      hovermode: "closest",
      hoverlabel: {
        bgcolor: "#ffffff",
        bordercolor: "rgba(31, 78, 121, 0.35)",
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 13,
          color: "#1f2937",
        },
        align: "left",
        namelength: -1,
      },
      legend: {
        orientation: "h",
        yanchor: "bottom",
        y: 1.02,
        xanchor: "left",
        x: 0,
        bgcolor: "rgba(0,0,0,0)",
        borderwidth: 0,
        font: { size: 11, color: "#4b5563" },
        itemclick: "toggleothers",
        itemdoubleclick: "toggle",
      },
      showlegend: true,
    };
  }

  function buildConfig(animate) {
    var config = {
      responsive: true,
      displayModeBar: false,
      displaylogo: false,
      scrollZoom: false,
    };
    if (animate) {
      config.transition = TRANSITION;
    }
    return config;
  }

  function attachHoverEmphasis(chartEl, traceCount) {
    function setEmphasis(highlightIndex) {
      var opacities = [];
      var widths = [];
      var markerSizes = [];

      for (var i = 0; i < traceCount; i++) {
        if (highlightIndex === null) {
          opacities.push(BASE_OPACITY);
          widths.push(BASE_LINE_WIDTH);
          markerSizes.push(BASE_MARKER);
        } else if (i === highlightIndex) {
          opacities.push(BASE_OPACITY);
          widths.push(HOVER_LINE_WIDTH);
          markerSizes.push(HOVER_MARKER);
        } else {
          opacities.push(DIM_OPACITY);
          widths.push(1.25);
          markerSizes.push(4);
        }
      }

      global.Plotly.restyle(chartEl, {
        opacity: opacities,
        "line.width": widths,
        "marker.size": markerSizes,
      });
    }

    chartEl.on("plotly_hover", function (event) {
      if (event.points && event.points[0]) {
        setEmphasis(event.points[0].curveNumber);
      }
    });

    chartEl.on("plotly_unhover", function () {
      setEmphasis(null);
    });
  }

  function attachResize(container, chartEl) {
    var resizeTimer;

    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        global.Plotly.Plots.resize(chartEl);
      }, 120);
    }

    window.addEventListener("resize", onResize);

    if (typeof global.ResizeObserver !== "undefined") {
      var ro = new global.ResizeObserver(onResize);
      ro.observe(container);
    }
  }

  /**
   * @param {HTMLElement} container
   * @param {Object} dataByMetric — { total: seriesByUniversity, domestic: … }
   */
  function createEnrollmentChart(container, dataByMetric) {
    if (!global.Plotly) {
      throw new Error("Plotly is not loaded");
    }

    var chartEl = null;
    var currentMetric = "total";
    var hoverAttached = false;

    function renderMetric(metricKey, animate) {
      var series = dataByMetric[metricKey];
      if (!series) {
        return Promise.resolve();
      }

      var traces = buildTraces(series, metricKey);
      if (!traces.length) {
        return Promise.resolve();
      }

      var layout = buildLayout(metricKey);
      currentMetric = metricKey;

      if (!chartEl) {
        container.innerHTML = "";
        container.classList.add("enrollment-chart--ready");
        container.setAttribute("aria-busy", "false");

        return global.Plotly.newPlot(
          container,
          traces,
          layout,
          buildConfig(false)
        ).then(function (el) {
          chartEl = el;
          if (!hoverAttached) {
            attachHoverEmphasis(chartEl, traces.length);
            attachResize(container, chartEl);
            hoverAttached = true;
          }
          return chartEl;
        });
      }

      return global.Plotly.react(
        chartEl,
        traces,
        layout,
        buildConfig(animate)
      ).then(function (el) {
        chartEl = el;
        return chartEl;
      });
    }

    return {
      setMetric: function (metricKey, animate) {
        return renderMetric(metricKey, animate !== false);
      },
      getMetric: function () {
        return currentMetric;
      },
      getChartEl: function () {
        return chartEl;
      },
      initialRender: function () {
        return renderMetric("total", false);
      },
    };
  }

  global.EnrollmentChart = {
    UNIVERSITY_COLORS: UNIVERSITY_COLORS,
    LEGEND_ORDER: LEGEND_ORDER,
    METRICS: METRICS,
    create: createEnrollmentChart,
  };
})(typeof window !== "undefined" ? window : this);
