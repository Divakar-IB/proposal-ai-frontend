"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, FileUp, FileText, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Label, Textarea, FormError, Card } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";

const schema = z.object({
  proposal_name: z.string().min(1, "Proposal name is required"),
  client_name: z.string().min(1, "Client name is required"),
  additional_context: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const ACCEPTED = ".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp";
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const MAX_MB = 50;

const formatSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadStep = () => {
  const router = useRouter();
  const { setProposalId, markStepComplete, setUploadResult, setUploading } = useProposalWizardStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const pickFile = (f: File) => {
    if (f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File must be under ${MAX_MB}MB`);
      return;
    }
    setFile(f);
    if (IMAGE_TYPES.includes(f.type)) {
      setImagePreview(URL.createObjectURL(f));
    } else {
      setImagePreview(null);
    }
  };

  const clearFile = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setFile(null);
    setImagePreview(null);
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
  }, []);

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (values: FormValues) => {
      if (!file) throw new Error("no_file");
      return proposalService.uploadRequirementDocument({
        file,
        proposal_name: values.proposal_name,
        client_name: values.client_name,
        additional_context: values.additional_context || undefined,
      });
    },
    onMutate: () => setUploading(true),
    onSuccess: (data) => {
      const id = String(data.proposal_id);
      setProposalId(id);
      setUploadResult(data.summary, data.knowledge_matches);
      setUploading(false);
      markStepComplete(1);
      router.push(`/all-proposals/generate-proposals/${id}/configure`);
    },
    onError: (error: Error) => {
      setUploading(false);
      if (error.message === "no_file") {
        toast.error("Please upload your RFP document first.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const onSubmit = (values: FormValues) => submit(values);

  return (
    <Card className="py-8 px-8 flex flex-col gap-5 max-w-6xl mx-auto">
      <StepHeader
        icon={FileUp}
        title="Upload client requirements"
        description="Attach the RFP document or describe the client's needs"
        step={1}
      />

      {/* Dropzone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 px-6 cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50"
        )}
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileUp className="w-5 h-5 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Drop your RFP or requirements document here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, DOCX, TXT, PNG, JPG up to {MAX_MB}MB
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-px w-8 bg-border" />
          or
          <div className="h-px w-8 bg-border" />
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) pickFile(f);
          }}
        />
      </div>

      {/* File preview */}
      {file && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            ) : IMAGE_TYPES.includes(file.type) ? (
              <ImageIcon className="w-4 h-4 text-primary" />
            ) : (
              <FileText className="w-4 h-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatSize(file.size)} · {IMAGE_TYPES.includes(file.type) ? "Image" : "Document"}
            </p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Project Details
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="proposal_name">Proposal name</Label>
          <Input
            id="proposal_name"
            placeholder="Cloud Migration RFP"
            {...register("proposal_name")}
          />
          <FormError message={errors.proposal_name?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="client_name">Client name</Label>
          <Input
            id="client_name"
            placeholder="Meridian Financial Services"
            {...register("client_name")}
          />
          <FormError message={errors.client_name?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="additional_context">
            Additional context{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="additional_context"
            placeholder="Describe any specific requirements or context for the AI..."
            rows={4}
            {...register("additional_context")}
          />
        </div>

        <div className="flex justify-end pt-1">
          <Button type="submit" loading={isPending}>
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UploadStep;
