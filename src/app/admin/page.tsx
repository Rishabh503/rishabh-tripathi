"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Unlock,
  KeyRound,
  Mail,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Code2,
  User,
  Briefcase,
  GraduationCap,
  MessageSquareText,
  Link2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ArrowLeft,
  X,
  HelpCircle,
  Copy,
  Check,
  Upload,
  ImagePlus,
  ImageIcon,
  Globe,
  Share2,
} from "lucide-react";
import { PortfolioData, ProjectItem, SkillItem, ProjectLink } from "@/lib/portfolio-data";
import { AVAILABLE_SKILL_ICONS, getSkillIconComponent, renderProjectLinkIcon } from "@/lib/icon-helper";
import { Icons } from "@/components/icons";

const VERIFIED_EMAIL = "rishabhtripathi2022@gmail.com";

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string;
  isEnabled: boolean;
  order: number;
}

type TabType = "projects" | "skills" | "links" | "profile" | "experience" | "chatbot" | "security";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("projects");

  // Notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Full portfolio state
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);

  // Quick Links state (merged from links.json)
  const [links, setLinks] = useState<LinkItem[]>([]);

  // Password reset state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "verify">("request");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Editing Project Modal State
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [editingProjectIndex, setEditingProjectIndex] = useState<number | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [newTechInput, setNewTechInput] = useState("");

  // Check authentication on initial load
  useEffect(() => {
    checkAuth();
  }, []);

  const notify = (type: "success" | "error" | "info", text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 6000);
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        await Promise.all([loadPortfolioData(), loadLinksData()]);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadPortfolioData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      const result = await res.json();
      if (result.success && result.data) {
        setPortfolioData(result.data);
      }
    } catch (err) {
      notify("error", "Failed to load portfolio data.");
    }
  };

  const DEFAULT_SEED_LINKS: LinkItem[] = [
    {
      id: "github",
      title: "GitHub",
      url: "https://github.com/Rishabh503",
      icon: "github",
      isEnabled: true,
      order: 1,
    },
    {
      id: "leetcode",
      title: "LeetCode",
      url: "https://leetcode.com/u/Rishabh2906/",
      icon: "leetcode",
      isEnabled: true,
      order: 2,
    },
    {
      id: "portfolio",
      title: "Portfolio Website",
      url: "https://rishabh-tripathi-xi.vercel.app/",
      icon: "globe",
      isEnabled: true,
      order: 3,
    },
    {
      id: "resume",
      title: "Resume",
      url: "https://drive.google.com/file/d/1PReRNpW5eE_1fltAQ_gN_dgKUgVPAL7z/view?usp=drive_link",
      icon: "resume",
      isEnabled: true,
      order: 4,
    },
    {
      id: "linkedin",
      title: "LinkedIn",
      url: "https://www.linkedin.com/in/rishabh-tripathi-9985aa319/",
      icon: "linkedin",
      isEnabled: true,
      order: 5,
    },
    {
      id: "email",
      title: "Contact Email",
      url: "mailto:rishabhtripathi2022@gmail.com",
      icon: "email",
      isEnabled: true,
      order: 6,
    },
  ];

  const loadLinksData = async () => {
    try {
      const res = await fetch("/api/links");
      const result = await res.json();
      if (result.success && Array.isArray(result.links) && result.links.length > 0) {
        setLinks(result.links);
      } else {
        setLinks(DEFAULT_SEED_LINKS);
      }
    } catch (err) {
      console.error("Failed to load quick links:", err);
      setLinks(DEFAULT_SEED_LINKS);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        notify("success", "Welcome back, Rishabh! Admin dashboard unlocked.");
        await Promise.all([loadPortfolioData(), loadLinksData()]);
      } else {
        notify("error", data.error || "Incorrect password. Access denied.");
      }
    } catch (err) {
      notify("error", "Network error while authenticating.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      setIsAuthenticated(false);
      setPassword("");
      notify("info", "Logged out. Dashboard locked.");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleFileUpload = async (file: File, target: "project" | "avatar") => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", target === "project" ? "projects" : "uploads");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (target === "project" && editingProject) {
          setEditingProject({ ...editingProject, image: data.url });
        } else if (target === "avatar" && portfolioData) {
          setPortfolioData({ ...portfolioData, avatarUrl: data.url });
        }
        notify("success", `Image "${file.name}" uploaded successfully!`);
      } else {
        notify("error", data.error || "Failed to upload image.");
      }
    } catch (err) {
      notify("error", "Network error while uploading image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Password Reset / Change via Verified Email
  const handleRequestOtp = async () => {
    setResetLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request-otp",
          email: VERIFIED_EMAIL,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setResetStep("verify");
        notify(
          "success",
          data.mockMode
            ? `OTP generated! Check terminal or configure RESEND_API_KEY.`
            : `Verification OTP sent to ${VERIFIED_EMAIL}. Please check your inbox.`
        );
      } else {
        notify("error", data.error || "Failed to request password reset OTP.");
      }
    } catch (err) {
      notify("error", "Network error requesting reset code.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notify("error", "Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      notify("error", "Password must be at least 6 characters long.");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          email: VERIFIED_EMAIL,
          otp: resetOtp,
          newPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        notify("success", "Password successfully updated! You can now log in.");
        setIsResetMode(false);
        setResetStep("request");
        setResetOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        notify("error", data.error || "Verification failed. Check your OTP.");
      }
    } catch (err) {
      notify("error", "Network error verifying OTP.");
    } finally {
      setResetLoading(false);
    }
  };

  // Save full portfolio data & quick links
  const handleSaveAll = async () => {
    if (!portfolioData) return;
    setSaving(true);
    try {
      const [portfolioRes, linksRes] = await Promise.all([
        fetch("/api/admin/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: portfolioData }),
        }),
        fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ links }),
        }),
      ]);

      const pResult = await portfolioRes.json();
      const lResult = await linksRes.json();

      if (portfolioRes.ok && linksRes.ok) {
        notify("success", "All changes (Portfolio & Quick Links) saved and published live!");
        if (pResult.data) setPortfolioData(pResult.data);
        if (lResult.links) setLinks(lResult.links);
      } else {
        notify("error", pResult.error || lResult.error || "Failed to save some changes.");
      }
    } catch (err) {
      notify("error", "Network error saving portfolio data.");
    } finally {
      setSaving(false);
    }
  };

  // Project Helper Functions
  const openNewProjectModal = () => {
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      title: "New Project",
      href: "https://",
      dates: `${new Date().getFullYear()}`,
      active: true,
      description: "A description of this project...",
      technologies: ["Next.js", "React", "Tailwind CSS"],
      image: "",
      video: "",
      links: [
        { type: "Website", href: "https://", icon: "globe" },
        { type: "Source", href: "https://github.com/Rishabh503", icon: "github" },
      ],
    };
    setEditingProject(newProj);
    setEditingProjectIndex(null);
    setIsNewProject(true);
  };

  const openEditProjectModal = (proj: ProjectItem, index: number) => {
    setEditingProject(JSON.parse(JSON.stringify(proj)));
    setEditingProjectIndex(index);
    setIsNewProject(false);
  };

  const saveProjectModal = () => {
    if (!portfolioData || !editingProject) return;
    const updatedProjects = [...portfolioData.projects];

    if (isNewProject) {
      updatedProjects.unshift(editingProject);
    } else if (editingProjectIndex !== null) {
      updatedProjects[editingProjectIndex] = editingProject;
    }

    setPortfolioData({
      ...portfolioData,
      projects: updatedProjects,
    });
    setEditingProject(null);
    notify("info", `Project "${editingProject.title}" updated in draft. Click "Save Changes" to publish.`);
  };

  const deleteProject = (index: number) => {
    if (!portfolioData) return;
    const p = portfolioData.projects[index];
    if (window.confirm(`Are you sure you want to delete "${p.title}"?`)) {
      const updatedProjects = portfolioData.projects.filter((_, i) => i !== index);
      setPortfolioData({
        ...portfolioData,
        projects: updatedProjects,
      });
      notify("info", `Deleted "${p.title}". Click "Save Changes" to publish.`);
    }
  };

  const moveProject = (index: number, direction: "up" | "down") => {
    if (!portfolioData) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= portfolioData.projects.length) return;

    const updated = [...portfolioData.projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPortfolioData({ ...portfolioData, projects: updated });
  };

  // Skill Helper Functions
  const addSkill = () => {
    if (!portfolioData) return;
    const newSkill: SkillItem = {
      name: "New Skill",
      icon: "code",
    };
    setPortfolioData({
      ...portfolioData,
      skills: [...portfolioData.skills, newSkill],
    });
  };

  const updateSkill = (index: number, field: keyof SkillItem, val: string) => {
    if (!portfolioData) return;
    const updated = [...portfolioData.skills];
    updated[index] = { ...updated[index], [field]: val };
    setPortfolioData({ ...portfolioData, skills: updated });
  };

  const deleteSkill = (index: number) => {
    if (!portfolioData) return;
    const updated = portfolioData.skills.filter((_, i) => i !== index);
    setPortfolioData({ ...portfolioData, skills: updated });
  };

  const moveSkill = (index: number, direction: "up" | "down") => {
    if (!portfolioData) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= portfolioData.skills.length) return;

    const updated = [...portfolioData.skills];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setPortfolioData({ ...portfolioData, skills: updated });
  };

  // Quick Links Helper Functions
  const addLinkItem = () => {
    const newLink: LinkItem = {
      id: `link_${Date.now()}`,
      title: "New Link",
      url: "https://",
      icon: "globe",
      isEnabled: true,
      order: links.length + 1,
    };
    setLinks([...links, newLink]);
  };

  const updateLinkItem = (id: string, field: keyof LinkItem, value: any) => {
    setLinks(
      links.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );
  };

  const deleteLinkItem = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const moveLinkItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    newLinks.forEach((l, idx) => {
      l.order = idx + 1;
    });
    setLinks(newLinks);
  };

  const handleResetDefaultLinks = () => {
    setLinks(DEFAULT_SEED_LINKS);
    notify("success", "Loaded default quick links (GitHub, LeetCode, Portfolio, Resume, LinkedIn, Email). Click 'Save All Changes' to save!");
  };

  // Render Loading Spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying admin session...</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // UNPROTECTED / LOCKED SCREEN VIEW
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] max-w-md mx-auto px-4 py-8">
        {/* Floating Notification */}
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed top-6 right-6 left-6 sm:left-auto sm:max-w-md z-50 p-4 rounded-2xl text-xs font-medium border shadow-xl flex items-start gap-3 backdrop-blur-xl ${
              notification.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                : notification.type === "error"
                ? "bg-destructive/15 border-destructive/30 text-destructive"
                : "bg-primary/15 border-primary/30 text-primary"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            ) : notification.type === "error" ? (
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="size-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{notification.text}</div>
          </motion.div>
        )}

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full border border-border/80 bg-card/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Light Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {!isResetMode ? (
            /* Standard Password Unlock Form */
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-2.5">
                <div className="p-3.5 bg-primary/10 text-primary rounded-2xl ring-1 ring-primary/20 shadow-xs">
                  <Lock className="size-7" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Admin Gateway
                </h1>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Enter your admin password to manage projects, skills, quick links, bio, and chatbot knowledge.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Master Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 rounded-2xl border bg-background border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary pr-11 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !password}
                  className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  Unlock Dashboard
                </button>
              </form>

              {/* Password Recovery Footer */}
              <div className="pt-4 border-t border-border/60 flex flex-col items-center gap-3 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setResetStep("request");
                  }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <Mail className="size-3.5" />
                  Forgot Password? Reset via Email
                </button>
                <Link
                  href="/"
                  className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="size-3" /> Return to Portfolio
                </Link>
              </div>
            </div>
          ) : (
            /* Email-Verified Password Reset Flow */
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-2xl ring-1 ring-indigo-500/20">
                  <ShieldCheck className="size-7" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Verified Email Recovery
                </h2>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Password changes are strictly verified via your primary email address:
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted rounded-full text-xs font-mono font-medium text-foreground border border-border">
                  <Mail className="size-3 text-indigo-500" />
                  {VERIFIED_EMAIL}
                </div>
              </div>

              {resetStep === "request" ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    Click below to send a secure, one-time 6-digit verification code to your verified inbox via Resend.
                  </p>

                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={resetLoading}
                    className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <Mail className="size-4" />
                    )}
                    Send Verification Code
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsResetMode(false)}
                    className="w-full py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel and return to login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value)}
                      placeholder="123456"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border bg-background border-border text-center font-mono text-lg tracking-widest text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      required
                      className="w-full px-4 py-2.5 rounded-2xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading || !resetOtp || !newPassword}
                    className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold text-sm rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {resetLoading ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : (
                      <KeyRound className="size-4" />
                    )}
                    Verify OTP & Update Password
                  </button>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={handleRequestOtp}
                      disabled={resetLoading}
                      className="text-xs text-primary hover:underline"
                    >
                      Resend code
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsResetMode(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD VIEW
  // ----------------------------------------------------
  if (!portfolioData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading portfolio manager...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 min-h-screen">
      {/* Floating Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 left-6 sm:left-auto sm:max-w-md z-50 p-4 rounded-2xl text-xs font-medium border shadow-2xl flex items-start gap-3 backdrop-blur-xl ${
              notification.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                : notification.type === "error"
                ? "bg-destructive/15 border-destructive/30 text-destructive"
                : "bg-primary/15 border-primary/30 text-primary"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            ) : notification.type === "error" ? (
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="size-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{notification.text}</div>
            <button
              onClick={() => setNotification(null)}
              className="text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/" className="hover:text-foreground flex items-center gap-1 transition-colors">
              <ArrowLeft className="size-3.5" /> View Live Portfolio
            </Link>
            <span>/</span>
            <Link href="/links" className="hover:text-foreground flex items-center gap-1 transition-colors">
              Public Linktree <ExternalLink className="size-3" />
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-500" /> Admin Control Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Portfolio Management Suite
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Modify projects, skills, quick links, biography, and AI chatbot prompts all from this single hub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-border bg-card/80 hover:bg-muted text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-2xs"
            title="Lock session"
          >
            <LogOut className="size-3.5" />
            Lock
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs sm:text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save All Changes
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-border/40">
        {[
          { id: "projects", label: "Projects", icon: Layers, count: portfolioData.projects.length },
          { id: "skills", label: "Skills", icon: Code2, count: portfolioData.skills.length },
          { id: "links", label: "Quick Links", icon: Link2, count: links.length },
          { id: "profile", label: "Profile & Bio", icon: User },
          { id: "experience", label: "Work & Education", icon: Briefcase },
          { id: "chatbot", label: "Chatbot AI", icon: MessageSquareText },
          { id: "security", label: "Security & Email", icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: PROJECTS MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Projects Showcase ({portfolioData.projects.length})</h2>
              <p className="text-xs text-muted-foreground">
                Add, edit details, upload cover images, add tags, links, and preview projects.
              </p>
            </div>
            <button
              onClick={openNewProjectModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              <Plus className="size-4" />
              Add New Project
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioData.projects.map((project, index) => (
              <div
                key={project.id || index}
                className={`border rounded-2xl p-4 bg-card/60 backdrop-blur-md shadow-xs flex flex-col justify-between gap-4 transition-all relative ${
                  !project.active ? "opacity-60 border-dashed" : "border-border/80"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                        #{index + 1}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-foreground line-clamp-1">
                        {project.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveProject(index, "up")}
                        disabled={index === 0}
                        className="p-1 border rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp className="size-3.5" />
                      </button>
                      <button
                        onClick={() => moveProject(index, "down")}
                        disabled={index === portfolioData.projects.length - 1}
                        className="p-1 border rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown className="size-3.5" />
                      </button>
                      <button
                        onClick={() => openEditProjectModal(project, index)}
                        className="p-1 border border-primary/30 text-primary rounded-lg hover:bg-primary/10 ml-1"
                        title="Edit Project"
                      >
                        <Edit3 className="size-3.5" />
                      </button>
                      <button
                        onClick={() => deleteProject(index)}
                        className="p-1 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10"
                        title="Delete Project"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.technologies.slice(0, 5).map((tech) => (
                      <span
                        key={tech}
                        className="text-[10px] font-medium bg-muted/60 border border-border px-2 py-0.5 rounded-md text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 5 && (
                      <span className="text-[10px] text-muted-foreground/80 px-1 py-0.5">
                        +{project.technologies.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                  <span className="text-[11px] font-mono">{project.dates || "No dates specified"}</span>
                  <div className="flex items-center gap-2">
                    {project.href && (
                      <a
                        href={project.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-[11px]"
                      >
                        Visit <ExternalLink className="size-2.5" />
                      </a>
                    )}
                    <span
                      className={`size-2 rounded-full ${project.active ? "bg-emerald-500" : "bg-muted-foreground"}`}
                      title={project.active ? "Active" : "Hidden"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: SKILLS MANAGEMENT */}
      {/* ---------------------------------------------------- */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Technical Skills ({portfolioData.skills.length})</h2>
              <p className="text-xs text-muted-foreground">
                Manage all skill badges rendered in the Skills section with matching SVG icons.
              </p>
            </div>
            <button
              onClick={addSkill}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
            >
              <Plus className="size-4" />
              Add Skill
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {portfolioData.skills.map((skill, index) => {
              const IconComp = getSkillIconComponent(skill.icon);
              return (
                <div
                  key={index}
                  className="border border-border/80 rounded-2xl p-3.5 bg-card/70 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="size-8 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/60">
                      <IconComp className="size-4 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => updateSkill(index, "name", e.target.value)}
                        className="w-full text-xs font-bold bg-transparent border-b border-transparent focus:border-primary focus:outline-hidden py-0.5"
                      />
                      <select
                        value={skill.icon}
                        onChange={(e) => updateSkill(index, "icon", e.target.value)}
                        className="text-[10px] text-muted-foreground bg-transparent border-0 p-0 focus:outline-hidden cursor-pointer"
                      >
                        {AVAILABLE_SKILL_ICONS.map((opt) => (
                          <option key={opt.id} value={opt.id} className="bg-card text-foreground">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveSkill(index, "up")}
                      disabled={index === 0}
                      className="p-1 border rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-20"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      onClick={() => moveSkill(index, "down")}
                      disabled={index === portfolioData.skills.length - 1}
                      className="p-1 border rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-20"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                    <button
                      onClick={() => deleteSkill(index)}
                      className="p-1 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: QUICK LINKS (LINKTREE SYSTEM) */}
      {/* ---------------------------------------------------- */}
      {activeTab === "links" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Quick Links Management ({links.length})</h2>
              <p className="text-xs text-muted-foreground">
                Manage the public links displayed on your <Link href="/links" target="_blank" className="text-primary underline">/links</Link> page.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaultLinks}
                className="flex items-center justify-center gap-1.5 px-3 py-2 border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
                title="Seed standard default links (GitHub, LeetCode, Portfolio, Resume, LinkedIn, Email)"
              >
                <RefreshCw className="size-3.5 text-primary" />
                <span>Seed Default Links</span>
              </button>
              <button
                onClick={addLinkItem}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Add New Link</span>
              </button>
            </div>
          </div>

          <div className="space-y-3.5">
            {links.map((linkItem, index) => (
              <div
                key={linkItem.id}
                className={`border rounded-2xl p-4 bg-card/60 backdrop-blur-md shadow-xs flex flex-col gap-3.5 transition-all ${
                  !linkItem.isEnabled ? "opacity-60 saturate-50 border-dashed" : "border-border/80"
                }`}
              >
                {/* Link Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded-md text-muted-foreground">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-bold text-foreground">{linkItem.title || "Untitled Link"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Active toggle */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs mr-2">
                      <input
                        type="checkbox"
                        checked={linkItem.isEnabled}
                        onChange={(e) => updateLinkItem(linkItem.id, "isEnabled", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="relative w-8 h-4 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-background after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                      <span className="text-muted-foreground font-medium select-none text-[11px]">
                        {linkItem.isEnabled ? "Active" : "Hidden"}
                      </span>
                    </label>

                    {/* Move controls */}
                    <button
                      onClick={() => moveLinkItem(index, "up")}
                      disabled={index === 0}
                      className="p-1 border rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      onClick={() => moveLinkItem(index, "down")}
                      disabled={index === links.length - 1}
                      className="p-1 border rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      onClick={() => deleteLinkItem(linkItem.id)}
                      className="p-1 border border-destructive/20 text-destructive rounded-lg hover:bg-destructive/10 ml-1"
                      title="Delete Link"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inputs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={linkItem.title}
                      onChange={(e) => updateLinkItem(linkItem.id, "title", e.target.value)}
                      placeholder="e.g. GitHub"
                      className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                      Target URL
                    </label>
                    <input
                      type="text"
                      value={linkItem.url}
                      onChange={(e) => updateLinkItem(linkItem.id, "url", e.target.value)}
                      placeholder="https://"
                      className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                      Brand Icon
                    </label>
                    <select
                      value={linkItem.icon}
                      onChange={(e) => updateLinkItem(linkItem.id, "icon", e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border bg-background border-border text-xs focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="globe">Globe (Default)</option>
                      <option value="github">GitHub</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="leetcode">LeetCode</option>
                      <option value="resume">Resume / Drive</option>
                      <option value="email">Email</option>
                      <option value="x">X / Twitter</option>
                      <option value="youtube">YouTube</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {links.length === 0 && (
              <div className="text-center py-12 border border-dashed rounded-2xl text-muted-foreground text-sm space-y-3">
                <p>No quick links configured yet.</p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleResetDefaultLinks}
                    className="px-4 py-2 bg-primary/10 border border-primary/30 text-primary rounded-xl text-xs font-semibold hover:bg-primary/20 transition-all cursor-pointer"
                  >
                    Seed Standard Default Links
                  </button>
                  <button
                    onClick={addLinkItem}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-all cursor-pointer"
                  >
                    + Add New Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: PROFILE & BIO DETAILS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Profile & Bio Details</h2>
            <p className="text-xs text-muted-foreground">
              Update your name, headline, markdown biography summary, avatar, and contact channels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border border-border/80 rounded-2xl p-5 bg-card/60 space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Basic Information
              </h3>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={portfolioData.name}
                  onChange={(e) => setPortfolioData({ ...portfolioData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Initials
                  </label>
                  <input
                    type="text"
                    value={portfolioData.initials}
                    onChange={(e) => setPortfolioData({ ...portfolioData, initials: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Avatar Image
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={portfolioData.avatarUrl}
                      onChange={(e) => setPortfolioData({ ...portfolioData, avatarUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2 rounded-xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                    <label className="p-2.5 bg-primary text-primary-foreground rounded-xl cursor-pointer hover:opacity-90 transition-all flex items-center justify-center shrink-0">
                      {uploadingImage ? <RefreshCw className="size-4 animate-spin" /> : <Upload className="size-4" />}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileUpload(f, "avatar");
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Location & Map Link
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={portfolioData.location}
                    onChange={(e) => setPortfolioData({ ...portfolioData, location: e.target.value })}
                    placeholder="New Delhi, India"
                    className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={portfolioData.locationLink}
                    onChange={(e) => setPortfolioData({ ...portfolioData, locationLink: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Hero Tagline / Short Description
                </label>
                <textarea
                  rows={2}
                  value={portfolioData.description}
                  onChange={(e) => setPortfolioData({ ...portfolioData, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="border border-border/80 rounded-2xl p-5 bg-card/60 space-y-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Contact & Social Profiles
              </h3>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={portfolioData.contact.email}
                  onChange={(e) =>
                    setPortfolioData({
                      ...portfolioData,
                      contact: { ...portfolioData.contact, email: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={portfolioData.contact.tel}
                  onChange={(e) =>
                    setPortfolioData({
                      ...portfolioData,
                      contact: { ...portfolioData.contact, tel: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
              </div>

              {Object.entries(portfolioData.contact.social).map(([key, item]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    {item.name || key} Profile URL
                  </label>
                  <input
                    type="text"
                    value={item.url}
                    onChange={(e) => {
                      const updatedSocial = { ...portfolioData.contact.social };
                      updatedSocial[key] = { ...item, url: e.target.value };
                      setPortfolioData({
                        ...portfolioData,
                        contact: { ...portfolioData.contact, social: updatedSocial },
                      });
                    }}
                    className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border/80 rounded-2xl p-5 bg-card/60 space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              About Me Biography (Markdown Supported)
            </h3>
            <textarea
              rows={6}
              value={portfolioData.summary}
              onChange={(e) => setPortfolioData({ ...portfolioData, summary: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border bg-background border-border text-sm text-foreground leading-relaxed focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: EXPERIENCE & EDUCATION */}
      {/* ---------------------------------------------------- */}
      {activeTab === "experience" && (
        <div className="space-y-6">
          {/* Work Experience */}
          <div className="border border-border/80 rounded-2xl p-5 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Work Experience</h3>
                <p className="text-xs text-muted-foreground">Manage your roles, internships, and company details.</p>
              </div>
              <button
                onClick={() => {
                  const newWork = {
                    company: "New Company",
                    href: "https://",
                    location: "New Delhi, India",
                    title: "Software Engineer",
                    logoUrl: "/drdo.png",
                    start: "July 2025",
                    end: "Present",
                    description: "Details about your contributions...",
                  };
                  setPortfolioData({
                    ...portfolioData,
                    work: [...portfolioData.work, newWork],
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl"
              >
                <Plus className="size-3.5" /> Add Work
              </button>
            </div>

            <div className="space-y-4">
              {portfolioData.work.map((work, index) => (
                <div key={index} className="p-4 border border-border/70 rounded-2xl bg-background/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      Position #{index + 1}
                    </span>
                    <button
                      onClick={() => {
                        const updated = portfolioData.work.filter((_, i) => i !== index);
                        setPortfolioData({ ...portfolioData, work: updated });
                      }}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Company</label>
                      <input
                        type="text"
                        value={work.company}
                        onChange={(e) => {
                          const updated = [...portfolioData.work];
                          updated[index].company = e.target.value;
                          setPortfolioData({ ...portfolioData, work: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Title / Role</label>
                      <input
                        type="text"
                        value={work.title}
                        onChange={(e) => {
                          const updated = [...portfolioData.work];
                          updated[index].title = e.target.value;
                          setPortfolioData({ ...portfolioData, work: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Dates (Start - End)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={work.start}
                          onChange={(e) => {
                            const updated = [...portfolioData.work];
                            updated[index].start = e.target.value;
                            setPortfolioData({ ...portfolioData, work: updated });
                          }}
                          placeholder="Start"
                          className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                        />
                        <input
                          type="text"
                          value={work.end || ""}
                          onChange={(e) => {
                            const updated = [...portfolioData.work];
                            updated[index].end = e.target.value;
                            setPortfolioData({ ...portfolioData, work: updated });
                          }}
                          placeholder="End"
                          className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Logo URL / Path</label>
                      <input
                        type="text"
                        value={work.logoUrl}
                        onChange={(e) => {
                          const updated = [...portfolioData.work];
                          updated[index].logoUrl = e.target.value;
                          setPortfolioData({ ...portfolioData, work: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={work.description}
                      onChange={(e) => {
                        const updated = [...portfolioData.work];
                        updated[index].description = e.target.value;
                        setPortfolioData({ ...portfolioData, work: updated });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="border border-border/80 rounded-2xl p-5 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Education</h3>
                <p className="text-xs text-muted-foreground">Manage universities, degrees, and school education.</p>
              </div>
              <button
                onClick={() => {
                  const newEdu = {
                    school: "Institution Name",
                    href: "https://",
                    degree: "Degree / Course Name",
                    logoUrl: "/mait.png",
                    start: "2023",
                    end: "2027",
                  };
                  setPortfolioData({
                    ...portfolioData,
                    education: [...portfolioData.education, newEdu],
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl"
              >
                <Plus className="size-3.5" /> Add Education
              </button>
            </div>

            <div className="space-y-4">
              {portfolioData.education.map((edu, index) => (
                <div key={index} className="p-4 border border-border/70 rounded-2xl bg-background/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      School #{index + 1}
                    </span>
                    <button
                      onClick={() => {
                        const updated = portfolioData.education.filter((_, i) => i !== index);
                        setPortfolioData({ ...portfolioData, education: updated });
                      }}
                      className="p-1 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">School / Institute</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const updated = [...portfolioData.education];
                          updated[index].school = e.target.value;
                          setPortfolioData({ ...portfolioData, education: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Degree / Score</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...portfolioData.education];
                          updated[index].degree = e.target.value;
                          setPortfolioData({ ...portfolioData, education: updated });
                        }}
                        className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 6: CHATBOT KNOWLEDGE & PROMPTS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "chatbot" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Chatbot AI Knowledge & Suggestions</h2>
            <p className="text-xs text-muted-foreground">
              Customize the suggested starter questions and rotating "Did you know?" trivia facts displayed by the AI assistant.
            </p>
          </div>

          {/* Suggested Starter Questions */}
          <div className="border border-border/80 rounded-2xl p-5 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Suggested Starter Prompts</h3>
                <p className="text-xs text-muted-foreground">Prompt buttons shown below the welcome message.</p>
              </div>
              <button
                onClick={() => {
                  const curr = portfolioData.chatbot?.suggestions || [];
                  setPortfolioData({
                    ...portfolioData,
                    chatbot: {
                      ...portfolioData.chatbot,
                      suggestions: [...curr, "New suggested question?"],
                      triviaFacts: portfolioData.chatbot?.triviaFacts || [],
                    },
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl"
              >
                <Plus className="size-3.5" /> Add Question
              </button>
            </div>

            <div className="space-y-2.5">
              {(portfolioData.chatbot?.suggestions || []).map((prompt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => {
                      const updated = [...(portfolioData.chatbot?.suggestions || [])];
                      updated[index] = e.target.value;
                      setPortfolioData({
                        ...portfolioData,
                        chatbot: {
                          ...portfolioData.chatbot,
                          suggestions: updated,
                          triviaFacts: portfolioData.chatbot?.triviaFacts || [],
                        },
                      });
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border bg-background border-border text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => {
                      const updated = (portfolioData.chatbot?.suggestions || []).filter((_, i) => i !== index);
                      setPortfolioData({
                        ...portfolioData,
                        chatbot: {
                          ...portfolioData.chatbot,
                          suggestions: updated,
                          triviaFacts: portfolioData.chatbot?.triviaFacts || [],
                        },
                      });
                    }}
                    className="p-2 border border-destructive/20 text-destructive rounded-xl hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Trivia Facts */}
          <div className="border border-border/80 rounded-2xl p-5 bg-card/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Rotating Trivia Facts</h3>
                <p className="text-xs text-muted-foreground">Trivia facts displayed during server wake-up and idle states.</p>
              </div>
              <button
                onClick={() => {
                  const curr = portfolioData.chatbot?.triviaFacts || [];
                  setPortfolioData({
                    ...portfolioData,
                    chatbot: {
                      ...portfolioData.chatbot,
                      suggestions: portfolioData.chatbot?.suggestions || [],
                      triviaFacts: [...curr, "Rishabh built an exciting new project with AI..."],
                    },
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl"
              >
                <Plus className="size-3.5" /> Add Trivia Fact
              </button>
            </div>

            <div className="space-y-2.5">
              {(portfolioData.chatbot?.triviaFacts || []).map((fact, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                    {index + 1}.
                  </span>
                  <input
                    type="text"
                    value={fact}
                    onChange={(e) => {
                      const updated = [...(portfolioData.chatbot?.triviaFacts || [])];
                      updated[index] = e.target.value;
                      setPortfolioData({
                        ...portfolioData,
                        chatbot: {
                          ...portfolioData.chatbot,
                          suggestions: portfolioData.chatbot?.suggestions || [],
                          triviaFacts: updated,
                        },
                      });
                    }}
                    className="flex-1 px-3.5 py-2 rounded-xl border bg-background border-border text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={() => {
                      const updated = (portfolioData.chatbot?.triviaFacts || []).filter((_, i) => i !== index);
                      setPortfolioData({
                        ...portfolioData,
                        chatbot: {
                          ...portfolioData.chatbot,
                          suggestions: portfolioData.chatbot?.suggestions || [],
                          triviaFacts: updated,
                        },
                      });
                    }}
                    className="p-2 border border-destructive/20 text-destructive rounded-xl hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 7: SECURITY & EMAIL SETTINGS */}
      {/* ---------------------------------------------------- */}
      {activeTab === "security" && (
        <div className="space-y-6 max-w-2xl">
          <div>
            <h2 className="text-lg font-bold text-foreground">Security & Password Management</h2>
            <p className="text-xs text-muted-foreground">
              Configure authentication and password reset restricted to your verified email.
            </p>
          </div>

          <div className="border border-border/80 rounded-2xl p-6 bg-card/60 space-y-5">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <ShieldCheck className="size-6 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-foreground">Verified Master Admin Account</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Password changes can strictly and exclusively be made by verifying a one-time passcode sent to:
                </p>
                <div className="mt-2 text-xs font-mono font-bold text-indigo-500 dark:text-indigo-400">
                  {VERIFIED_EMAIL}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Change Master Password
              </h4>
              <p className="text-xs text-muted-foreground">
                To update your master password, request a 6-digit verification code to be sent to your verified email address.
              </p>

              <button
                type="button"
                onClick={() => {
                  setIsResetMode(true);
                  setResetStep("request");
                  setIsAuthenticated(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Mail className="size-4" />
                Initiate Password Change via Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PROJECT EDIT / ADD MODAL DRAWER */}
      {/* ---------------------------------------------------- */}
      <AnimatePresence>
        {editingProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border bg-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {isNewProject ? "Add New Project" : `Edit: ${editingProject.title}`}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Fill in project details matching the portfolio card layout.
                  </p>
                </div>
                <button
                  onClick={() => setEditingProject(null)}
                  className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Primary URL (Live Demo / Website)
                  </label>
                  <input
                    type="text"
                    value={editingProject.href || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, href: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Dates / Year
                  </label>
                  <input
                    type="text"
                    value={editingProject.dates}
                    onChange={(e) => setEditingProject({ ...editingProject, dates: e.target.value })}
                    placeholder="e.g. 2024 - Present"
                    className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Status Toggle
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={editingProject.active}
                      onChange={(e) => setEditingProject({ ...editingProject, active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="relative w-9 h-5 bg-muted peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-background after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    <span className="text-xs font-medium text-foreground">
                      {editingProject.active ? "Visible on Portfolio" : "Hidden"}
                    </span>
                  </label>
                </div>

                {/* Project Image Upload & Preview */}
                <div className="sm:col-span-2 border border-border/80 rounded-2xl p-4 bg-background/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="size-4 text-primary" /> Project Cover Image
                    </label>
                    {editingProject.image && (
                      <button
                        type="button"
                        onClick={() => setEditingProject({ ...editingProject, image: "" })}
                        className="text-[11px] text-destructive hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="size-3" /> Remove Image
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    {/* Thumbnail Preview */}
                    <div className="sm:col-span-5">
                      {editingProject.image ? (
                        <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-muted group shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={editingProject.image}
                            alt={editingProject.title}
                            className="w-full h-full object-contain bg-neutral-950"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="p-2 bg-primary text-primary-foreground rounded-xl cursor-pointer hover:opacity-90 shadow-md flex items-center gap-1.5 text-xs font-semibold">
                              <Upload className="size-3.5" /> Replace
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={uploadingImage}
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleFileUpload(f, "project");
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-border/80 aspect-video bg-muted/30 flex flex-col items-center justify-center p-3 text-center">
                          <ImageIcon className="size-7 text-muted-foreground/40 mb-1" />
                          <span className="text-[11px] text-muted-foreground font-medium">No cover image uploaded</span>
                        </div>
                      )}
                    </div>

                    {/* Upload Actions & Path Input */}
                    <div className="sm:col-span-7 space-y-2.5">
                      <label className="block">
                        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs">
                          {uploadingImage ? (
                            <RefreshCw className="size-4 animate-spin" />
                          ) : (
                            <ImagePlus className="size-4" />
                          )}
                          <span>{uploadingImage ? "Uploading Image..." : "Upload Image from Device"}</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(f, "project");
                          }}
                        />
                      </label>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
                          Or Enter Custom Image URL / Path
                        </label>
                        <input
                          type="text"
                          value={editingProject.image || ""}
                          onChange={(e) => setEditingProject({ ...editingProject, image: e.target.value })}
                          placeholder="/projects/example.png or https://..."
                          className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Video URL (Optional MP4 / WebM)
                  </label>
                  <input
                    type="text"
                    value={editingProject.video || ""}
                    onChange={(e) => setEditingProject({ ...editingProject, video: e.target.value })}
                    placeholder="https://...mp4"
                    className="w-full px-3.5 py-2 rounded-xl border bg-background border-border text-sm"
                  />
                </div>
              </div>

              {/* Technologies Badges Editor */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Technologies / Tech Stack Badges
                </label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl border bg-background border-border min-h-[46px] items-center">
                  {editingProject.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs font-medium bg-muted px-2.5 py-1 rounded-xl text-foreground"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingProject.technologies.filter((_, i) => i !== idx);
                          setEditingProject({ ...editingProject, technologies: updated });
                        }}
                        className="hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                    <input
                      type="text"
                      value={newTechInput}
                      onChange={(e) => setNewTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTechInput.trim()) {
                          e.preventDefault();
                          if (!editingProject.technologies.includes(newTechInput.trim())) {
                            setEditingProject({
                              ...editingProject,
                              technologies: [...editingProject.technologies, newTechInput.trim()],
                            });
                          }
                          setNewTechInput("");
                        }
                      }}
                      placeholder="Type tag & press Enter"
                      className="w-full text-xs bg-transparent border-none focus:outline-hidden py-1 px-1"
                    />
                  </div>
                </div>
              </div>

              {/* Description Markdown */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  Project Description (Markdown Supported)
                </label>
                <textarea
                  rows={4}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border bg-background border-border text-sm leading-relaxed"
                />
              </div>

              {/* Action Links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Project Links & Buttons
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newLink: ProjectLink = { type: "Website", href: "https://", icon: "globe" };
                      setEditingProject({
                        ...editingProject,
                        links: [...editingProject.links, newLink],
                      });
                    }}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus className="size-3" /> Add Link
                  </button>
                </div>

                <div className="space-y-2">
                  {editingProject.links.map((link, lIdx) => (
                    <div key={lIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={link.type}
                          onChange={(e) => {
                            const updated = [...editingProject.links];
                            updated[lIdx].type = e.target.value;
                            setEditingProject({ ...editingProject, links: updated });
                          }}
                          placeholder="Label (e.g. Website, Source)"
                          className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={link.href}
                          onChange={(e) => {
                            const updated = [...editingProject.links];
                            updated[lIdx].href = e.target.value;
                            setEditingProject({ ...editingProject, links: updated });
                          }}
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 rounded-xl border bg-background border-border text-xs"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <select
                          value={link.icon || "globe"}
                          onChange={(e) => {
                            const updated = [...editingProject.links];
                            updated[lIdx].icon = e.target.value;
                            setEditingProject({ ...editingProject, links: updated });
                          }}
                          className="w-full px-2 py-1.5 rounded-xl border bg-background border-border text-xs"
                        >
                          <option value="globe">Globe</option>
                          <option value="github">GitHub</option>
                          <option value="linkedin">LinkedIn</option>
                        </select>
                      </div>
                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingProject.links.filter((_, i) => i !== lIdx);
                            setEditingProject({ ...editingProject, links: updated });
                          }}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/80">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveProjectModal}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 shadow-md"
                >
                  Apply Project Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
