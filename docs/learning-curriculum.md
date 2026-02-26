# Curriculum: Learning How the Project Code Works

This curriculum is designed for a **beginner** and is focused on helping you understand this repository in practical, project-specific steps.

## Goal

Build your understanding of web development fundamentals while learning this codebase by making small, visible changes to a new page:

- `learning-how-the-project-code-works.html`

You will complete exercises in order. Each exercise adds new elements to that page and includes short notes on what you learned.

---

## How to Use This Curriculum with Codex

1. Work through modules in order.
2. For each exercise, ask Codex to implement only that exercise.
3. After each exercise, review the changed files and compare before/after.
4. Keep your personal notes directly in the page so your learning history lives in the code.

---

## Priority Learning Path (Beginner-First)

### Module 0 — Orientation (very easy)
**Why first:** You need a map of the project before details.

**What to understand**
- The repo has multiple zones:
  - Static site at root (`index.html`, `style.css`, `site.js`)
  - React app in `timeline-scratch/`
  - Supabase SQL migrations in `supabase/migrations/`
- A browser page is built from HTML (structure), CSS (visual style), and JS (behavior).

**Exercise 0 — Add your learning home page link**
- Add a link button from the home page to `learning-how-the-project-code-works.html`.
- On the learning page, add a short “What this page is for” section.

**What you should be able to explain after this**
- Which files control page structure vs styles.
- How one HTML page links to another.

---

### Module 1 — HTML essentials in this repo (easy)
**Why now:** HTML is the easiest way to build confidence and see immediate results.

**What to understand**
- Semantic tags used in the project (`header`, `main`, `section`, `article`, `footer`, `nav`).
- Class names and IDs as hooks for CSS/JS.
- Accessibility basics (`aria-label`, heading order, readable link text).

**Exercise 1 — Build a “HTML Concepts Learned” section**
- Add a new section with:
  - A heading
  - A short list (`ul`) of concepts learned
  - A “Before / After” note block
- Add one `article` card per concept.

**What you should be able to explain after this**
- Why semantic tags matter.
- Why class names are reused across pages.

---

### Module 2 — CSS essentials in this repo (easy to medium)
**Why now:** Styling is heavily centralized in `style.css`.

**What to understand**
- CSS variables in `:root`.
- Reusable utility-like components (`.button`, `.card`, layout patterns).
- Responsive adjustments and spacing patterns.

**Exercise 2 — Add a styled “CSS Concepts Learned” board**
- Add a new section with 3 concept cards.
- Reuse existing classes (`.card`, `.button`) where possible.
- Add 1–2 new classes in `style.css` specific to the learning page.
- Include notes in each card: “I changed X; it affected Y.”

**What you should be able to explain after this**
- How a CSS class maps to a visible change.
- Why design tokens (variables) are useful.

---

### Module 3 — JavaScript basics in this repo (medium)
**Why now:** You will start reading and adding behavior.

**What to understand**
- How script tags load code (`site.js`, `editable-content.js`).
- DOM query + event listeners.
- Updating text/content dynamically.

**Exercise 3 — Add an interactive “JS Concepts Learned” panel**
- Add a button: “Mark concept as understood”.
- Clicking it should append a new checklist item with a timestamp.
- Add short code comments that explain each JS line in plain language.

**What you should be able to explain after this**
- How JS finds elements and changes the page.
- Difference between static HTML content and JS-generated content.

---

### Module 4 — Project architecture and file flow (medium)
**Why now:** You know basics; now connect files into systems.

**What to understand**
- Root static site vs React timeline app.
- Entry points and where behavior starts.
- Data layer conceptually: front-end → service file → Supabase.

**Exercise 4 — Add an architecture map section**
- Add a visual list that maps:
  - `index.html` → `style.css` + `site.js`
  - `timeline-scratch/src/main*.jsx` → React components
  - `timeline-scratch/src/services/*` → data requests
- Add one plain-language sentence per arrow.

**What you should be able to explain after this**
- Where to start debugging when a static page breaks vs React page breaks.

---

### Module 5 — React + component thinking (medium)
**Why now:** React is important in this repo, but it’s easier after DOM basics.

**What to understand**
- Component = function that returns UI.
- Props, state, and rendering flow.
- Folder organization in `timeline-scratch/src/components`.

**Exercise 5 — Add a React learning notes section to your page**
- Add an explanatory section (in static page) that includes:
  - “What is a component?”
  - “What is state?”
  - “What is a prop?”
- Add links to 2–3 specific React files you studied.

**What you should be able to explain after this**
- Why React code is split into many files.
- How data moves from parent to child component.

---

### Module 6 — TypeScript + services (medium)
**Why now:** You can read JS first, then typed JS.

**What to understand**
- Basic TypeScript syntax (`type`, `interface`, typed function params).
- Why some project files are `.ts/.tsx`.
- How service files isolate API/data logic.

**Exercise 6 — Add “TypeScript translation” notes**
- Add a section with two examples:
  - one JS function rewritten in typed form (educational sample)
  - one service contract example (input/output notes)
- Keep examples short and commented.

**What you should be able to explain after this**
- What a type annotation does and why it helps.

---

### Module 7 — Data + SQL awareness (medium)
**Why now:** You need enough frontend understanding first.

**What to understand**
- Migration files in `supabase/migrations/` define schema changes.
- Basic SQL read skills: `create table`, `alter table`, policy statements.
- Only focus on SQL and the connection code in this repo (not platform internals).

**Exercise 7 — Add a “Data flow + SQL notes” section**
- Add a simple 3-step flow diagram:
  1. UI action
  2. Service call
  3. Database table/migration context
- Add one SQL snippet with a plain-English translation.

**What you should be able to explain after this**
- How a frontend action ultimately relates to stored data.

---

## Weekly Pacing (Suggested)

- **Week 1:** Modules 0–2
- **Week 2:** Modules 3–4
- **Week 3:** Modules 5–6
- **Week 4:** Module 7 + review

If a module feels hard, stretch it over more days and keep changes tiny.

---

## Progress Tracker

Mark each as you complete it:

- [ ] Module 0 complete
- [ ] Module 1 complete
- [ ] Module 2 complete
- [ ] Module 3 complete
- [ ] Module 4 complete
- [ ] Module 5 complete
- [ ] Module 6 complete
- [ ] Module 7 complete

---

## Rules for Each Exercise

1. Make one small visible change.
2. Add a short “What I learned” note right next to it.
3. Commit after each exercise.
4. Ask Codex to explain the diff in beginner language.

---

## Scope Notes (per your request)

- Focus is web fundamentals + this codebase’s patterns.
- We avoid deep Supabase/Clerk platform internals.
- We only cover **how this project’s code connects to them**.
