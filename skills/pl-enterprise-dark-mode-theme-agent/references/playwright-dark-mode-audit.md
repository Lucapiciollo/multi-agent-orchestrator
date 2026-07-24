# Playwright Dark Mode Audit

## Goals

Use Playwright to validate that dark mode is not only present, but correct.

## Required captures

For each route:

- light screenshot;
- dark screenshot;
- visual diff;
- computed style report;
- contrast report;
- overflow report;
- responsive screenshots.

## Recommended viewport set

```ts
const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'wide', width: 1920, height: 1080 }
];
```

## Disable animation noise

Inject:

```ts
await page.addStyleTag({
  content: `
    *, *::before, *::after {
      transition-duration: 0s !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      scroll-behavior: auto !important;
    }
  `
});
```

## Computed style sample

Collect:

- color;
- background-color;
- border-color;
- box-shadow;
- font-size;
- font-weight;
- line-height;
- opacity;
- bounding box;
- overflow status.

## Interactive states

Try to open:

- sidebar menus;
- dropdown menus;
- Material select;
- autocomplete panel;
- datepicker;
- dialogs;
- tooltips;
- snackbars;
- tabs;
- stepper;
- table actions.

## Result categories

- PASS;
- WARNING;
- FAIL;
- NEEDS_MANUAL_REVIEW.
