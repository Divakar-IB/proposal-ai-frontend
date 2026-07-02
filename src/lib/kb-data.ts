import {
  Files,
  Shield,
  Code2,
  GitBranch,
  Lock,
  History,
  FileText,
} from "lucide-react";

export type FileType = "pdf" | "docx" | "txt" | "image";

export interface KbDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  status: "verified" | "draft";
  updatedAt: string;
  fileName?: string;
  fileType?: FileType;
  fileSize?: number;
  chunks?: number;
  lastIndexed?: string;
}

export interface Category {
  name: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  count: number;
}

export const CATEGORIES: Category[] = [
  {
    name: "All Documents",
    description: "Browse all uploaded knowledge documents across every category.",
    icon: Files,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    count: 6,
  },
  {
    name: "Company Capabilities",
    description: "Core service offerings, domain expertise, and past achievements.",
    icon: Shield,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    count: 1,
  },
  {
    name: "Technical Methodologies",
    description: "Implementation strategies, architecture patterns, and tech approaches.",
    icon: Code2,
    iconColor: "text-green-500",
    iconBg: "bg-green-50",
    count: 1,
  },
  {
    name: "Development Practices",
    description: "Engineering standards, CI/CD pipelines, and workflow guidelines.",
    icon: GitBranch,
    iconColor: "text-indigo-500",
    iconBg: "bg-indigo-50",
    count: 1,
  },
  {
    name: "Security & Compliance",
    description: "Security controls, audit frameworks, and compliance certifications.",
    icon: Lock,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    count: 1,
  },
  {
    name: "Past Solutions",
    description: "Winning proposals and case studies from previous client engagements.",
    icon: History,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-50",
    count: 1,
  },
  {
    name: "Technical Docs",
    description: "Reference guides, API documentation, and system manuals.",
    icon: FileText,
    iconColor: "text-teal-500",
    iconBg: "bg-teal-50",
    count: 1,
  },
];

export const KB_DOCUMENTS: KbDocument[] = [
  {
    id: "1",
    name: "Enterprise AWS Cloud Migration",
    description:
      "End-to-end cloud migration capability focusing on lift-and-shift, replatforming, and cloud-native architecture.",
    category: "Company Capabilities",
    tags: ["AWS", "Migration", "Enterprise"],
    status: "verified",
    updatedAt: "2 weeks ago",
    fileName: "aws-cloud-migration.pdf",
    fileType: "pdf",
    fileSize: 2480000,
    chunks: 18,
    lastIndexed: "Jun 17, 2026",
  },
  {
    id: "2",
    name: "Blue-Green Zero Downtime Deployment",
    description:
      "Technical implementation steps for zero-downtime database and app switches using DNS and Load Balancer routing.",
    category: "Technical Methodologies",
    tags: ["DevOps", "Zero-Downtime", "AWS"],
    status: "verified",
    updatedAt: "1 month ago",
    fileName: "blue-green-deployment.docx",
    fileType: "docx",
    fileSize: 840000,
    chunks: 12,
    lastIndexed: "May 30, 2026",
  },
  {
    id: "3",
    name: "DevOps & GitOps Workflow Standards",
    description:
      "Our standard pipeline stages for automated linting, security scanning, unit testing, and deployment to staging.",
    category: "Development Practices",
    tags: ["GitOps", "CI/CD", "Docker"],
    status: "verified",
    updatedAt: "3 days ago",
    fileName: "devops-gitops-standards.txt",
    fileType: "txt",
    fileSize: 32000,
    chunks: 8,
    lastIndexed: "Jun 28, 2026",
  },
  {
    id: "4",
    name: "SOC 2 Type II Controls Matrix",
    description:
      "Mapping of internal controls for access management, encryption, key rotation, and audit logs.",
    category: "Security & Compliance",
    tags: ["SOC2", "Compliance", "Security"],
    status: "verified",
    updatedAt: "3 months ago",
    fileName: "soc2-controls-matrix.pdf",
    fileType: "pdf",
    fileSize: 1920000,
    chunks: 24,
    lastIndexed: "Apr 1, 2026",
  },
  {
    id: "5",
    name: "Meridian Core Banking Migration Proposal",
    description:
      "Winning solution architecture for migrating legacy mainframe cores to AWS RDS Aurora PostgreSQL.",
    category: "Past Solutions",
    tags: ["Case Study", "Database", "Mainframe"],
    status: "verified",
    updatedAt: "Jun 24, 2026",
    fileName: "meridian-migration-proposal.pdf",
    fileType: "pdf",
    fileSize: 5100000,
    chunks: 34,
    lastIndexed: "Jun 24, 2026",
  },
  {
    id: "6",
    name: "AWS Database Migration Service (DMS) Guide",
    description:
      "Configuring network replication links, schema mappings, and resolving common table lock issues.",
    category: "Technical Docs",
    tags: ["AWS DMS", "PostgreSQL", "Oracle"],
    status: "draft",
    updatedAt: "1 week ago",
    fileName: "aws-dms-guide.docx",
    fileType: "docx",
    fileSize: 1100000,
    chunks: 0,
    lastIndexed: undefined,
  },
];
