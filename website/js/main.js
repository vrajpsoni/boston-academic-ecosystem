/**
 * App entry — initialize story sections on DOM ready.
 */
(function () {
  "use strict";

  var SECTION_INITS = [
    { id: "ecosystem-map", init: initEcosystemMapSection },
    { id: "enrollment-trends", init: initEnrollmentSection },
    { id: "ecosystem-scale", init: initEcosystemScaleSection },
    { id: "academic-boston", init: initSection04 },
  ];

  function getHeaderHeight() {
    var header = document.querySelector(".site-header");
    return header ? header.offsetHeight : 0;
  }

  function updateHeaderHeightVar() {
    document.documentElement.style.setProperty(
      "--site-header-height",
      getHeaderHeight() + "px"
    );
  }

  function setFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) {
      el.textContent = String(new Date().getFullYear());
    }
  }

  function initSections() {
    SECTION_INITS.forEach(function (section) {
      if (typeof section.init !== "function") {
        console.warn("[main] Missing init for section:", section.id);
        return;
      }
      try {
        section.init();
      } catch (err) {
        console.error("[main] Section init failed:", section.id, err);
      }
    });
  }

  function scrollToPageTop() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    window.setTimeout(function () {
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
      }
    }, 450);
  }

  function scrollToSectionStart(target) {
    var top = target.getBoundingClientRect().top + window.pageYOffset - getHeaderHeight();
    top = Math.max(0, top);

    window.scrollTo({ top: top, left: 0, behavior: "smooth" });

    window.setTimeout(function () {
      var exact =
        target.getBoundingClientRect().top + window.pageYOffset - getHeaderHeight();
      exact = Math.max(0, exact);
      if (Math.abs(window.scrollY - exact) > 2) {
        window.scrollTo(0, exact);
      }
    }, 450);
  }

  function initTopScrollLinks() {
    document.querySelectorAll(".site-nav__link--top").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        if (history.replaceState) {
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
        scrollToPageTop();
      });
    });
  }

  /** Solid on hero; ghosted glass once user scrolls into the story */
  function initHeaderGhostScroll() {
    var header = document.querySelector(".site-header");
    var hero = document.getElementById("landing-hero");
    if (!header || !hero) {
      return;
    }

    var ticking = false;

    function updateGhostState() {
      var heroBottom = hero.getBoundingClientRect().bottom;
      var enterGhost = heroBottom < getHeaderHeight() * 0.65;
      header.classList.toggle("site-header--ghost", enterGhost);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateGhostState);
      }
    }

    updateGhostState();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateGhostState);
  }

  /** Highlight current story section in nav while scrolling */
  function initNavActiveState() {
    var sourcesLink = document.querySelector(".site-nav__link--sources");
    var sectionLinks = Array.prototype.slice.call(
      document.querySelectorAll(
        ".site-nav__link--section:not(.site-nav__link--sources)"
      )
    );
    if (!sectionLinks.length && !sourcesLink) {
      return;
    }

    var items = sectionLinks
      .map(function (link) {
        var hash = link.getAttribute("href");
        if (!hash || hash.length < 2) {
          return null;
        }
        var el = document.getElementById(hash.slice(1));
        return el ? { link: link, el: el } : null;
      })
      .filter(Boolean);

    if (sourcesLink) {
      var outroEl = document.getElementById("story-outro");
      if (outroEl) {
        items.push({ link: sourcesLink, el: outroEl });
      }
    }

    if (!items.length) {
      return;
    }

    var ticking = false;

    function setActiveLink(active) {
      sectionLinks.forEach(function (l) {
        var on = l === active;
        l.classList.toggle("site-nav__link--active", on);
        if (on) {
          l.setAttribute("aria-current", "true");
        } else {
          l.removeAttribute("aria-current");
        }
      });
      if (sourcesLink) {
        var sourcesOn = active === sourcesLink;
        sourcesLink.classList.toggle("site-nav__link--active", sourcesOn);
        if (sourcesOn) {
          sourcesLink.setAttribute("aria-current", "true");
        } else {
          sourcesLink.removeAttribute("aria-current");
        }
      }
    }

    function updateActive() {
      var offset = getHeaderHeight() + 48;
      var scrollPos = window.scrollY + offset;
      var active = null;

      items.forEach(function (item) {
        var top = item.el.getBoundingClientRect().top + window.scrollY;
        if (top <= scrollPos) {
          active = item.link;
        }
      });

      setActiveLink(active);
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateActive);
      }
    }

    sectionLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setActiveLink(link);
      });
    });

    if (sourcesLink) {
      sourcesLink.addEventListener("click", function () {
        setActiveLink(sourcesLink);
      });
    }

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateActive);
  }

  /** Nav + in-page links: scroll so section start sits just below sticky header */
  function initSectionNavScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      if (
        link.classList.contains("site-nav__link--top") ||
        link.classList.contains("skip-link")
      ) {
        return;
      }

      var hash = link.getAttribute("href");
      if (!hash || hash.length < 2) {
        return;
      }

      var id = hash.slice(1);
      var target = document.getElementById(id);

      if (!target || id === "landing-hero") {
        return;
      }

      if (
        !target.classList.contains("story-section") &&
        !target.closest(".story-section") &&
        id !== "story-outro"
      ) {
        return;
      }

      link.addEventListener("click", function (event) {
        event.preventDefault();
        updateHeaderHeightVar();
        scrollToSectionStart(target);
        if (history.replaceState) {
          history.replaceState(null, "", hash);
        }
      });
    });
  }

  function onReady() {
    updateHeaderHeightVar();
    window.addEventListener("resize", updateHeaderHeightVar);
    setFooterYear();
    initTopScrollLinks();
    initHeaderGhostScroll();
    initNavActiveState();
    initSectionNavScroll();
    initSections();
    if (typeof initStoryOutro === "function") {
      initStoryOutro();
    }
    if (typeof initStoryScrollReveal === "function") {
      initStoryScrollReveal();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
