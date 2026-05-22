/**
 * Leaflet map constants (bounds, zoom, category styles).
 * Stub — full implementation in next phase.
 * @global
 */
(function (global) {
  "use strict";

  global.MapConfig = {
    /* Greater Boston metro — closer than full-state view on first load */
    defaultCenter: [42.355, -71.1],
    defaultZoom: 12,
    greaterBostonBounds: [
      [42.23, -71.2],
      [42.4, -70.95],
    ],
    tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    tileAttribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    categoryStyles: {
      university: { color: "#2166AC", label: "University" },
      college: { color: "#4393C3", label: "College" },
      student_housing: { color: "#E08214", label: "Student housing zone" },
      research_institute: { color: "#4DAF4A", label: "Research institute" },
      medical_research: { color: "#D6604D", label: "Medical / research center" },
    },
  };
})(typeof window !== "undefined" ? window : this);
