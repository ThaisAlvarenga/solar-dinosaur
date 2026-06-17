# solar-dinosaur

A React + Vite website with three side-by-side Three.js scenes (energy, CO2, and saving) in a triptych layout, an interactive **2021–2026 timeline** with an energy-spark design, a **Look Ahead** mode that transitions to a full-width **Future** scene, and a **menu overlay** for additional content pages.

**Quick links for editors:**

| I want to… | Edit this file |
|------------|----------------|
| Change menu page text | **`src/components/ContentPage.jsx`** |
| Change menu link labels | **`src/components/SiteMenu.jsx`** |
| Change timeline years or default year | **`src/constants/timeline.js`** |
| Change timeline look (spark, tail, track) | **`src/components/Timeline.css`** |
| Change Look Ahead / Back / menu button style | **`src/index.css`** (`.chrome-cta`) |
| Change page background or global colors | **`src/index.css`** |
| Change Three.js scenes | **`src/scenes/index.js`** |

This guide assumes you are starting on a machine with **no development tools installed** yet.

## What you need

| Tool | Why |
|------|-----|
| **Git** | To download the project from the repository |
| **Node.js** (includes **npm**) | To install packages and run the dev server |

You do **not** need to install React, Vite, or Three.js yourself. They are installed automatically when you run `npm install`.

**Recommended Node.js version:** 20 LTS or newer.

---

## 1. Install Git

Git lets you clone (download) the repository.

### Windows

1. Download the installer from [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Run the installer and accept the default options
3. Open **PowerShell** or **Command Prompt** and verify:

```bash
git --version
```

### macOS

1. Install Xcode Command Line Tools (if prompted when running `git` for the first time), **or** install Git from [https://git-scm.com/download/mac](https://git-scm.com/download/mac)
2. Open **Terminal** and verify:

```bash
git --version
```

### Linux (Debian/Ubuntu)

```bash
sudo apt update
sudo apt install git
git --version
```

---

## 2. Install Node.js

Node.js includes **npm** (Node Package Manager), which this project uses to install dependencies and run scripts.

### Windows

1. Download the **LTS** installer from [https://nodejs.org](https://nodejs.org)
2. Run the installer (keep **“Add to PATH”** enabled)
3. Close and reopen PowerShell, then verify:

```bash
node --version
npm --version
```

### macOS

1. Download the **LTS** installer from [https://nodejs.org](https://nodejs.org), **or** install with Homebrew:

```bash
brew install node
```

2. Verify:

```bash
node --version
npm --version
```

### Linux (Debian/Ubuntu)

Using NodeSource for a current LTS release:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

---

## 3. Get the project

### Option A: Clone with Git (recommended)

```bash
git clone <repository-url>
cd solar-dinosaur
```

Replace `<repository-url>` with the actual URL of this repo (for example, a GitHub `https://` or `git@` URL).

### Option B: Download a ZIP

1. Download the repository as a ZIP from your Git host (e.g. GitHub **Code → Download ZIP**)
2. Extract the ZIP
3. Open a terminal in the extracted `solar-dinosaur` folder

---

## 4. Install project dependencies

From the project root (the folder that contains `package.json`):

```bash
npm install
```

This reads `package.json` and downloads everything the app needs (React, Vite, Three.js, etc.) into a local `node_modules` folder. You only need to run this once, or again after dependencies change.

---

## 5. Run the development server

```bash
npm run dev
```

You should see output similar to:

```text
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open that URL in a browser (Chrome, Firefox, Edge, or Safari).

To stop the server, press `Ctrl+C` in the terminal.

---

## 6. Other useful commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Serve the production build locally (run `build` first) |
| `npm run lint` | Check the code with ESLint |

---

## Appearance and theme

The site uses a **black background** (`#000`) with light text. This is set in **`src/index.css`** via `--bg: #000` and `background: #000` on `html` and `body`.

| Token | Purpose | Where to edit |
|-------|---------|---------------|
| `--bg` | Page background | **`src/index.css`** |
| `--text` / `--text-h` | Body and heading text | **`src/index.css`** |
| `--border` | Dividers (header, footer, timeline top border) | **`src/index.css`** |
| `--accent` | Purple accent (menu focus, etc.) | **`src/index.css`** |

Timeline colors (white track, yellow spark dot, energy tail) are scoped separately in **`src/components/Timeline.css`** — see [Timeline](#timeline).

The Three.js scenes use transparent canvases, so they sit on top of the black page background.

---

## Typography

The site uses **[Anybody](https://fonts.google.com/specimen/Anybody)** for all text (navigation, timeline, footer, and UI).

The font is loaded from Google Fonts in **`index.html`** and applied globally via CSS variables in **`src/index.css`**:

```css
--sans: 'Anybody', system-ui, sans-serif;
--heading: 'Anybody', system-ui, sans-serif;
--mono: 'Anybody', system-ui, sans-serif;
```

To change the font, update the Google Fonts `<link>` in **`index.html`** and the `--sans`, `--heading`, and `--mono` variables in **`src/index.css`**.

---

## Troubleshooting

### `node` or `npm` is not recognized

- Node.js is not installed, or the terminal was opened **before** installation finished
- Close all terminal windows, open a new one, and run `node --version` again
- On Windows, confirm Node.js was added to PATH during install

### `npm install` fails with permission errors

- Avoid using `sudo npm install` on macOS/Linux inside the project folder
- If needed, fix npm’s default directory: [https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

### Port 5173 is already in use

- Another app (or another Vite dev server) is using that port
- Stop the other process, or run with a different port:

```bash
npm run dev -- --port 5174
```

### Blank page or errors after cloning

1. Make sure you are in the project root (where `package.json` lives)
2. Delete `node_modules` and reinstall:

```bash
rm -rf node_modules
npm install
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### The page scrolls oddly or scenes look wrong

- Use a modern browser with WebGL support
- Try a hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (macOS)

---

## File organization

The project is a standard Vite + React app. Here is what each important file and folder does:

```text
solar-dinosaur/
├── index.html              # HTML entry; loads Anybody from Google Fonts and src/main.jsx
├── package.json            # Project name, dependencies, and npm scripts
├── package-lock.json       # Locked dependency versions (created by npm install)
├── vite.config.js          # Vite build/dev server configuration
├── eslint.config.js        # Linting rules
│
├── public/                 # Static files served as-is (not processed by React)
│   └── icons.svg           # SVG icons used elsewhere in the template
│
└── src/                    # Application source code
    ├── main.jsx            # React entry point; mounts <App /> into index.html
    ├── index.css           # Global styles (black theme, typography, #root layout, .chrome-cta buttons)
    ├── App.jsx             # Page structure, carousel state, menu routing, timeline wiring
    ├── App.css             # Layout, triptych, carousel transitions, Back button stage, footer
    │
    ├── constants/
    │   └── timeline.js     # Timeline year range, default year, yearProgress()
    │
    ├── components/
    │   ├── ThreePanel.jsx  # React wrapper that mounts and runs a Three.js scene
    │   ├── Timeline.jsx    # Clickable 2021–2026 timeline + Look Ahead button
    │   ├── Timeline.css    # Timeline track, energy spark dot, progress tail, CTA positioning
    │   ├── SiteMenu.jsx    # solar-dinosaur logo toggle + full-screen menu overlay
    │   ├── SiteMenu.css    # Menu overlay and large menu link buttons
    │   ├── ContentPage.jsx # Placeholder content for non-main menu pages
    │   └── ContentPage.css # Content page layout and typography
    │
    ├── scenes/
    │   └── index.js        # All Three.js scene definitions (triptych + Future)
    │
    └── assets/             # Images and SVGs imported by React components
        ├── hero.png
        ├── react.svg
        └── vite.svg
```

### How the pieces connect

1. **`index.html`** loads the **Anybody** font and **`src/main.jsx`**, which renders **`App.jsx`**.
2. **`App.jsx`** holds **year**, **lookAheadActive**, **showFuture**, **menuOpen**, and **siteView** state. It lays out: header (**SiteMenu**) → main content (triptych/Future or **ContentPage**) → timeline chrome (timeline + Back button) → footer.
3. Clicking **solar-dinosaur** in the header opens the **SiteMenu** overlay. **Main site** shows the triptych + timeline; other links show **ContentPage** placeholders.
4. The **triptych** renders three **`ThreePanel`** components (`"energy"`, `"co2"`, `"saving"`), each receiving the current `year`.
5. **`ThreePanel`** looks up the variant in **`src/scenes/index.js`**, creates the scene, and runs the animation loop. When `year` changes, it calls each scene’s `applyYear()` function.
6. **`Timeline`** displays years **2021–2026** plus a **Look Ahead** button. Clicking a year updates all three triptych scenes. Clicking **Look Ahead** triggers the carousel transition to the **Future** scene.
7. **`App.css`** defines scene carousel animations (panels slide apart; Future slides in). **`Timeline.css`** handles the energy-themed timeline. Shared pill button styles live in **`index.css`** as **`.chrome-cta`** (used by Look Ahead and Back).

---

## Site navigation and content pages

Click **solar-dinosaur** in the header to open a full-screen menu overlay. The menu links are defined in **`src/components/SiteMenu.jsx`**:

```js
const MENU_LINKS = [
  { id: 'main', label: 'Main site' },
  { id: 'artist-statement', label: 'Artist statement / Context of the project / Overview' },
  { id: 'research', label: 'Research Links / Data points / References' },
  { id: 'team', label: 'Team section' },
]
```

| Link | What it shows |
|------|----------------|
| **Main site** | Triptych scenes + timeline (resets year to 2021) |
| **Artist statement…** | Content page placeholder |
| **Research Links…** | Content page placeholder |
| **Team section** | Content page placeholder |

### Where to edit page content

All non-main page copy lives in **`src/components/ContentPage.jsx`** in the `CONTENT` object at the top of the file:

```js
const CONTENT = {
  'artist-statement': {
    title: 'Artist statement / Context of the project / Overview',
    body: [
      'First paragraph…',
      'Second paragraph…',
    ],
  },
  research: {
    title: 'Research Links / Data points / References',
    body: [
      'Add research links, datasets, and references for the project here.',
    ],
  },
  team: {
    title: 'Team section',
    body: [
      'Add team member names, roles, and bios here.',
    ],
  },
}
```

Each entry has:

- **`title`** — shown as the page heading (`<h1>`)
- **`body`** — array of strings; each string becomes one `<p>` paragraph

To edit a page, change the `title` and/or add, remove, or rewrite strings in `body`. The `id` keys (`artist-statement`, `research`, `team`) must match the `id` values in **`SiteMenu.jsx`** `MENU_LINKS`.

### Adding a new menu page

1. Add a link to **`MENU_LINKS`** in **`src/components/SiteMenu.jsx`** with a unique `id` and `label`
2. Add a matching entry to the `CONTENT` object in **`src/components/ContentPage.jsx`**
3. Optionally style the page in **`src/components/ContentPage.css`**

Menu overlay styling (large buttons, backdrop) is in **`src/components/SiteMenu.css`**. Menu buttons reuse the same pill style as Look Ahead via **`.chrome-cta`**.

### Navigation state

**`src/App.jsx`** tracks which view is active with `siteView` (`'main'`, `'artist-statement'`, `'research'`, or `'team'`). `handleNavigate()` switches views; choosing **Main site** also resets the timeline to **2021** and exits Look Ahead mode.

---

## Shared button style (Look Ahead, Back, menu)

**Look Ahead**, **Back**, and the menu overlay links share a pill button style defined as **`.chrome-cta`** in **`src/index.css`**:

- Squared corners (`border-radius: 10px`)
- `3.5px` border with a light gradient fill
- Hover brightening

**Look Ahead** adds **`timeline-cta`** in **`Timeline.css`** for absolute positioning on the timeline line.

**Back** appears in the timeline strip when the Future scene is open (left-aligned in **`.back-stage`** in **`App.css`**). It uses **`chrome-cta`** only — no `is-active` class, so it does not show the purple accent ring.

To change the shared button appearance, edit **`.chrome-cta`** in **`src/index.css`**. To change Look Ahead placement on the timeline, edit **`.timeline-cta`** in **`Timeline.css`**.

---

## Timeline

The site includes a full-width timeline between the main content and the footer.

- Clicking a **year** updates all **three triptych** Three.js scenes at once.
- Clicking **Look Ahead** transitions to the **Future** scene (see [Look Ahead and the Future scene](#look-ahead-and-the-future-scene) below).

### Default year

The site starts on **2021**. The default is set in **`src/constants/timeline.js`**:

```js
export const DEFAULT_YEAR = 2021
```

### Timeline layout and styling

The timeline spans the full page width and uses an **energy spark** visual theme on a black background:

| Element | Description |
|---------|-------------|
| **Track line** | Low-opacity white placeholder (`--timeline-track`, ~22% opacity) running from the center of **2021** to the center of **2026** |
| **Progress tail** | White-to-yellow gradient that fades in from transparent on the left and brightens toward the active year — reads as the energy trail behind the spark |
| **Year markers** | Hollow circles on the track; inactive markers use the same low-opacity white as the track |
| **Active year dot** | Yellow radial gradient with a multi-layer glow (energy spark effect) |
| **Look Ahead button** | Pill CTA after **2026**, centered on the timeline line via **`.timeline-cta`** |

The track line is positioned with CSS so it aligns exactly with the year dot centers (not the full width including the Look Ahead column). See **`--timeline-year-columns`** and **`--timeline-total-columns`** in **`Timeline.css`**.

### Timeline color variables

Edit these in **`.timeline-track`** inside **`src/components/Timeline.css`**:

| Variable | Purpose | Default |
|----------|---------|---------|
| `--timeline-track` | Inactive line and marker rings | `rgba(255, 255, 255, 0.22)` |
| `--timeline-spark` | Active dot base yellow | `#ffd54a` |
| `--timeline-spark-hot` | Active dot bright core | `#fff59d` |
| `--timeline-spark-glow` | Active dot outer glow | `rgba(255, 213, 74, 0.55)` |

The progress tail gradient and spark `box-shadow` are in **`.timeline-progress`** and **`.timeline-year.is-active .timeline-marker`** in the same file.

### Where the timeline code lives

| File | Purpose |
|------|---------|
| **`src/components/Timeline.jsx`** | Renders the timeline UI, year clicks, and Look Ahead button |
| **`src/components/Timeline.css`** | Track alignment, spark dot, progress tail, CTA positioning |
| **`src/constants/timeline.js`** | Year list (`2021`–`2026`), default year, and `yearProgress()` helper |

**`src/App.jsx`** owns timeline state and connects it to the scenes:

```jsx
const [year, setYear] = useState(DEFAULT_YEAR)
const [lookAheadActive, setLookAheadActive] = useState(false)
const [showFuture, setShowFuture] = useState(false)

const handleYearChange = (nextYear) => {
  setLookAheadActive(false)
  setYear(nextYear)
}

const handleLookAhead = () => {
  setLookAheadActive(true)
  setShowFuture(true)
  setYear(TIMELINE_YEARS[TIMELINE_YEARS.length - 1])
}

<Timeline
  year={year}
  onYearChange={handleYearChange}
  lookAheadActive={lookAheadActive}
  onLookAhead={handleLookAhead}
/>
```

### How the timeline affects the triptych scenes

Each triptych scene factory in **`src/scenes/index.js`** returns an `applyYear(year)` function. When you click a year:

1. **`Timeline`** calls `onYearChange(year)`
2. **`App.jsx`** sets `lookAheadActive` to `false` and updates `year`
3. Each triptych **`ThreePanel`** calls `applyYear(year)` on its scene (without remounting the canvas)

`yearProgress(year)` maps the selected year to a value from `0` (2021) to `1` (2026). Scenes use that value to interpolate sizes, colors, and animation speed.

| Scene | What changes from 2021 → 2026 |
|-------|-------------------------------|
| **Energy** | Core grows brighter and larger; corona and orbit expand; rotation speeds up |
| **CO2** | Knot grows and shifts from purple to red; ring expands; rotation speeds up |
| **Saving** | Figure grows and becomes greener; ground lightens; bobbing increases slightly |

### How to edit the timeline

**Change the year range** — edit `TIMELINE_YEARS` in **`src/constants/timeline.js`**:

```js
export const TIMELINE_YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
```

If you change the range, update each triptych scene’s `applyYear()` logic in **`src/scenes/index.js`** so the visual changes still match your years. You may also need to adjust the track line width in **`Timeline.css`** (`--timeline-year-columns` / `--timeline-total-columns`).

**Change the default starting year** — edit `DEFAULT_YEAR` in the same constants file.

**Change timeline appearance** — edit **`src/components/Timeline.css`**:

- **Track / inactive markers:** `--timeline-track`
- **Spark dot colors and glow:** `--timeline-spark`, `--timeline-spark-hot`, `--timeline-spark-glow`, and `.timeline-year.is-active .timeline-marker`
- **Progress tail gradient:** `.timeline-progress`
- **Look Ahead position:** `.timeline-cta`

**Change shared button style (Look Ahead + Back + menu):** edit **`.chrome-cta`** in **`src/index.css`**.

**Change what happens when a year is selected** — edit the `applyYear()` function inside each triptych scene in **`src/scenes/index.js`**.

---

## Look Ahead and the Future scene

Clicking the **Look Ahead -->** button on the timeline replaces the triptych with a single full-width **Future** Three.js scene, using a horizontal carousel-style transition.

### What happens when you click Look Ahead

1. **`lookAheadActive`** becomes `true` and **`showFuture`** becomes `true` in **`App.jsx`**
2. The year is set to **2026** (the last timeline year)
3. CSS class **`scene-carousel--future`** is applied to the carousel container
4. The three triptych panels animate apart:
   - **Energy** slides left off screen
   - **CO2** fades and scales down in the center
   - **Saving** slides right off screen
5. The **Future** scene slides in from the right and fills the main area

### Returning to the triptych

Click the **<-- Back** button in the timeline strip (left-aligned). That calls `handleGoBack()` in **`App.jsx`**, which:

1. Sets `lookAheadActive` to `false`
2. Resets the year to **2021**
3. Reverses the carousel animation back to the three-panel view

The Future scene stays mounted (hidden) so the reverse transition stays smooth.

You can also return via the menu: **Main site** runs the same reset logic.

Selecting a year on the timeline while still on the triptych updates scenes without entering Future mode. If you were in Future mode, use **Back** or **Main site** first.

### Where the carousel code lives

| File | Purpose |
|------|---------|
| **`src/App.jsx`** | `lookAheadActive`, `showFuture` state; carousel markup; **Back** button |
| **`src/App.css`** | `.scene-carousel`, `.scene-carousel--future`, panel slide transforms, `.future-stage`, `.chrome-carousel`, `.back-stage` |
| **`src/scenes/index.js`** | `createFutureScene()` factory |
| **`src/components/ThreePanel.jsx`** | Mounts the `future` variant (no `year` prop required) |
| **`src/index.css`** | **`.chrome-cta`** shared button style for Look Ahead and Back |

Carousel markup in **`App.jsx`**:

```jsx
<div className={`scene-carousel${lookAheadActive ? ' scene-carousel--future' : ''}`}>
  <section className="triptych" aria-hidden={lookAheadActive}>
    {/* energy, co2, saving panels */}
  </section>

  {showFuture && (
    <section className="future-stage" aria-label="Future scene">
      <ThreePanel variant="future" label="Future scene" />
    </section>
  )}
</div>

<div className={`chrome-carousel${lookAheadActive ? ' chrome-carousel--future' : ''}`}>
  <div className="timeline-stage">
    <Timeline ... />
  </div>

  {showFuture && (
    <div className="back-stage">
      <button type="button" className="chrome-cta" onClick={handleGoBack}>
        <span className="chrome-cta-arrow">&lt;--</span>
        <span className="chrome-cta-label">Back</span>
      </button>
    </div>
  )}
</div>
```

### The Future scene

`createFutureScene()` in **`src/scenes/index.js`** renders a distinct futuristic visualization:

- Cyan glowing icosahedron core
- Purple wireframe outer shell
- Orbiting light nodes
- Rotating accent ring

Unlike the triptych scenes, the Future scene does **not** respond to timeline years. It exposes a no-op `applyYear()` and is mounted without a `year` prop.

### How to edit Look Ahead behavior

| Goal | Where to edit |
|------|----------------|
| Change slide animation speed or direction | **`src/App.css`** — `.triptych-panel` transitions and `.scene-carousel--future` transforms |
| Change what the Future scene looks like | **`src/scenes/index.js`** — `createFutureScene()` |
| Change when Future mounts or unmounts | **`src/App.jsx`** — `showFuture` / `lookAheadActive` logic |
| Change Look Ahead or Back button label or style | **`Timeline.jsx`** / **`App.jsx`** for labels; **`.chrome-cta`** in **`index.css`** for shared style; **`.timeline-cta`** in **`Timeline.css`** for Look Ahead position |
| Change Back button placement | **`App.css`** — `.back-stage` |

On viewports **1024px and below**, the carousel uses vertical slides (panels move up/down) instead of horizontal.

---

## Three.js scenes: where they live and how to edit them

### Where the scene code is

All Three.js scene logic lives in **`src/scenes/index.js`**.

That file defines four scene factory functions:

| Function | `variant` in App.jsx | View | What it shows |
|----------|----------------------|------|----------------|
| `createEnergyScene()` | `"energy"` | Triptych (left) | Rotating energy core with corona and orbit ring |
| `createCo2Scene()` | `"co2"` | Triptych (center) | Purple torus knot with ring |
| `createSavingScene()` | `"saving"` | Triptych (right) | Low-poly figure on a ground disc |
| `createFutureScene()` | `"future"` | Full-width (Look Ahead) | Cyan core, wireframe shell, orbiting nodes, accent ring |

They are registered at the bottom of the file in `sceneFactories`:

```js
export const sceneFactories = {
  energy: createEnergyScene,
  co2: createCo2Scene,
  saving: createSavingScene,
  future: createFutureScene,
}
```

**`src/components/ThreePanel.jsx`** handles the canvas, resizing, render loop, cleanup, and calling `applyYear()` when the year changes. The `future` variant is created without a year and skips year updates.

**`src/App.jsx`** wires triptych panels via `variant` and `year`; the Future panel uses only `variant="future"`:

```jsx
<ThreePanel variant="energy" label="Energy scene" year={year} />
<ThreePanel variant="co2" label="CO2 scene" year={year} />
<ThreePanel variant="saving" label="Saving scene" year={year} />
<ThreePanel variant="future" label="Future scene" />
```

### How to edit an existing scene

1. Start the dev server: `npm run dev`
2. Open **`src/scenes/index.js`** in your editor
3. Find the function for the panel you want to change (e.g. `createEnergyScene`)
4. Edit meshes, materials, lights, camera position, or animation
5. Save the file — Vite hot-reloads and the browser updates automatically

Each scene function follows the same pattern:

```js
export function createEnergyScene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()
  const renderer = createRenderer()

  // Add lights, meshes, groups to scene...

  const applyYear = (year) => {
    // Update scene based on selected timeline year
  }

  const animate = () => {
    // Update rotations, positions, etc. each frame
  }

  applyYear(initialYear)

  return { scene, camera, renderer, animate, applyYear, objects: [/* meshes to dispose */] }
}
```

Common edits:

- **Colors:** change `color`, `emissive`, or `opacity` in `MeshStandardMaterial` / `MeshBasicMaterial`
- **Shapes:** swap `IcosahedronGeometry`, `TorusKnotGeometry`, `BoxGeometry`, etc.
- **Motion:** edit the `animate` function (rotation speed, bobbing, etc.)
- **Camera:** adjust `camera.position.set(x, y, z)` inside the scene function
- **Lighting:** modify `addLights()` or add more lights in a specific scene
- **Timeline behavior:** edit `applyYear()` in each scene, or constants in **`src/constants/timeline.js`** (see [Timeline](#timeline) above)

Any new mesh or group you add to a scene should also be listed in the `objects` array in the return value so **`ThreePanel`** can dispose of it cleanly when the component unmounts.

### How to add a new scene

1. Add a new factory function in **`src/scenes/index.js`** (copy an existing one as a template)
2. Register it in `sceneFactories` with a new key, e.g. `moon: createMoonScene`
3. In **`src/App.jsx`**, add a new triptych panel and `<ThreePanel variant="moon" label="Moon scene" year={year} />`, or mount it in the carousel if it replaces the Future view
4. In **`src/App.jsx`**, add a new triptych panel and `<ThreePanel variant="moon" label="Moon scene" year={year} />`, or mount it in the carousel if it replaces the Future view
5. Update nav links in **`src/components/SiteMenu.jsx`** and styles in **`App.css`** if needed

For a scene that does not use the timeline, follow the `createFutureScene()` pattern (no `year` argument, no-op `applyYear`).

### Three.js reference

Scene code uses the [Three.js API](https://threejs.org/docs/). Useful docs:

- [Geometries](https://threejs.org/docs/#api/en/geometries/BoxGeometry)
- [Materials](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
- [Lights](https://threejs.org/docs/#api/en/lights/DirectionalLight)

---

## Tech stack

- [React](https://react.dev/)
- [Vite](https://vite.dev/)
- [Three.js](https://threejs.org/)


## Notes on Collaboration

For collaborating, we are using Github. Please do the following whenever you plan to commit push something to the repository. 

1. Fetch/pull from the origin of the repo. 
2. Compare differences and accept mergers. 
3. Do your commit and add a message for documentation
4. Push to the origin