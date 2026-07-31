"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import {
  Search,
  Plus,
  FileText,
  CheckCircle2,
  RefreshCw,
  Eye,
  Trash2,
  Download,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button, Input, Card, ConfirmDialog, DataTable, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import type { ColumnDef } from "@/components/ui";
import { PageHeader, ActionMenu } from "@/components/shared";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import type { Proposal, ProposalStatus } from "@/types";

const STATUS_TABS = ["All", "In Progress", "Generating", "In Review", "Done", "Failed"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const TAB_TO_STATUS: Record<StatusTab, ProposalStatus | undefined> = {
  "All": undefined,
  "In Progress": "inprogress",
  "Generating": "generating",
  "In Review": "review",
  "Done": "done",
  "Failed": "failed",
};

const STATUS_LABEL: Record<ProposalStatus, string> = {
  inprogress: "In Progress",
  generating: "Generating",
  review: "In Review",
  done: "Done",
  failed: "Failed",
};

const STATUS_STYLE: Record<ProposalStatus, string> = {
  inprogress: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  generating: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  review: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  done: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  failed: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const MODE_LABEL: Record<string, string> = {
  llm_only: "AI Only",
  knowledge_augmented: "AI + KB",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const PAGE_SIZE = 10;

const STATUS_TO_SEGMENT: Record<ProposalStatus, string> = {
  inprogress: "configure",
  generating: "generate",
  review: "review",
  done: "export",
  failed: "generate",
};

const STATUS_TO_COMPLETED_STEPS: Record<ProposalStatus, number[]> = {
  inprogress: [1],
  generating: [1, 2],
  review: [1, 2, 3],
  done: [1, 2, 3, 4],
  failed: [1, 2],
};

export const AllProposalsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setProposalId, markStepComplete, reset } = useProposalWizardStore();

  const [activeTab, setActiveTab] = useState<StatusTab>("All");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleView = (proposal: Proposal) => {
    reset();
    setProposalId(String(proposal.id));
    (STATUS_TO_COMPLETED_STEPS[proposal.status] ?? []).forEach((step) => markStepComplete(step));
    const segment = STATUS_TO_SEGMENT[proposal.status] ?? "review";
    router.push(`/all-proposals/generate-proposals/${proposal.id}/${segment}`);
  };

  const handleTabChange = (tab: StatusTab) => {
    setActiveTab(tab);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const handleSearchChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    }, 350);
  };

  const queryParams = {
    search: search || undefined,
    status: TAB_TO_STATUS[activeTab],
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["proposals", queryParams],
    queryFn: () => proposalService.getAll(queryParams),
  });

  const { data: statsData } = useQuery({
    queryKey: ["proposals", "stats"],
    queryFn: () => proposalService.getStats(),
    staleTime: 30_000,
  });

  const stats = [
    { label: "Total Proposals", value: statsData?.total ?? "—", icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Completed", value: statsData?.done ?? "—", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
    { label: "In Progress", value: statsData?.inprogress ?? "—", icon: RefreshCw, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { label: "In Review", value: statsData?.review ?? "—", icon: ClipboardList, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
  ];

  const [deleteTarget, setDeleteTarget] = useState<Proposal | null>(null);

  const { mutate: deleteProposal, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => proposalService.delete(id),
    onSuccess: () => {
      toast.success("Proposal deleted");
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
    onError: () => toast.error("Failed to delete proposal"),
  });

  const columns: ColumnDef<Proposal, string>[] = [
    {
      accessorKey: "title",
      header: "Proposal Name",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="font-medium text-foreground">{getValue()}</span>
      ),
    },
    {
      accessorKey: "client_name",
      header: "Client",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue()}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as ProposalStatus;
        return (
          <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", STATUS_STYLE[status])}>
            {STATUS_LABEL[status]}
          </span>
        );
      },
    },
    {
      id: "generation_mode",
      header: "Mode",
      cell: ({ row }) => {
        const mode = row.original.generation_mode;
        return (
          <span className="text-xs text-muted-foreground">
            {mode ? (MODE_LABEL[mode] ?? mode) : "—"}
          </span>
        );
      },
    },
    {
      id: "page_count",
      header: "Pages",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.page_count ?? "—"}
        </span>
      ),
    },
    {
      id: "section_count",
      header: "Sections",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.sections?.length ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      enableSorting: true,
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{formatDate(getValue())}</span>
      ),
    },
    {
      id: "actions",
      header: "Action",
      size: 40,
      cell: ({ row }) => {
        const proposal = row.original;
        const base = `/all-proposals/generate-proposals/${proposal.id}`;
        return (
          <ActionMenu
            items={[
              { label: "View", icon: Eye, onClick: () => handleView(proposal) },
              ...(proposal.status === "done"
                ? [{ label: "Download", icon: Download, onClick: () => router.push(`${base}/export`) }]
                : []),
              {
                label: "Delete",
                icon: Trash2,
                onClick: () => setDeleteTarget(proposal),
                variant: "destructive",
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="flex flex-col relative">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="All Proposals"
          description="Track and manage all client proposals generated by your team."
        />

        <div className="grid grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="p-5 flex items-center gap-4 card-surface">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", bg)}>
                <Icon className={cn("w-5 h-5", color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none mb-1">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 p-4 border-b border-border">
            <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as StatusTab)}>
              <TabsList size="md">
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab} value={tab} size="md">
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search proposals..."
                  className="pl-9 w-64"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                />
              </div>

              <Button size="default" onClick={() => { reset(); router.push("/all-proposals/generate-proposals/new"); }}>
                <Plus className="w-4 h-4" />
                New Proposal
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={data?.data ?? []}
            pagination
            defaultPageSize={PAGE_SIZE}
            isLoading={isLoading}
            manualPagination
            totalRows={data?.total}
            paginationState={pagination}
            onPaginationChange={setPagination}
          />
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete proposal"
        description={`"${deleteTarget?.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        isPending={isDeleting}
        onConfirm={() => deleteTarget && deleteProposal(String(deleteTarget.id))}
      />
    </div>
  );
};
