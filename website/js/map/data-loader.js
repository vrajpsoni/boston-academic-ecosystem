/**
 * Fetch and parse ecosystem CSV.
 * @global
 */
(function (global) {
  "use strict";

  function parseRow(row) {
    var lat = parseFloat(row.lat);
    var lon = parseFloat(row.lon);
    if (isNaN(lat) || isNaN(lon)) {
      return null;
    }
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      city: row.city,
      lat: lat,
      lon: lon,
      neighborhood: row.neighborhood || "",
    };
  }

  function parseCsvSimple(text) {
    var lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      return [];
    }
    var headers = lines[0].split(",");
    var points = [];

    for (var i = 1; i < lines.length; i++) {
      var line = lines[i];
      if (!line.trim()) {
        continue;
      }
      var values = line.split(",");
      if (values.length < headers.length) {
        continue;
      }
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] ? values[j].trim() : "";
      }
      if (row.include_on_map !== "true") {
        continue;
      }
      var point = parseRow(row);
      if (point) {
        points.push(point);
      }
    }
    return points;
  }

  /**
   * @param {string} csvUrl
   * @returns {Promise<object[]>}
   */
  async function loadEcosystemPoints(csvUrl) {
    var response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error("Failed to load ecosystem data (" + response.status + ")");
    }
    var text = await response.text();

    if (global.Papa && global.Papa.parse) {
      return new Promise(function (resolve, reject) {
        global.Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            var points = results.data
              .filter(function (row) {
                return row.include_on_map === "true";
              })
              .map(parseRow)
              .filter(Boolean);
            resolve(points);
          },
          error: function (err) {
            reject(err);
          },
        });
      });
    }

    return parseCsvSimple(text);
  }

  global.EcosystemDataLoader = {
    loadEcosystemPoints: loadEcosystemPoints,
  };
})(typeof window !== "undefined" ? window : this);
