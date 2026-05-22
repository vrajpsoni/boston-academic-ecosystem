/**
 * Section 05 — currency / number formatting.
 */
(function (global) {
  "use strict";

  function formatUsdCompact(n) {
    if (n == null || isNaN(n)) {
      return "—";
    }
    var abs = Math.abs(n);
    if (abs >= 1e9) {
      return "$" + (n / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
    }
    if (abs >= 1e6) {
      return "$" + (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    }
    return "$" + n.toLocaleString("en-US");
  }

  /** Hero typography: $17.94B at full scale */
  function formatUsdHero(n) {
    if (n == null || isNaN(n)) {
      return "$0";
    }
    var abs = Math.abs(n);
    if (abs >= 1e9) {
      return "$" + (n / 1e9).toFixed(2) + "B";
    }
    if (abs >= 1e6) {
      return "$" + (n / 1e6).toFixed(0) + "M";
    }
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function formatUsdFull(n) {
    if (n == null || isNaN(n)) {
      return "—";
    }
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function parseMoney(val) {
    if (val == null || val === "") {
      return null;
    }
    var n = parseInt(String(val).replace(/[^0-9\-]/g, ""), 10);
    return isNaN(n) ? null : n;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  global.Section05Format = {
    formatUsdCompact: formatUsdCompact,
    formatUsdHero: formatUsdHero,
    formatUsdFull: formatUsdFull,
    parseMoney: parseMoney,
    easeOutCubic: easeOutCubic,
  };
})(typeof window !== "undefined" ? window : this);
