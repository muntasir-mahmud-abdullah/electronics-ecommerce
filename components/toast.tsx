"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { clearToast } from "@/store/slices/ui";
import { CheckCircle, XCircle, X } from "lucide-react";

export function Toast() {
  const { toastMessage, toastType } = useSelector((state: RootState) => state.ui);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        dispatch(clearToast());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage, dispatch]);

  if (!toastMessage) return null;

  const isSuccess = toastType === "success";

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all duration-300 ${
        isSuccess ? "bg-[#0D1A0D] border border-[#1F3E1F]" : "bg-[#1F0808] border border-[#3E1F1F]"
      }`}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-[#22c55e] shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
      )}
      <span>{toastMessage}</span>
      <button
        onClick={() => dispatch(clearToast())}
        className="ml-2 text-white/60 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
