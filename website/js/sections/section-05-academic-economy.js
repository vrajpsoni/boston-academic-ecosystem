/**
 * Section 05 — The Academic Economy (lazy init).
 */
(function (global) {
  "use strict";

  function initAcademicEconomySection() {
    var id = global.SiteConfig.sections.academicEconomy;
    var section = document.getElementById(id);
    var root =
      section &&
      (section.querySelector("[data-econ-root]") || section);
    if (!root || typeof global.Section05Init === "undefined") {
      return;
    }

    if ("IntersectionObserver" in global) {
      var obs = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              global.Section05Init.init(root);
              observer.disconnect();
            }
          });
        },
        { rootMargin: "200px 0px" }
      );
      obs.observe(section || root);
    } else {
      global.Section05Init.init(root);
    }
  }

  global.initAcademicEconomySection = initAcademicEconomySection;
})(typeof window !== "undefined" ? window : this);
