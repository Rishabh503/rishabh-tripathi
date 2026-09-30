"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";

export default function LinksAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the unified master admin hub
    const timer = setTimeout(() => {
      router.replace("/admin");
    }, 1200);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-4 text-center space-y-5">
      <div className="p-4 bg-primary/10 text-primary rounded-2xl ring-1 ring-primary/20 animate-pulse">
        <ShieldCheck className="size-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          Links Management Has Moved
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The links manager has been unified into the **Master Admin Panel** at <code className="text-primary font-mono font-bold">/admin</code> alongside your projects, skills, and bio.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
        <RefreshCw className="size-3.5 animate-spin text-primary" />
        <span>Redirecting you automatically...</span>
      </div>

      <Link
        href="/admin"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-md"
      >
        <span>Open Master Admin Hub</span>
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
