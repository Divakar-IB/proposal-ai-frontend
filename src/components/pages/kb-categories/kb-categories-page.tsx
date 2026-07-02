"use client";

import { useState } from "react";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Card, Heading, Input } from "@/components/ui";
import { PageHeader, ActionMenu } from "@/components/shared";
import { CATEGORIES } from "@/lib/kb-data";
import type { Category } from "@/lib/kb-data";

export const KbCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newDescription, setNewDescription] = useState<string>("");

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewName("");
    setNewDescription("");
  };

  const handleSaveAdd = () => {
    if (!newName.trim()) return;
    setCategories((prev) => [
      ...prev,
      {
        name: newName.trim(),
        description: newDescription.trim(),
        icon: FolderOpen,
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        count: 0,
      },
    ]);
    handleCancelAdd();
  };

  const handleDeleteCategory = (name: string) => {
    setCategories((prev) => prev.filter((c) => c.name !== name));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Document Categories"
          description="Create and manage categories to organise your knowledge base documents."
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm((v) => !v)}
        >
          <Plus />
          Add Category
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-5 flex flex-col gap-4">
          <Heading as="h3" size="sm">New Category</Heading>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              placeholder="Short description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleCancelAdd}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveAdd}>
              Save
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.name}
              className="card-surface p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    cat.iconBg,
                  )}
                >
                  <Icon className={cn("w-5 h-5", cat.iconColor)} />
                </div>
                <ActionMenu
                  items={[
                    { label: "Edit", icon: Pencil, onClick: () => {} },
                    {
                      label: "Delete",
                      icon: Trash2,
                      onClick: () => handleDeleteCategory(cat.name),
                      variant: "destructive",
                    },
                  ]}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-foreground">
                  {cat.name}
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {cat.count} documents
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
