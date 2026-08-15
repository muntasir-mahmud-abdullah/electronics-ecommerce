"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselNavProps {
  onPrev?: () => void;
  onNext?: () => void;
}

export function CarouselNav({ onPrev, onNext }: CarouselNavProps) {
  return (
    <>
      <button
        onClick={onPrev}
        className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB] transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={onNext}
        className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB] transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </>
  );
}
