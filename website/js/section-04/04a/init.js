/**
 * Section 04A — Student-Centered Neighborhoods (locked choropleth).
 * @global
 */
(function (global) {
  "use strict";

  var booted = false;

  async function boot04A() {
    if (booted) {
      return;
    }
    booted = true;

    var site = global.SiteConfig;
    var cfg = global.Section04AConfig;
    var statusEl = document.getElementById(site.section04a.statusId);
    var canvasId = site.section04a.canvasId;

    if (typeof global.L === "undefined") {
      if (statusEl) {
        statusEl.textContent = "Map library failed to load.";
      }
      return;
    }

    try {
      if (statusEl) {
        statusEl.textContent = "Loading neighborhood data…";
      }

      await global.Section04EcosystemContext.loadEcosystemTotals(
        site.ecosystemEnrollmentCsv
      );

      function dataUrl(path) {
        if (!path || /^https?:\/\//i.test(path)) {
          return path;
        }
        var normalized = String(path).replace(/^\//, "");
        var base = (site.dataBaseUrl || "").replace(/\/$/, "");
        if (!base || normalized.indexOf(base + "/") === 0 || normalized === base) {
          return normalized;
        }
        return base + "/" + normalized;
      }

      var geojson = await global.Section04GeoJson.loadGeoJson(dataUrl(site.neighborhoodGeoJson));
      var layerIndex = await global.Section04LayerData.loadLayerIndex(dataUrl(cfg.viz.csvPath));

      global.Section04EcosystemContext.computeMappedTotal(
        geojson,
        layerIndex,
        cfg.viz.contextCountKey
      );

      var map = global.Section04Choropleth.createLockedMap(canvasId, cfg.mapDefaults);
      var choropleth = global.Section04Choropleth.addChoropleth(
        map,
        geojson,
        layerIndex,
        cfg.viz,
        cfg.mapDefaults,
        global.Section04ATooltips.buildTooltipHtml
      );

      global.Section04Legend.attachLegend(map, cfg.viz, choropleth.getBreaks);

      var vizBlock = document.querySelector(
        "#" + global.SiteConfig.sections.section04a + " .section-04-viz"
      );
      if (vizBlock) {
        vizBlock.classList.add("is-revealed");
      }
    } catch (err) {
      console.error("[section-04a]", err);
      var canvas = document.getElementById(canvasId);
      if (canvas && statusEl) {
        canvas.appendChild(statusEl);
        statusEl.textContent = "Unable to load the neighborhood map.";
      }
    }
  }

  function initSection04A() {
    var root = document.getElementById(global.SiteConfig.sections.section04a);
    if (!root) {
      return;
    }
    global.Section04LazyInit.lazyInitWhenVisible(root, boot04A);
  }

  global.initSection04A = initSection04A;
})(typeof window !== "undefined" ? window : this);
