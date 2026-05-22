/**
 * Editorial map legend (per-subsection viz config).
 * @global
 */
(function (global) {
  "use strict";

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function attachLegend(map, vizConfig, getBreaksFn) {
    var LegendControl = global.L.Control.extend({
      options: { position: "bottomleft" },

      onAdd: function () {
        this._container = global.L.DomUtil.create("div", "section-04-map-legend");
        global.L.DomEvent.disableClickPropagation(this._container);
        this._render();
        return this._container;
      },

      _render: function () {
        if (!this._container) {
          return;
        }
        var stops = vizConfig.colors
          .map(function (c, i) {
            return c + " " + (i / (vizConfig.colors.length - 1)) * 100 + "%";
          })
          .join(", ");

        var eco = global.Section04EcosystemContext.getEcosystemTotals();
        var mapped = global.Section04EcosystemContext.getMappedTotal();
        var extra = "";

        if (vizConfig.showEcosystemReference && eco.totalStudents) {
          extra +=
            '<p class="section-04-map-legend__ecosystem">Greater Boston enrolled ecosystem: <strong>' +
            global.Section04EcosystemContext.formatInteger(eco.totalStudents) +
            "</strong></p>";
        }
        if (mapped && vizConfig.mappedConcentrationLabel) {
          extra +=
            '<p class="section-04-map-legend__mapped">' +
            escapeHtml(vizConfig.mappedConcentrationLabel) +
            ": <strong>" +
            global.Section04EcosystemContext.formatInteger(mapped) +
            "</strong></p>";
        }

        this._container.innerHTML =
          '<p class="section-04-map-legend__title">' +
          escapeHtml(vizConfig.legendTitle) +
          "</p>" +
          '<p class="section-04-map-legend__metric">' +
          escapeHtml(vizConfig.metricLabel) +
          "</p>" +
          '<div class="section-04-map-legend__bar" style="background:linear-gradient(90deg,' +
          stops +
          ')" aria-hidden="true"></div>' +
          '<div class="section-04-map-legend__labels">' +
          '<span>' +
          escapeHtml(vizConfig.legendLow) +
          "</span><span>" +
          escapeHtml(vizConfig.legendHigh) +
          "</span></div>" +
          extra +
          '<p class="section-04-map-legend__note">' +
          escapeHtml(vizConfig.legendNote) +
          "</p>";
      },
    });

    var control = new LegendControl();
    control.addTo(map);
    return control;
  }

  global.Section04Legend = {
    attachLegend: attachLegend,
  };
})(typeof window !== "undefined" ? window : this);
