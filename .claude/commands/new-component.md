# New Component

Scaffold a new reusable component following the Proposal AI conventions.

Ask the user for:
1. The component name (e.g. "StatusBadge", "EmptyState")
2. Where it lives — `ui` (primitive, no business logic) or `shared` (composed, used across pages)
3. What props it needs

Then create the following:

## Component file

For `ui`: `src/components/ui/<kebab-name>.tsx`
For `shared`: `src/components/shared/<kebab-name>.tsx`

```tsx
import { cn } from "@/lib/utils";

interface <PascalName>Props {
  // props here
  className?: string;
}

export const <PascalName> = ({ className, ...props }: <PascalName>Props) => {
  return (
    <div className={cn("", className)}>
      {/* content */}
    </div>
  );
};
```

## Barrel export

Add to the relevant `index.ts`:
- `src/components/ui/index.ts` for ui components
- `src/components/shared/index.ts` for shared components

```ts
export { <PascalName> } from "./<kebab-name>";
export type { <PascalName>Props } from "./<kebab-name>"; // only if props should be exported
```

## Rules to follow
- Arrow function, named export only
- Use `cn()` from `@/lib/utils` for className merging
- Use OKLCH primary color tokens (`text-primary`, `bg-primary/10`, etc.) — no hardcoded hex colors
- Use `card-surface` utility class for card-like surfaces
- Use `text-gradient-brand` for gradient text, `bg-gradient-brand` for gradient backgrounds
- No JSX comments, no default exports
- TypeScript interface for props, not `type`
