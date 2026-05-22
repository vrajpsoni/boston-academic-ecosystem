/**
 * Section 04B — Business & Social Growth (ecosystem constellation prototype).
 * @global
 */
(function (global) {
  "use strict";

  var booted = false;

  async function boot04B() {
    if (booted) {
      return;
    }
    booted = true;

    var site = global.SiteConfig;
    var cfg = global.Section04BConfig;
    var statusEl = document.getElementById(site.section04b.statusId);
    var rootEl = document.getElementById(site.section04b.canvasId);

    if (!rootEl) {
      return;
    }

    try {
      if (statusEl) {
        statusEl.textContent = "Tracing ecosystem connections…";
      }

      var businessIndex = await global.Section04LayerData.loadLayerIndex(cfg.viz.businessCsvPath);
      var corridorIndex = await global.Section04BConstellation.loadCorridorIndex(
        cfg.viz.corridorCsvPath
      );
      var housingIndex = await global.Section04LayerData.loadLayerIndex(cfg.viz.housingCsvPath);
      var innovationIndex = await global.Section04LayerData.loadLayerIndex(cfg.viz.innovationCsvPath);
      var institutions = await global.Section04BConstellation.loadInstitutions(
        cfg.viz.ecosystemCsvPath
      );
      var activityIndex = await global.Section04BConstellation.loadActivityIndex(
        cfg.viz.activityCsvPath
      );

      var hubModels = global.Section04BConstellation.buildHubModels(
        cfg.hubs,
        businessIndex,
        corridorIndex,
        housingIndex,
        innovationIndex,
        cfg.satellites,
        institutions,
        cfg.tiers,
        activityIndex
      );

      if (statusEl) {
        statusEl.remove();
      }

      global.Section04BConstellation.renderConstellation(rootEl, hubModels, cfg);
      rootEl.setAttribute("aria-busy", "false");
      var shell = rootEl.closest(".ecosystem-constellation-shell");
      if (shell) {
        shell.classList.add("ecosystem-constellation-shell--ready");
      }

      var vizBlock = document.querySelector(
        "#" + global.SiteConfig.sections.section04b + " .section-04-viz"
      );
      if (vizBlock) {
        vizBlock.classList.add("is-revealed");
      }
    } catch (err) {
      console.error("[section-04b]", err);
      if (statusEl) {
        statusEl.textContent = "Unable to load the ecosystem visualization.";
      }
      rootEl.setAttribute("aria-busy", "false");
    }
  }

  function initSection04B() {
    var root = document.getElementById(global.SiteConfig.sections.section04b);
    if (!root) {
      return;
    }
    global.Section04LazyInit.lazyInitWhenVisible(root, boot04B);
  }

  global.initSection04B = initSection04B;
})(typeof window !== "undefined" ? window : this);
