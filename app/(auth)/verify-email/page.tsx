"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data?.error || "Unable to verify email");
      }

      toast.success("Email verified successfully!");
      router.push("/sign-in");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    
    setIsResending(true);

    try {
      // We'll use the signup endpoint to resend - it handles unverified users
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data?.error || "Unable to resend code");
      }

      toast.success("Verification code sent!");
      setResendCooldown(60);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsResending(false);
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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
            <Mail className="h-6 w-6 text-blue-600/80 dark:text-blue-400/80" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify your email</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {email ? (
              <>
                We sent a code to{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
              </>
            ) : (
              "Enter your email and the verification code"
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email (if not prefilled) */}
          {!emailFromUrl && (
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 pr-4 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500/70 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          )}

          {/* OTP Input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={setCode}
              className="gap-2"
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className="h-14 w-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                <InputOTPSlot index={1} className="h-14 w-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                <InputOTPSlot index={2} className="h-14 w-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                <InputOTPSlot index={3} className="h-14 w-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                <InputOTPSlot index={4} className="h-14 w-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
                <InputOTPSlot index={5} className="h-14 w-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-lg font-semibold" />
              </InputOTPGroup>
            </InputOTP>
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
                Verifying...
              </>
            ) : (
              <>
                Verify email
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || resendCooldown > 0 || !email}
              className="font-medium text-blue-600/80 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <RotateCcw className="h-3 w-3" />
                  Resend code
                </>
              )}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/sign-in"
            className="font-medium text-blue-600/80 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
