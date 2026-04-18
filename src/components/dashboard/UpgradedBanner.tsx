"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function UpgradedBanner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("upgraded") !== "1") return;
    toast.success("Welcome to Pro! Your subscription is active.", {
      duration: 6000,
    });
    const url = new URL(window.location.href);
    url.searchParams.delete("upgraded");
    router.replace(url.pathname + (url.search || ""));
  }, [params, router]);

  return null;
}
