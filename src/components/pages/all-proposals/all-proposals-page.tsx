"use client";

import {
  Search,
  Filter,
  Download,
  Plus,
  FileText,
  CheckCircle2,
  RefreshCw,
  Send,
  MoreVertical,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Input, Card, DataTable } from "@/components/ui";
import type { ColumnDef } from "@/components/ui";

const stats = [
  {
    label: "Total Proposals",
    value: 6,
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    label: "Completed",
    value: 2,
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    label: "In Progress",
    value: 3,
    icon: RefreshCw,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    label: "Submitted",
    value: 1,
    icon: Send,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
];

interface Proposal {
  name: string;
  client: string;
  status: string;
  created: string;
}

const proposals: Proposal[] = [
  {
    name: "Cloud Migration Strategy",
    client: "Acme Corp",
    status: "In Review",
    created: "Jan 15, 2024",
  },
  {
    name: "Security Audit Framework",
    client: "BankCo Ltd",
    status: "Done",
    created: "Jan 12, 2024",
  },
  {
    name: "DevOps Transformation",
    client: "RetailGiant",
    status: "Draft",
    created: "Jan 10, 2024",
  },
  {
    name: "Data Lake Implementation",
    client: "HealthTech Inc",
    status: "Submitted",
    created: "Jan 8, 2024",
  },
  {
    name: "AI Integration Roadmap",
    client: "FinanceFirst",
    status: "Generating",
    created: "Jan 5, 2024",
  },
  {
    name: "Kubernetes Migration Plan",
    client: "LogiCorp",
    status: "Draft",
    created: "Jan 3, 2024",
  },
];

const statusStyles: Record<string, string> = {
  "In Review": "bg-blue-50 text-blue-600",
  Done: "bg-green-50 text-green-600",
  Draft: "bg-gray-100 text-gray-500",
  Submitted: "bg-violet-50 text-violet-600",
  Generating: "bg-orange-50 text-orange-600",
};

const columns: ColumnDef<Proposal, string>[] = [
  {
    accessorKey: "name",
    header: "Proposal Name",
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="font-medium text-foreground">{getValue()}</span>
    ),
  },
  {
    accessorKey: "client",
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
      const status = getValue();
      return (
        <span
          className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-full",
            statusStyles[status],
          )}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "created",
    header: "Created",
    enableSorting: true,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue()}</span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    size: 40,
    cell: () => (
      <button className="text-muted-foreground hover:text-foreground transition-colors">
        <MoreVertical className="w-4 h-4" />
      </button>
    ),
  },
];

export const AllProposalsPage = () => {
  return (
    <div className="flex flex-col relative">
      <div className="p-8 flex flex-col gap-6">
        <div className="grid grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="p-5 flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  bg,
                )}
              >
                <Icon className={cn("w-5 h-5", color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none mb-1">
                  {value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search proposals or clients..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              New Proposal
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={proposals}
            pagination
            defaultPageSize={10}
          />
        </Card>
      </div>

      <button className="fixed bottom-6 right-6 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity z-50">
        <HelpCircle className="w-5 h-5" />
      </button>
    </div>
  );
};
