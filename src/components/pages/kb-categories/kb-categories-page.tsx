"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderOpen, Pencil, Plus, Trash2,
  Shield, Code2, GitBranch, Lock, History, FileText,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button, Card, FormError, Heading, Input } from "@/components/ui";
import { PageHeader, ActionMenu } from "@/components/shared";
import { kbService } from "@/services";
import type { KbCategory, CreateCategoryRequest, UpdateCategoryRequest } from "@/types";

interface IconConfig { icon: LucideIcon; color: string; bg: string; }

const ICON_MAP: Record<string, IconConfig> = {
  "Company Capabilities":    { icon: Shield,    color: "text-blue-500",   bg: "bg-blue-50"   },
  "Technical Methodologies": { icon: Code2,     color: "text-green-500",  bg: "bg-green-50"  },
  "Development Practices":   { icon: GitBranch, color: "text-indigo-500", bg: "bg-indigo-50" },
  "Security & Compliance":   { icon: Lock,      color: "text-amber-500",  bg: "bg-amber-50"  },
  "Past Solutions":          { icon: History,   color: "text-violet-500", bg: "bg-violet-50" },
  "Technical Docs":          { icon: FileText,  color: "text-teal-500",   bg: "bg-teal-50"   },
};

const getIconConfig = (name: string): IconConfig =>
  ICON_MAP[name] ?? { icon: FolderOpen, color: "text-primary", bg: "bg-primary/10" };

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  title: string;
  defaultValues?: CategoryFormValues;
  onSubmit: (data: CategoryFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  submitLabel: string;
}

const CategoryForm = ({ title, defaultValues, onSubmit, onCancel, isPending, submitLabel }: CategoryFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues ?? { name: "", description: "" },
  });

  return (
    <Card className="p-5 flex flex-col gap-4">
      <Heading as="h3" size="sm">{title}</Heading>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <Input placeholder="Category name" {...register("name")} />
            <FormError message={errors.name?.message} />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <Input placeholder="Short description" {...register("description")} />
            <FormError message={errors.description?.message} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" size="sm" loading={isPending}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export const KbCategoriesPage = () => {
  const queryClient = useQueryClient();

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<KbCategory | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["kb-categories"],
    queryFn: () => kbService.getCategories(),
  });

  const { mutate: createCategory, isPending: isCreating } = useMutation({
    mutationFn: (payload: CreateCategoryRequest) => kbService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kb-categories"] });
      toast.success("Category created");
      setShowAddForm(false);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const { mutate: updateCategory, isPending: isUpdating } = useMutation({
    mutationFn: (payload: UpdateCategoryRequest) => kbService.updateCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kb-categories"] });
      toast.success("Category updated");
      setEditingCategory(null);
    },
    onError: () => toast.error("Failed to update category"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Document Categories"
          description="Create and manage categories to organise your knowledge base documents."
        />
        <Button variant="secondary" size="sm" onClick={() => setShowAddForm((v) => !v)}>
          <Plus />
          Add Category
        </Button>
      </div>

      {showAddForm && (
        <CategoryForm
          title="New Category"
          onSubmit={(data) => createCategory(data)}
          onCancel={() => setShowAddForm(false)}
          isPending={isCreating}
          submitLabel="Save"
        />
      )}

      {editingCategory && (
        <CategoryForm
          title="Edit Category"
          defaultValues={{ name: editingCategory.name, description: editingCategory.description }}
          onSubmit={(data) => updateCategory({ id: editingCategory.id, ...data })}
          onCancel={() => setEditingCategory(null)}
          isPending={isUpdating}
          submitLabel="Update"
        />
      )}

      {!isLoading && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <FolderOpen className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No categories found</p>
          <p className="text-xs text-muted-foreground">Add your first category to start organising documents.</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-surface p-4 h-40 animate-pulse rounded-xl" />
            ))
          : categories.map((cat: KbCategory) => {
              const { icon: Icon, color, bg } = getIconConfig(cat.name);
              return (
                <div key={cat.id} className="card-surface p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", bg)}>
                      <Icon className={cn("w-5 h-5", color)} />
                    </div>
                    <ActionMenu
                      items={[
                        { label: "Edit", icon: Pencil, onClick: () => setEditingCategory(cat) },
                        { label: "Delete", icon: Trash2, onClick: () => {}, variant: "destructive" },
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{cat.document_count} documents</span>
                </div>
              );
            })}
      </div>
    </div>
  );
};
