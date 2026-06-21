<h1>
  <img src="icon.png" width="48" height="48" alt="CFV Maker Logo" valign="middle" />
  CFV Maker LTSC
</h1>

CFV Maker LTSC is a web and desktop-based editor designed for creating custom Cardfight!! Vanguard cards. The application runs natively in web browsers or as a cross-platform desktop application using Electron.

---

## User Guide

CFV Maker provides a powerful interface to design custom Vanguard card designs. 

### 1. Card Customization
- **Nation & Clan:** Select standard Cardfight!! Vanguard nations (Dragon Empire, Brandt Gate, Dark States, Keter Sanctuary, Stoicheia, Lyrical Monasterio) or choose custom nations. Map clans and races to card fields.
- **Card Types:** Supports formatting for Normal Units, Trigger Units, G Units, Token Units, Orders (Normal, Blitz, Set), Crests, and Ride Deck Crests.
- **Stats:** Configure Grade, Power, Shield (with checkbox visibility), and passive markers (Boost, Intercept, Twin/Triple Drive, Persona Ride, Regalis Piece).
- **Text & Details:** Add card names, illustrator tags, flavor texts, and abilities using custom rich-text markers (see *Rich-Text Syntax Reference* below).

### 2. Canvas & Art Management
- **Artwork Upload:** Click **Add Art** under the File menu or drag-and-drop a `.png`, `.jpg`, or `.webp` file directly onto the canvas workspace.
- **Composition Controls:** Drag to reposition and adjust the scale slider to fit artwork bounds perfectly under layout overlays.
- **Custom Frame Layers:** Upload and manage custom layout frames or custom borders to design unique cards.

### 3. Project Management
- **Unified Project Menu:** Under the **Project** menu in the header, you can start new projects (same window or new window) and manage your recent files.
- **Recent Files Submenu:** The editor keeps track of the last 10 recently opened or saved templates. You can reload these files directly or click the **"x"** button to remove them from your list.
- **Natively Saved Modal:** When loading a file from your recent list in Electron, the app validates its presence on disk. If the file has been moved, renamed, or deleted, a warning modal will appear.
- **Exporting/Importing:** Save backups of your layout configuration and art by exporting them as `.zip` template bundles. Export finalized designs as high-resolution PNG images.

---

## Rich-Text Syntax Reference

The text rendering engine tokenizes specifications inline. Apply these text markers within formatting blocks:

* `/* text */` - Formats the text segment color to Red.
* `/** text **/` - Formats the text segment to Red and Italic.
* `* text *` - Applies Italic styling to the selected text segment.
* `__ text __` - Adds a continuous baseline Underline beneath the text segment.
* `\j` - Forces full line justification across horizontal bounds.

---

## Developer Guide

### Core Dependencies
The system utilizes the following production libraries:
* `next` (16.2.4) - Full-stack framework using App Router architecture.
* `react` (19.2.4) & `react-dom` (19.2.4) - UI rendering engine.
* `konva` (10.2.5) & `react-konva` (19.2.3) - Canvas 2D engine for layered card composition.
* `use-image` (1.1.4) - React hook for managing asynchronous image loading states on Konva.
* `react-colorful` (5.7.0) - Hexadecimal and gradient color picker component.
* `jszip` (3.10.1) - Client-side ZIP compression and unpacking utility for file synchronization.
* `file-saver` (2.0.5) - Synchronous file system downloading handler for web browsers.

### Development Dependencies
The build system and tooling environment depend on:
* `electron` (42.4.1) - Cross-platform desktop runtime shell wrapper.
* `electron-builder` (26.15.3) - Installer serialization and asset packager framework.
* `tailwindcss` (4) & `@tailwindcss/postcss` (4) - Utility-first CSS pipeline layout engine.
* `concurrently` (10.0.3) - Simultaneous multi-thread CLI task execution manager.
* `wait-on` (9.0.10) - Port listener check script for automated dev environment initialization.

### Project Structure
```text
├── components/           # UI elements and modifiable input fields
│   ├── custom/           # Sub-modules including LayerManager and UploadGroup
│   └── editor/           # Canvas implementation and parsing layers
├── src/app/              # Next.js router setup and core layout frames
│   ├── components/       # Interface structural blocks (NavBar, LeftPanel, Workspace)
│   ├── globals.css       # Tailwind CSS properties and local styles
│   └── layout.js         # Centralized context providers for theme and language
├── utils/                # State management and filesystem logic
│   ├── store/            # Initial states, localized text registries, and constants
│   ├── CardIO.js         # Zip bundle compilation and decoding rules
│   └── PathHelper.js     # Internal localized asset path translation routing
├── main.js               # Electron main process workflow and IPC configurations
├── preload.js            # Electron bridge binding isolated contexts
└── splash.html           # Desktop asset initialization loading sequence view
```
---

## License

This project's source code is licensed under the MIT License.

### Assets & Trademarks

Artwork, card frames, nation logos, trigger icons, and other Cardfight!! Vanguard-related visual assets are not covered by the MIT License.

These materials may contain copyrighted works and trademarks owned by Bushiroad Inc. and their respective rights holders. They are included solely for fan-made, educational, and compatibility purposes.

CFV Maker is an independent fan project and is not affiliated with, endorsed by, or sponsored by Bushiroad Inc.

For complete licensing information:

* Source Code License: [LICENSE](LICENSE)
* Asset & Trademark Notice: [ASSETS_LICENSE.md](ASSETS_LICENSE.md)
