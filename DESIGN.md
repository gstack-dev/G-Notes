---
name: G-Notes Precision
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#b9c8de'
  on-secondary: '#233143'
  secondary-container: '#39485a'
  on-secondary-container: '#a7b6cc'
  tertiary: '#bcc7de'
  on-tertiary: '#263143'
  tertiary-container: '#8691a7'
  on-tertiary-container: '#1f2a3c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d4e4fa'
  secondary-fixed-dim: '#b9c8de'
  on-secondary-fixed: '#0d1c2d'
  on-secondary-fixed-variant: '#39485a'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  headline-sm:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  code:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 16px
  sidebar_width: 260px
---

## Brand & Style

The design system is engineered for high-performance productivity, targeting power users who require a focused, distraction-free environment for note-taking and knowledge management. The aesthetic is **Modern Minimalist**, drawing heavy influence from engineering-focused tools like Linear and VS Code.

The brand personality is professional, reliable, and precise. It avoids unnecessary ornamentation, favoring structural clarity and functional density. The UI leverages a dark-first color strategy to reduce eye strain during long sessions, utilizing depth through tonal layering rather than aggressive shadows. 

Key visual pillars:
- **Clarity:** Generous monospaced-adjacent spacing and crisp borders.
- **Efficiency:** High information density without visual clutter.
- **Focus:** Low-contrast secondary elements that recede, allowing content to take center stage.

## Colors

The palette is anchored in a deep navy spectrum to provide a premium "pro-tool" feel. 

- **Primary (#3B82F6):** Used for action-oriented elements, focus states, and progress indicators.
- **Backgrounds:** The foundation is a deep navy (`#020617`). Surfaces are layered using slightly lighter values to create a sense of hierarchy.
- **Interactive States:** Use a 10% opacity white overlay for hover states and a 20% opacity white overlay for active/pressed states on dark surfaces.
- **Borders:** Subtle borders (`#1E293B`) are essential for defining zones within the single-window desktop application without relying on heavy shadows.

## Typography

Typography is used to create a clear structural hierarchy. 

**Sora** is utilized for headings to provide a modern, technical character with its unique geometric forms. **Inter** is the workhorse for all body copy and UI elements, chosen for its exceptional legibility at small sizes and its neutral, systematic feel.

- **Desktop Readability:** Body text defaults to 14px for standard UI elements and 16px for long-form note reading.
- **Monospaced Accents:** For technical notes or metadata, use JetBrains Mono to reinforce the productivity/developer-adjacent aesthetic.
- **Line Height:** Tight for headings (1.2-1.3) to keep them impactful; generous for body (1.6) to facilitate reading.

## Layout & Spacing

This design system uses a **Fluid Sidebar / Fixed Content** model typical of modern desktop applications.

- **Grid:** A 12-column system is used for the main content area, while the sidebar remains a fixed width (260px) to ensure navigation stability.
- **Spacing Scale:** Based on a 4px baseline. Most UI gaps should be `12px` (3 units) or `16px` (4 units).
- **Safe Areas:** Maintain a 24px margin around the main editor content to ensure focus. 
- **Density:** Use `8px` padding for interactive list items (like file trees) to maximize information density in the sidebar.

## Elevation & Depth

This design system avoids traditional drop shadows in favor of **Tonal Layering** and **Subtle Outlines**. Depth is communicated through color brightness: the higher the element is in the stack, the lighter its surface color.

1.  **Level 0 (Background):** `#020617` — The main application canvas.
2.  **Level 1 (Sidebar/Secondary):** `#0F172A` — Sidebar and navigation panels.
3.  **Level 2 (Cards/Modals):** `#1E293B` — Floating elements and dialogs.

For floating elements (Modals/Context Menus), apply a very subtle, highly diffused shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.5)` and a 1px border of `#334155` to ensure separation from the background.

## Shapes

The shape language is "Soft Geometric." 

- **Standard Elements:** Buttons, input fields, and chips use a `8px` (rounded-md) corner radius.
- **Containers:** Large surfaces like the editor area or sidebar panels use a `12px` (rounded-lg) radius when nested within the main window.
- **Interactive Feedback:** Hover states on list items should use a `6px` radius to create a tight, professional look within dense menus.

## Components

### Buttons
- **Primary:** Background `#3B82F6`, Text `#FFFFFF`. Solid fill, no border.
- **Secondary:** Background `#1E293B`, Text `#94A3B8`, Border `1px solid #334155`.
- **Ghost:** No background, Text `#94A3B8`. Background becomes `#0F172A` on hover.

### Input Fields
- **Default:** Background `#0F172A`, Border `1px solid #1E293B`, Text `#FFFFFF`.
- **Focus:** Border becomes `1px solid #3B82F6` with a subtle glow (2px spread primary color at 20% opacity).

### Cards & Panels
- Used for grouping related content. Always use `#0F172A` or `#1E293B` with a `1px` border of `#1E293B`.

### Selection & Chips
- **Active State:** Use a 10% primary color tint for the background of selected items in the file tree or navigation, with a 2px vertical primary color "pill" indicator on the left edge.
- **Chips:** Small, `12px` roundedness, background `#1E293B`, text `body-sm`.

### Scrollbars
- In Electron, customize scrollbars to be thin (`6px`), with a track color of `transparent` and a thumb color of `#1E293B` that turns `#334155` on hover.