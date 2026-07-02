"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui";

export interface ActionMenuItem {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  variant?: "default" | "destructive";
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

export const ActionMenu = ({ items }: ActionMenuProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="w-40 p-1 gap-0">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={
                item.variant === "destructive"
                  ? "flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-md text-red-500 hover:bg-red-50 transition-colors"
                  : "flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-md text-foreground hover:bg-primary/5 hover:text-primary transition-colors"
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
};
