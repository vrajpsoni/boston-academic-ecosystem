/**
 * Section 05 — The Academic Economy (constants).
 */
(function (global) {
  "use strict";

  /** Build order: largest institutional mass first, Others last */
  var BUILD_ORDER = [
    166027,
    166683,
    164988,
    167358,
    168148,
    164924,
    167987,
    "AGG_OTHERS",
  ];

  global.Section05Config = {
    scaleCsv: "data/section_05_institution_scale.csv",
    heroTotalUsd: 17940441187,
    fiscalLabel: "FY2022 IPEDS Finance",
    institutionCount: 29,
    othersSchoolCount: 22,
    buildOrder: BUILD_ORDER,
    othersId: "AGG_OTHERS",

    /** Time-based staged playback (ms) — ~30% faster than v1 auto-play */
    playback: {
      introMs: 460,
      institutionMs: 900,
      othersPulseMs: 600,
      lockupHoldMs: 280,
      replayFromProgress: 0.82,
      replayDurationMs: 1000,
    },

    /** Phase shares within normalized progress 0–1 */
    phases: {
      introEnd: 0.08,
      buildEnd: 0.8,
      othersEnd: 0.9,
    },

    observe: {
      startRatio: 0.28,
      stopRatio: 0.06,
    },

    /** UNITIDs that trigger an honesty note only (not a different bar layout) */
    partialCategoryNoteUnitids: [167987, "AGG_OTHERS"],

    categories: [
      { key: "instruction", label: "Instruction", color: "rgba(96, 165, 250, 0.88)" },
      { key: "research", label: "Research", color: "rgba(52, 211, 153, 0.82)" },
      {
        key: "studentServices",
        label: "Student services",
        color: "rgba(167, 139, 250, 0.8)",
      },
      { key: "auxiliary", label: "Auxiliary", color: "rgba(251, 191, 36, 0.75)" },
      { key: "other", label: "Other", color: "rgba(148, 163, 184, 0.5)" },
    ],

    colors: {
      bg: "#0a0e14",
      gold: "#c9a227",
    },
  };
})(typeof window !== "undefined" ? window : this);
