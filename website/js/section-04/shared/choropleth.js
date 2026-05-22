/**
 * Single-layer storytelling choropleth (04A / 04B maps).
 * @global
 */
(function (global) {
  "use strict";

  function quantileBreaks(values, count) {
    var sorted = values
      .filter(function (v) {
        return v != null && !isNaN(v);
      })
      .sort(function (a, b) {
        return a - b;
      });
    if (!sorted.length) {
      return [];
    }
    if (sorted.length <= count) {
      return sorted.slice();
    }
    var breaks = [];
    for (var i = 1; i < count; i++) {
      var idx = Math.floor((sorted.length * i) / count);
      breaks.push(sorted[Math.min(idx, sorted.length - 1)]);
    }
    return breaks;
  }

  function colorForValue(value, breaks, colors) {
    if (value == null || isNaN(value)) {
      return null;
    }
    if (!breaks.length) {
      return colors[colors.length - 1];
    }
    var idx = 0;
    while (idx < breaks.length && value > breaks[idx]) {
      idx += 1;
    }
    return colors[Math.min(idx, colors.length - 1)];
  }

  /**
   * @param {string} containerId
   * @param {object} mapDefaults
   */
  function createLockedMap(containerId, mapDefaults) {
    var container = document.getElementById(containerId);
    if (!container) {
      throw new Error("Map container not found: " + containerId);
    }
    container.classList.add("map-canvas--ready");
    container.setAttribute("role", "application");

    var map = global.L.map(containerId, {
      center: mapDefaults.defaultCenter,
      zoom: mapDefaults.defaultZoom,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomControl: false,
      dragging: false,
      touchZoom: false,
      minZoom: 10,
      maxZoom: 15,
    });

    global.L.tileLayer(mapDefaults.tileUrl, {
      attribution: mapDefaults.tileAttribution,
      maxZoom: 19,
    }).addTo(map);

    map.getContainer().classList.add("section-04-map--story");

    var placeholder = container.querySelector(".map-canvas__placeholder");
    if (placeholder) {
      placeholder.remove();
    }

    return map;
  }

  /**
   * @param {L.Map} map
   * @param {HTMLElement} container
   */
  function watchMapResize(map, container) {
    if (!container || !map) {
      return;
    }

    function refresh() {
      map.invalidateSize();
    }

    window.setTimeout(refresh, 80);
    window.setTimeout(refresh, 400);

    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(refresh);
      ro.observe(container);
    }
  }

  /**
   * @param {L.Map} map
   * @param {object} geojson
   * @param {Map} layerIndex
   * @param {object} vizConfig
   * @param {object} mapDefaults
   * @param {Function} buildTooltipHtml
   */
  function addChoropleth(map, geojson, layerIndex, vizConfig, mapDefaults, buildTooltipHtml) {
    var geoIdFn = global.Section04GeoJson.geoIdFromProperties;
    var breaks = [];
    var values = [];

    var layerData = global.Section04LayerData;
    (geojson.features || []).forEach(function (feat) {
      var props = feat.properties || {};
      var geoId = geoIdFn(props);
      var v = layerData.metricValue(
        layerIndex,
        geoId,
        props.name,
        vizConfig.metricKey
      );
      if (v != null && !isNaN(v)) {
        values.push(v);
      }
    });
    breaks = quantileBreaks(values, vizConfig.colors.length - 1);

    function styleFeature(feature) {
      var props = feature.properties || {};
      var geoId = geoIdFn(props);
      var name = props.name || geoId;
      var value = layerData.metricValue(
        layerIndex,
        geoId,
        name,
        vizConfig.metricKey
      );
      var fill =
        colorForValue(value, breaks, vizConfig.colors) || mapDefaults.noDataFill;

      return {
        fillColor: fill,
        fillOpacity: 0.82,
        color: mapDefaults.strokeColor,
        weight: mapDefaults.strokeWeight,
        opacity: 1,
        _geoId: geoId,
        _name: name,
        _value: value,
      };
    }

    function tooltipClassName() {
      var cls = "section-04-map-tooltip";
      if (vizConfig.tooltipCompact) {
        cls += " section-04-map-tooltip--compact";
      }
      return cls;
    }

    function tooltipOptions() {
      return {
        sticky: true,
        opacity: 1,
        className: tooltipClassName(),
        maxWidth: vizConfig.tooltipMaxWidth || 272,
        direction: "auto",
        offset: [0, -6],
      };
    }

    function updateTooltipDirection(layer, latlng) {
      if (!vizConfig.tooltipSmartDirection || !latlng) {
        return;
      }
      var tip = layer.getTooltip && layer.getTooltip();
      if (!tip) {
        return;
      }
      var pt = map.latLngToContainerPoint(latlng);
      var size = map.getSize();
      var topBand = size.y * 0.38;
      var dir = pt.y < topBand ? "bottom" : "top";
      if (tip.options.direction !== dir) {
        tip.options.direction = dir;
        tip.options.offset = dir === "bottom" ? [0, 10] : [0, -6];
        if (typeof tip.update === "function") {
          tip.update();
        }
      }
    }

    function bindInteractions(feature, layer) {
      var s = layer.options;
      var html = buildTooltipHtml(s._geoId, s._name, layerIndex, vizConfig);
      layer.bindTooltip(html, tooltipOptions());

      layer.on("mouseover", function (e) {
        updateTooltipDirection(layer, e.latlng);
        layer.setStyle({
          weight: mapDefaults.strokeWeight + 1.25,
          fillOpacity: 0.92,
          color: vizConfig.hoverStrokeColor || mapDefaults.strokeColor,
        });
        if (!global.L.Browser.ie && !global.L.Browser.opera && !global.L.Browser.edge) {
          layer.bringToFront();
        }
      });

      if (vizConfig.tooltipSmartDirection) {
        layer.on("mousemove", function (e) {
          updateTooltipDirection(layer, e.latlng);
        });
      }

      layer.on("mouseout", function () {
        layer.setStyle(styleFeature(feature));
      });
    }

    var layer = global.L.geoJSON(geojson, {
      style: styleFeature,
      onEachFeature: bindInteractions,
    }).addTo(map);

    try {
      map.fitBounds(layer.getBounds(), { padding: [28, 28], maxZoom: 13 });
      var lockedZoom = map.getZoom();
      map.setMinZoom(lockedZoom);
      map.setMaxZoom(lockedZoom);
      map.setMaxBounds(layer.getBounds().pad(0.04));
      map.setView(layer.getBounds().getCenter(), lockedZoom, { animate: false });
    } catch (e) {
      map.setView(mapDefaults.defaultCenter, mapDefaults.defaultZoom);
    }

    map.getContainer().setAttribute("aria-label", vizConfig.mapAriaLabel || "Neighborhood map");

    watchMapResize(map, map.getContainer().parentElement);

    return {
      map: map,
      layer: layer,
      getBreaks: function () {
        return breaks;
      },
    };
  }

  global.Section04Choropleth = {
    createLockedMap: createLockedMap,
    addChoropleth: addChoropleth,
    watchMapResize: watchMapResize,
    quantileBreaks: quantileBreaks,
  };
})(typeof window !== "undefined" ? window : this);
