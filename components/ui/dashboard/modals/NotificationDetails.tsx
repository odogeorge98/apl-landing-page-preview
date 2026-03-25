"use client";

import React from "react";
import { Modal } from "../../Modal";

interface INotificationDetailsModal {
  open: boolean;
  setTrigger: (open: boolean) => void;
  notification?: {
    id: string;
    type: string;
    message: string;
    leadAgent: string;
    date: string;
    status: string;
    lead?: string;
    time?: string;
    sourceAgent?: string;
    fullMessage?: string;
  };
  onMarkAsRead?: () => void;
}

const NotificationDetails = ({
  open,
  setTrigger,
  notification,
  onMarkAsRead,
}: INotificationDetailsModal) => {
  if (!notification) return null;

  const formatDate = (date: string) => {
    if (!date) return "—";
    if (date.includes(";")) {
      const parts = date.split(";");
      if (parts.length === 2) {
        return `${parts[0]!.trim()}, ${parts[1]!.trim()}`;
      }
    }
    return date;
  };

  return (
    <Modal
      size="md"
      open={open}
      onOpenChange={(next) => {
        if (!next) setTrigger(false);
      }}
      title="Notification details"
      showCloseButton
      className="border border-white/[0.08] bg-[#161222] text-white sm:max-w-lg [&>button]:text-white/60 [&>button]:hover:text-white"
      headerTitleCss="text-left text-lg font-semibold text-white"
      headerCss="text-left"
    >
      <div className="flex flex-col gap-5 pt-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-white/40">Type</p>
            <p className="mt-1 text-sm font-semibold text-white">{notification.type}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/40">Status</p>
            <p className="mt-1 text-sm font-semibold text-white">{notification.status}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-white/40">Lead</p>
          <p className="mt-1 text-sm font-medium text-white/90">
            {notification.lead && notification.lead !== "N/A"
              ? notification.lead
              : notification.leadAgent && notification.leadAgent !== "N/A"
                ? notification.leadAgent
                : "—"}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-white/40">Message</p>
          <p className="mt-1 text-sm leading-relaxed text-white/75">
            {notification.fullMessage || notification.message}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-white/40">Time</p>
            <p className="mt-1 text-sm font-medium text-white/90">
              {formatDate(notification.time || notification.date)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/40">Source</p>
            <p className="mt-1 text-sm font-medium text-white/90">
              {notification.sourceAgent || notification.leadAgent || "—"}
            </p>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-xl border border-white/[0.12] bg-transparent px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.06]"
            onClick={() => setTrigger(false)}
          >
            Close
          </button>
          {notification.status === "Unread" ? (
            <button
              type="button"
              className="rounded-xl bg-[#8B5CF6] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#7c3aed]"
              onClick={() => {
                onMarkAsRead?.();
                setTrigger(false);
              }}
            >
              Mark as read
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationDetails;
