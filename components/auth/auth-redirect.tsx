"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "guest">("checking");

  useEffect(() => {
    let isMounted = true;

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.authenticated) {
          router.replace("/");
          return;
        }
        setStatus("guest");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("guest");
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (status === "checking") {
    return null;
  }

  return <>{children}</>;
}
