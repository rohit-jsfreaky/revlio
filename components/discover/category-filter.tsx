"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { CategoryFilter } from "@/hooks/discover";

interface CategoryFilterProps {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "saas", label: "SaaS" },
  { value: "tool", label: "Tool" },
  { value: "app", label: "App" },
  { value: "portfolio", label: "Portfolio" },
  { value: "api", label: "API" },
  { value: "open_source", label: "Open Source" },
  { value: "other", label: "Other" },
];

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

export function CategoryFilterDropdown({ value, onChange }: CategoryFilterProps) {
  const currentLabel = CATEGORY_OPTIONS.find((opt) => opt.value === value)?.label || "All Categories";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-full px-4 gap-2">
          <FilterIcon />
          <span className="hidden sm:inline">{currentLabel}</span>
          <span className="sm:hidden">Filter</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CATEGORY_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className={value === option.value ? "bg-accent" : ""}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
