# Contributing to Pixel — Image Extractor

Thank you for your interest in contributing to **Pixel — Image Extractor**! 🎉

Whether you are fixing a bug, suggesting a new feature, improving documentation, or optimizing performance, your contributions are sincerely appreciated. This project is created and maintained by [Shakib Khan (`@ichshakib`)](https://github.com/ichshakib).

---

## Table of Contents

- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Local Setup & Getting Started](#local-setup--getting-started)
- [Development Workflow](#development-workflow)
- [Available Scripts](#available-scripts)
- [Coding Standards & Guidelines](#coding-standards--guidelines)
  - [Pure Vanilla CSS (No Tailwind / No shadcn)](#pure-vanilla-css-no-tailwind--no-shadcn)
  - [Device Theme Adaptation](#device-theme-adaptation)
  - [Strict TypeScript Standards](#strict-typescript-standards)
  - [Manifest V3 Best Practices](#manifest-v3-best-practices)
- [Pull Request Process](#pull-request-process)
- [Code of Conduct](#code-of-conduct)
- [Contact](#contact)

---

## Project Architecture

The repository is organized into two primary components:

```text
pixel-image-extractor/
├── chrome-extension/              # Manifest V3 Chrome Extension
│   ├── src/
│   │   ├── background/            # Service worker (lifecycle, context menus, download engine)
│   │   ├── content/               # Content scripts (DOM & Shadow DOM image discovery)
│   │   ├── sidepanel/             # Side panel React application (UI, store, components)
│   │   └── utils/                 # Format converters (PDF 1.4, GIF palette encoder, Base64)
│   ├── manifest.config.ts         # Chrome Manifest V3 configuration
│   ├── vite.config.ts             # Vite + @crxjs/vite-plugin build configuration
│   └── package.json               # Extension dependencies and scripts
├── index.html                     # Standalone landing page
├── landing.css                    # Landing page styling
├── script.js                      # Landing page interactions and scroll animations
├── CODE_OF_CONDUCT.md             # Community standards
├── CONTRIBUTING.md                # This guide
├── LICENSE                        # MIT License
└── README.md                      # Project documentation
```

- **`chrome-extension/`**: The core Chrome extension powered by React 19, TypeScript, and Vite.
- **Standalone Web App (`index.html`, `landing.css`, `script.js`)**: A lightweight landing page showcasing Pixel's capabilities.

---

## Prerequisites

Before starting development, ensure you have the following installed:

- **Node.js**: `v20.0.0` or higher
- **pnpm**: `v9.0.0` or higher (recommended package manager)
  ```bash
  npm install -g pnpm
  ```
- **Google Chrome** (or any Chromium-based browser such as Brave or Edge) with Developer Mode enabled.

---

## Local Setup & Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ichshakib/pixel-image-extractor.git
cd pixel-image-extractor
```

### 2. Install Extension Dependencies

Navigate to the `chrome-extension` directory and install the project dependencies using `pnpm`:

```bash
cd chrome-extension
pnpm install
```

### 3. Start Development Server

Run the development server with Hot Module Replacement (HMR):

```bash
pnpm dev
```

Vite will watch for file changes and output an unpacked extension in `chrome-extension/dist/`.

### 4. Load the Extension in Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable the **Developer mode** toggle in the upper-right corner.
3. Click the **Load unpacked** button.
4. Select the `chrome-extension/dist` folder.
5. Pin the **Pixel** extension to your toolbar.

---

## Development Workflow

### Branching Strategy

- Always branch off the latest `main` branch:
  ```bash
  git checkout -b <type>/<short-description>
  ```
- Use conventional prefixes for branch names:
  - `feat/` — A new feature or enhancement
  - `fix/` — A bug fix
  - `refactor/` — Code refactoring without behavioral changes
  - `docs/` — Documentation updates
  - `perf/` — Performance optimizations
  - `chore/` — Tooling, dependency, or configuration updates

### Commit Messages

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat(sidepanel): add resolution badge to image cards`
- `fix(downloader): resolve CORS issue for cross-origin WebP exports`
- `docs(readme): add troubleshooting section for side panel permissions`
- `perf(scanner): optimize recursive shadow DOM query depth`

---

## Available Scripts

All scripts must be executed inside the `chrome-extension/` directory:

| Command | Purpose |
|---|---|
| `pnpm dev` | Starts Vite development server with HMR and automatic extension rebuilds |
| `pnpm build` | Type-checks code with `tsc -b` and creates a production build in `dist/` & zipped release |
| `pnpm preview` | Previews the build output locally |

To verify that your changes compile with zero errors before opening a pull request, run:

```bash
pnpm build
```

---

## Coding Standards & Guidelines

### Pure Vanilla CSS (No Tailwind / No shadcn)

> [!IMPORTANT]
> The Chrome extension strictly uses **Pure Vanilla CSS** in `src/sidepanel/index.css`. **Do NOT install or introduce Tailwind CSS, shadcn/ui, or external CSS component frameworks.**

- Organize styles using CSS custom properties (`--bg-primary`, `--text-primary`, `--accent`, etc.).
- Maintain modular class names matching their respective components (`.filter-accordion`, `.image-card`, `.floating-bar`).
- Use native CSS Flexbox, Grid, and CSS transitions for micro-interactions and animations.

### Device Theme Adaptation

- The side panel UI automatically adapts to the user's operating system / browser theme using media queries:
  ```css
  @media (prefers-color-scheme: dark) {
    :root {
      --bg-primary: #0a0d14;
      --surface-card: #151b26;
      /* dark theme tokens */
    }
  }
  ```
- Avoid adding manual theme switchers or hardcoded inline background colors that break OS theme synchronization.

### Strict TypeScript Standards

- Avoid using `any`. Utilize strict TypeScript types, discriminated unions, and specific interfaces.
- Clearly type all extension communication payloads between `background`, `content`, and `sidepanel`.
- Maintain modular store slices and separate UI components from business logic and data manipulation.

### Manifest V3 Best Practices

- Background service workers are ephemeral: do not rely on in-memory global state across user actions.
- Use `OffscreenCanvas` and `createImageBitmap` for canvas operations inside service workers.
- Respect user privacy: all image extraction, filtering, and conversion must run **100% locally** on the user's device. No remote telemetry or external asset transmission.

---

## Pull Request Process

1. **Keep PRs Focused:** Submit individual PRs for distinct features or fixes rather than monolithic updates.
2. **Verify the Build:** Ensure `pnpm build` succeeds with zero TypeScript or Vite compilation errors.
3. **Manual Verification:**
   - Test image extraction across diverse websites (including Single Page Applications and sites using Shadow DOM components).
   - Test the right-click **Save Image As** menu across multiple formats (PNG, JPG, WebP, JFIF, GIF, PDF).
   - Verify that the layout remains responsive in narrow side panel widths.
4. **Visual Evidence:** Attach screenshots or a short GIF/video demonstrating the change if you modified any UI components.
5. **Review:** Maintainers will review your PR, provide constructive feedback, and merge once all checks pass.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our **[Code of Conduct](./CODE_OF_CONDUCT.md)**. Please ensure that all interactions remain polite, inclusive, and professional.

---

## Contact

If you have questions, need guidance, or want to discuss ideas before implementing them:

- **Maintainer:** Shakib Khan ([@ichshakib](https://github.com/ichshakib))
- **Email:** [ichshakib@gmail.com](mailto:ichshakib@gmail.com)
- **GitHub Issues:** [Open an Issue](https://github.com/ichshakib/pixel-image-extractor/issues)
