"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SyncUser() {
  const router = useRouter();

  useEffect(() => {
    // Retry after a short delay — the DB record is being created
    const timer = setTimeout(() => {
      router.refresh();
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground">Setting up your account...</p>
    </div>
  );
}
