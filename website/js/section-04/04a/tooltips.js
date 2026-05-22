/**
 * Section 04A hover tooltips (compact card).
 * @global
 */
(function (global) {
  "use strict";

  function buildTooltipHtml(geoId, name, layerIndex, vizConfig) {
    var metrics = global.Section04LayerData.getBucket(layerIndex, geoId, name);
    var lines = ['<div class="section-04-map-tooltip__inner section-04-map-tooltip__inner--compact">'];
    lines.push('<p class="section-04-map-tooltip__name">' + (name || "Neighborhood") + "</p>");

    if (!metrics) {
      lines.push('<p class="section-04-map-tooltip__compact">No data</p></div>');
      return lines.join("");
    }

    var intensity = metrics[vizConfig.metricKey];
    var count = metrics[vizConfig.contextCountKey];
    var mappedPct = global.Section04EcosystemContext.shareOfMapped(
      geoId,
      layerIndex,
      vizConfig.contextCountKey,
      name
    );

    var pct =
      intensity != null
        ? global.Section04EcosystemContext.formatPercent(intensity * 100)
        : "—";
    var countStr = global.Section04EcosystemContext.formatInteger(count);
    var shareStr =
      mappedPct != null ? global.Section04EcosystemContext.formatPercent(mappedPct) : "—";

    lines.push(
      '<p class="section-04-map-tooltip__compact"><span class="section-04-map-tooltip__compact-k">Conc.</span> ' +
        pct +
        "</p>"
    );
    lines.push(
      '<p class="section-04-map-tooltip__compact"><span class="section-04-map-tooltip__compact-k">Est.</span> ' +
        countStr +
        "</p>"
    );
    lines.push(
      '<p class="section-04-map-tooltip__compact"><span class="section-04-map-tooltip__compact-k">Share</span> ' +
        shareStr +
        "</p>"
    );
    lines.push("</div>");
    return lines.join("");
  }

  global.Section04ATooltips = {
    buildTooltipHtml: buildTooltipHtml,
  };
})(typeof window !== "undefined" ? window : this);
