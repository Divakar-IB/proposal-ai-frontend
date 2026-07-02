# Review

Review the currently open file (or the file the user mentions) for consistency with the Proposal AI design system and code conventions.

Check for and flag the following:

## Component usage
- [ ] Raw `<label>` instead of `<Label>` from `@/components/ui`
- [ ] Raw `<p className="text-xs text-destructive">` instead of `<FormError>`
- [ ] Raw `<h1>`/`<h2>`/`<h3>` instead of `<Heading>` for section titles
- [ ] `<p className="text-sm font-semibold">` used as a section title — replace with `<Heading size="sm">`
- [ ] Inline style prop where a Tailwind class exists
- [ ] `style={{ minHeight: "..." }}` — use `min-h-*` Tailwind class instead

## Styling
- [ ] Hardcoded hex or rgb colors — use OKLCH tokens (`text-primary`, `bg-primary/10`, etc.)
- [ ] `ring-3` or `ring-ring/50` on inputs — should be `ring-1 ring-ring/30`
- [ ] `bg-gradient-brand` used for text clipping — must use `text-gradient-brand` instead
- [ ] Arbitrary Tailwind values where a canonical class exists (linter will flag these)
- [ ] Missing `rounded-xl` on card-like surfaces not using `card-surface`

## TypeScript
- [ ] `useState` without explicit generic type (`useState<string>("")`)
- [ ] Untyped event handlers (should type `e: React.ChangeEvent<HTMLInputElement>` etc.)
- [ ] `type` used for props — should be `interface`

## Structure
- [ ] Default export on a non-page component
- [ ] Missing barrel export in `index.ts`
- [ ] JSX comments (`{/* ... */}`) in production code
- [ ] `console.log` left in submitted handlers

## Forms
- [ ] Form using raw `fetch` without loading/error state
- [ ] Missing `FormError` under a field with validation
- [ ] `<select>` instead of `<Select>` from `@/components/ui`
- [ ] `<textarea>` instead of `<Textarea>` from `@/components/ui`

Report each issue with the line number and a one-line fix. If nothing is found, say "Looks clean."
