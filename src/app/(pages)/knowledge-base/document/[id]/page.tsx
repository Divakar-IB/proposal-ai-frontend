import { createSearchParamsCache, parseAsStringLiteral } from "nuqs/server";
import { DocumentPage, DocumentViewPage } from "@/components/pages/knowledge-base";

const searchParamsCache = createSearchParamsCache({
  mode: parseAsStringLiteral(["view", "edit"]).withDefault("view"),
});

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
}

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { mode } = await searchParamsCache.parse(searchParams);

  if (id === "new" || mode === "edit") {
    return <DocumentPage id={id} />;
  }

  return <DocumentViewPage id={id} />;
}
