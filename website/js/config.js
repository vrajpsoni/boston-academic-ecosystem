/**
 * Site-wide configuration (paths, section IDs).
 * @global
 */
(function (global) {
  "use strict";

  global.SiteConfig = {
    dataBaseUrl: "data/",
    ecosystemCsv: "data/greater_boston_academic_ecosystem.csv",
    enrollmentCsv: "data/greater_boston_enrollment.csv",
    ecosystemEnrollmentCsv: "data/greater_boston_ecosystem_enrollment.csv",
    neighborhoodGeoJson: "data/student_ecosystem_boundaries.geojson?v=20260522a",
    sections: {
      ecosystemMap: "ecosystem-map",
      enrollmentTrends: "enrollment-trends",
      ecosystemScale: "ecosystem-scale",
      academicBoston: "academic-boston",
      section04a: "section-04a-neighborhoods",
      section04b: "section-04b-business",
      section04c: "academic-economy",
      academicEconomy: "academic-economy",
    },
    section05ScaleCsv: "data/section_05_institution_scale.csv",
    mapCanvasId: "ecosystem-map-canvas",
    mapStatusId: "ecosystem-map-status",
    enrollmentChartId: "enrollment-chart",
    enrollmentChartStatusId: "enrollment-chart-status",
    section04a: {
      canvasId: "section-04a-map-canvas",
      statusId: "section-04a-map-status",
    },
    section04b: {
      canvasId: "section-04b-constellation",
      statusId: "section-04b-constellation-status",
    },
    section04c: {
      matrixId: "section-04c-matrix",
      statusId: "section-04c-matrix-status",
    },

    /**
     * Source / methodology links (live repo).
     * Navbar Sources control stays #story-outro in index.html (in-page scroll).
     * registry: future paths for docs (not wired to UI until hrefs are set).
     */
    sources: {
      navbar: {
        href: "https://github.com/vrajpsoni/boston-academic-ecosystem",
        external: true,
      },
      outro: {
        explore: {
          label: "Explore sources",
          href: "https://github.com/vrajpsoni/boston-academic-ecosystem/tree/main/data",
          external: true,
        },
        methodology: {
          label: "View methodology",
          href: "https://github.com/vrajpsoni/boston-academic-ecosystem/tree/main/docs",
          external: true,
        },
        repository: {
          label: "Project repository",
          href: "https://github.com/vrajpsoni/boston-academic-ecosystem",
          external: true,
        },
      },
      registry: {
        dataReferences: {
          label: "DATA_REFERENCES.md",
          path: "data/DATA_REFERENCES.md",
          href: "",
        },
        enrollmentSources: {
          label: "ENROLLMENT_DATA_SOURCES.md",
          path: "data/ENROLLMENT_DATA_SOURCES.md",
          href: "",
        },
        section05Methodology: {
          label: "SECTION_05_METHODOLOGY.md",
          path: "data/section_05/sources/SECTION_05_METHODOLOGY.md",
          href: "",
        },
        section04bActivity: {
          label: "SECTION_04B_ACTIVITY_METHODOLOGY.md",
          path: "data/section_04/sources/SECTION_04B_ACTIVITY_METHODOLOGY.md",
          href: "",
        },
        section04aAudit: {
          label: "SECTION_04A_DATA_AUDIT.md",
          path: "data/section_04/sources/SECTION_04A_DATA_AUDIT.md",
          href: "",
        },
        walkthrough: {
          label: "PROJECT_FINAL_WALKTHROUGH.md",
          path: "docs/PROJECT_FINAL_WALKTHROUGH.md",
          href: "",
        },
      },
    },
  };
})(typeof window !== "undefined" ? window : this);
