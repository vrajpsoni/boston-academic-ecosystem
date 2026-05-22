/**
 * Section 03 ecosystem totals — contextual reference for 04A tooltips/legend.
 * @global
 */
(function (global) {
  "use strict";

  var ecosystemTotals = { totalStudents: null, yearRange: "", loaded: false };
  var mappedTotal = null;

  function parseEcosystemCsv(text) {
    if (typeof Papa === "undefined") {
      return null;
    }
    var out = {};
    Papa.parse(text, { header: true, skipEmptyLines: true }).data.forEach(function (row) {
      var key = (row.Metric || "").trim();
      var raw = String(row.Value || "").trim().replace(/,/g, "");
      if (!key) {
        return;
      }
      var num = parseInt(raw, 10);
      out[key] = isNaN(num) ? raw : num;
    });
    return out;
  }

  function loadEcosystemTotals(url) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Ecosystem CSV " + res.status);
        }
        return res.text();
      })
      .then(function (text) {
        var parsed = parseEcosystemCsv(text);
        if (parsed && typeof parsed.total_students === "number") {
          ecosystemTotals.totalStudents = parsed.total_students;
          ecosystemTotals.yearRange = parsed.data_year_range || "2023–2025";
          ecosystemTotals.loaded = true;
        }
      })
      .catch(function () {
        ecosystemTotals.totalStudents = 235824;
        ecosystemTotals.yearRange = "2023–2025";
        ecosystemTotals.loaded = true;
      });
  }

  function formatInteger(n) {
    if (n == null || isNaN(n)) {
      return "—";
    }
    return Math.round(n).toLocaleString("en-US");
  }

  function formatPercent(pct, digits) {
    if (pct == null || isNaN(pct)) {
      return "—";
    }
    return pct.toFixed(digits == null ? 1 : digits) + "%";
  }

  function computeMappedTotal(geojson, layerIndex, countKey) {
    var geoIdFn = global.Section04GeoJson.geoIdFromProperties;
    var layerData = global.Section04LayerData;
    var sum = 0;
    (geojson.features || []).forEach(function (feat) {
      var props = feat.properties || {};
      var geoId = geoIdFn(props);
      var v = layerData.metricValue(layerIndex, geoId, props.name, countKey);
      if (v != null && !isNaN(v)) {
        sum += v;
      }
    });
    mappedTotal = sum;
  }

  function shareOfMapped(geoId, layerIndex, countKey, geoName) {
    if (!mappedTotal) {
      return null;
    }
    var v = global.Section04LayerData.metricValue(
      layerIndex,
      geoId,
      geoName,
      countKey
    );
    if (v == null || isNaN(v)) {
      return null;
    }
    return (v / mappedTotal) * 100;
  }

  function getEcosystemTotals() {
    return ecosystemTotals;
  }

  function getMappedTotal() {
    return mappedTotal;
  }

  global.Section04EcosystemContext = {
    loadEcosystemTotals: loadEcosystemTotals,
    computeMappedTotal: computeMappedTotal,
    getEcosystemTotals: getEcosystemTotals,
    getMappedTotal: getMappedTotal,
    shareOfMapped: shareOfMapped,
    formatInteger: formatInteger,
    formatPercent: formatPercent,
  };
})(typeof window !== "undefined" ? window : this);
