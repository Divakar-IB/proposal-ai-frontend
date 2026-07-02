"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { UploadCloud, X, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Button,
  Card,
  FormError,
  Heading,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import { PageHeader, Breadcrumb } from "@/components/shared";
import { CATEGORIES } from "@/lib/kb-data";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const schema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  status: z.enum(["draft", "verified"]),
  file: z
    .instanceof(File, { message: "Please upload a file" })
    .refine(
      (f) => ACCEPTED_TYPES.includes(f.type),
      "Only PDF, DOCX, and TXT files are accepted",
    )
    .optional(),
});

type DocumentFormValues = z.infer<typeof schema>;

const SELECTABLE_CATEGORIES = CATEGORIES.filter(
  (c) => c.name !== "All Documents",
);

interface DocumentPageProps {
  id: string;
}

export const DocumentPage = ({ id }: DocumentPageProps) => {
  const isNew = id === "new";
  const router = useRouter();
  const [tagInput, setTagInput] = useState<string>("");
  const [dragOver, setDragOver] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      tags: [],
      status: "draft",
    },
  });

  const tags = watch("tags") ?? [];
  const file = watch("file");

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      tags.filter((t) => t !== tag),
    );
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setValue("file", dropped);
  };

  const onSubmit = async (data: DocumentFormValues) => {
    console.log(data);
    router.push("/knowledge-base");
  };

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb
        items={[
          { label: "Knowledge Base", href: "/knowledge-base" },
          { label: isNew ? "Add Document" : "Edit Document" },
        ]}
      />

      <PageHeader
        title={isNew ? "Add Document" : "Edit Document"}
        description={
          isNew
            ? "Upload a document to your knowledge base for AI-powered proposal generation."
            : "Update the document details and file in your knowledge base."
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Card className="p-8">
          <div className="grid grid-cols-[3fr_2fr] gap-8">
            {/* Left — document fields */}
            <div className="flex flex-col gap-5">
              <Heading as="h3" size="sm">
                Document Details
              </Heading>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Document Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Enterprise AWS Cloud Migration"
                  {...register("name")}
                />
                <FormError message={errors.name?.message} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  placeholder="Short summary of what this document covers..."
                  rows={3}
                  {...register("description")}
                />
                <FormError message={errors.description?.message} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label>
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {SELECTABLE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.name} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormError message={errors.category?.message} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Status</Label>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>Tags</Label>
                <div
                  className={cn(
                    "flex flex-wrap gap-1.5 min-h-9 rounded-lg border border-input px-2.5 py-1.5 transition-colors",
                    "focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30",
                  )}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary/60 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput && addTag(tagInput)}
                    placeholder={
                      tags.length === 0 ? "Type a tag and press Enter..." : ""
                    }
                    className="flex-1 min-w-24 h-7 bg-transparent text-sm outline-none placeholder:text-text-subtle"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter or comma to add a tag.
                </p>
              </div>
            </div>

            {/* Right — file upload */}
            <div className="flex flex-col gap-5">
              <Heading as="h3" size="sm">
                File Upload
              </Heading>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById("file-input")?.click()}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer flex-1",
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-muted-foreground" />
                </div>
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setValue("file", undefined);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/70 transition-colors"
                    >
                      <X className="w-3 h-3" /> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center">
                    <p className="text-sm font-medium text-foreground">
                      Drop your file here or{" "}
                      <span className="text-primary">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF, DOCX, TXT
                    </p>
                  </div>
                )}
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setValue("file", f);
                  }}
                />
              </div>
              <FormError message={errors.file?.message} />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isNew ? "Add Document" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};
