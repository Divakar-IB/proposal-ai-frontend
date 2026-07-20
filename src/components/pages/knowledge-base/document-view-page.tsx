"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  FileImage,
  File,
  Download,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-format";
import { Badge, Button, Card, Skeleton } from "@/components/ui";
import { Breadcrumb } from "@/components/shared";
import { kbService } from "@/services";

interface DocumentViewPageProps {
  id: string;
}

type ViewerType = "pdf" | "docx" | "txt" | "image" | "other";

const getViewerType = (ext: string): ViewerType => {
  const e = ext.toLowerCase();
  if (e === "pdf") return "pdf";
  if (e === "docx" || e === "doc") return "docx";
  if (e === "txt") return "txt";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(e)) return "image";
  return "other";
};

const VIEWER_ICONS: Record<ViewerType, React.ElementType> = {
  pdf:   FileText,
  docx:  File,
  txt:   FileText,
  image: FileImage,
  other: File,
};

const VIEWER_COLORS: Record<ViewerType, string> = {
  pdf:   "text-red-500 bg-red-50",
  docx:  "text-blue-500 bg-blue-50",
  txt:   "text-gray-500 bg-gray-100",
  image: "text-violet-500 bg-violet-50",
  other: "text-gray-500 bg-gray-100",
};

const VIEWER_LABELS: Record<ViewerType, string> = {
  pdf:   "PDF Document",
  docx:  "Word Document",
  txt:   "Plain Text",
  image: "Image",
  other: "Document",
};

const FileViewer = ({
  viewerType,
  fileName,
  url,
}: {
  viewerType: ViewerType;
  fileName: string;
  url: string;
}) => {
  const [docxHtml, setDocxHtml] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocxFile = async (file: File) => {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    setDocxHtml(result.value);
  };

  // if (viewerType === "pdf") {
  //   return (
  //     <iframe src={url} className="w-full h-full border-0" title={fileName} />
  //   );
  // }

  if (viewerType === "image") {
    return (
      <div className="relative w-full h-full">
        <Image
          src={url}
          alt={fileName}
          fill
          unoptimized
          className="object-contain"
        />
      </div>
    );
  }

  if (viewerType === "txt") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <FileText className="w-8 h-8 text-gray-500" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">{fileName}</p>
          <p className="text-xs text-muted-foreground">Open to view plain text content.</p>
        </div>
        <Button variant="secondary" size="sm" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <ExternalLink className="w-3.5 h-3.5" /> Open file
          </a>
        </Button>
      </div>
    );
  }

  if (viewerType === "docx") {
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
              <p className="text-sm font-medium text-foreground">Word Document</p>
              <p className="text-xs text-muted-foreground">Load a .docx file to preview its content here.</p>
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

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <File className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Preview not available for this file type.</p>
      <Button variant="secondary" size="sm" asChild>
        <a href={url} target="_blank" rel="noreferrer">
          <ExternalLink className="w-3.5 h-3.5" /> Open file
        </a>
      </Button>
    </div>
  );
};

export const DocumentViewPage = ({ id }: DocumentViewPageProps) => {
  const { data: doc, isLoading, isError } = useQuery({
    queryKey: ["kb-document", id],
    queryFn: () => kbService.getDocument(Number(id)),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-3 pb-5 shrink-0">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-10 w-80" />
        </div>
        <div className="flex flex-1 min-h-0 gap-5">
          <div className="w-72 shrink-0 flex flex-col gap-4">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="flex-1 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">Document not found</p>
        <Button variant="secondary" size="sm" asChild>
          <Link href="/knowledge-base">Back to Knowledge Base</Link>
        </Button>
      </div>
    );
  }

  const viewerType = getViewerType(doc.extension);
  const FileIcon = VIEWER_ICONS[viewerType];
  const fileColorClass = VIEWER_COLORS[viewerType];
  const fileLabel = VIEWER_LABELS[viewerType];
  const isActive = doc.availability_status === "active";

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Knowledge Base", href: "/knowledge-base" },
          { label: doc.document_name },
        ]}
      />

      {/* Top info card */}
      <Card className="px-5 py-4 shrink-0">
        <div className="flex items-center gap-5">
          {/* File icon + name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", fileColorClass)}>
              <FileIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{doc.document_name}</p>
              <p className="text-xs text-muted-foreground truncate">{doc.file_name}</p>
            </div>
          </div>

          <div className="w-px h-8 bg-border shrink-0" />

          {/* Meta items */}
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium text-foreground whitespace-nowrap">{doc.category_name}</p>
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Status</p>
              <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase", isActive ? "text-green-600" : "text-red-600")}>
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isActive ? "bg-green-500" : "bg-red-500")} />
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="text-sm font-medium text-foreground">v{doc.version}</p>
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-muted-foreground">Uploaded</p>
              <p className="text-sm font-medium text-foreground whitespace-nowrap">{formatDate(doc.created_at)}</p>
            </div>

            {doc.tags.length > 0 && (
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {doc.tags.map((tag) => (
                    <Badge key={tag} variant="purple">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-border shrink-0" />

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => kbService.downloadDocument(doc.id, doc.file_name)}
            >
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <a href={doc.url} target="_blank" rel="noreferrer">
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </a>
            </Button>
          </div>
        </div>
      </Card>

      {/* Full-width viewer */}
      <Card className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", fileColorClass)}>
              <FileIcon className="w-3.5 h-3.5" />
            </div>
            <p className="text-sm font-medium text-foreground">{doc.file_name}</p>
          </div>
          <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-md">
            {fileLabel}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <FileViewer viewerType={viewerType} fileName={doc.file_name} url={doc.url} />
        </div>
      </Card>
    </div>
  );
};
