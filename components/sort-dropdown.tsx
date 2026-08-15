"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";

interface SortOption {
  label: string;
  value: string;
}

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (value: string) => void;
}

const sortOptions: SortOption[] = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  const currentLabel = sortOptions.find((opt) => opt.value === currentSort)?.label || "Newest First";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-md px-3 py-1.5 font-semibold text-[#111827] hover:bg-gray-50 transition-colors">
          {currentLabel}
          <ChevronDown className="w-4 h-4 text-[#6B7280]" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-white border border-[#E5E7EB] rounded-lg p-1 shadow-lg z-50"
          sideOffset={8}
          align="end"
        >
          {sortOptions.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                currentSort === option.value
                  ? "bg-[#00D4E8] text-[#0A0C14]"
                  : "text-[#111827] hover:bg-gray-100"
              }`}
            >
              {option.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
