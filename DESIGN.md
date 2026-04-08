# Design System Specification: Technical Brutalism

## 1. Overview & Creative North Star
**Creative North Star: The Sovereign Architect**

This design system rejects the "over-processed" nature of modern SaaS interfaces in favor of an aesthetic that feels like a high-performance terminal or a meticulously maintained developer manifesto. We are building for an audience that values raw logic, precision, and the beauty of the machine.

The system breaks the "template" look by utilizing **Intentional Asymmetry** and **Monospaced Hierarchy**. We avoid the "safe" centered layouts of corporate landing pages. Instead, we lean into left-aligned "indented" content structures—mimicking code nesting—and use high-contrast typography scales to create an editorial experience that feels both low-fidelity and high-polish.

---

## 2. Colors
Our palette is rooted in the "Void"—a deep, matte darkness that provides the canvas for high-energy technical accents.

| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `surface` | `#131313` | The primary canvas. Non-negotiable. |
| **Primary Accent** | `primary_container` | `#00f0ff` | "Neon Blue." Used for tactical highlights and focus. |
| **Secondary Accent**| `secondary_container`| `#13ff43` | "Matrix Green." Used for success states and secondary actions. |
| **Surface Low** | `surface_container_low` | `#1c1b1b` | Secondary layout sections. |
| **Surface High** | `surface_container_high`| `#2a2a2a` | Elevated "code-block" style containers. |

### The Rules of Engagement
*   **The "No-Line" Rule:** Prohibit 1px solid borders for standard sectioning. Boundaries between the main page and sidebar (for example) must be defined solely by shifting from `surface` to `surface_container_low`. 
*   **Surface Hierarchy:** Treat the UI as nested logic. A "Code Container" (`surface_container_high`) sits inside a "Section Wrapper" (`surface_container_low`), which sits on the `background`. This creates depth through value rather than shadows.
*   **The "Electronic Glow":** To move beyond flat UI, use "Glows" sparingly. Apply a `0px 0px 12px` drop shadow using `primary` or `secondary` at 30% opacity for active states or critical status indicators.
*   **Signature Textures:** For hero backgrounds, use a subtle "Grid Paper" pattern—1px dots spaced at `8` (1.75rem) intervals using the `outline_variant` color at 10% opacity.

---

## 3. Typography
We use a high-contrast pairing that balances technical precision with modern readability.

*   **Display & Headlines:** `JetBrains Mono` (via `spaceGrotesk` tokens). This is our signature. It conveys "Drafting" and "Technical Authority." Headlines should use `headline-lg` (2rem) and be styled in `lowercase` for a more independent, developer-centric feel.
*   **Body Text:** `Inter` (via `body` tokens). High-readability sans-serif. Used for long-form descriptions to ensure the eye doesn't fatigue from monospaced characters.
*   **Labels & Metadata:** `JetBrains Mono` at `label-sm` (0.6875rem). Use this for tags, timestamps, and "System Output" style text.

---

## 4. Elevation & Depth
In this design system, "Up" is defined by "Lightness."

*   **The Layering Principle:** Depth is achieved by stacking. A card is not a box with a shadow; it is a region of `surface_container_highest` that cuts through the `surface`. 
*   **The "Ghost Border" Fallback:** If a container requires a border for technical clarity (like a code snippet), use `outline_variant` (#3b494b) but set its opacity to **20%**. It should be felt, not seen.
*   **Zero Roundedness:** All `Roundedness Scale` tokens are strictly **0px**. Corners must remain sharp and architectural.
*   **Interaction Displacement:** Instead of traditional shadows, "lift" an element on hover by changing its background color from `surface_container_high` to `surface_bright`.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary_container` (#00f0ff) with `on_primary_fixed` (#002022) text. Hard 0px corners.
*   **Secondary:** Ghost style. `outline` color border (at 40% opacity) with `primary` text. No background.
*   **Tertiary:** Text-only in `JetBrains Mono`. Prefixed with a `>` character (e.g., `> RUN_BUILD`).

### Code-Block Containers
*   **Styling:** Background `surface_container_lowest`. Left-side "accent bar" 2px wide using `secondary`. 
*   **Padding:** Use `8` (1.75rem) to provide significant breathing room, making the technical content feel premium.

### Inputs
*   **Default:** `surface_container_low` background with a bottom-only border of `outline_variant`.
*   **Focus:** Border shifts to `primary_container`. Text remains white.

### Lists & Navigation
*   **Forbid Dividers:** Do not use horizontal lines between list items. Use the `Spacing Scale` of `4` (0.9rem) between items.
*   **Active State:** Mark active nav items with a `secondary` color dot `[.]` prefix in `JetBrains Mono`.

---

## 6. Do's and Don'ts

### Do:
*   **Embrace Whitespace:** Use the `24` (5.5rem) spacing token for major section gaps. Let the layout breathe.
*   **Align to a Hard Grid:** Even if the layout is asymmetrical, elements should feel snapped to a 4px grid.
*   **Use Technical Glyphs:** Use characters like `->`, `[ ]`, and `//` as decorative elements for labels.

### Don't:
*   **No Border Radius:** Never use rounded corners. It breaks the "Independent Developer" aesthetic.
*   **No Soft Gradients:** Avoid "Apple-style" soft gradients. If you must use a gradient, make it a hard-edge "Step" gradient or a high-contrast glow.
*   **No Standard Shadows:** Avoid CSS `box-shadow` unless it is a colored "Glow" for a specific interactive state.