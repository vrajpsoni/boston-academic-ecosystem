/**
 * Load long-format layer CSV → Map<geo_id, metrics>.
 * @global
 */
(function (global) {
  "use strict";

  function parseCsv(text) {
    if (typeof Papa !== "undefined") {
      return Papa.parse(text, { header: true, skipEmptyLines: true }).data || [];
    }
    return [];
  }

  function toNumber(val) {
    if (val === null || val === undefined) {
      return null;
    }
    var n = parseFloat(String(val).trim());
    return isNaN(n) ? null : n;
  }

  function loadLayerIndex(url) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to load " + url + " (" + res.status + ")");
        }
        return res.text();
      })
      .then(function (text) {
        var index = new Map();
        var byName = new Map();
        parseCsv(text).forEach(function (row) {
          var geoId = (row.geo_id || "").trim();
          var key = (row.metric_key || "").trim();
          if (!geoId || !key) {
            return;
          }
          if (!index.has(geoId)) {
            index.set(geoId, {});
          }
          var bucket = index.get(geoId);
          bucket[key] = toNumber(row.metric_value);
          if (row.geo_name) {
            bucket._geoName = String(row.geo_name).trim();
            byName.set(bucket._geoName.toLowerCase(), bucket);
          }
        });
        index.forEach(function (metrics) {
          var cafes = metrics.osm_cafe_count || 0;
          var restaurants = metrics.osm_restaurant_count || 0;
          if (metrics.osm_cafe_count != null || metrics.osm_restaurant_count != null) {
            metrics.osm_social_poi_total = cafes + restaurants;
          }
        });
        index._byName = byName;
        return index;
      });
  }

  /**
   * Resolve metrics by geo_id, with optional neighborhood-name fallback.
   * @param {Map} layerIndex
   * @param {string} geoId
   * @param {string} [geoName]
   * @returns {object|null}
   */
  function getBucket(layerIndex, geoId, geoName) {
    if (!layerIndex) {
      return null;
    }
    if (geoId && layerIndex.has(geoId)) {
      return layerIndex.get(geoId);
    }
    var nameKey = (geoName || "").trim().toLowerCase();
    if (nameKey && layerIndex._byName && layerIndex._byName.has(nameKey)) {
      return layerIndex._byName.get(nameKey);
    }
    return null;
  }

  function hasBucket(layerIndex, geoId, geoName) {
    return getBucket(layerIndex, geoId, geoName) != null;
  }

  function metricValue(layerIndex, geoId, geoName, metricKey) {
    var bucket = getBucket(layerIndex, geoId, geoName);
    if (!bucket) {
      return null;
    }
    var v = bucket[metricKey];
    return v != null && !isNaN(v) ? v : null;
  }

  global.Section04LayerData = {
    loadLayerIndex: loadLayerIndex,
    getBucket: getBucket,
    hasBucket: hasBucket,
    metricValue: metricValue,
  };
})(typeof window !== "undefined" ? window : this);
