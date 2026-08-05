"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Lock,
  Eye,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  isEnabled: boolean;
  order: number;
}

export default function AdminPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch links from API on mount
  useEffect(() => {
    const savedPassword = localStorage.getItem("portfolio_admin_password") || "";
    if (savedPassword) {
      setPassword(savedPassword);
    }
    fetchLinks(savedPassword);
  }, []);

  async function fetchLinks(passToVerify?: string) {
    setLoading(true);
    setMessage(null);
    try {
      const headers: Record<string, string> = {};
      const verifyPass = passToVerify !== undefined ? passToVerify : password;
      if (verifyPass) {
        headers["x-admin-password"] = verifyPass;
      }

      const res = await fetch("/api/links", { headers });
      const data = await res.json();
      if (data.success) {
        setIsPasswordProtected(data.isPasswordProtected);
        
        if (!data.isPasswordProtected) {
          setLinks(data.links);
          setIsUnlocked(true);
        } else {
          if (data.isAuthorized) {
            setLinks(data.links);
            setIsUnlocked(true);
            if (verifyPass) {
              localStorage.setItem("portfolio_admin_password", verifyPass);
            }
          } else {
            setIsUnlocked(false);
            if (verifyPass) {
              setMessage({ type: "error", text: "Invalid admin password." });
              localStorage.removeItem("portfolio_admin_password");
            }
          }
        }
      } else {
        setMessage({ type: "error", text: "Failed to load links from API." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error loading links." });
    } finally {
      setLoading(false);
    }
  }

  // Handle password unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === "") return;
    await fetchLinks(password);
  };

  const handleLogout = () => {
    localStorage.removeItem("portfolio_admin_password");
    setPassword("");
    setIsUnlocked(false);
  };

  // Add a new blank link
  const addLink = () => {
    const newId = `link_${Date.now()}`;
    const newLink: LinkItem = {
      id: newId,
      title: "New Link",
      url: "https://",
      icon: "globe",
      isEnabled: true,
      order: links.length + 1,
    };
    setLinks([...links, newLink]);
  };

  // Remove a link
  const deleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  // Move link up in order
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index - 1];
    newLinks[index - 1] = temp;
    
    // Reassign orders
    newLinks.forEach((link, idx) => {
      link.order = idx + 1;
    });
    setLinks(newLinks);
  };

  // Move link down in order
  const moveDown = (index: number) => {
    if (index === links.length - 1) return;
    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[index + 1];
    newLinks[index + 1] = temp;
    
    // Reassign orders
    newLinks.forEach((link, idx) => {
      link.order = idx + 1;
    });
    setLinks(newLinks);
  };

  // Update specific fields of a link
  const updateLink = (id: string, field: keyof LinkItem, value: any) => {
    setLinks(
      links.map((link) => {
        if (link.id === id) {
          return { ...link, [field]: value };
        }
        return link;
      })
    );
  };

  // Save changes to JSON file
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          links,
          password,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Links saved successfully!" });
        setLinks(data.links);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save links. Check password.",
        });
        if (res.status === 401) {
          // Wrong password, force relock
          setIsUnlocked(false);
        }
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error saving links." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <RefreshCw className="size-8 text-primary animate-spin" />
        <p className="mt-4 text-muted-foreground text-sm">Loading dashboard data...</p>
      </div>
    );
  }

  // Lock screen if password required and not unlocked
  if (isPasswordProtected && !isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto px-4">
        <div className="w-full border rounded-2xl bg-card p-6 shadow-xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Lock className="size-6" />
            </div>
            <h2 className="text-xl font-bold">Admin Dashboard Locked</h2>
            <p className="text-sm text-muted-foreground">
              Please enter the ADMIN_PASSWORD to edit your links.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label htmlFor="pass" className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                required
              />
            </div>

            {message && (
              <div className="flex items-center gap-2 p-3 text-xs bg-destructive/10 text-destructive rounded-xl border border-destructive/20">
                <XCircle className="size-4 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-foreground text-background font-medium text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3.5" /> Home
            </Link>
            <span>/</span>
            <Link href="/links" className="hover:text-foreground flex items-center gap-1 transition-colors">
              Public Links <ExternalLink className="size-3" />
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Links</h1>
        </div>

        <div className="flex items-center gap-2">
          {isPasswordProtected && (
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 border border-border bg-card hover:bg-muted text-xs font-medium rounded-xl transition-all"
            >
              Lock Dashboard
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Warnings & Messages */}
      {!isPasswordProtected && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl text-xs">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Local Mode Active</p>
            <p className="text-muted-foreground">
              No `ADMIN_PASSWORD` is configured in your environmental variables. Anyone can access this page and edit links in production. Set `ADMIN_PASSWORD` in your `.env.local` to secure it.
            </p>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-2xl text-xs border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="size-4 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="size-4 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Links Editor List */}
      <div className="space-y-4">
        {links.map((link, index) => (
          <div
            key={link.id}
            className={`border rounded-2xl p-4 bg-card/40 backdrop-blur shadow-sm flex flex-col gap-4 relative transition-all ${
              !link.isEnabled ? "opacity-60 saturate-50" : ""
            }`}
          >
            {/* Top Bar inside card */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Link #{index + 1}
              </span>
              
              <div className="flex items-center gap-1.5">
                {/* Active Toggle Switch */}
                <label className="flex items-center gap-2 cursor-pointer text-xs mr-2">
                  <input
                    type="checkbox"
                    checked={link.isEnabled}
                    onChange={(e) => updateLink(link.id, "isEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-8 h-4 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-foreground"></div>
                  <span className="text-muted-foreground font-medium select-none">
                    {link.isEnabled ? "Active" : "Disabled"}
                  </span>
                </label>

                {/* Move Actions */}
                <button
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="p-1 border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move Up"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  onClick={() => moveDown(index)}
                  disabled={index === links.length - 1}
                  className="p-1 border rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move Down"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                
                {/* Delete */}
                <button
                  onClick={() => deleteLink(link.id)}
                  className="p-1 border border-destructive/20 rounded-lg hover:bg-destructive/10 text-destructive/80 hover:text-destructive transition-all ml-1"
                  title="Delete Link"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
              <div className="md:col-span-4">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updateLink(link.id, "title", e.target.value)}
                  placeholder="e.g. GitHub"
                  className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-5">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  URL
                </label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateLink(link.id, "url", e.target.value)}
                  placeholder="https://"
                  className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Icon
                </label>
                <select
                  value={link.icon}
                  onChange={(e) => updateLink(link.id, "icon", e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border bg-background border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="globe">Globe (Default)</option>
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="leetcode">LeetCode</option>
                  <option value="resume">Resume</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {links.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-2xl text-muted-foreground text-sm">
            No links added yet. Click "+ Add New Link" to start.
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
        <button
          onClick={addLink}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-xl hover:bg-muted text-sm font-medium transition-all"
        >
          <Plus className="size-4" />
          Add New Link
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLinks()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-muted text-sm font-medium transition-all"
          >
            <RefreshCw className="size-4" />
            Discard Changes
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground text-background font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
