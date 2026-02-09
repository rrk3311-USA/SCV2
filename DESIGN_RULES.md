# SCV2 Design Rules (responsive + deployment)

Use these rules for all layout and UI work so the site stays sharp on deployment (including iPhone/Retina) and consistent across breakpoints.

## Breakpoints (use only these)

| Range        | Name    | Tailwind | Use for                          |
|-------------|---------|----------|-----------------------------------|
| &lt; 768px   | Mobile  | default, `sm` (640px) | Single column, touch targets 44px+ |
| 768px–1024px| Tablet  | `md` (768px), `lg` (1024px) | Centered content, 720px max content |
| &gt; 1024px | Desktop | `lg`, `xl` (1200px) | Max-width 1200px, padding 32px     |

## Container rules

- **Mobile (&lt; 768px):** `max-width: 100%`, padding `16px` (`px-4`).
- **Tablet (768px–1024px):** max-width `720px` centered, padding `24px` (`md:px-6`). Use `max-w-container-narrow` when needed.
- **Desktop (&gt; 1024px):** max-width `1200px` centered, padding `32px` (`lg:px-8`). Use `max-w-container`.

Use the `<Container>` component for page content; it already follows these values. Never use fixed pixel widths for main content containers—use percentage/flex/grid and these max-widths.

## Responsive + high-DPI (deployment blur fixes)

- **Viewport:** Already set in `layout.tsx`: `width: device-width`, `initialScale: 1`.
- **Text:** Body uses `-webkit-font-smoothing: antialiased`, `text-rendering: optimizeLegibility`. Do not put text inside elements that use `transform` or `filter: blur()`—it can look blurry on iOS Safari.
- **Header:** Topbar uses solid background on mobile (no `backdrop-blur`) to avoid compositing blur; logo is centered with grid/flex, not `translate(-50%)`, to avoid subpixel blur on Retina.
- **Images:** Prefer `srcset` or Next.js `<Image>` with appropriate `sizes` for 2x/3x where possible.

## Prompt snippet for AI / code gen

When asking an AI or generator for layout/UI code, you can paste:

```
Always use mobile-first responsive design with these exact breakpoints and container rules:

- Mobile (< 768px): max-width 100%, padding 16px, font-size 16px base
- Tablet (768px–1024px): max-width 720px, centered, padding 24px
- Desktop (>1024px): max-width 1200px, centered, padding 32px

Use media queries only for these breakpoints. Never use fixed pixel widths for main containers. Prioritize percentage/flex/grid for layout. Optimize all images and text for high-DPI (Retina) screens. Do not center content with transform (e.g. translate(-50%))—use flex/grid to avoid blur on mobile.
```

These values are implemented in `tailwind.config.js` (screens, maxWidth.container) and `src/components/Container.tsx`.
