# New Page

Scaffold a new page following the Proposal AI conventions.

Ask the user for:
1. The page name (e.g. "Settings", "All Proposals")
2. The route path (e.g. `/settings`, `/all-proposals`)
3. A one-line description shown under the title

Then create the following files:

## Component file
`src/components/pages/<folder-name>/<kebab-name>-page.tsx`

```tsx
"use client";

import { PageHeader } from "@/components/shared";

export const <PascalName>Page = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="<Title>"
        description="<Description>"
      />
    </div>
  );
};
```

## Barrel export
`src/components/pages/<folder-name>/index.ts`

```ts
export { <PascalName>Page } from "./<kebab-name>-page";
```

## Next.js page
`src/app/(pages)/<route>/page.tsx`

```tsx
import { <PascalName>Page } from "@/components/pages/<folder-name>";

export default function Page() {
  return <<PascalName>Page />;
}
```

## Rules to follow
- Arrow function component, named export (default only for Next.js page file)
- Use `Breadcrumb` from `@/components/shared` if the page is nested under a parent route
- Use `Card` from `@/components/ui` for content sections
- Use `Heading` for section titles inside cards
- Use `Label`, `Input`, `FormError` for any forms
- No comments in the code
- Add the route to the sidebar nav in `src/store/use-sidebar-store.ts` if it should appear in navigation
