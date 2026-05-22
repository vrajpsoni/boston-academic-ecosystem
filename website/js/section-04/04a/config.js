/**
 * Section 04A — Student-Centered Neighborhoods (choropleth).
 * @global
 */
(function (global) {
  "use strict";

  global.Section04AConfig = {
    mapDefaults: {
      defaultCenter: [42.36, -71.08],
      defaultZoom: 11,
      tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      tileAttribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      noDataFill: "#e8edf2",
      strokeColor: "rgba(31, 78, 121, 0.45)",
      strokeWeight: 1.25,
    },
    viz: {
      csvPath: "data/layer_a_housing_pressure.csv?v=20260522a",
      metricKey: "population_age_20_24_share",
      contextCountKey: "population_age_20_24",
      legendTitle: "Student-Centered Neighborhoods",
      metricLabel: "Estimated ecosystem concentration (neighborhood index)",
      colors: ["#e8f4fc", "#c5e8f4", "#7ec8e3", "#4a9bb8", "#1f6b8a"],
      legendLow: "Lighter blue — lower concentration",
      legendHigh: "Darker blue — stronger student-centered patterns",
      legendNote:
        "Boston neighborhoods plus adjacent academically connected cities (Cambridge, Somerville, Chelsea, Revere, Medford). Hover for estimated counts and share of mapped concentration.",
      mappedConcentrationLabel: "mapped ecosystem concentration (Boston + spillover)",
      showEcosystemReference: true,
      tooltipCompact: true,
      tooltipMaxWidth: 148,
      tooltipSmartDirection: true,
      mapAriaLabel: "Student-centered neighborhood concentration map",
      hoverStrokeColor: "rgba(31, 78, 121, 0.75)",
    },
  };
})(typeof window !== "undefined" ? window : this);
