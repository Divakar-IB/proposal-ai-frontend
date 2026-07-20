"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Eye, Trash2, Plus, Edit,
  Files, Shield, Code2, GitBranch, Lock, History, FileText,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
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
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import type { ColumnDef, PaginationState } from "@/components/ui";
import { PageHeader, ActionMenu } from "@/components/shared";
import { kbService } from "@/services";
import { DocumentStatus } from "@/types";
import type { KbCategory, KbDocument } from "@/types";

interface IconConfig { icon: LucideIcon; iconColor: string; iconBg: string; }

const ICON_MAP: Record<string, IconConfig> = {
  "Company Capabilities":    { icon: Shield,    iconColor: "text-blue-500",   iconBg: "bg-blue-50"   },
  "Technical Methodologies": { icon: Code2,     iconColor: "text-green-500",  iconBg: "bg-green-50"  },
  "Development Practices":   { icon: GitBranch, iconColor: "text-indigo-500", iconBg: "bg-indigo-50" },
  "Security & Compliance":   { icon: Lock,      iconColor: "text-amber-500",  iconBg: "bg-amber-50"  },
  "Past Solutions":          { icon: History,   iconColor: "text-violet-500", iconBg: "bg-violet-50" },
  "Technical Docs":          { icon: FileText,  iconColor: "text-teal-500",   iconBg: "bg-teal-50"   },
};

const getIconConfig = (name: string): IconConfig =>
  ICON_MAP[name] ?? { icon: Files, iconColor: "text-primary", iconBg: "bg-primary/10" };

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

  const totalCount = apiCategories.reduce((sum: number, c: KbCategory) => sum + c.document_count, 0);

  const categories = [
    { id: null as number | null, name: "All Documents", icon: Files, iconColor: "text-primary", iconBg: "bg-primary/10", document_count: totalCount },
    ...apiCategories.map((cat: KbCategory) => ({ ...cat, ...getIconConfig(cat.name) })),
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
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">{getValue() || "—"}</span>
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
        <PageHeader
          title="Knowledge Base"
          description="Manage your internal documents used for AI-generated proposals. Upload, categorise, and track indexing status."
        />

        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.name}
                onClick={() => { setActiveCategoryId(cat.id); resetPage(); }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all shrink-0 text-left",
                  isActive
                    ? "bg-gradient-brand border-transparent shadow-md"
                    : "card-surface hover:shadow-sm hover:border-primary/30",
                )}
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    isActive ? "bg-white/15" : cat.iconBg,
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      isActive ? "text-white" : cat.iconColor,
                    )}
                  />
                </div>
                <div className="flex flex-col leading-none gap-1.5">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-white" : "text-foreground",
                    )}
                  >
                    {cat.name}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isActive ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {cat.document_count} {cat.document_count === 1 ? "document" : "documents"}
                  </span>
                </div>
              </button>
            );
          })}
          <Link
            href="/kb-categories"
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-dashed transition-all shrink-0 text-left border-primary/40 bg-primary/5 group"
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-muted group-hover:bg-primary/10 transition-colors">
              <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex flex-col leading-none gap-1.5">
              <span className="text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                New Category
              </span>
              <span className="text-xs text-muted-foreground/70">
                Manage categories
              </span>
            </div>
          </Link>
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
