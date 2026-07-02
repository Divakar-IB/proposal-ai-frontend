"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Trash2, Plus, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Button,
  Card,
  DataTable,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import type { ColumnDef } from "@/components/ui";
import { PageHeader, ActionMenu } from "@/components/shared";
import { CATEGORIES, KB_DOCUMENTS } from "@/lib/kb-data";
import type { KbDocument } from "@/lib/kb-data";

const documents = KB_DOCUMENTS;

enum StatusFilter {
  All = "all",
  Active = "active",
  Inactive = "inactive",
}

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: StatusFilter.All },
  { label: "Active", value: StatusFilter.Active },
  { label: "Inactive", value: StatusFilter.Inactive },
];

export const KnowledgeBasePage = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("All Documents");
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    StatusFilter.All,
  );

  const columns: ColumnDef<KbDocument, string>[] = [
    {
      accessorKey: "name",
      header: "Document",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-sm">
            {row.original.name}
          </span>
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-lg">
            {row.original.description}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const verified = row.original.status === "verified";
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase",
              verified ? "text-green-600" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                verified ? "bg-green-500" : "bg-gray-400",
              )}
            />
            {verified ? "Verified" : "Draft"}
          </span>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {getValue()}
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
              {
                label: "View",
                icon: Eye,
                onClick: () => router.push(`/knowledge-base/document/${id}`),
              },
              {
                label: "Edit",
                icon: Edit,
                onClick: () =>
                  router.push(`/knowledge-base/document/${id}?mode=edit`),
              },
              {
                label: "Delete",
                icon: Trash2,
                onClick: () => {},
                variant: "destructive",
              },
            ]}
          />
        );
      },
    },
  ];

  const filtered = documents.filter((doc) => {
    const matchesCategory =
      activeCategory === "All Documents" || doc.category === activeCategory;
    const matchesSearch =
      search === "" ||
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === StatusFilter.All ||
      (statusFilter === StatusFilter.Active && doc.status === "verified") ||
      (statusFilter === StatusFilter.Inactive && doc.status === "draft");
    return matchesCategory && matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col relative">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Knowledge Base"
          description="Manage your internal documents used for AI-generated proposals. Upload, categorise, and track indexing status."
        />

        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
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
                    {cat.count} {cat.count === 1 ? "document" : "documents"}
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
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
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
                  onChange={(e) => setSearch(e.target.value)}
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
            data={filtered}
            pagination
            defaultPageSize={10}
            emptyMessage="No documents found."
          />
        </Card>
      </div>
    </div>
  );
};
