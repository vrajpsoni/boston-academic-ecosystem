/**
 * Boston neighborhood boundaries for Section 04 map subsections.
 * @global
 */
(function (global) {
  "use strict";

  function loadGeoJson(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to load GeoJSON (" + res.status + ")");
      }
      return res.json();
    });
  }

  function geoIdFromProperties(props) {
    if (props.geo_id != null && String(props.geo_id).trim()) {
      return String(props.geo_id).trim();
    }
    var raw = props.neighborhood_id != null ? props.neighborhood_id : props.OBJECTID;
    var id = String(raw || "").trim();
    if (!id) {
      return "";
    }
    if (id.length === 1) {
      id = "0" + id;
    } else if (id.length > 2) {
      id = id.slice(-2);
    }
    return "bos_nbhd_" + id;
  }

  global.Section04GeoJson = {
    loadGeoJson: loadGeoJson,
    geoIdFromProperties: geoIdFromProperties,
  };
})(typeof window !== "undefined" ? window : this);
