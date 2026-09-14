# Tailwind token reference — WordQuizer `web/`

Generated against **tailwindcss 4.3.3** (values read from `node_modules/tailwindcss/theme.css`,
not from memory). Root font size assumed 16px, so `1rem = 16px`.

> **Tailwind silently ignores unknown class names.** A typo (`raidius-md`) is not a build error
> and not a console warning — it just produces nothing. Install the **Tailwind CSS IntelliSense**
> VS Code extension; it validates class names against the generated theme, including `@theme`
> tokens, and autocompletes your own colours.

---

## 0. Quick lookup — RN property → Tailwind

The conversion direction. Sections below index the other way (class → px), which is what you
want when *reading* Tailwind; this is what you want when *writing* it.

### Layout & size

| RN | Tailwind | Note |
|---|---|---|
| `flex: 1` (root container) | `min-h-screen` | RN fills its parent; a web div has no height. The honest translation for a full-page container — **not** `flex-1` |
| `flex: 1` (child sharing space) | `flex-1` | only inside an actual flex parent |
| `flexDirection: "row"` | `flex flex-row` | two classes — you are turning flex *on* |
| `flexDirection: "column"` | `flex flex-col` | |
| `justifyContent: "center"` | `justify-center` | main axis |
| `justifyContent: "space-between"` | `justify-between` | |
| `justifyContent: "flex-end"` | `justify-end` | |
| `alignItems: "center"` | `items-center` | cross axis |
| `width: "100%"` | `w-full` | |
| `maxWidth: 400` | `max-w-[400px]` | off-scale → brackets. `max-w-sm` is 384px, `max-w-md` 448px — neither is 400 |
| `position: "absolute"` | `absolute` | parent needs `relative` |

### Spacing — class number × 4 = px

| RN | Tailwind |
|---|---|
| `padding: 24` | `p-6` |
| `paddingVertical: 10` | `py-2.5` (half-steps exist) |
| `paddingHorizontal: 16` | `px-4` |
| `paddingBottom: 24` | `pb-6` |
| `marginTop: 16` / `marginBottom: 4` | `mt-4` / `mb-1` |
| `gap: 8` | `gap-2` — **only works on a flex/grid parent** |

### Typography

| RN | Tailwind | Note |
|---|---|---|
| `fontSize: 12 / 16 / 18 / 20 / 24 / 30` | `text-xs / text-base / text-lg / text-xl / text-2xl / text-3xl` | |
| `fontSize: 14` | `text-md` | your token — v4 has no default `text-md` |
| `fontSize: 13` | `text-sm` | your override (default is 14px) |
| `fontSize: 15` or `28` | `text-[15px]`, `text-[28px]` | off-scale |
| `fontWeight: "500" / "600" / "700"` | `font-medium / font-semibold / font-bold` | |
| `textAlign: "center"` | `text-center` | |
| `numberOfLines={1}` | `truncate` | |

### Colour — one `--color-x` token gives `bg-x`, `text-x`, `border-x`

| RN | Tailwind |
|---|---|
| `backgroundColor: colors.primary` | `bg-primary` |
| `backgroundColor: colors.surface` | `bg-surface` |
| `backgroundColor: colors.background` | `bg-background` |
| `color: colors.textMuted` | `text-text-muted` |
| `color: colors.textPrimary` | `text-text-primary` |
| `borderColor: colors.border` | `border-border` |
| `borderColor: colors.borderInput` | `border-borderInput` |

### Border & radius

| RN | Tailwind | Note |
|---|---|---|
| `borderWidth: 1` | `border border-<colour>` | **two classes.** v4 defaults border colour to `currentColor`, so width alone gives a border in the text colour |
| `borderWidth: 2` | `border-2 border-<colour>` | |
| `borderColor: "transparent"` | `border-transparent` | |
| `borderRadius: 8 / 12 / 16` | `rounded-lg / rounded-xl / rounded-2xl` | v4 renamed the scale — bare `rounded` is no longer 4px |
| `borderRadius: 10` | `rounded-md` | your override (default is 6px) |

### Props with no web equivalent

| RN | Web |
|---|---|
| `onChangeText={(t) => ...}` | `onChange={(e) => ... e.target.value}` |
| `onPress` | `onClick` |
| `secureTextEntry` | `type="password"` |
| `keyboardType="email-address"` | `type="email"` |
| `keyboardType="numeric"` | `type="number"` or `inputMode="numeric"` |
| `autoCapitalize="none"` | nothing — not a web concern |
| `<Text>` inside a button | usually delete it — put the classes on the `<button>` |
| `style={[a, b]}` | see below — there is no equivalent |

**On `style={[a, b]}`:** RN defined precedence, so the later object won. Tailwind has no such rule
— if both strings set the same property, the winner is decided by **generated stylesheet order**,
not by string order. So template-literal concatenation is only safe when the two halves touch
different properties:

```tsx
// safe — different properties
className={`text-sm font-medium ${isActive ? "text-primary" : "text-text-muted"}`}

// broken — both set background; the winner is arbitrary
className={`bg-card-default ${isSelected ? "bg-card-selected" : ""}`}
```

Pick one class conditionally instead of layering an override on top.

---

## 1. Project tokens → the classes they generate

From `web/src/index.css`. A `--color-x` token generates `bg-x`, `text-x`, `border-x`,
`ring-x`, `fill-x` and friends.

| Token | Value | Classes | Use for |
|---|---|---|---|
| `--color-background` | `#fafaf8` | `bg-background` | page / screen background |
| `--color-surface` | `#ffffff` | `bg-surface` | cards, inputs, anything raised |
| `--color-border` | `#e6e4da` | `border-border` | card + divider borders |
| `--color-borderInput` | `#d8d6cd` | `border-borderInput` | input + secondary button borders |
| `--color-text-primary` | `#1a1a18` | `text-text-primary` | headings, body |
| `--color-text-secondary` | `#5f5e5a` | `text-text-secondary` | labels |
| `--color-text-muted` | `#888780` | `text-text-muted` | subtitles, hints |
| `--color-primary` | `#2f6b3a` | `bg-primary` `text-primary` | primary button, links |
| `--color-primary-light` | `#eef6ef` | `bg-primary-light` | selected / tinted rows |
| `--color-danger` | `#a32d2d` | `text-danger` `bg-danger` | errors, destructive |
| `--color-card-default` | `#9ad1e6` | `bg-card-default` | quiz card, resting |
| `--color-card-selected` | `#1ab0e8` | `bg-card-selected` | quiz card, selected |
| `--color-card-selected-border` | `#236c87` | `border-card-selected-border` | |
| `--color-card-matched` | `#81d66b` | `bg-card-matched` | quiz card, correct |
| `--color-card-matched-border` | `#3c802b` | `border-card-matched-border` | |
| `--color-card-wrong` | `#c9181e` | `bg-card-wrong` | quiz card, wrong flash |
| `--color-card-wrong-border` | `#5e2224` | `border-card-wrong-border` | |

### Naming smells to fix in one pass later

- `--color-borderInput` → `border-borderInput` puts camelCase in a class name. Rename to
  `--color-border-input` → `border-border-input`.
- `--color-text-*` → `text-text-primary`. The doubled word is the `text-` utility meeting a
  token whose name starts with `text`. Rename to `--color-ink` / `--color-ink-muted` or similar.

### Overrides currently in `@theme`

| Token | Tailwind default | Yours | Effect |
|---|---|---|---|
| `--text-sm` | 14px | **13px** | `text-sm` means 13px in this codebase only |
| `--radius-md` | 6px | **10px** | `rounded-md` means 10px in this codebase only |

**Open decision on `--text-sm`:** v4 pairs every size with a line-height token —
`--text-sm--line-height: calc(1.25 / 0.875)`, a ratio of about 1.4286. You overrode the size and
inherited that ratio, so `text-sm` is 13px text on an 18.6px line box. If that is not what you
want, set `--text-sm--line-height` explicitly next to it.

---

## 2. Tailwind defaults you will actually reach for

### Spacing — `--spacing: 0.25rem`, so **class number × 4 = px**

| Class | px | Class | px |
|---|---|---|---|
| `p-1` | 4 | `p-5` | 20 |
| `p-1.5` | 6 | `p-6` | 24 |
| `p-2` | 8 | `p-8` | 32 |
| `p-2.5` | 10 | `p-10` | 40 |
| `p-3` | 12 | `p-12` | 48 |
| `p-4` | 16 | `p-16` | 64 |

Half-steps (`.5`) exist, so 6px and 10px are on-scale. Same numbering for
`m- pt- pb- px- py- gap- w- h- top- inset- space-x-`.

### Font size

| Class | px | Class | px |
|---|---|---|---|
| `text-xs` | 12 | `text-2xl` | 24 |
| `text-sm` | 14 *(13 here)* | `text-3xl` | 30 |
| `text-base` | 16 | `text-4xl` | 36 |
| `text-lg` | 18 | `text-5xl` | 48 |
| `text-xl` | 20 | | |

### Border radius — **renamed in v4**; bare `rounded` is no longer 4px

| Class | px | Class | px |
|---|---|---|---|
| `rounded-xs` | 2 | `rounded-xl` | 12 |
| `rounded-sm` | 4 | `rounded-2xl` | 16 |
| `rounded-md` | 6 *(10 here)* | `rounded-3xl` | 24 |
| `rounded-lg` | 8 | `rounded-full` | pill |

### Font weight

`font-light` 300 · `font-normal` 400 · `font-medium` 500 · `font-semibold` 600 · `font-bold` 700

### Border width — always **two** classes

v4 defaults border colour to `currentColor`, so a width class alone gives you a border in the
text colour.

| Want | Write |
|---|---|
| 1px | `border border-border` |
| 2px | `border-2 border-primary` |
| bottom only | `border-b border-border` |

### Off-scale values → square brackets

`max-w-[400px]` · `text-[28px]` · `rounded-[10px]` · `bg-[#fafaf8]` · `w-[72%]`

Prefer adding a `@theme` token over repeating the same bracket value three times.

---

## 3. Old app scale → what to write now

From `app/src/theme/spacing.ts`. Most of it already lines up.

### `spacing`

| Old | px | Class |
|---|---|---|
| `xs` | 4 | `p-1` |
| `sm` | 8 | `p-2` |
| `md` | 12 | `p-3` |
| `lg` | 16 | `p-4` |
| `xl` | 24 | `p-6` |
| `xxl` | 40 | `p-10` |
| `md - 2` | 10 | `p-2.5` |
| `xs + 2` | 6 | `p-1.5` |

All on-scale — no brackets needed anywhere for spacing.

### `radius`

| Old | px | Class | Note |
|---|---|---|---|
| `sm` | 8 | `rounded-lg` | matches default |
| `md` | 10 | `rounded-md` | via your override |
| `lg` | 12 | `rounded-xl` | matches default |

### `fontSize`

| Old | px | Class | Note |
|---|---|---|---|
| `sm` | 13 | `text-sm` | via your override |
| `md` | 14 | `text-md` | **token not added yet.** Free to add — v4 has no default `text-md` |
| `base` | 16 | `text-base` | matches default |
| `lg` | 20 | `text-xl` | matches default |
| `xl` | 24 | `text-2xl` | matches default |

---

## 4. `sharedStyles.ts` → Tailwind, every entry

Complete conversion of `app/src/theme/sharedStyles.ts` (28 entries). `sharedStyles` does not
exist in `web/` — this table is its replacement.

**Prerequisite:** many rows use `text-md` (14px). Add `--text-md: 14px;` to `@theme` — v4 has no
default `text-md`, so it is a free addition.

### Layout & type

| Entry | Tailwind |
|---|---|
| `container` | `min-h-screen p-4 bg-background` |
| `title` | `text-2xl font-semibold text-text-primary` |
| `subtitle` | `text-md text-text-muted` |
| `label` | `block text-sm font-medium text-text-secondary mb-1.5` |

> `block` is not a translation of anything in the RN object — it is a **fix**. A `<label>` is
> `display: inline` on the web, and vertical margins do not apply to inline elements, so
> `mb-1.5` would silently do nothing without it. RN had no inline/block distinction.

### Buttons

| Entry | Tailwind |
|---|---|
| `primaryButton` | `bg-primary py-2.5 px-4 rounded-md text-center` |
| `primaryButtonDisabled` | `disabled:bg-borderInput` |
| `primaryButtonText` | `text-surface font-semibold text-md` |
| `secondaryButton` | `py-2.5 px-4 rounded-md border border-borderInput text-center` |
| `secondaryButtonText` | `text-text-secondary font-medium text-md` |
| `textButton` | `py-1 px-1.5` |
| `textButtonText` | `text-sm font-semibold text-primary` |
| `textButtonTextMuted` | `text-sm font-medium text-text-muted` |
| `deleteText` | `text-sm font-medium text-danger` |

> Two structural changes here, not just class swaps:
>
> - **`alignItems: "center"` becomes `text-center`, not `items-center`.** The RN original centred
>   a child `<Text>` node inside a flex column. A web `<button>` already centres its text by user
>   agent default; `text-center` just makes it explicit. Reaching for `items-center` would force
>   you to add `flex` and change the button's layout model for no reason.
> - **`primaryButtonDisabled` stops being a separate style.** On the web it is a variant on the
>   same element — `disabled:bg-borderInput` — so you never branch in JS to pick a style. Put it
>   on the button permanently and let the `disabled` attribute drive it.

### Inputs

| Entry | Tailwind |
|---|---|
| `input` | `border border-borderInput rounded-md py-2.5 px-3 text-base bg-surface` |

> Worth adding while you are here, none of which RN could express:
> `focus:border-primary focus:outline-none w-full`

### Cards & lists

| Entry | Tailwind |
|---|---|
| `card` | `bg-surface rounded-xl py-3.5 px-4 border border-border` |
| `cardRow` | `flex flex-row items-center justify-between gap-2` |
| `cardTitle` | `text-base font-semibold text-text-primary` |
| `list` | `flex flex-col gap-2.5 pb-6` |
| `formCard` | `bg-surface rounded-xl p-4 mb-4 border border-border` |
| `formActions` | `flex flex-row justify-end gap-2 mt-3` |

> `list` and `cardRow` both need an explicit `flex` that is absent from the RN source. `gap` only
> works on a flex or grid container, and a `div` is neither by default — this is the single most
> common way a converted layout silently collapses.
>
> `paddingVertical: spacing.lg - 2` is 14px → `py-3.5`. On-scale via the half-step.

### Quiz cards

| Entry | Tailwind |
|---|---|
| `quizCard` | `flex flex-col items-center p-4 bg-card-default rounded-lg border-2 border-transparent` |
| `quizCardSelected` | `bg-card-selected border-card-selected-border` |
| `quizCardMatched` | `bg-card-matched border-card-matched-border` |
| `quizCardWrong` | `bg-card-wrong border-card-wrong-border` |
| `quizCardText` | `text-[15px] text-center` |

> `border-2 border-transparent` on the base is deliberate and must stay: it reserves the 2px so
> the card does not jump 2px when a state adds a border colour. Same trick as the RN original.
>
> `fontSize: 15` is the **only** off-scale value in the entire shared stylesheet — hence the
> bracket. Consider snapping it to `text-base` (16px) instead.
>
> The state entries are the one place `style={[base, state]}` array-merging was load-bearing.
> On the web, do not concatenate `bg-card-default` and `bg-card-selected` — the winner is decided
> by stylesheet order, not string order. Pick one: `` className={`... ${state ?? "bg-card-default border-transparent"}`} ``

### Empty states

| Entry | Tailwind |
|---|---|
| `emptyState` | `flex flex-col items-center py-10` |
| `emptyText` | `text-base font-semibold text-text-primary mb-1` |
| `emptySubtext` | `text-md text-text-muted` |

### Do not port this file as an object of strings

The obvious move is `export const sharedStyles = { card: "bg-surface rounded-xl ...", ... }` and
carry on writing `className={sharedStyles.card}`. That is the React Native habit surviving the
port, and a reviewer would send it back: you keep the indirection of a stylesheet while losing
the only thing that made it worthwhile (type-checked keys). `sharedStyles.crad` was a compile
error; `sharedStyles` as a plain object of strings is only as safe as you make its type.

The two idiomatic destinations instead:

- **A component**, whenever markup repeats alongside the classes — `<Button variant="primary">`,
  `<Input>`, `<Card>`. This is where `primaryButton` + `primaryButtonText` + `primaryButtonDisabled`
  belong: three entries collapse into one component, and the caller cannot mismatch them.
- **`@utility` in `index.css`**, for a bare class with no markup of its own:
  ```css
  @utility card { @apply bg-surface rounded-xl py-3.5 px-4 border border-border; }
  ```
  Use sparingly — it recreates the semantic-class indirection Tailwind exists to avoid. Justified
  for two or three genuinely global primitives, not for 28 entries.

Rough split for this app: `card`, `formCard`, `input`, the buttons and `emptyState` want to be
components. `container`, `list`, `cardRow`, `formActions` are one-line layout utilities — inline
them at each use site and delete the entry.

---

## 5. React Native → web

**The structural difference:** every RN `View` is already `display: flex; flex-direction: column`.
A web `div` is `display: block`. So any View that used `justifyContent` / `alignItems` /
`flexDirection` needs an explicit `flex` class on the web.

### Layout

| RN | Tailwind |
|---|---|
| `flex: 1` on a root container | `min-h-screen` — a div has no inherent height |
| `flex: 1` on a child sharing space | `flex-1` (only inside a flex parent) |
| `flexDirection: "row"` | `flex flex-row` |
| `flexDirection: "column"` | `flex flex-col` |
| `justifyContent: "center"` | `justify-center` |
| `justifyContent: "space-between"` | `justify-between` |
| `alignItems: "center"` | `items-center` |
| `width: "100%"` | `w-full` |
| `position: "absolute"` | `absolute` (parent needs `relative`) |

### Props with no web equivalent

| RN | Web |
|---|---|
| `onChangeText={(t) => ...}` | `onChange={(e) => ... e.target.value}` |
| `onPress` | `onClick` |
| `secureTextEntry` | `type="password"` |
| `keyboardType="email-address"` | `type="email"` |
| `keyboardType="numeric"` | `type="number"` or `inputMode="numeric"` |
| `autoCapitalize="none"` | not a web concern |
| `numberOfLines={1}` | `truncate` |
| `<Text>` inside a button | usually delete it — put the classes on the `<button>` |
| `style={[a, b]}` | no precedence rules on the web; pick one class conditionally rather than concatenating two that set the same property |

### Web-only, no RN equivalent — the payoff

`hover:bg-primary` · `focus:border-primary` · `focus-visible:ring-2` · `disabled:opacity-50` ·
`active:scale-95` · `md:max-w-lg` · `dark:bg-surface` · `group-hover:text-primary`
