"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  isPro: boolean;
  plan: string | null;
  proExpiresAt: string | null;
};

export function SubscriptionSection({ isPro, plan, proExpiresAt }: Props) {
  const [upgradeLoading, setUpgradeLoading] = useState<"monthly" | "yearly" | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleUpgrade(selectedPlan: "monthly" | "yearly") {
    setUpgradeLoading(selectedPlan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      const data = (await res.json()) as { checkout_url?: string; error?: string };
      if (!res.ok || !data.checkout_url) {
        throw new Error(data.error ?? "Failed to start checkout");
      }
      window.location.href = data.checkout_url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      setUpgradeLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    window.location.href = "/api/customer-portal";
  }

  const renewsOn = proExpiresAt
    ? new Date(proExpiresAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Subscription</h2>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {isPro ? (
          <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center size-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Crown className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  Pro
                  {plan && (
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {plan}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {renewsOn ? `Renews on ${renewsOn}` : "Active subscription"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ExternalLink className="size-3.5" />
              )}
              Manage subscription
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            <div>
              <h3 className="text-sm font-medium">Free plan</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Upgrade to unlock file &amp; image uploads, AI features, and unlimited items.
              </p>
            </div>
            <div className="flex gap-2 max-sm:flex-col">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpgrade("monthly")}
                disabled={upgradeLoading !== null}
              >
                {upgradeLoading === "monthly" && <Loader2 className="size-3.5 animate-spin" />}
                Monthly &mdash; $8
              </Button>
              <Button
                size="sm"
                onClick={() => handleUpgrade("yearly")}
                disabled={upgradeLoading !== null}
              >
                {upgradeLoading === "yearly" && <Loader2 className="size-3.5 animate-spin" />}
                Yearly &mdash; $72 (save 25%)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
