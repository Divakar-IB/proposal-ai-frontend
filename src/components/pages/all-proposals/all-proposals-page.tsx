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
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button, Input, Card, DataTable, Tabs, TabsList, TabsTrigger } from "@/components/ui";
import type { ColumnDef } from "@/components/ui";
import { PageHeader, ActionMenu } from "@/components/shared";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import type { Proposal, ProposalStatus } from "@/types";

const STATUS_TABS = ["All", "In Progress", "Generating", "In Review", "Approved", "Done", "Failed"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const TAB_TO_STATUS: Record<StatusTab, ProposalStatus | undefined> = {
  "All": undefined,
  "In Progress": "inprogress",
  "Generating": "generating",
  "In Review": "review",
  "Approved": "approved",
  "Done": "done",
  "Failed": "failed",
};

const STATUS_LABEL: Record<ProposalStatus, string> = {
  inprogress: "In Progress",
  generating: "Generating",
  review: "In Review",
  approved: "Approved",
  done: "Done",
  failed: "Failed",
};

const STATUS_STYLE: Record<ProposalStatus, string> = {
  inprogress: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  generating: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  review: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  approved: "bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400",
  done: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  failed: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const PAGE_SIZE = 10;

const STEP_SEGMENT: Record<string, string> = {
  upload: "configure",
  generation: "generate",
  review: "review",
  export: "export",
};

const STEP_COMPLETE_MAP: Record<string, number[]> = {
  upload: [1],
  generation: [1, 2],
  review: [1, 2, 3],
  export: [1, 2, 3, 4],
};

export const AllProposalsPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setProposalId, markStepComplete } = useProposalWizardStore();

  const [activeTab, setActiveTab] = useState<StatusTab>("All");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: PAGE_SIZE });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const handleView = async (proposal: Proposal) => {
    setViewingId(proposal.id);
    try {
      const state = await proposalService.getProposalState(String(proposal.id));
      setProposalId(String(proposal.id));
      (STEP_COMPLETE_MAP[state.current_step] ?? []).forEach((step) => markStepComplete(step));
      const segment = STEP_SEGMENT[state.current_step] ?? "review";
      router.push(`/all-proposals/generate-proposals/${proposal.id}/${segment}`);
    } catch {
      toast.error("Failed to load proposal.");
      setViewingId(null);
    }
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

  // Lightweight stat queries — limit 1 just to read `total`
  const { data: statDone } = useQuery({
    queryKey: ["proposals", "stats", "done"],
    queryFn: () => proposalService.getAll({ status: "done", limit: 1, page: 1 }),
    staleTime: 30_000,
  });
  const { data: statInProgress } = useQuery({
    queryKey: ["proposals", "stats", "inprogress"],
    queryFn: () => proposalService.getAll({ status: "inprogress", limit: 1, page: 1 }),
    staleTime: 30_000,
  });
  const { data: statReview } = useQuery({
    queryKey: ["proposals", "stats", "review"],
    queryFn: () => proposalService.getAll({ status: "review", limit: 1, page: 1 }),
    staleTime: 30_000,
  });

  const stats = [
    { label: "Total Proposals", value: data?.total ?? "—", icon: FileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Completed", value: statDone?.total ?? "—", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
    { label: "In Progress", value: statInProgress?.total ?? "—", icon: RefreshCw, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { label: "In Review", value: statReview?.total ?? "—", icon: ClipboardList, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
  ];

  const { mutate: deleteProposal } = useMutation({
    mutationFn: (id: string) => proposalService.delete(id),
    onSuccess: () => {
      toast.success("Proposal deleted");
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
        if (viewingId === proposal.id) {
          return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
        }
        return (
          <ActionMenu
            items={[
              { label: "View", icon: Eye, onClick: () => handleView(proposal) },
              { label: "Download", icon: Download, onClick: () => router.push(`${base}/export`) },
              {
                label: "Delete",
                icon: Trash2,
                onClick: () => deleteProposal(String(proposal.id)),
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

              <Button size="default" onClick={() => router.push("/all-proposals/generate-proposals/new")}>
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
    </div>
  );
};
