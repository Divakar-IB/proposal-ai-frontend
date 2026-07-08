# API Integration

Integrate a backend API endpoint into the Proposal AI frontend following the established pattern.

The user will provide API details in any format (raw text, JSON, cURL, Swagger snippet). Extract:
- **Endpoint** — path e.g. `/proposals`
- **Method** — GET / POST / PUT / PATCH / DELETE
- **Request payload** — body fields and types (if any)
- **Response payload** — response fields and types

Then generate the following in order:

---

## 1. Types — `src/types/<domain>.ts`

Create or update the domain types file. All types use `interface`, not `type`.

```ts
// Request (only if method has a body)
export interface <Domain>Request {
  field: type;
}

// Response
export interface <Domain>Response {
  field: type;
}
```

Export from `src/types/index.ts`:
```ts
export type { <Domain>Request, <Domain>Response } from "./<domain>";
```

**Rules:**
- Use `string`, `number`, `boolean` — no `any`
- Optional fields use `?`
- Nested objects get their own named interface
- Arrays typed as `FieldType[]`

---

## 2. Service — `src/services/<domain>-service.ts`

Create or update the service class. Use the `api` instance from `@/lib/axios`.

```ts
import { api } from "@/lib/axios";
import type { <Domain>Request, <Domain>Response } from "@/types";

class <Domain>Service {
  // GET — no request body
  async getAll(): Promise<<Domain>Response[]> {
    const { data } = await api.get<<Domain>Response[]>("/<endpoint>");
    return data;
  }

  // GET by id
  async getById(id: string): Promise<<Domain>Response> {
    const { data } = await api.get<<Domain>Response>(`/<endpoint>/${id}`);
    return data;
  }

  // POST
  async create(payload: <Domain>Request): Promise<<Domain>Response> {
    const { data } = await api.post<<Domain>Response>("/<endpoint>", payload);
    return data;
  }

  // PUT / PATCH
  async update(id: string, payload: Partial<<Domain>Request>): Promise<<Domain>Response> {
    const { data } = await api.put<<Domain>Response>(`/<endpoint>/${id}`, payload);
    return data;
  }

  // DELETE
  async delete(id: string): Promise<void> {
    await api.delete(`/<endpoint>/${id}`);
  }
}

export const <domain>Service = new <Domain>Service();
```

Only generate the methods needed for the given endpoint.

Export from `src/services/index.ts`:
```ts
export { <domain>Service } from "./<domain>-service";
```

---

## 3. TanStack Query Hook — `src/hooks/use-<domain>.ts`

Choose hook type based on HTTP method:
- **GET** → `useQuery`
- **POST / PUT / PATCH / DELETE** → `useMutation`

```ts
// GET example
import { useQuery } from "@tanstack/react-query";
import { <domain>Service } from "@/services";
import type { <Domain>Response } from "@/types";

export const use<Domain> = () => {
  return useQuery<<Domain>Response[]>({
    queryKey: ["<domain>"],
    queryFn: () => <domain>Service.getAll(),
  });
};
```

```ts
// POST / mutation example
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { <domain>Service } from "@/services";
import type { <Domain>Request } from "@/types";

export const useCreate<Domain> = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: <Domain>Request) => <domain>Service.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["<domain>"] });
      toast.success("<Domain> created successfully");
    },
    onError: () => {
      toast.error("Failed to create <domain>. Please try again.");
    },
  });
};
```

Export from `src/hooks/index.ts` (create if missing):
```ts
export { use<Domain> } from "./use-<domain>";
```

---

## Rules to follow

- Never use `any` — infer or declare all types explicitly
- Services are class-based, exported as a singleton instance
- One service class per domain (e.g. `ProposalService`, `AuthService`)
- Hook files are one hook per file named `use-<domain>.ts`
- `useMutation` always invalidates relevant query keys on success
- `useMutation` always shows a `toast.error` on failure
- `useQuery` does not show toasts — errors surface via the returned `error` state
- Do not put API logic directly in components — always go through the service + hook layer
- If a types or service file already exists for the domain, add to it rather than replacing it
