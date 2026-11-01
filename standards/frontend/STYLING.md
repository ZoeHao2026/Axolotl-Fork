# Frontend Styling

Shared Tailwind configuration and colour vocabulary for every frontend package. Read this before choosing a colour, adding a token, or touching a Tailwind config.

## Tailwind configuration

All frontend packages share a Tailwind preset at `packages/tooling-config/tailwind/tailwind-preset.ts`. Each package's `tailwind.config.ts` extends it:

```ts
import preset from '@modrinth/tooling-config/tailwind/tailwind-preset.ts'
```

CSS custom properties are defined in `packages/assets/styles/variables.scss` with light, dark, and OLED theme variants.

## Surfaces

Use `surface-*` variables for backgrounds and strokes. The [surface standard](SURFACE_SYSTEM.md) is authoritative for elevation and separators, including ordinary cards, cards on panels, table rows and stronger outlines.

## Text colours

| Class                               | Usage                            |
| ----------------------------------- | -------------------------------- |
| `text-[var(--color-text-primary)]`  | Primary headings                 |
| `text-[var(--color-text-default)]`  | Default body text                |
| `text-[var(--color-text-tertiary)]` | Reduced emphasis, secondary info |

## Brand and semantic colours

Not all of these are exposed as Figma variables — refer to `packages/assets/styles/variables.scss` for the full set:

- `bg-{color}`, `text-{color}` etc. — Primary brand colors
- `bg-{color}-highlight` — 25% opacity semantic highlights

**Color palette** (each with shades 50–950): red, orange, green, blue, purple, gray. Platform-specific colors also exist (fabric, forge, quilt, neoforge, etc.).
