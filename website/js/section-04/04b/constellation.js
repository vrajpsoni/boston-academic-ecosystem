/**
 * Section 04B — Immersive ecosystem constellation (editorial, full-scene).
 * @global
 */
(function (global) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    var node = document.createElementNS(NS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        node.setAttribute(key, attrs[key]);
      });
    }
    return node;
  }

  function sumMetrics(geoIds, layerIndex, key) {
    var total = 0;
    geoIds.forEach(function (id) {
      var bucket = layerIndex.get(id);
      if (bucket && bucket[key] != null) {
        total += bucket[key];
      }
    });
    return total;
  }

  function avgMetrics(geoIds, layerIndex, key) {
    var sum = 0;
    var n = 0;
    geoIds.forEach(function (id) {
      var bucket = layerIndex.get(id);
      if (bucket && bucket[key] != null) {
        sum += bucket[key];
        n += 1;
      }
    });
    return n ? sum / n : 0;
  }

  function countInstitutions(bbox, institutions) {
    if (!bbox || !institutions.length) {
      return 0;
    }
    var south = bbox[0];
    var west = bbox[1];
    var north = bbox[2];
    var east = bbox[3];
    return institutions.filter(function (inst) {
      return inst.lat >= south && inst.lat <= north && inst.lon >= west && inst.lon <= east;
    }).length;
  }

  function intensityLabel(socialTotal, studentShare) {
    if (socialTotal >= 100 && studentShare >= 0.2) {
      return "Strong student-driven street life";
    }
    if (socialTotal >= 70) {
      return "Dense cafe & restaurant ecosystem";
    }
    if (studentShare >= 0.28) {
      return "High academic-age neighborhood concentration";
    }
    if (socialTotal >= 35) {
      return "Growing social activity around campus edges";
    }
    return "Quieter corridor · emerging activity";
  }

  function tierMeta(tier, tiers) {
    return tiers[tier] || tiers.medium;
  }

  function parseInstitutions(text) {
    if (typeof Papa === "undefined") {
      return [];
    }
    var rows = Papa.parse(text, { header: true, skipEmptyLines: true }).data || [];
    return rows
      .filter(function (row) {
        return (
          String(row.include_on_map || "").toLowerCase() === "true" &&
          String(row.category || "").trim() === "university"
        );
      })
      .map(function (row) {
        return {
          name: String(row.name || "").trim(),
          lat: parseFloat(row.lat),
          lon: parseFloat(row.lon),
        };
      })
      .filter(function (inst) {
        return !isNaN(inst.lat) && !isNaN(inst.lon);
      });
  }

  function mergeCorridorMetrics(metrics, corridorBucket) {
    if (!corridorBucket) {
      return metrics;
    }
    ["osm_cafe_count", "osm_restaurant_count", "osm_bookstore_count", "osm_coworking_count"].forEach(
      function (key) {
        if (corridorBucket[key] != null) {
          metrics[key] = corridorBucket[key];
        }
      }
    );
    if (corridorBucket.osm_social_poi_total != null) {
      metrics.osm_social_poi_total = corridorBucket.osm_social_poi_total;
    } else {
      metrics.osm_social_poi_total =
        (metrics.osm_cafe_count || 0) + (metrics.osm_restaurant_count || 0);
    }
    return metrics;
  }

  function hubMetricsFromLayers(hub, layerIndex, corridorIndex, housingIndex, innovationIndex) {
    var geoIds = hub.geoIds || [];
    var metrics = {
      osm_cafe_count: sumMetrics(geoIds, layerIndex, "osm_cafe_count"),
      osm_restaurant_count: sumMetrics(geoIds, layerIndex, "osm_restaurant_count"),
      osm_bookstore_count: sumMetrics(geoIds, layerIndex, "osm_bookstore_count"),
      osm_coworking_count: sumMetrics(geoIds, layerIndex, "osm_coworking_count"),
      osm_social_poi_total: sumMetrics(geoIds, layerIndex, "osm_social_poi_total"),
      population_age_20_24_share: avgMetrics(geoIds, housingIndex, "population_age_20_24_share"),
      employment_management_professional_share: avgMetrics(
        geoIds,
        innovationIndex,
        "employment_management_professional_share"
      ),
    };
    return mergeCorridorMetrics(metrics, corridorIndex.get(hub.id));
  }

  function compositeDensityScore(metrics, activity) {
    var m = metrics || {};
    var social = Number(m.osm_social_poi_total) || 0;
    var cafes = Number(m.osm_cafe_count) || 0;
    var restaurants = Number(m.osm_restaurant_count) || 0;
    var coworking = Number(m.osm_coworking_count) || 0;
    var bookstores = Number(m.osm_bookstore_count) || 0;
    var act =
      activity && activity.activityIndex != null ? Number(activity.activityIndex) : 0;
    return (
      social * 0.4 +
      (cafes + restaurants) * 0.06 +
      coworking * 9 +
      bookstores * 2.5 +
      act * 88
    );
  }

  function densityHubRadius(tier, baseRadius, densityNorm) {
    var eased = Math.pow(Math.max(0, Math.min(1, densityNorm)), 0.78);
    var span = tier === "major" ? 4 : tier === "medium" ? 2.75 : 1.6;
    var maxR = tier === "major" ? 18 : tier === "medium" ? 12.5 : 8.5;
    return Math.min(baseRadius + eased * span, maxR);
  }

  function buildHubModels(
    hubs,
    layerIndex,
    corridorIndex,
    housingIndex,
    innovationIndex,
    satellites,
    institutions,
    tiers,
    activityIndex
  ) {
    var socialMax = 1;
    var densityMax = 1;
    var hubContexts = hubs.map(function (hub) {
      var metrics = hubMetricsFromLayers(
        hub,
        layerIndex,
        corridorIndex,
        housingIndex,
        innovationIndex
      );
      var activity = activityIndex.get(hub.id) || null;
      var social = metrics.osm_social_poi_total || 0;
      var density = compositeDensityScore(metrics, activity);
      if (social > socialMax) {
        socialMax = social;
      }
      if (density > densityMax) {
        densityMax = density;
      }
      return { hub: hub, metrics: metrics, activity: activity, density: density };
    });

    return hubContexts.map(function (ctx) {
      var hub = ctx.hub;
      var geoIds = hub.geoIds || [];
      var metrics = ctx.metrics;
      var hasCorridor = corridorIndex.has(hub.id);
      var institutionCount = hub.institutionBbox
        ? countInstitutions(hub.institutionBbox, institutions)
        : 0;
      var social = metrics.osm_social_poi_total || 0;
      var studentShare = metrics.population_age_20_24_share || 0;
      var strength = socialMax > 0 ? social / socialMax : 0;
      var densityNorm = densityMax > 0 ? ctx.density / densityMax : 0;
      var tier = hub.tier || "medium";
      var baseTier = tierMeta(tier, tiers);
      var hubRadius = densityHubRadius(tier, baseTier.radius, densityNorm);
      var spokeRadius = 36 + strength * 22;
      var satelliteNodes = satellites.map(function (sat, i) {
        var val = metrics[sat.metric] || 0;
        var norm = Math.min(1, val / (Math.max(social, 40) * 0.45 + 1));
        return {
          key: sat.key,
          label: sat.label,
          value: val,
          norm: norm,
          angle: (i / satellites.length) * Math.PI * 2 - Math.PI / 2,
        };
      });

      var activity = ctx.activity;
      var activityPulse = activity ? activity.activityIndex : strength * 0.5;

      return {
        id: hub.id,
        name: hub.name,
        subtitle: hub.subtitle,
        tier: tier,
        cluster: hub.cluster,
        layout: hub.layout,
        geoIds: geoIds,
        dataSource: hasCorridor ? "corridor_bbox" : "boston_neighborhood",
        institutionCount: institutionCount,
        metrics: metrics,
        strength: strength,
        densityNorm: densityNorm,
        hubRadius: hubRadius,
        activity: activity,
        activityPulse: activityPulse,
        activityClass: activityLevelClass(activityPulse),
        spokeRadius: spokeRadius,
        intensityLabel: intensityLabel(social, studentShare),
        satellites: satelliteNodes,
        tierStyle: baseTier,
      };
    });
  }

  var SIGNAL_LABELS = {
    innovation: "Innovation activity",
    student_events: "Student event density",
    meetups: "Community meetup signal",
    cultural: "Cultural activity",
  };

  var LEVEL_DISPLAY = {
    low: "Low",
    moderate: "Moderate",
    active: "Active",
    strong: "Strong",
    high: "High",
  };

  function loadActivityIndex(url) {
    if (!url) {
      return Promise.resolve(new Map());
    }
    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to load " + url);
        }
        return res.text();
      })
      .then(function (text) {
        var index = new Map();
        if (typeof Papa === "undefined") {
          return index;
        }
        var rows = Papa.parse(text, { header: true, skipEmptyLines: true }).data || [];
        rows.forEach(function (row) {
          var hubId = (row.hub_id || "").trim();
          if (!hubId) {
            return;
          }
          var highlights = [];
          if ((row.highlight_1 || "").trim()) {
            highlights.push({
              text: String(row.highlight_1).trim(),
              source: String(row.highlight_1_source || "").trim(),
            });
          }
          if ((row.highlight_2 || "").trim()) {
            highlights.push({
              text: String(row.highlight_2).trim(),
              source: String(row.highlight_2_source || "").trim(),
            });
          }
          index.set(hubId, {
            innovation: (row.signal_innovation || "moderate").trim().toLowerCase(),
            student_events: (row.signal_student_events || "moderate").trim().toLowerCase(),
            meetups: (row.signal_meetups || "moderate").trim().toLowerCase(),
            cultural: (row.signal_cultural || "moderate").trim().toLowerCase(),
            activityIndex: parseFloat(row.activity_index) || 0.5,
            highlights: highlights,
            sourceId: row.source_id || "",
            notes: row.notes || "",
          });
        });
        return index;
      });
  }

  function activityLevelClass(index) {
    if (index >= 0.72) {
      return "alive";
    }
    if (index >= 0.55) {
      return "warm";
    }
    return "quiet";
  }

  function renderActivityBlock(hub) {
    var a = hub.activity;
    if (!a) {
      return "";
    }
    var signalsHtml = Object.keys(SIGNAL_LABELS)
      .map(function (key) {
        var level = a[key] || "moderate";
        var display = LEVEL_DISPLAY[level] || level;
        return (
          '<li class="ecosystem-constellation__activity-signal ecosystem-constellation__activity-signal--' +
          level +
          '"><span>' +
          SIGNAL_LABELS[key] +
          "</span><strong>" +
          display +
          "</strong></li>"
        );
      })
      .join("");

    var highlightsHtml = "";
    if (a.highlights && a.highlights.length) {
      highlightsHtml =
        '<ul class="ecosystem-constellation__activity-highlights">' +
        a.highlights
          .map(function (h) {
            return (
              '<li><span class="ecosystem-constellation__activity-dot" aria-hidden="true"></span>' +
              h.text +
              (h.source
                ? '<span class="ecosystem-constellation__activity-src">' + h.source + "</span>"
                : "") +
              "</li>"
            );
          })
          .join("") +
        "</ul>";
    }

    return (
      '<div class="ecosystem-constellation__detail-activity">' +
      '<p class="ecosystem-constellation__detail-activity-title">Ecosystem activity</p>' +
      '<ul class="ecosystem-constellation__activity-signals">' +
      signalsHtml +
      "</ul>" +
      highlightsHtml +
      '<p class="ecosystem-constellation__activity-note">Signals from MIT public iCal + OpenStreetMap (reproducible dataset build). Not a live feed.</p>' +
      "</div>"
    );
  }

  function tierLabel(tier) {
    if (tier === "major") {
      return "Major ecosystem hub";
    }
    if (tier === "minor") {
      return "Supporting corridor";
    }
    return "Connected corridor";
  }

  function formatCount(n) {
    var val = n == null || isNaN(n) ? 0 : n;
    return Number(val).toLocaleString("en-US");
  }

  function renderDetail(panel, hub) {
    if (!panel || !hub) {
      return;
    }
    var m = hub.metrics;
    var scopeNote =
      hub.dataSource === "corridor_bbox"
        ? "OpenStreetMap POI counts within a curated academic-corridor bounding box (Overpass API, May 2026)."
        : "OpenStreetMap POI counts within City of Boston neighborhood boundaries (Analyze Boston / Overpass API).";

    var statsHtml =
      '<ul class="ecosystem-constellation__detail-stats">' +
      "<li><span>Cafes</span><strong>" +
      formatCount(m.osm_cafe_count) +
      "</strong></li>" +
      "<li><span>Restaurants</span><strong>" +
      formatCount(m.osm_restaurant_count) +
      "</strong></li>" +
      "<li><span>Bookstores</span><strong>" +
      formatCount(m.osm_bookstore_count) +
      "</strong></li>" +
      "<li><span>Coworking</span><strong>" +
      formatCount(m.osm_coworking_count) +
      "</strong></li>" +
      "<li><span>Social POIs</span><strong>" +
      formatCount(m.osm_social_poi_total) +
      "</strong></li>" +
      "</ul>";

    panel.innerHTML =
      '<p class="ecosystem-constellation__detail-tier">' +
      tierLabel(hub.tier) +
      "</p>" +
      '<h4 class="ecosystem-constellation__detail-title">' +
      hub.name +
      "</h4>" +
      '<p class="ecosystem-constellation__detail-sub">' +
      hub.subtitle +
      "</p>" +
      '<p class="ecosystem-constellation__detail-story">' +
      hub.intensityLabel +
      "</p>" +
      statsHtml +
      renderActivityBlock(hub) +
      '<p class="ecosystem-constellation__detail-note">' +
      scopeNote +
      "</p>";
  }

  function computeNetworkFit(models, w, h) {
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    var pad = 48;

    models.forEach(function (hub) {
      var px = hub.layout.x * w;
      var py = hub.layout.y * h;
      minX = Math.min(minX, px - pad);
      maxX = Math.max(maxX, px + pad);
      minY = Math.min(minY, py - pad);
      maxY = Math.max(maxY, py + pad);
    });

    var bw = maxX - minX || 1;
    var bh = maxY - minY || 1;
    var scale = Math.min((w * 0.9) / bw, (h * 0.84) / bh);
    var tx = (w - bw * scale) / 2 - minX * scale;
    var ty = (h - bh * scale) / 2 - minY * scale;
    return { tx: tx, ty: ty, scale: scale };
  }

  function renderConstellation(container, hubModels, cfg) {
    var vb = cfg.viewBox || { width: 1400, height: 880 };
    var width = vb.width;
    var height = vb.height;
    var colors = cfg.colors;
    var tiers = cfg.tiers;

    container.innerHTML = "";
    container.classList.add("ecosystem-constellation--ready");

    var scene = document.createElement("div");
    scene.className = "ecosystem-constellation__scene";

    var layout = document.createElement("div");
    layout.className = "ecosystem-constellation__layout";

    var stage = document.createElement("div");
    stage.className = "ecosystem-constellation__stage";

    var svg = el("svg", {
      class: "ecosystem-constellation__svg",
      viewBox: "0 0 " + width + " " + height,
      preserveAspectRatio: "xMidYMid slice",
      role: "img",
      "aria-label": cfg.viz.ariaLabel,
    });

    var defs = el("defs");
    var grad = el("radialGradient", { id: "eco-scene-glow", cx: "50%", cy: "45%", r: "55%" });
    grad.appendChild(el("stop", { offset: "0%", "stop-color": "rgba(232, 200, 114, 0.12)" }));
    grad.appendChild(el("stop", { offset: "100%", "stop-color": "rgba(12, 10, 9, 0)" }));
    defs.appendChild(grad);

    var glowFilter = el("filter", {
      id: "eco-hub-glow",
      x: "-100%",
      y: "-100%",
      width: "300%",
      height: "300%",
    });
    glowFilter.appendChild(el("feGaussianBlur", { stdDeviation: "2", result: "b" }));
    var merge = el("feMerge");
    merge.appendChild(el("feMergeNode", { in: "b" }));
    merge.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
    glowFilter.appendChild(merge);
    defs.appendChild(glowFilter);
    svg.appendChild(defs);

    var ambient = el("rect", {
      class: "ecosystem-constellation__ambient",
      width: String(width),
      height: String(height),
      fill: "url(#eco-scene-glow)",
    });
    svg.appendChild(ambient);

    var regionsG = el("g", { class: "ecosystem-constellation__regions" });
    (cfg.regions || []).forEach(function (region) {
      var cx = region.layout.cx * width;
      var cy = region.layout.cy * height;
      var rx = region.layout.rx * width;
      var ry = region.layout.ry * height;
      regionsG.appendChild(
        el("ellipse", {
          class: "ecosystem-constellation__region",
          cx: String(cx),
          cy: String(cy),
          rx: String(rx),
          ry: String(ry),
        })
      );
      var label = el("text", {
        class: "ecosystem-constellation__region-label",
        x: String(cx),
        y: String(cy - ry + 14),
        "text-anchor": "middle",
      });
      label.textContent = region.label;
      regionsG.appendChild(label);
    });
    svg.appendChild(regionsG);

    var hubPos = {};
    hubModels.forEach(function (hub) {
      hubPos[hub.id] = { x: hub.layout.x * width, y: hub.layout.y * height };
    });

    var linksG = el("g", { class: "ecosystem-constellation__hub-links" });
    (cfg.hubLinks || []).forEach(function (pair) {
      var a = hubPos[pair[0]];
      var b = hubPos[pair[1]];
      if (!a || !b) {
        return;
      }
      linksG.appendChild(
        el("line", {
          class: "ecosystem-constellation__hub-link",
          "data-hub-a": pair[0],
          "data-hub-b": pair[1],
          x1: String(a.x),
          y1: String(a.y),
          x2: String(b.x),
          y2: String(b.y),
        })
      );
    });
    var avgX = 0;
    var avgY = 0;
    hubModels.forEach(function (h) {
      avgX += h.layout.x;
      avgY += h.layout.y;
    });
    avgX /= hubModels.length;
    avgY /= hubModels.length;
    var balanceX = (0.5 - avgX) * width * 0.32;
    var balanceY = (0.46 - avgY) * height * 0.32;
    var defaultTransform = "translate(" + balanceX + " " + balanceY + ")";
    var deepFit = computeNetworkFit(hubModels, width, height);
    var deepTransform =
      "translate(" +
      deepFit.tx +
      " " +
      deepFit.ty +
      ") scale(" +
      deepFit.scale +
      ")";

    var networkG = el("g", {
      class: "ecosystem-constellation__network",
      transform: defaultTransform,
    });
    networkG.setAttribute("data-transform-default", defaultTransform);
    networkG.setAttribute("data-transform-deep", deepTransform);
    networkG.appendChild(linksG);

    var shell = container.closest(".ecosystem-constellation-shell");

    var nodesG = el("g", { class: "ecosystem-constellation__clusters" });

    var focusPanel = document.createElement("aside");
    focusPanel.className = "ecosystem-constellation__focus-panel";
    focusPanel.setAttribute("aria-label", "Corridor focus panel");

    var focusChrome = document.createElement("div");
    focusChrome.className = "ecosystem-constellation__focus-panel__chrome";
    focusChrome.innerHTML =
      '<p class="ecosystem-constellation__focus-panel__kicker">Corridor focus</p>' +
      '<p class="ecosystem-constellation__focus-panel__lede">Hover a corridor hub to see cafes, restaurants, bookstores, coworking spaces, and activity signals along Greater Boston&rsquo;s academic corridors.</p>' +
      '<button type="button" class="ecosystem-constellation__deep-enter">Enter Deep View</button>' +
      '<div class="ecosystem-constellation__focus-panel__chrome-actions">' +
      '<p class="ecosystem-constellation__focus-panel__hint">Hover a hub to explore street-level activity</p>' +
      '<button type="button" class="ecosystem-constellation__deep-exit" aria-label="Exit deep view">' +
      "<span>Exit Deep View</span></button>" +
      "</div>";

    var focusBody = document.createElement("div");
    focusBody.className = "ecosystem-constellation__focus-panel__body";
    focusBody.innerHTML =
      '<div class="ecosystem-constellation__focus-panes">' +
      '<div class="ecosystem-constellation__focus-pane ecosystem-constellation__focus-pane--detail"></div>' +
      "</div>";

    var detailPane = focusBody.querySelector(".ecosystem-constellation__focus-pane--detail");

    focusPanel.appendChild(focusChrome);
    focusPanel.appendChild(focusBody);
    focusPanel.setAttribute("aria-live", "off");
    var isDeepView = false;
    var deepExitBtn = focusChrome.querySelector(".ecosystem-constellation__deep-exit");
    var deepViewState = { parent: null, next: null, scrollY: 0, scrollPad: "" };
    var pendingHubId;
    var activeRaf = null;

    function syncDeepChrome() {
      layout.classList.toggle("is-deep-view", isDeepView);
    }

    function lockPageScroll() {
      var pad = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      deepViewState.scrollPad = document.body.style.paddingRight || "";
      if (pad > 0) {
        document.body.style.paddingRight = pad + "px";
      }
      document.documentElement.classList.add("eco-constellation-deep-open");
      document.body.classList.add("eco-constellation-deep-open");
    }

    function unlockPageScroll() {
      document.documentElement.classList.remove("eco-constellation-deep-open");
      document.body.classList.remove("eco-constellation-deep-open");
      document.body.style.paddingRight = deepViewState.scrollPad;
    }

    function bindDeepEnter(btn) {
      if (!btn || btn.dataset.bound === "1") {
        return;
      }
      btn.dataset.bound = "1";
      btn.addEventListener("click", enterDeepView);
    }

    function enterDeepView() {
      if (!shell || isDeepView) {
        return;
      }
      isDeepView = true;
      deepViewState.scrollY = window.scrollY || window.pageYOffset || 0;
      deepViewState.parent = shell.parentNode;
      deepViewState.next = shell.nextSibling;
      document.body.appendChild(shell);
      shell.classList.add("is-deep-view");
      lockPageScroll();
      networkG.setAttribute("transform", deepTransform);
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      syncDeepChrome();
      applySetActive(null);
    }

    function exitDeepView() {
      if (!shell || !isDeepView) {
        return;
      }
      isDeepView = false;
      shell.classList.remove("is-deep-view");
      unlockPageScroll();
      if (deepViewState.parent) {
        deepViewState.parent.insertBefore(shell, deepViewState.next);
      }
      networkG.setAttribute("transform", defaultTransform);
      svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
      syncDeepChrome();
      applySetActive(null);
      window.scrollTo(0, deepViewState.scrollY);
    }

    bindDeepEnter(focusChrome.querySelector(".ecosystem-constellation__deep-enter"));
    if (deepExitBtn) {
      deepExitBtn.addEventListener("click", exitDeepView);
    }
    global.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && isDeepView) {
        exitDeepView();
      }
    });

    function applySetActive(hubId) {
      var activeHub = hubModels.find(function (h) {
        return h.id === hubId;
      });

      if (shell) {
        shell.classList.toggle("is-hub-hover", !!hubId);
      }

      layout.classList.toggle("is-focus-active", !!hubId);
      focusPanel.classList.toggle("is-active", !!hubId);

      nodesG.querySelectorAll("[data-hub-id]").forEach(function (group) {
        var on = group.getAttribute("data-hub-id") === hubId;
        group.classList.toggle("is-active", on);
        group.classList.toggle("is-dimmed", hubId && !on);
      });

      linksG.querySelectorAll(".ecosystem-constellation__hub-link").forEach(function (line) {
        if (!hubId) {
          line.classList.remove("is-active", "is-alive", "is-connected");
          return;
        }
        var connected =
          line.getAttribute("data-hub-a") === hubId ||
          line.getAttribute("data-hub-b") === hubId;
        line.classList.toggle("is-connected", connected);
        line.classList.toggle("is-active", connected);
        if (activeHub && activeHub.activityClass === "alive" && connected) {
          line.classList.add("is-alive");
        } else {
          line.classList.remove("is-alive");
        }
      });

      if (activeHub) {
        renderDetail(detailPane, activeHub);
        focusBody.classList.add("has-detail");
        detailPane.classList.add("is-active");
      } else {
        focusBody.classList.remove("has-detail");
        detailPane.classList.remove("is-active");
        detailPane.innerHTML = "";
      }
    }

    function setActive(hubId) {
      pendingHubId = hubId;
      if (activeRaf != null) {
        return;
      }
      activeRaf = global.requestAnimationFrame(function () {
        activeRaf = null;
        var nextId = pendingHubId;
        pendingHubId = undefined;
        applySetActive(nextId);
      });
    }

    hubModels.forEach(function (hub) {
      var cx = hub.layout.x * width;
      var cy = hub.layout.y * height;
      var tm = hub.tierStyle;
      var hubR = hub.hubRadius != null ? hub.hubRadius : tm.radius;

      var cluster = el("g", {
        class:
          "ecosystem-constellation__cluster ecosystem-constellation__cluster--" +
          hub.tier +
          " ecosystem-constellation__cluster--activity-" +
          hub.activityClass,
        "data-hub-id": hub.id,
        "data-activity": String(hub.activityPulse.toFixed(2)),
        tabindex: "-1",
        role: "button",
        "aria-label": hub.name + " corridor",
      });

      hub.satellites.forEach(function (sat) {
        var sx = cx + Math.cos(sat.angle) * hub.spokeRadius;
        var sy = cy + Math.sin(sat.angle) * hub.spokeRadius;
        cluster.appendChild(
          el("line", {
            class: "ecosystem-constellation__spoke",
            x1: String(cx),
            y1: String(cy),
            x2: String(sx),
            y2: String(sy),
            "stroke-opacity": String(0.12 + sat.norm * 0.5),
            "stroke-width": String(0.6 + sat.norm * 1.8),
          })
        );
        cluster.appendChild(
          el("circle", {
            class: "ecosystem-constellation__sat-node ecosystem-constellation__sat-node--" + sat.key,
            cx: String(sx),
            cy: String(sy),
            r: String(3 + sat.norm * 4),
            fill: colors.satellite[sat.key] || "#d4a574",
          })
        );
      });

      cluster.appendChild(
        el("circle", {
          class: "ecosystem-constellation__hub-glow",
          cx: String(cx),
          cy: String(cy),
          r: String(hubR + 8 + hub.strength * 3),
        })
      );

      cluster.appendChild(
        el("circle", {
          class: "ecosystem-constellation__hub-node",
          cx: String(cx),
          cy: String(cy),
          r: String(hubR),
          fill: colors.hub[hub.tier] || colors.hub.medium,
        })
      );

      var shortName = hub.name.split(" / ")[0].split("–")[0];
      var label = el("text", {
        class: "ecosystem-constellation__hub-label",
        x: String(cx),
        y: String(cy + hubR + 14),
        "text-anchor": "middle",
      });
      label.textContent = shortName;
      cluster.appendChild(label);

      cluster.addEventListener("mouseenter", function () {
        setActive(hub.id);
      });
      cluster.addEventListener("mouseleave", function () {
        setActive(null);
      });

      nodesG.appendChild(cluster);
    });

    networkG.appendChild(nodesG);
    svg.appendChild(networkG);
    var foot = document.createElement("div");
    foot.className = "ecosystem-constellation__foot";
    foot.innerHTML =
      '<p class="ecosystem-constellation__foot-lead">Street-level activity from OpenStreetMap · hover a corridor hub</p>' +
      '<ul class="ecosystem-constellation__foot-legend" aria-hidden="true">' +
      cfg.satellites
        .map(function (s) {
          return (
            '<li><span class="ecosystem-constellation__foot-swatch ecosystem-constellation__foot-swatch--' +
            s.key +
            '"></span>' +
            s.label +
            "</li>"
          );
        })
        .join("") +
      "</ul>";

    stage.appendChild(svg);
    stage.appendChild(foot);
    layout.appendChild(focusPanel);
    layout.appendChild(stage);
    scene.appendChild(layout);
    container.appendChild(scene);

    return { setActive: applySetActive };
  }

  function loadInstitutions(url) {
    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to load " + url);
        }
        return res.text();
      })
      .then(parseInstitutions)
      .catch(function () {
        return [];
      });
  }

  function loadCorridorIndex(url) {
    if (!url) {
      return Promise.resolve(new Map());
    }
    return fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error("Failed to load " + url);
        }
        return res.text();
      })
      .then(function (text) {
        var index = new Map();
        if (typeof Papa === "undefined") {
          return index;
        }
        var rows = Papa.parse(text, { header: true, skipEmptyLines: true }).data || [];
        rows.forEach(function (row) {
          var hubId = (row.hub_id || "").trim();
          var key = (row.metric_key || "").trim();
          if (!hubId || !key) {
            return;
          }
          if (!index.has(hubId)) {
            index.set(hubId, {});
          }
          var bucket = index.get(hubId);
          var n = parseFloat(String(row.metric_value || "").trim());
          bucket[key] = isNaN(n) ? 0 : n;
        });
        index.forEach(function (bucket) {
          if (bucket.osm_social_poi_total == null) {
            bucket.osm_social_poi_total =
              (bucket.osm_cafe_count || 0) + (bucket.osm_restaurant_count || 0);
          }
        });
        return index;
      });
  }

  global.Section04BConstellation = {
    buildHubModels: buildHubModels,
    renderConstellation: renderConstellation,
    loadInstitutions: loadInstitutions,
    loadCorridorIndex: loadCorridorIndex,
    loadActivityIndex: loadActivityIndex,
  };
})(typeof window !== "undefined" ? window : this);
