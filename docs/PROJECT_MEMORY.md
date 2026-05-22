# PROJECT MEMORY — CS617 FINAL PROJECT

## Project Title
Boston: A Hub of Academic Excellence

## Core Story
The project explores how Boston has become a city deeply shaped by students, universities, research institutions, and academic culture.

The main narrative:
"Everywhere around Boston, student-related infrastructure exists."

The goal is to visually demonstrate how universities, dorms, research labs, and academic institutions influence Boston's identity and ecosystem.

---

# WEBSITE STYLE

Reference Website:
https://avanith12.github.io/Unemployment-in-Massachusetts-vs.-the-U.S/

Project Style:
- clean storytelling visualization website
- modern but academic
- visually engaging
- NOT cinematic
- NOT overly animated
- smooth scrolling narrative structure
- global subtle scroll reveals (`.story-reveal` in `website/css/story-reveal.css` + `js/story/scroll-reveal.js`)
- section rhythm: heading → short intro → viz → insights on scroll

---

# SECTION 02 DATASET (v1)

File: `data/greater_boston_enrollment_v1.csv`  
Sources: `data/DATA_REFERENCES.md` (master) · `data/ENROLLMENT_DATA_SOURCES.md` (Section 02 detail)  
Six universities, 2004–2023, from NCES IPEDS Fall Enrollment (EF).  
Rebuild: `python3 data/scripts/build_enrollment_dataset.py`

---

# SECTION 03 — ECOSYSTEM SCALE (v1)

**Purpose:** Cinematic aggregate enrollment storytelling — hero number + supporting metrics.  
**Data:** `data/section_03/processed/greater_boston_ecosystem_enrollment_v1.csv` (29 map-scope schools, Fall 2023 IPEDS).  
**Rebuild:** `python3 data/scripts/build_section_03_ecosystem_totals.py`  
**Website:** `#ecosystem-scale` · `section-03-ecosystem-scale.css` · `section-03-ecosystem-scale.js`

**Former Section 03 (neighborhood heatmaps)** → **Section 04** (`data/section_04/`, `section-04-neighborhood.*`)

---

# FIRST WEBSITE SECTION

## Interactive Greater Boston Academic Ecosystem Map

Purpose:
Introduce the project visually by showing the density of universities, student housing, research institutions, and academic infrastructure around Boston.

Main storytelling idea:
"In Boston, almost every part of the city is connected to student life."

---

# MAP SCOPE

Coverage area:
- Boston
- Cambridge
- Somerville
- Brookline
- Quincy
- nearby Greater Boston student-centered areas

DO NOT include distant Massachusetts regions.

The map should initially display most of Massachusetts while pins remain concentrated around Greater Boston.

---

# MAP STYLE

Theme:
- bright/light mode

Interactions:
- draggable map
- scroll zoom
- hover/click interactions
- lightweight interactions only

When clicking or hovering:
- show institution name
- optional small tooltip

DO NOT create:
- heavy Google Maps-style information panels
- cinematic effects
- unnecessary complexity

---

# MAP DATA CATEGORIES

Include:
- universities
- colleges
- student housing/dorms
- research institutes
- medical/research centers

DO NOT include:
- elementary schools
- middle schools
- unrelated K-12 institutions

The map should feel like:
"Boston's higher education ecosystem."

---

# TECH STACK

Frontend:
- HTML
- CSS
- JavaScript

Visualization:
- Leaflet.js
- OpenStreetMap
- Plotly.js later for charts

Data:
- CSV datasets

Hosting:
- GitHub Pages

---

# MAP DATA TARGET

Target:
~80–150 meaningful pins.

Goal:
- visually dense
- readable
- storytelling-focused
- not cluttered

---

# CURRENT DEVELOPMENT STATUS

Completed:
- proposal
- presentation
- storytelling direction
- website inspiration/reference
- first visualization concept
- map planning
- project structure setup

Current Phase:
- planning
- dataset collection
- visualization architecture

NOT started yet:
- website coding
- chart coding
- deployment

---

# IMPORTANT WORKFLOW RULE

The project should be built:
- one section at a time
- one visualization at a time
- with data/story first before coding

Avoid overengineering.
Prioritize clarity, storytelling, and clean visualizations.
