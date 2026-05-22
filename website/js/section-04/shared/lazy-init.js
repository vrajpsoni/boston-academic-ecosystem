/**
 * Lazy-init when a subsection scrolls into view.
 * @global
 */
(function (global) {
  "use strict";

  /**
   * @param {HTMLElement} rootEl
   * @param {Function} bootFn
   * @returns {boolean} whether boot started
   */
  function lazyInitWhenVisible(rootEl, bootFn) {
    if (!rootEl || typeof bootFn !== "function") {
      return false;
    }

    var started = false;

    function run() {
      if (started) {
        return;
      }
      started = true;
      bootFn();
    }

    if (!("IntersectionObserver" in global)) {
      run();
      return true;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
            run();
            observer.disconnect();
          }
        });
      },
      { root: null, rootMargin: "80px 0px", threshold: [0, 0.12, 0.2] }
    );

    observer.observe(rootEl);
    return true;
  }

  global.Section04LazyInit = {
    lazyInitWhenVisible: lazyInitWhenVisible,
  };
})(typeof window !== "undefined" ? window : this);
