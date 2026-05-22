/**
 * Section 05 — load institution scale CSV.
 */
(function (global) {
  "use strict";

  function mappedOpex(inst) {
    return (
      (inst.instruction || 0) +
      (inst.research || 0) +
      (inst.studentServices || 0) +
      (inst.auxiliary || 0)
    );
  }

  function otherOpex(inst) {
    return Math.max(0, inst.opex - mappedOpex(inst));
  }

  function hasPartialCategoryNote(inst, cfg) {
    var ids = cfg.partialCategoryNoteUnitids || [];
    if (ids.indexOf(inst.unitid) >= 0) {
      return true;
    }
    if (!inst.opex) {
      return false;
    }
    return mappedOpex(inst) / inst.opex < 0.35;
  }

  function enrichInstitution(inst, cfg) {
    var mapped = mappedOpex(inst);
    var other = otherOpex(inst);
    inst.mappedOpex = mapped;
    inst.otherOpex = other;
    inst.partialCategoryNote = hasPartialCategoryNote(inst, cfg);
    inst.widthShare = 0;
    return inst;
  }

  function loadScale() {
    var cfg = global.Section05Config;
    var url = cfg.scaleCsv;
    return new Promise(function (resolve, reject) {
      if (typeof Papa === "undefined") {
        reject(new Error("PapaParse required"));
        return;
      }
      Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (res) {
          resolve(normalizeScale(res.data || []));
        },
        error: function (err) {
          reject(err);
        },
      });
    });
  }

  function normalizeScale(rows) {
    var fmt = global.Section05Format;
    var cfg = global.Section05Config;
    var institutions = [];
    var others = null;
    var total = 0;
    var maxOpex = 0;

    rows.forEach(function (row) {
      var uidRaw = row.unitid;
      var uid =
        uidRaw === cfg.othersId
          ? cfg.othersId
          : parseInt(uidRaw, 10) || uidRaw;
      var opex = fmt.parseMoney(row.total_operating_expenses_usd);
      if (opex == null) {
        return;
      }
      var item = {
        unitid: uid,
        name: (row.institution_name || "").trim(),
        tier: (row.tier || "").trim(),
        opex: opex,
        instruction: fmt.parseMoney(row.expense_instruction_usd),
        research: fmt.parseMoney(row.expense_research_usd),
        studentServices: fmt.parseMoney(row.expense_student_services_usd),
        auxiliary: fmt.parseMoney(row.expense_auxiliary_usd),
        opexVar: row.opex_varname || "",
      };
      enrichInstitution(item, cfg);

      if (uid === cfg.othersId) {
        others = item;
      } else {
        institutions.push(item);
        total += opex;
        if (opex > maxOpex) {
          maxOpex = opex;
        }
      }
    });

    if (others) {
      total += others.opex;
      enrichInstitution(others, cfg);
    }

    var anchorMap = {};
    institutions.forEach(function (i) {
      anchorMap[i.unitid] = i;
    });

    var build = [];
    var cumulative = 0;
    cfg.buildOrder.forEach(function (uid) {
      var inst =
        uid === cfg.othersId ? others : anchorMap[uid];
      if (!inst) {
        return;
      }
      cumulative += inst.opex;
      inst.cumulativeOpex = cumulative;
      inst.widthShare = maxOpex ? inst.opex / maxOpex : 0;
      build.push(inst);
    });

    return {
      institutions: institutions,
      build: build,
      others: others,
      totalOpex: total || cfg.heroTotalUsd,
      maxOpex: maxOpex,
    };
  }

  global.Section05DataLoader = {
    loadScale: loadScale,
    mappedOpex: mappedOpex,
    otherOpex: otherOpex,
  };
})(typeof window !== "undefined" ? window : this);
