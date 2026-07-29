"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Trash2, Plus, Edit, FolderOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useDebounce } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-format";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import type { ColumnDef, PaginationState } from "@/components/ui";
import { PageHeader, ActionMenu } from "@/components/shared";
import { kbService } from "@/services";
import { DocumentStatus } from "@/types";
import type { KbCategory, KbDocument } from "@/types";

const STATUS_CONFIG: Record<string, { color: string; dot: string; label: string }> = {
  active:   { color: "text-green-600", dot: "bg-green-500", label: "Active"   },
  inactive: { color: "text-red-600",   dot: "bg-red-500",   label: "Inactive" },
};

const STATUS_TABS: { label: string; value: DocumentStatus | "all" }[] = [
  { label: "All",      value: "all"                   },
  { label: "Active",   value: DocumentStatus.Active   },
  { label: "Inactive", value: DocumentStatus.Inactive },
];

export const KnowledgeBasePage = () => {
  const router = useRouter();
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search);
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
  const [paginationState, setPaginationState] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const [deleteTarget, setDeleteTarget] = useState<KbDocument | null>(null);

  const resetPage = () => setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));

  const queryClient = useQueryClient();

  const { mutate: deleteDocument, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => kbService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kb-documents"] });
      queryClient.invalidateQueries({ queryKey: ["kb-categories"] });
      toast.success("Document deleted");
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete document"),
  });

  const { data: apiCategories = [] } = useQuery({
    queryKey: ["kb-categories"],
    queryFn: () => kbService.getCategories(),
  });

  const { data: pageData, isLoading: isLoadingDocs } = useQuery({
    queryKey: ["kb-documents", activeCategoryId, debouncedSearch, statusFilter, paginationState.pageIndex, paginationState.pageSize],
    queryFn: () => kbService.getDocuments({
      category_id: activeCategoryId ?? undefined,
      search:      debouncedSearch || undefined,
      status:      statusFilter === "all" ? undefined : statusFilter,
      page:        paginationState.pageIndex + 1,
      limit:       paginationState.pageSize,
    }),
  });

  const categoryOptions = [
    { id: null as number | null, name: "All Categories" },
    ...apiCategories.map((cat: KbCategory) => ({ id: cat.id, name: cat.name })),
  ];

  const columns: ColumnDef<KbDocument, string>[] = [
    {
      accessorKey: "title",
      header: "Document",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-sm">{row.original.document_name}</span>
          <span className="text-xs text-muted-foreground/60 line-clamp-1 max-w-xs">{row.original.file_name}</span>
        </div>
      ),
    },
    {
      accessorKey: "category_name",
      header: "Category",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">{getValue()}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">{getValue() || "—"}</span>
      ),
    },
    {
      accessorKey: "extension",
      header: "Type",
      cell: ({ getValue }) => (
        <Badge className="uppercase">{getValue()}</Badge>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((tag) => (
            <Badge key={tag} variant="purple">{tag}</Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">v{getValue()}</span>
      ),
    },
    {
      accessorKey: "availability_status",
      header: "Status",
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.availability_status] ?? { color: "text-muted-foreground", dot: "bg-gray-400", label: row.original.availability_status };
        return (
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase", cfg.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Uploaded",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(getValue())}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      size: 48,
      cell: ({ row }) => {
        const id = row.original.id;
        return (
          <ActionMenu
            items={[
              { label: "View",   icon: Eye,   onClick: () => router.push(`/knowledge-base/document/${id}`) },
              { label: "Edit",   icon: Edit,  onClick: () => router.push(`/knowledge-base/document/${id}?mode=edit`) },
              { label: "Delete", icon: Trash2, onClick: () => setDeleteTarget(row.original), variant: "destructive" },
            ]}
          />
        );
      },
    },
  ];

  const tableData = pageData?.data ?? [];
  const totalRows = pageData?.total ?? 0;

  return (
    <div className="flex flex-col relative">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <PageHeader
            title="Knowledge Base"
            description="Manage your internal documents used for AI-generated proposals. Upload, categorise, and track indexing status."
          />
          <Button variant="secondary" size="default" onClick={() => router.push("/kb-categories")}>
            <FolderOpen className="w-4 h-4" />
            Categories
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
            <Tabs
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v as DocumentStatus | "all"); resetPage(); }}
            >
              <TabsList size="md">
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} size="md">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-3">
              <Select
                value={activeCategoryId === null ? "all" : String(activeCategoryId)}
                onValueChange={(v) => { setActiveCategoryId(v === "all" ? null : Number(v)); resetPage(); }}
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.id ?? "all"} value={cat.id === null ? "all" : String(cat.id)} className="cursor-pointer">
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge base..."
                  className="pl-9 w-64"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                />
              </div>
              <Button
                size="default"
                onClick={() => router.push("/knowledge-base/document/new")}
              >
                <Plus className="w-4 h-4" />
                Add Document
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={tableData}
            isLoading={isLoadingDocs}
            pagination
            manualPagination
            totalRows={totalRows}
            paginationState={paginationState}
            onPaginationChange={setPaginationState}
            emptyMessage="No documents found."
          />
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete document"
        description={`"${deleteTarget?.document_name}" will be permanently deleted and removed from the knowledge base. This cannot be undone.`}
        confirmLabel="Delete"
        isPending={isDeleting}
        onConfirm={() => deleteTarget && deleteDocument(deleteTarget.id)}
      />
    </div>
  );
};
