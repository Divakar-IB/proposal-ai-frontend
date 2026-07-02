"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import {
  FileText,
  FileImage,
  File,
  Download,
  ExternalLink,
  Tag,
  CheckCircle2,
  Clock,
  Database,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card, Heading } from "@/components/ui";
import { Breadcrumb, PageHeader } from "@/components/shared";
import { KB_DOCUMENTS, FileType } from "@/lib/kb-data";

interface DocumentViewPageProps {
  id: string;
}

const FILE_ICONS: Record<FileType, React.ElementType> = {
  pdf: FileText,
  docx: File,
  txt: FileText,
  image: FileImage,
};

const FILE_COLORS: Record<FileType, string> = {
  pdf: "text-red-500 bg-red-50",
  docx: "text-blue-500 bg-blue-50",
  txt: "text-gray-500 bg-gray-100",
  image: "text-violet-500 bg-violet-50",
};

const FILE_LABELS: Record<FileType, string> = {
  pdf: "PDF Document",
  docx: "Word Document",
  txt: "Plain Text",
  image: "Image",
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const DEMO_TXT = (name: string) =>
  `# ${name}\n\nThis is a preview of the plain text document.\n\nIn production this content is fetched from the stored file URL and displayed here. The text is rendered in a scrollable pre-formatted block preserving all whitespace and line breaks from the original file.\n\nSection 1\n─────────\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nSection 2\n─────────\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`;

const FileViewer = ({
  fileType,
  fileName,
}: {
  fileType?: FileType;
  fileName?: string;
}) => {
  const [docxHtml, setDocxHtml] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocxFile = async (file: File) => {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    setDocxHtml(result.value);
  };

  if (!fileType) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-10">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <File className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No file attached</p>
        <p className="text-xs text-muted-foreground">
          Upload a file when editing this document.
        </p>
      </div>
    );
  }

  if (fileType === "pdf") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <FileText className="w-8 h-8 text-red-500" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">
            PDF preview loads from the stored file URL in production.
          </p>
        </div>
        <p className="text-xs text-muted-foreground max-w-xs">
          The viewer will embed the file using the browser&apos;s native PDF
          renderer via{" "}
          <code className="bg-muted px-1 rounded text-xs">&lt;iframe&gt;</code>.
        </p>
      </div>
    );
  }

  if (fileType === "image") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center">
          <FileImage className="w-8 h-8 text-violet-500" />
        </div>
        <p className="text-sm text-muted-foreground">
          Image preview will display here.
        </p>
      </div>
    );
  }

  if (fileType === "txt") {
    return (
      <pre className="h-full overflow-auto p-5 text-xs text-foreground font-mono whitespace-pre-wrap leading-relaxed">
        {DEMO_TXT(fileName ?? "Document")}
      </pre>
    );
  }

  if (fileType === "docx") {
    return (
      <div className="h-full flex flex-col">
        {docxHtml ? (
          <div
            className="flex-1 overflow-auto p-6 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: docxHtml }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
              <File className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                Word Document
              </p>
              <p className="text-xs text-muted-foreground">
                Load a .docx file to preview its content here.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Load DOCX to preview
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleDocxFile(f);
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return null;
};

export const DocumentViewPage = ({ id }: DocumentViewPageProps) => {
  const [, setMode] = useQueryState(
    "mode",
    parseAsStringLiteral(["view", "edit"]).withDefault("view"),
  );
  const doc = KB_DOCUMENTS.find((d) => d.id === id);

  if (!doc) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Document not found
          </p>
          <Button variant="secondary" size="sm" asChild>
            <Link href="/knowledge-base">Back to Knowledge Base</Link>
          </Button>
        </div>
      </div>
    );
  }

  const FileIcon = doc.fileType ? FILE_ICONS[doc.fileType] : File;
  const fileColorClass = doc.fileType
    ? FILE_COLORS[doc.fileType]
    : "text-gray-500 bg-gray-100";
  const fileLabel = doc.fileType ? FILE_LABELS[doc.fileType] : "Unknown";

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Knowledge Base", href: "/knowledge-base" },
          { label: doc.name },
        ]}
      />

      <div className="flex items-start justify-between gap-4">
        <PageHeader title={doc.name} description={doc.description} />
        <Button size="sm" onClick={() => setMode("edit")}>
          Edit Document
        </Button>
      </div>

      <div className="grid grid-cols-[5fr_7fr] gap-5">
        {/* Left — metadata */}
        <div className="flex flex-col gap-4">
          {/* File info */}
          <Card className="p-5 flex flex-col gap-4">
            <Heading as="h3" size="sm">
              File Information
            </Heading>

            {doc.fileName ? (
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    fileColorClass,
                  )}
                >
                  <FileIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fileLabel} ·{" "}
                    {doc.fileSize ? formatBytes(doc.fileSize) : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No file attached.</p>
            )}

            {doc.fileName && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open
                </Button>
              </div>
            )}
          </Card>

          {/* Details */}
          <Card className="p-5 flex flex-col gap-4">
            <Heading as="h3" size="sm">
              Details
            </Heading>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium text-foreground">
                    {doc.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                  {doc.status === "verified" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p
                    className={cn(
                      "text-sm font-medium",
                      doc.status === "verified"
                        ? "text-green-600"
                        : "text-amber-600",
                    )}
                  >
                    {doc.status === "verified" ? "Verified" : "Draft"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium text-foreground">
                    {doc.updatedAt}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tags */}
          {doc.tags.length > 0 && (
            <Card className="p-5 flex flex-col gap-3">
              <Heading as="h3" size="sm">
                Tags
              </Heading>
              <div className="flex flex-wrap gap-1.5">
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* KB index info */}
          <Card className="p-5 flex flex-col gap-4">
            <Heading as="h3" size="sm">
              Knowledge Base Index
            </Heading>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Chunks indexed
                  </p>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {doc.chunks ?? 0}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Last indexed</p>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {doc.lastIndexed ?? "Not indexed"}
                </p>
              </div>

              {(doc.chunks ?? 0) === 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    This document has not been indexed yet. It will not be used
                    in proposal generation.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right — file viewer */}
        <Card className="overflow-hidden flex flex-col min-h-150">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60 shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center",
                  fileColorClass,
                )}
              >
                <FileIcon className="w-3.5 h-3.5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {doc.fileName ?? "No file"}
              </p>
            </div>
            {doc.fileType && (
              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-md">
                {fileLabel}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <FileViewer fileType={doc.fileType} fileName={doc.fileName} />
          </div>
        </Card>
      </div>
    </div>
  );
};
