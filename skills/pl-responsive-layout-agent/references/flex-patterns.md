# Flex patterns

## Regola obbligatoria

Quando usi Flexbox, controlla sempre:

- `flex-wrap`
- `min-width: 0`
- `flex-basis`
- `flex-shrink`
- `gap`
- `align-items`
- `justify-content`

## Pattern base

```scss
.responsive-flex {
  display: flex;
  gap: var(--responsive-gap, 16px);
  min-width: 0;
}

.responsive-flex > * {
  min-width: 0;
}

.responsive-flex--wrap {
  flex-wrap: wrap;
}
```

## Toolbar

```scss
.responsive-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(8px, 1.5vw, 16px);
  flex-wrap: wrap;
  min-width: 0;
}
```
