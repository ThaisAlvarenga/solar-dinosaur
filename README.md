# solar-dinosaur

A React + Vite website with three side-by-side Three.js scenes (solar, crystal, and dinosaur) in a triptych layout.

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

## Appearance (light vs dark mode)

The site background and UI colors follow your **operating system theme** (light or dark mode). If the site looks inverted compared to another computer, check:

- **Windows:** Settings → Personalization → Colors → Choose your mode
- **macOS:** System Settings → Appearance

The Three.js scenes use transparent canvases, so they sit on top of whatever page background your OS theme selects.

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

## Project structure (brief)

```text
solar-dinosaur/
├── index.html          # HTML entry point
├── package.json        # Dependencies and scripts
├── src/
│   ├── App.jsx         # Main layout (nav, triptych, footer)
│   ├── components/
│   │   └── ThreePanel.jsx   # Three.js canvas wrapper
│   └── scenes/
│       └── index.js    # Solar, crystal, and dinosaur scenes
└── public/             # Static assets
```

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