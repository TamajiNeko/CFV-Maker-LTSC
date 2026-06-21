# CFV Maker - Agent Documentation

## Project Overview

**CFV Maker** is a web-based editor for creating custom Cardfight Vanguard (CFV) cards. Users can design card layouts, manage card properties (name, abilities, power, shield, etc.), upload custom artwork, and export/import card configurations.

- **Core Purpose**: Visual card editor with import/export via ZIP files
- **Supported Languages**: English, Thai, Japanese
- **Status**: Active development (frequent small fixes and optimizations)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19 / react-colorful (for Hex color selection)
- **Styling**: Tailwind CSS v4 with PostCSS
- **Canvas Rendering**: Konva (2D drawing) + react-konva
- **File Handling**: jszip (ZIP export), file-saver (download), html2canvas (screenshot)
- **Analytics**: Vercel Analytics
- **Package Manager**: npm (see `package.json` for exact versions)

## Project Structure

> **This is a multi-branch project.** The directory layout, available components, and features may differ significantly between branches. Do NOT assume a fixed structure — always inspect the current branch to understand what exists.

**Discovery steps for any agent:**
1. Check the current branch with `git branch --show-current`
2. Explore the root directory and key subdirectories (`src/`, `components/`, `utils/`, `public/`)
3. Read `package.json` for dependencies and scripts
4. Check `.version` file for current version string
5. Identify the entry points (`src/app/layout.js` → `src/app/page.js`)

**Actual directory structure (pre-release branch):**
```
/src/app/
  layout.js                    [Root layout with ThemeProvider, LanguageProvider]
  page.js                      [CardProvider + PageContent + MemoryWarning + ImportModal]
  globals.css                  [Theme CSS custom properties]
  components/
    NavBar.jsx                 [File menu, language/theme/lock buttons]
    LeftPanel.jsx              [Card properties editor]
    Workspace.jsx              [Canvas container with drag-drop]
    RightPanel.jsx             [Abilities/flavor text editor]
  docs/                        [Documentation sub-route (/docs)]
    layout.js                  [Docs layout with ThemeProvider, LanguageProvider]
    page.js                    [Docs landing page]
    components/                [Docs-specific components]
    pages/                     [Docs sub-pages]

/components/
  TextInput.jsx                [Number/text input with validation]
  Selector.jsx                 [Dropdown with optional checkbox]
  TextArea.jsx                 [Auto-expanding textarea]
  Tooltip.jsx, DropDownMenu.jsx, Icon.jsx [UI components]
  ImportModal.jsx              [ZIP import preview]
  CardTypeModal.jsx            [Card type selector assistant modal]
  ColorPickerInput.jsx         [Hex color picker input using react-colorful]
  GradientInput.jsx            [Multi-color gradient builder input using react-colorful]
  ToggleInput.jsx              [Text/number input with an optional toggle checkbox]
  editor/
    CardEditor.jsx             [Konva Stage with text/image layers]
    AbilitiesOutput.jsx        [Formatted abilities rendering]
    icon/
      IconGenerator.jsx        [Custom icon renderer (main)]
      KeywordImage.jsx         [Keyword image rendering]
      PlainIcon.jsx            [Plain icon rendering]
      index.js                 [Re-exports]
    text/
      TextMeasure.js           [Font measurement utilities]
      ParseTokens.js           [Ability text tokenization]
      JustifyLine.js           [Line justification logic]
      index.js                 [Re-exports]
  custom/
    Icon/
      UploadGroup.jsx          [Icon pack management UI]
      UploadItem.jsx           [Upload item component]
      DB.js                    [IndexedDB wrapper for custom icons]
    layer/
      LayerManager.jsx         [Custom layer management UI (drag-drop, visibility, delete)]

/utils/
  store/
    State.js                   [CardProvider + useCardState hook]
    CardConstants.js           [Card options: nations, clans, types, etc.]
    Text.js                    [Localization strings (en, th, jp)]
    IconConfig.js              [Icon definitions + custom icons]
    LanguageStore.js           [Singleton language state: getLanguage(), setLanguage()]
  ThemeProvider.jsx            [Theme context, localStorage key: 'theme']
  LanguageProvider.jsx         [Language context, localStorage key: 'lang']
  CardIO.js                    [Card ZIP export/import]
  IconIO.js                    [Custom icon pack management]
  PathHelper.js                [Asset path resolution with i18n]
  LRUCache.js                  [Performance cache]

/public/assets/
  base/                        [Card base templates]
  base/nation/                 [Nation icons + grade/]
  base/clan/                   [Clan icons]
  base/shield/                 [Shield overlays]
  base/tag/                    [Tag overlays]
  box/, flavor/, frame/        [Text decorations]
  icon/                        [Ability icons]
  passive/, trigger/           [Special ability icons]
  th/                          [Thai-localized assets]
  icon.png, icon_landscape.png [Icon sheets]
  watermark.png                [Watermark overlay]
  watermark_landscape.png      [Landscape watermark overlay]

/public/fonts/
  Columbia.ttf                 [English card font]
  PSLxImperial.ttf             [Thai/Japanese card font]
```

## Key Architectural Patterns

### State Management
- **Location**: `/utils/store/State.js` (CardProvider context + useCardState hook)
- **Hook signature**: `useCardState()` → returns `{ state, setField, setMultiple, setImageConfig }`
- **Dispatch actions**: 
  - `SET_FIELD(field, value)` — Single property update
  - `SET_MULTIPLE(payload)` — Batch update (prevents excessive re-renders)
  - `SET_IMAGE_CONFIG(payload)` — Image positioning with equality check
- **Complete Initial State**:
  ```
  Card Configuration:
  - cardName, abilities, illust, flavor
  - grade (0-4), power, shield
  - raceText, raceCheck, shieldCheck
  - selectedNation, selectedType, selectedPassive, selectedTrigger
  - clan, subOrderType, isSubType, addition
  
  Visual / Style:
  - isFullArt (boolean)
  - showGlobe (boolean, toggles nation globe overlay)
  - showClan (boolean, toggles clan overlay)
  - baseColorTint { enabled: boolean, color: string } — tints the card base color
  - solidColor (hex string) — solid color for custom nation background
  - customNationEnabled (boolean) — enables custom nation mode
  - customNationName (string) — name shown for custom nation
  - cardNameGradient (array of hex strings) — gradient colors for card name text
  - nationGradient (array of hex strings) — gradient colors for nation bar

  Image Management:
  - imageSrc (blob URL for user artwork)
  - imageConfig { scale, x, y } for canvas positioning
  - tempImageSrc (for import preview)

  Layer Management:
  - customLayers (array of { id, name, src, visible }) — user-added overlay images

  UI State:
  - isSaved (boolean)
  - isLocked (boolean, hides UI controls)
  - showImportModal (boolean)
  - isImporting, isImportingPreview (async states)
  - importPreview (ZIP preview data for confirmation)
  
  Export Config:
  - exportPreset ('standard', 'max', 'lite')
  - exportTrigger (counter for force export)
  ```

### Theming & Internationalization
- **Theme**: CSS custom properties with light/dark variants
  - Provider: `ThemeProvider` (`/utils/ThemeProvider.jsx`)
  - Storage: localStorage key `theme` (user's preference)
  - CSS vars: `--bg-primary`, `--bg-secondary`, `--text-primary`, `--text-secondary`, `--border-color`, `--panel-bg`, `--panel-border`, `--accent`, `--button-hover`, `--toolbar-bg`, `--shadow-sm`
  - Implementation: Adds/removes `dark` class on `document.documentElement`
  - Global CSS: `src/app/globals.css`

- **Language**: English (EN), Thai (TH), Japanese (JP - currently locked/preview only)
  - Provider: `LanguageProvider` (`/utils/LanguageProvider.jsx`)
  - Storage: localStorage key `lang`
  - Strings: Centralized in `/utils/store/Text.js` (language keys: `en`, `th`, `jp`)
  - Singleton module: `/utils/store/LanguageStore.js` — exposes `getLanguage()` and `setLanguage()` for SSR-safe access (used by PathHelper, State.js)
  - Font handling:
    - English: "Columbia" font, size 11, line height 14.5
    - Thai/Japanese: "PSLxImperial" font, size 18, line height 16.97
  - Asset localization: `PathHelper.getLocalizedPath()` redirects EN paths to `/assets/th/` variants for Thai cards

### PathHelper API (`/utils/PathHelper.js`)
All helpers accept `(filename, shouldLocalize = true)` unless noted:
- `getLocalizedPath(fullPath)` — rewrites `/assets/…` to `/assets/th/…` when lang=th
- `getAssetPath(filename, category, shouldLocalize)` — generic asset path builder
- `getBasePath(filename)` — `/assets/base/<filename>`
- `getPassivePath(filename)` — `/assets/passive/<filename>`
- `getTriggerPath(filename, shouldLocalize = false)` — trigger icons (not localized by default)
- `getNationPath(filename)` — `/assets/base/nation/<filename>`
- `getRacePath(filename)` — `/assets/base/<filename>` (race overlay)
- `getShieldPath(filename)` — `/assets/base/shield/<filename>`
- `getTagPath(filename)` — `/assets/base/tag/<filename>`
- `getClanPath(filename)` — `/assets/base/<filename>` (clan icon)

### Component Layout
- **Root hierarchy**: `layout.js` (ThemeProvider + LanguageProvider) → `page.js` (CardProvider + MemoryWarning) → `PageContent` (main UI)
- **Three-panel layout**: 
  - **NavBar** (top): File menu (export/import/download), language selector, theme toggle, image lock button
  - **LeftPanel** (left): Card properties editor (name, abilities, stats, nation, clan, type, trigger, passive)
  - **Workspace** (center): Konva canvas with drag-drop support for images and ZIP files
  - **RightPanel** (right): Abilities and flavor text editor with icon formatting support
- **Canvas**: Konva Stage with multiple layers:
  - Image layers (base template, overlays, user artwork, custom layers)
  - Text layers (name, grade, power, shield, abilities, flavor)
  - Touch/mouse multi-touch support for image positioning (drag + zoom)
  - Mobile responsive (drawer UI for RightPanel on small screens)

## Development Workflow

### Running the Development Server
```bash
npm install
npm run dev
# Server runs at http://localhost:3000
```

### Building for Production
```bash
npm run build
npm start
```

### Key Development Notes

1. **"use client" directive**: All interactive components must have this (React client components)
2. **Hydration safety**: Components check `typeof window` or use `mounted` state to avoid SSR mismatches
3. **Memory optimization**: Device memory warning for systems <8GB (checked via `navigator.deviceMemory`)
   - Warning dismissal: localStorage key `memory-warning-dont-show-time` stores a timestamp; warning suppressed for 3 days if "don't show again" is checked
4. **Card export**: Generated as ZIP with image + config.json metadata
   - Metadata includes: version, exportedAt, all card properties, language support
5. **CSS custom properties**: Avoid hardcoding colors; use CSS variables from theme
6. **Keyboard shortcuts**: Ctrl+S (export), Ctrl+Shift+S (download screenshot)

### Supported Card Types & Features

**Card Types** (selectedType):
- Unit (Normal): `base_normal.png`
- Trigger Unit: `base_trigger.png`
- G Unit: `base_g.png`
- Token Unit: `base_normal.png/token`
- Encounter Unit: `base_encounter.png`
- G Encounter: `base_g.png/encounter`
- Order (Normal): `base_normal_order.png`
- Order (Blitz): `base_blitz.png`
- Order (Set): `base_set.png`
- Set Token: `base_set.png/token`
- Marker: `base_ticket.png/marker`
- Energy: `base_ticket.png`
- Crest (Standard): `base_crest.png`
- Crest (Encounter): `base_crest.png/encounter`
- Crest (Ride Deck): `base_crest.png/ride_deck`

**Passives** (`passiveOption` — primary passive icon):
- None: `""`
- Boost: `boost.png`
- Intercept: `intercept.png`
- Twin Drive: `twindrive.png`
- Triple Drive: `tripledrive.png`

**Additional Passives** (`addPassiveOption` — secondary passive, keyed by grade):
- Grade 0: None only
- Grade 1: None, Persona Ride (`persona_ride.png`), Ace Unit (`ace_unit.png`)
- Grade 2+: None, Regalis Piece (`regalis_piece.png`)

**Triggers** (selectedTrigger):
- Over, Critical, Draw, Front, Heal

**Export Presets**:
- **Lite**: 800x1168 px (2x scale)
- **Standard**: 1600x2336 px (4x scale) — default
- **Max**: 2805x4090 px (7x scale)
- Base canvas viewport: 400x584 px

### Import/Export Features

**Card Export** (`/utils/CardIO.js`):
- `exportCardToZip(cardData, imageSrc, imageConfig, cardName)` → ZIP file
- Exports: `config.json` (metadata), `image.png` (artwork)
- Includes version string and export timestamp
- Backward compatible: Supports legacy `abilities.json` format on import

**Card Import**:
- `importCardFromZip(zipFile)` → `{ success, cardData, imageUrl, customLayers }`
- `previewZip(zipFile)` → Preview data for import confirmation modal
- Preserves image positioning, all card properties, and custom layers

**Icon Pack Management** (`/utils/IconIO.js`):
- `exportIconsToZip(exactConfig)` → Custom icon pack
- `importIconsFromZip(zipFile)` → Load custom icons
- `importIconFromImage(imageFile)` → Single custom icon import
- Storage: IndexedDB (persistent across sessions)

### Custom Icons & Ability Text

**Base Icons** (predefined in `IconConfig.js`):
- Actions: AUTO, ACT, CONT
- Costs: CB, CC (with GB variant)
- Triggers: Over, Critical, Draw, Front, Heal
- Keywords: 100+ CFV-specific keywords
- Passive abilities, circle icons (VC, RC, GC)

**Ability Text Formatting & Rendering**:
- Tokenization: `ParseTokens.js` converts text with icon references.
- Replacement: Icons render inline using `IconGenerator.jsx`, `KeywordImage.jsx`, `PlainIcon.jsx`.
- Justification: `JustifyLine.js` handles text alignment.
- Output: `AbilitiesOutput.jsx` renders formatted abilities with custom icons.

**Icon Color Tinting & Variant Handling**:
- **Dynamic Tinting**: Certain base icons can be dynamically tinted or inverted based on the color tag applied in the text syntax (e.g. `{[gray]` or `}[red]`). Color tag constraints are defined in `COLOR_TAG_BASE.allow` (either `true` for all presets or an array of allowed presets like `COST: ["red"]`).
- **Exclusive Path Overrides**: To support complex color styling without dynamic filters, `HYBRID_ICON_CONFIG.exclusivePaths` maps specific path-preset combinations (e.g. `/assets/icon/COST.png@red`) to custom pre-rendered asset files (like `/assets/icon/COST_red.png` and custom stroke path `COST_s.png`). The rendering system and the documentation engine (`SyntaxLoader.jsx`) automatically resolve these path overrides.

### Layer Manager (`/components/custom/layer/LayerManager.jsx`)
- Allows users to upload additional overlay images on top of the card canvas
- Supports drag-to-reorder (pointer-based), toggle visibility, rename, and delete
- Custom layers stored in `state.customLayers` as `{ id, name, src (dataURL), visible }`
- Layers are rendered on the canvas in order (index 0 = bottom); UI shows them reversed for intuitive top-to-bottom ordering
- Accepted image formats: PNG, JPEG, WebP
- Aspect ratio hint shown in upload zone: `(50:73)` for portrait, `(73:50)` for crest landscape

### Version Management

- Current version: stored in `/.version` file (e.g., `26.2.4a`)
- Exported in `next.config.mjs` as env var `TEMPLATE_VERSION`
- Version string included in card ZIP metadata
- Branches: `pre-release` (staging) and `master` (production)

## Common Workflows

### Adding a New Card Property
1. Add field to `initialState` in the state management file
2. Add UI control in the appropriate panel component
3. Add translation strings for all supported languages
4. Update card import/export logic to include the field
5. Test in browser; ensure import/export round-trip works

### Updating Styling
- Modify the global CSS file for global styles
- Use Tailwind classes in components
- Add CSS custom properties for theming consistency
- Test theme toggle to verify both light/dark modes

### Adding a New Language
1. Add language code to supported list in the language provider
2. Expand all string objects with the new language key
3. Update language selector in NavBar

## Testing & QA Checklist

Before reporting changes as done:
- [ ] Card properties save correctly
- [ ] Import/export round-trip preserves all data (including customLayers)
- [ ] Image upload and positioning works
- [ ] Theme toggle functions (light/dark)
- [ ] Language switching updates all text
- [ ] Memory warning shows on low-RAM systems
- [ ] Canvas rendering is smooth (test on lower-end device if possible)
- [ ] No console errors in browser DevTools

## Git Policy

> **⚠️ STRICT RULE: Do NOT `git commit`, `git pull`, or `git push` unless the owner explicitly asks you to.** The owner manages all git operations.

- **No committing** — Do not commit changes on your own. The owner will review and commit manually.
- **No pulling** — Do not pull from remote. The owner controls when to sync.
- **No pushing** — **Never push under any circumstances** unless the owner directly instructs it.

### Exception: Emergency Backup Commits

If you are working on high-priority or complex changes and need a safety checkpoint to prevent data loss from a big error, you **may** create a temporary backup commit:

1. Stage and commit with a clear temporary message (e.g., `TEMP BACKUP - [description]`)
2. **Never push** the backup commit
3. **Clean up before finishing** — when the work is done or after restoring from the backup, remove the temporary commit(s):
   ```bash
   git reset --soft HEAD~1   # undo the backup commit, keep changes staged
   ```
4. Leave the working tree in an uncommitted state for the owner to review

### General Notes

- **Branches**: This project uses multiple branches. Always check which branch you're on (`git branch --show-current`) before making changes.
- **Commit style** (when owner asks you to commit): Short descriptive messages
- **Frequency**: Frequent small commits (no giant PRs)

## Known Issues & Considerations

- Device memory warning for <8GB systems (3-day suppression via localStorage timestamp)
- Large canvas operations can consume significant RAM (hence the warning)
- Image format support limited by browser (PNG, JPG, WebP)
- ZIP export requires a lot of in-memory processing
- Thai/Japanese text rendering requires proper font support in browser

## For AI Agents — Getting Started

1. **Identify the current branch** — structure and features vary per branch
2. Read `package.json` for dependencies and available scripts
3. Explore the directory tree to understand what exists on this branch
4. Start the dev server (`npm run dev`) and test changes in the browser
5. Review recent commits (`git log --oneline -10`) to understand code style and recent context
6. Make small, focused changes and verify before reporting to the owner
