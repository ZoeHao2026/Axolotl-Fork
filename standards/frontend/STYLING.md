# Frontend Styling

Shared Tailwind configuration and colour vocabulary. Read this before picking a colour, adding a token or touching a Tailwind config.

## Tailwind

Every frontend package extends one preset at `packages/tooling-config/tailwind/tailwind-preset.ts`:

```ts
import preset from '@modrinth/tooling-config/tailwind/tailwind-preset.ts'
```

CSS custom properties live in `packages/assets/styles/variables.scss`, with light, dark and OLED variants. That file is the full colour set — including the palette (red, orange, green, blue, purple, gray, each 50–950) and platform colours (fabric, forge, quilt, neoforge).

## Colour rules

- Backgrounds and strokes use `surface-*` variables. The [surface standard](SURFACE_SYSTEM.md) is authoritative for elevation and separators.
- Text uses `text-[var(--color-text-primary)]` for headings, `--color-text-default` for body, `--color-text-tertiary` for secondary information.
- Brand and semantic colours follow `bg-{color}` / `text-{color}`, with `-highlight` for a 25% opacity semantic highlight. Not all of them are exposed as Figma variables.
