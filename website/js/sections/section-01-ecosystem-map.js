/**
 * Section 01: Greater Boston Academic Ecosystem Map orchestrator.
 * @global
 */
(function (global) {
  "use strict";

  async function initEcosystemMapSection() {
    var config = global.SiteConfig;
    var canvas = document.getElementById(config.mapCanvasId);
    var statusEl = document.getElementById(config.mapStatusId);

    if (!canvas) {
      console.warn("[section-01] Map container not found:", config.mapCanvasId);
      return;
    }

    if (typeof global.L === "undefined") {
      if (statusEl) {
        statusEl.textContent = "Map library failed to load. Please refresh the page.";
      }
      return;
    }

    try {
      if (statusEl) {
        statusEl.textContent = "Loading map data…";
      }

      var points = await global.EcosystemDataLoader.loadEcosystemPoints(
        config.ecosystemCsv
      );

      if (!points.length) {
        if (statusEl) {
          statusEl.textContent = "No map locations found in the dataset.";
        }
        return;
      }

      var map = global.EcosystemLeafletMap.createMap(config.mapCanvasId);
      global.EcosystemMarkers.addMarkers(map, points);
      global.EcosystemLegendControl.attachLegend(map);
      global.EcosystemResetViewControl.attachDefaultViewControl(map);

      setTimeout(function () {
        map.invalidateSize();
      }, 100);
    } catch (err) {
      console.error("[section-01]", err);
      if (statusEl) {
        statusEl.textContent =
          "Unable to load the map. Run a local server from the website folder (see README).";
      }
    }
  }

  global.initEcosystemMapSection = initEcosystemMapSection;
})(typeof window !== "undefined" ? window : this);
