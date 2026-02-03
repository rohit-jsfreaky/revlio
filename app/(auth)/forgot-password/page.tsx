"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      await response.json().catch(() => ({}));
      
      toast.success("If this email exists, a reset code has been sent");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error("Something went wrong");
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
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
            <KeyRound className="h-6 w-6 text-blue-600/80 dark:text-blue-400/80" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password?</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No worries, we&apos;ll send you reset instructions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-10 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-blue-500/70 focus:ring-blue-500/20"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-blue-600/90 text-white font-medium hover:bg-blue-700/90 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send reset code
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

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
