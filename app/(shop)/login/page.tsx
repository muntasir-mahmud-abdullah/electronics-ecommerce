"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { setAuth } from "@/store/slices/auth";
import { showToast } from "@/store/slices/ui";
import { LoginSchema } from "@/lib/validations";
import { ArrowRight, ShieldCheck, Lock } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get("redirectTo") || "/";
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok) {
        dispatch(
          setAuth({ user: result.user, accessToken: result.accessToken }),
        );
        dispatch(showToast({ message: "Login successful!", type: "success" }));

        const redirectTo = searchParams.get("redirectTo") || "/";
        router.push(redirectTo);
      } else {
        dispatch(
          showToast({ message: result.error || "Login failed", type: "error" }),
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      dispatch(
        showToast({ message: "An unexpected error occurred", type: "error" }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="w-8 h-8 rounded-md bg-[#00D4E8] flex items-center justify-center">
              <span className="text-[#0A0C14] font-black text-lg leading-none">
                G
              </span>
            </div>
            <span className="font-bold text-[20px] tracking-tight text-[#0A0C14]">
              GadgetHub<span className="text-[#00D4E8]">.</span>
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 lg:p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-[24px] font-black text-[#111827] tracking-tight mb-2">
              Welcome Back
            </h1>
            <p className="text-[13px] text-[#6B7280]">
              Sign in to access your account and continue shopping
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-[12px] font-bold text-[#4B5563] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] focus:outline-none focus:border-[#00D4E8] focus:ring-1 focus:ring-[#00D4E8] transition-all"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-[11px] text-[#EF4444] mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[12px font-bold text-[#4B5563] mb-1.5">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[14px] text-[#111827] focus:outline-none focus:border-[#00D4E8] focus:ring-1 focus:ring-[#00D4E8] transition-all"
                placeholder="•••••••••"
              />
              {errors.password && (
                <p className="text-[11px] text-[#EF4444] mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] bg-[#0A0C14] hover:bg-[#1E2235] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Links */}
          <div className="mt-6 text-center text-[13px] text-[#6B7280]">
            <p className="mb-2">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-[#00D4E8] font-semibold hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 flex items-center justify-center gap-6 text-[11px] text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            <span>Secure login</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#6B7280]" />
            <span>Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
