/**
 * Section 04 orchestrator — three independent subsection experiences.
 * @global
 */
(function (global) {
  "use strict";

  function initSection04() {
    if (typeof global.initSection04A === "function") {
      global.initSection04A();
    }
    if (typeof global.initSection04B === "function") {
      global.initSection04B();
    }
    if (typeof global.initAcademicEconomySection === "function") {
      global.initAcademicEconomySection();
    }
  }

  global.initSection04 = initSection04;
})(typeof window !== "undefined" ? window : this);
