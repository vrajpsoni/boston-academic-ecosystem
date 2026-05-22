/**
 * Add markers and tooltips from ecosystem points.
 * @global
 */
(function (global) {
  "use strict";

  function getCategoryMeta(category) {
    var styles = global.MapConfig.categoryStyles;
    return styles[category] || styles.university;
  }

  function getMarkerStyle(category) {
    var meta = getCategoryMeta(category);
    var style = {
      radius: 7,
      fillColor: meta.color,
      color: "#ffffff",
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.85,
    };

    switch (category) {
      case "college":
        style.radius = 5;
        break;
      case "student_housing":
        style.radius = 10;
        style.fillOpacity = 0.4;
        style.weight = 2;
        style.color = meta.color;
        break;
      case "research_institute":
        style.radius = 6;
        style.fillOpacity = 0.9;
        break;
      case "medical_research":
        style.radius = 7;
        style.fillOpacity = 0.9;
        break;
      default:
        break;
    }

    return style;
  }

  function buildTooltip(point) {
    var meta = getCategoryMeta(point.category);
    return (
      "<strong>" +
      escapeHtml(point.name) +
      "</strong><br><span class=\"map-tooltip__category\">" +
      escapeHtml(meta.label) +
      "</span>"
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * @param {L.Map} map
   * @param {object[]} points
   * @returns {L.LayerGroup}
   */
  function addMarkers(map, points) {
    if (typeof global.L === "undefined") {
      throw new Error("Leaflet is not loaded");
    }

    var group = global.L.layerGroup();

    points.forEach(function (point) {
      var marker = global.L.circleMarker([point.lat, point.lon], getMarkerStyle(point.category));
      marker.bindTooltip(buildTooltip(point), {
        direction: "top",
        offset: [0, -6],
        opacity: 0.95,
      });
      marker.bindPopup(buildTooltip(point), { maxWidth: 240 });
      marker.addTo(group);
    });

    group.addTo(map);
    return group;
  }

  global.EcosystemMarkers = {
    addMarkers: addMarkers,
  };
})(typeof window !== "undefined" ? window : this);
