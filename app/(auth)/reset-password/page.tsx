"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data?.error || "Unable to reset password");
      }

      toast.success("Password reset successfully!");
      router.push("/sign-in");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <Image
          src="/revlio_logo.png"
          alt="Revlio"
          width={40}
          height={40}
          className="rounded-xl"
        />
        <span className="text-2xl font-semibold text-gray-900 dark:text-white">Revlio</span>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/90 dark:bg-gray-900/80 p-8 shadow-xl shadow-blue-900/5 dark:shadow-black/20 backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
            <ShieldCheck className="h-6 w-6 text-emerald-600/80 dark:text-emerald-400/80" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set new password</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter the code and your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email (if not prefilled) */}
          {!emailFromUrl && (
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500/70 focus:ring-blue-500/20"
              />
            </div>
          )}

          {/* Email display if prefilled */}
          {emailFromUrl && (
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Reset code sent to</p>
              <p className="text-sm text-gray-900 dark:text-white font-medium">{email}</p>
            </div>
          )}

          {/* OTP Input */}
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Reset code</label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                className="gap-2"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="h-12 w-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                  <InputOTPSlot index={1} className="h-12 w-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                  <InputOTPSlot index={2} className="h-12 w-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                  <InputOTPSlot index={3} className="h-12 w-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                  <InputOTPSlot index={4} className="h-12 w-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                  <InputOTPSlot index={5} className="h-12 w-10 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {/* New Password */}
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500/70 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500/70 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            className="h-12 w-full rounded-xl bg-blue-600/90 text-white font-medium hover:bg-blue-700/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                Reset password
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/forgot-password"
            className="font-medium text-blue-600/80 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
          >
            ← Request new code
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
