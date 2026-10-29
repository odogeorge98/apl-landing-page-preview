"use client";
import { MainLayout } from "@/components/layout/dashboard";
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  Pin,
  Calendar,
  Clock,
  Send,
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  ChevronDown,
  Check,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Embedded styles (modal + dropdown animations). No globals.css needed.      */
/* -------------------------------------------------------------------------- */
const COMPONENT_STYLES = `
  @keyframes ann-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes ann-panel-in {
    0%   { opacity: 0; transform: scale(0.8) translateY(16px); }
    60%  { opacity: 1; }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  @keyframes ann-dropdown-in {
    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .ann-modal-overlay {
    animation: ann-overlay-in 200ms ease-out both;
  }

  .ann-modal-panel {
    animation: ann-panel-in 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
    transform-origin: center;
  }

  .ann-dropdown-panel {
    animation: ann-dropdown-in 150ms ease-out both;
    transform-origin: top;
  }

  @media (prefers-reduced-motion: reduce) {
    .ann-modal-overlay,
    .ann-modal-panel,
    .ann-dropdown-panel {
      animation: none;
    }
  }
`;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: "ALL" | "STUDENTS" | "TUTORS" | "ADMINS";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "PUBLISHED" | "SCHEDULED" | "DRAFT";
  isPinned: boolean;
  publishDate: string;
  viewsCount: number;
  attachments?: { name: string; size: string; type: string }[];
  author: string;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [];

/* -------------------------------------------------------------------------- */
/*  Custom dropdown                                                            */
/* -------------------------------------------------------------------------- */
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

function Select({ value, onChange, options, className = "" }: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Start keyboard highlight on the selected item when opening
  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setHighlighted(idx >= 0 ? idx : 0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) return setOpen(true);
      setHighlighted((h) => (h + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      setHighlighted((h) => (h - 1 + options.length) % options.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) return setOpen(true);
      onChange(options[highlighted].value);
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-200 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#101d49]/20 ${
          open
            ? "border-[#101d49] ring-2 ring-[#101d49]/10"
            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180 text-[#101d49] dark:text-slate-200" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="ann-dropdown-panel absolute left-0 right-0 z-[60] mt-2 max-h-60 overflow-y-auto p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-black/40"
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlighted;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#101d49]/10 text-[#101d49] dark:bg-slate-800 dark:text-white font-semibold"
                    : isHighlighted
                    ? "bg-slate-100 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const AUDIENCE_FILTER_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "All Audiences" },
  { value: "STUDENTS", label: "Students Only" },
  { value: "TUTORS", label: "Tutors Only" },
];

const AUDIENCE_FORM_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "Everyone (All Users)" },
  { value: "STUDENTS", label: "Students Only" },
  { value: "TUTORS", label: "Tutors Only" },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: "PUBLISHED", label: "Publish Immediately" },
  { value: "SCHEDULED", label: "Schedule for Later" },
  { value: "DRAFT", label: "Save as Draft" },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    INITIAL_ANNOUNCEMENTS
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [audienceFilter, setAudienceFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] =
    useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] =
    useState<Announcement | null>(null);

  // Form input state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "ALL" as Announcement["targetAudience"],
    priority: "MEDIUM" as Announcement["priority"],
    status: "PUBLISHED" as Announcement["status"],
    isPinned: false,
    publishDate: new Date().toISOString().slice(0, 16),
  });
  const [selectedFiles, setSelectedFiles] = useState<
    { name: string; size: string; type: string }[]
  >([]);

  // Analytics computation
  const stats = useMemo(() => {
    const total = announcements.length;
    const published = announcements.filter(
      (a) => a.status === "PUBLISHED"
    ).length;
    const scheduled = announcements.filter(
      (a) => a.status === "SCHEDULED"
    ).length;
    const drafts = announcements.filter((a) => a.status === "DRAFT").length;
    const totalViews = announcements.reduce(
      (acc, curr) => acc + curr.viewsCount,
      0
    );
    return { total, published, scheduled, drafts, totalViews };
  }, [announcements]);

  // Filtered List
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || ann.status === statusFilter;
      const matchesAudience =
        audienceFilter === "ALL" || ann.targetAudience === audienceFilter;
      const matchesPriority =
        priorityFilter === "ALL" || ann.priority === priorityFilter;

      return (
        matchesSearch && matchesStatus && matchesAudience && matchesPriority
      );
    });
  }, [announcements, searchQuery, statusFilter, audienceFilter, priorityFilter]);

  // Handle Form Open
  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      content: "",
      targetAudience: "ALL",
      priority: "MEDIUM",
      status: "PUBLISHED",
      isPinned: false,
      publishDate: new Date().toISOString().slice(0, 16),
    });
    setSelectedFiles([]);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      targetAudience: announcement.targetAudience,
      priority: announcement.priority,
      status: announcement.status,
      isPinned: announcement.isPinned,
      publishDate: new Date(announcement.publishDate)
        .toISOString()
        .slice(0, 16),
    });
    setSelectedFiles(announcement.attachments || []);
    setIsFormModalOpen(true);
  };

  // Form submission
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingAnnouncement) {
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === editingAnnouncement.id
            ? {
                ...item,
                title: formData.title,
                content: formData.content,
                targetAudience: formData.targetAudience,
                priority: formData.priority,
                status: formData.status,
                isPinned: formData.isPinned,
                publishDate: new Date(formData.publishDate).toISOString(),
                attachments: selectedFiles,
              }
            : item
        )
      );
    } else {
      const newAnn: Announcement = {
        id: `ANN-${Math.floor(100 + Math.random() * 900)}`,
        title: formData.title,
        content: formData.content,
        targetAudience: formData.targetAudience,
        priority: formData.priority,
        status: formData.status,
        isPinned: formData.isPinned,
        publishDate: new Date(formData.publishDate).toISOString(),
        viewsCount: 0,
        author: "Admin User",
        attachments: selectedFiles,
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
    }

    setIsFormModalOpen(false);
  };

  // Delete Action
  const handleDeleteAnnouncement = () => {
    if (!deletingAnnouncement) return;
    setAnnouncements((prev) =>
      prev.filter((a) => a.id !== deletingAnnouncement.id)
    );
    setDeletingAnnouncement(null);
    if (viewingAnnouncement?.id === deletingAnnouncement.id) {
      setViewingAnnouncement(null);
    }
  };

  // Pin Toggle
  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      )
    );
  };

  // File Upload Simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        type: f.name.split(".").pop() || "file",
      }));
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Badge Helpers
  const getPriorityBadge = (priority: Announcement["priority"]) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="w-3 h-3" /> Urgent
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
            High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Medium
          </span>
        );
      case "LOW":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status: Announcement["status"]) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Published
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="w-3 h-3" /> Scheduled
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            <FileText className="w-3 h-3" /> Draft
          </span>
        );
    }
  };

  return (
    <MainLayout>
      {/* Embedded animation styles */}
      <style>{COMPONENT_STYLES}</style>

      <div className="p-6 space-y-6 max-w-7xl mx-auto min-h-screen text-slate-900 dark:text-slate-100">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Announcements
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Broadcast system notices, updates, and news to students,
                  tutors, and staff.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#101d49] hover:bg-[#101d49]/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#101d49]/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Announcement</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Notices
            </p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Scheduled
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.scheduled}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Drafts
            </p>
            <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">
              {stats.drafts}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 col-span-2 md:col-span-1">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Audience Reach
            </p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {stats.totalViews.toLocaleString()} views
            </p>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search announcements by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters dropdown */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Filter className="w-3.5 h-3.5" /> Filter By:
              </div>

              {/* Target Audience Filter */}
              <Select
                value={audienceFilter}
                onChange={setAudienceFilter}
                options={AUDIENCE_FILTER_OPTIONS}
                className="w-44"
              />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-medium">
            {[
              { key: "ALL", label: "All Items" },
              { key: "PUBLISHED", label: "Published" },
              { key: "SCHEDULED", label: "Scheduled" },
              { key: "DRAFT", label: "Drafts" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`pb-2.5 transition-all relative border-b-2 ${
                  statusFilter === tab.key
                    ? "border-primary-600 text-primary-600 dark:text-primary-400 font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements List / Cards */}
        <div className="space-y-3">
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Megaphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No Announcements Found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No announcements match your search query or selected filter
                criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("ALL");
                  setAudienceFilter("ALL");
                  setPriorityFilter("ALL");
                }}
                className="text-xs text-primary-600 font-medium hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredAnnouncements.map((item) => (
              <div
                key={item.id}
                onClick={() => setViewingAnnouncement(item)}
                className={`group bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative ${
                  item.isPinned
                    ? "border-primary-300 dark:border-primary-800/60 bg-primary-50/20 dark:bg-primary-950/10"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {item.isPinned && (
                  <div className="absolute top-0 left-6 -translate-y-1/2 bg-primary-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Pin className="w-2.5 h-2.5 fill-white" /> Pinned
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(item.status)}
                      {getPriorityBadge(item.priority)}
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Audience: {item.targetAudience}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.title}
                    </h2>

                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.publishDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                      <span>•</span>
                      <span>By: {item.author}</span>
                      {item.status === "PUBLISHED" && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" /> {item.viewsCount}{" "}
                            views
                          </span>
                        </>
                      )}
                      {item.attachments && item.attachments.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium">
                            <Paperclip className="w-3.5 h-3.5" />{" "}
                            {item.attachments.length} Attachment(s)
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-0 border-slate-100 dark:border-slate-800 justify-end">
                    <button
                      onClick={(e) => handleTogglePin(item.id, e)}
                      title={
                        item.isPinned ? "Unpin Announcement" : "Pin Announcement"
                      }
                      className={`p-2 rounded-lg transition-all ${
                        item.isPinned
                          ? "text-primary-600 bg-primary-50 dark:bg-primary-950/40"
                          : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(item);
                      }}
                      title="Edit Announcement"
                      className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingAnnouncement(item);
                      }}
                      title="Delete Announcement"
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CREATE / EDIT ANNOUNCEMENT MODAL */}
        {isFormModalOpen && (
          <div className="ann-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="ann-modal-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary-500/10 text-primary-600">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold">
                    {editingAnnouncement
                      ? "Edit Announcement"
                      : "Create Announcement"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form
                onSubmit={handleSaveAnnouncement}
                className="p-6 overflow-y-auto space-y-4 flex-1"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Scheduled Platform Maintenance Notice"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Target Audience
                    </label>
                    <Select
                      value={formData.targetAudience}
                      onChange={(v) =>
                        setFormData({
                          ...formData,
                          targetAudience: v as Announcement["targetAudience"],
                        })
                      }
                      options={AUDIENCE_FORM_OPTIONS}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Announcement Body *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write full details of the announcement..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Status
                    </label>
                    <Select
                      value={formData.status}
                      onChange={(v) =>
                        setFormData({
                          ...formData,
                          status: v as Announcement["status"],
                        })
                      }
                      options={STATUS_OPTIONS}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                      Publish / Schedule Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.publishDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          publishDate: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </div>
                </div>

                {/* Pin Option */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={formData.isPinned}
                    onChange={(e) =>
                      setFormData({ ...formData, isPinned: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                  <label
                    htmlFor="isPinned"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Pin this announcement to top of feed
                  </label>
                </div>

                {/* Attachments Section */}
                <div className="space-y-4 pt-9 border-t border-slate-200 dark:border-slate-800">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Attachments & Documents
                  </label>

                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Click or drag files here to attach
                    </p>
                    <p className="text-[11px] text-slate-400">
                      PDF, PNG, JPG, or DOCX up to 10MB
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium truncate">
                              {file.name}
                            </span>
                            <span className="text-slate-400">
                              ({file.size})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-sm font-medium bg-[#101d49] hover:bg-[#0d1a3a] text-white shadow-sm flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {editingAnnouncement
                        ? "Update Announcement"
                        : "Publish Announcement"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW ANNOUNCEMENT DETAIL MODAL */}
        {viewingAnnouncement && (
          <div className="ann-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="ann-modal-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  {getStatusBadge(viewingAnnouncement.status)}
                  {getPriorityBadge(viewingAnnouncement.priority)}
                </div>
                <button
                  onClick={() => setViewingAnnouncement(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {viewingAnnouncement.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-y border-slate-100 dark:border-slate-800 py-2.5">
                  <span>
                    Audience: <strong>{viewingAnnouncement.targetAudience}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Author: <strong>{viewingAnnouncement.author}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Date:{" "}
                    <strong>
                      {new Date(
                        viewingAnnouncement.publishDate
                      ).toLocaleDateString()}
                    </strong>
                  </span>
                  {viewingAnnouncement.status === "PUBLISHED" && (
                    <>
                      <span>•</span>
                      <span>
                        Views: <strong>{viewingAnnouncement.viewsCount}</strong>
                      </span>
                    </>
                  )}
                </div>

                <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {viewingAnnouncement.content}
                </div>

                {viewingAnnouncement.attachments &&
                  viewingAnnouncement.attachments.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Attached Files ({viewingAnnouncement.attachments.length})
                      </h4>
                      <div className="space-y-1.5">
                        {viewingAnnouncement.attachments.map((file, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-primary-500" />
                              <span className="font-medium">{file.name}</span>
                              <span className="text-slate-400">
                                ({file.size})
                              </span>
                            </div>
                            <button className="text-primary-600 font-medium hover:underline text-xs">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  onClick={() => setDeletingAnnouncement(viewingAnnouncement)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleOpenEditModal(viewingAnnouncement);
                      setViewingAnnouncement(null);
                    }}
                    className="px-4 py-1.5 rounded-xl text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setViewingAnnouncement(null)}
                    className="px-4 py-1.5 rounded-xl text-xs font-medium bg-primary-600 text-white hover:bg-primary-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingAnnouncement && (
          <div className="ann-modal-overlay fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="ann-modal-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Delete Announcement
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-800 dark:text-slate-200">
                    "{deletingAnnouncement.title}"
                  </strong>
                  ? This action cannot be undone and users will no longer see
                  this update.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setDeletingAnnouncement(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAnnouncement}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Permanently</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
