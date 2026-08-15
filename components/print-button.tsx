"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#111827] font-bold px-8 py-3.5 rounded-xl transition-colors"
    >
      <Printer className="w-4 h-4" />
      Print Receipt
    </button>
  );
}
