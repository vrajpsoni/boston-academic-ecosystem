/**
 * Create and manage Leaflet map instance.
 * @global
 */
(function (global) {
  "use strict";

  /**
   * @param {string} containerId
   * @returns {L.Map}
   */
  function createMap(containerId) {
    if (typeof global.L === "undefined") {
      throw new Error("Leaflet is not loaded");
    }

    var container = document.getElementById(containerId);
    if (!container) {
      throw new Error("Map container not found: " + containerId);
    }

    var placeholder = container.querySelector(".map-canvas__placeholder");
    if (placeholder) {
      placeholder.remove();
    }

    container.classList.add("map-canvas--ready");
    container.setAttribute("role", "application");
    container.setAttribute(
      "aria-label",
      "Interactive map of Greater Boston academic institutions"
    );

    var cfg = global.MapConfig;
    var map = global.L.map(containerId, {
      center: cfg.defaultCenter,
      zoom: cfg.defaultZoom,
      scrollWheelZoom: false,
      minZoom: 7,
      maxZoom: 16,
    });

    global.L.tileLayer(cfg.tileUrl, {
      attribution: cfg.tileAttribution,
      maxZoom: 19,
    }).addTo(map);

    map.on("click", function () {
      map.scrollWheelZoom.enable();
    });

    map.on("mouseout", function () {
      map.scrollWheelZoom.disable();
    });

    return map;
  }

  global.EcosystemLeafletMap = {
    createMap: createMap,
  };
})(typeof window !== "undefined" ? window : this);
