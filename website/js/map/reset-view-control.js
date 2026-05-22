/**
 * "Default view" control — reset map to initial Massachusetts viewport.
 * @global
 */
(function (global) {
  "use strict";

  var DefaultViewControl = global.L.Control.extend({
    options: {
      position: "topright",
    },

    onAdd: function (map) {
      var cfg = global.MapConfig;
      var container = global.L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-default-view"
      );
      var button = global.L.DomUtil.create("button", "leaflet-default-view__btn", container);
      button.type = "button";
      button.title = "Reset to default view";
      button.setAttribute("aria-label", "Reset map to default view");
      button.textContent = "Default view";

      global.L.DomEvent.disableClickPropagation(container);
      global.L.DomEvent.on(button, "click", function (e) {
        global.L.DomEvent.preventDefault(e);
        map.setView(cfg.defaultCenter, cfg.defaultZoom);
      });

      return container;
    },
  });

  /**
   * @param {L.Map} map
   * @returns {L.Control}
   */
  function attachDefaultViewControl(map) {
    if (typeof global.L === "undefined") {
      throw new Error("Leaflet is not loaded");
    }
    var control = new DefaultViewControl();
    control.addTo(map);
    return control;
  }

  global.EcosystemResetViewControl = {
    attachDefaultViewControl: attachDefaultViewControl,
  };
})(typeof window !== "undefined" ? window : this);
