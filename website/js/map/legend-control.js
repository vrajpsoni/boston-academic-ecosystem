/**
 * Leaflet custom legend control (bottom-left).
 * @global
 */
(function (global) {
  "use strict";

  var LEGEND_ORDER = [
    "university",
    "college",
    "student_housing",
    "research_institute",
    "medical_research",
  ];

  var LegendControl = global.L.Control.extend({
    options: {
      position: "bottomleft",
    },

    onAdd: function () {
      var container = global.L.DomUtil.create("div", "leaflet-legend");
      var styles = global.MapConfig.categoryStyles;
      var html =
        '<p class="leaflet-legend__title">Legend</p><ul class="leaflet-legend__list">';

      LEGEND_ORDER.forEach(function (key) {
        var meta = styles[key];
        if (!meta) {
          return;
        }
        html +=
          '<li class="leaflet-legend__item leaflet-legend__item--' +
          key +
          '">' +
          '<span class="leaflet-legend__swatch" aria-hidden="true"></span>' +
          '<span>' +
          meta.label +
          "</span></li>";
      });

      html += "</ul>";
      container.innerHTML = html;
      global.L.DomEvent.disableClickPropagation(container);
      return container;
    },
  });

  /**
   * @param {L.Map} map
   * @returns {L.Control}
   */
  function attachLegend(map) {
    if (typeof global.L === "undefined") {
      throw new Error("Leaflet is not loaded");
    }
    var control = new LegendControl();
    control.addTo(map);
    return control;
  }

  global.EcosystemLegendControl = {
    attachLegend: attachLegend,
  };
})(typeof window !== "undefined" ? window : this);
