import AuthRedirect from "@/components/auth/auth-redirect";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(99, 102, 241, 0.06), transparent 30%), radial-gradient(circle at 0% 100%, rgba(14, 165, 233, 0.06), transparent 35%)",
        }}
      />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <AuthRedirect>{children}</AuthRedirect>
      </div>
    </div>
  );
}
