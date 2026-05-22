/**
 * Global editorial scroll reveals — fade + lift, replays on every scroll-in.
 * Markup: class "story-reveal" (+ optional story-reveal--delay-1 … delay-3).
 * Or: data-story-reveal on blocks inside .story-section (auto-stagger children).
 */
(function (global) {
  "use strict";

  var REVEAL_SELECTOR = ".story-reveal, [data-story-reveal]";
  var REVEALED_CLASS = "is-revealed";
  var OBSERVED_ATTR = "data-story-reveal-observed";

  var ENTER_RATIO = 0.12;
  var EXIT_RATIO = 0.04;
  var TAIL_ENTER_RATIO = 0.07;
  var TAIL_EXIT_RATIO = 0.03;
  var TAIL_ZONE_SELECTOR = ".story-outro, .site-footer";

  var observer = null;
  var reducedMotion = false;
  var watchStarted = false;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function revealAll(nodes) {
    nodes.forEach(function (el) {
      el.classList.add(REVEALED_CLASS);
    });
  }

  function isTailReveal(el) {
    if (!el || el.nodeType !== 1) {
      return false;
    }
    return (
      el.classList.contains("story-reveal--tail") ||
      el.getAttribute("data-story-reveal") === "tail" ||
      !!el.closest(TAIL_ZONE_SELECTOR)
    );
  }

  function enterRatioFor(el) {
    return isTailReveal(el) ? TAIL_ENTER_RATIO : ENTER_RATIO;
  }

  function exitRatioFor(el) {
    return isTailReveal(el) ? TAIL_EXIT_RATIO : EXIT_RATIO;
  }

  function shouldReveal(entry) {
    return (
      entry.isIntersecting &&
      entry.intersectionRatio >= enterRatioFor(entry.target)
    );
  }

  function shouldHide(entry) {
    return (
      !entry.isIntersecting ||
      entry.intersectionRatio <= exitRatioFor(entry.target)
    );
  }

  function isPersistReveal(el) {
    return (
      el.classList.contains("story-reveal--persist") ||
      el.getAttribute("data-story-reveal") === "persist"
    );
  }

  function applyRevealState(el, reveal) {
    if (reveal) {
      el.classList.add(REVEALED_CLASS);
    } else if (!isPersistReveal(el)) {
      el.classList.remove(REVEALED_CLASS);
    }
  }

  function onIntersect(entries) {
    entries.forEach(function (entry) {
      var el = entry.target;

      if (shouldReveal(entry)) {
        applyRevealState(el, true);
      } else if (shouldHide(entry) && !isPersistReveal(el)) {
        applyRevealState(el, false);
      }
    });
  }

  function observeNode(el) {
    if (!observer || el.getAttribute(OBSERVED_ATTR) === "true") {
      return;
    }
    el.setAttribute(OBSERVED_ATTR, "true");
    observer.observe(el);
  }

  function collectRevealNodes(root) {
    var scope = root || document;
    return scope.querySelectorAll(REVEAL_SELECTOR);
  }

  function applyAutoStaggerInGroups() {
    document.querySelectorAll("[data-story-reveal-group]").forEach(function (group) {
      var children = group.querySelectorAll("[data-story-reveal]");
      children.forEach(function (child, index) {
        if (!child.classList.contains("story-reveal")) {
          child.classList.add("story-reveal");
        }
        if (index >= 1 && index <= 3) {
          child.classList.add("story-reveal--delay-" + index);
        }
      });
    });
  }

  function observeAll(root) {
    collectRevealNodes(root).forEach(observeNode);
  }

  function revealInViewport(nodes) {
    var viewport = window.innerHeight || document.documentElement.clientHeight;
    nodes.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < viewport * 0.92 && rect.bottom > viewport * 0.06) {
        el.classList.add(REVEALED_CLASS);
      }
    });
  }

  function createObserver() {
    return new IntersectionObserver(onIntersect, {
      threshold: [0, TAIL_EXIT_RATIO, EXIT_RATIO, TAIL_ENTER_RATIO, ENTER_RATIO, 0.2],
      rootMargin: "0px 0px -2% 0px",
    });
  }

  function refreshTailReveals() {
    if (reducedMotion) {
      return;
    }
    var nodes = document.querySelectorAll(
      TAIL_ZONE_SELECTOR + " " + REVEAL_SELECTOR
    );
    if (!nodes.length) {
      return;
    }
    ensureObserver();
    nodes.forEach(observeNode);
    revealInViewport(nodes);
  }

  function watchFutureContent() {
    if (watchStarted) {
      return;
    }
    watchStarted = true;

    var main = document.getElementById("main-content");
    if (!main || typeof MutationObserver === "undefined") {
      return;
    }

    var pending = null;

    function flush() {
      pending = null;
      observeAll(main);
    }

    new MutationObserver(function (mutations) {
      var hasNew = mutations.some(function (m) {
        return m.addedNodes && m.addedNodes.length;
      });
      if (!hasNew) {
        return;
      }
      if (pending) {
        cancelAnimationFrame(pending);
      }
      pending = requestAnimationFrame(flush);
    }).observe(main, { childList: true, subtree: true });
  }

  function ensureObserver() {
    if (!observer) {
      observer = createObserver();
      watchFutureContent();
    }
  }

  /**
   * Observe newly added reveal nodes without resetting the global observer.
   * @param {ParentNode} [root]
   */
  function observeStoryRevealNodes(root) {
    reducedMotion = prefersReducedMotion();
    applyAutoStaggerInGroups();

    var nodes = collectRevealNodes(root);
    if (!nodes.length) {
      return;
    }

    if (reducedMotion) {
      revealAll(nodes);
      return;
    }

    ensureObserver();
    observeAll(root);
    revealInViewport(nodes);
  }

  function initStoryScrollReveal() {
    reducedMotion = prefersReducedMotion();
    applyAutoStaggerInGroups();

    var nodes = collectRevealNodes();
    if (!nodes.length) {
      return;
    }

    if (reducedMotion) {
      revealAll(nodes);
      return;
    }

    if (!observer) {
      observer = createObserver();
      watchFutureContent();
    }

    observeAll();
    revealInViewport(nodes);
  }

  function bindPostEconomyContinuity() {
    document.addEventListener("econ-playback-complete", refreshTailReveals);
  }

  global.initStoryScrollReveal = initStoryScrollReveal;
  global.observeStoryRevealNodes = observeStoryRevealNodes;
  global.refreshTailReveals = refreshTailReveals;

  bindPostEconomyContinuity();
})(window);
