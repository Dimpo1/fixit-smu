"use client";

import React, { useState } from "react";
import {
  CheckCircle,
  ArrowUpRight,
  Send,
  RotateCcw,
  MessageSquare,
  HeartPulse,
} from "lucide-react";
import { Ticket, Profile } from "@/shared/api/supabase/types";
import {
  escalateTicket,
  resolveTicket,
  reopenTicket,
  addTicketComment,
} from "@/entities/ticket";
import { Button, Modal, Textarea, useToast } from "@/shared/ui";

export interface TicketActionBarProps {
  ticket: Ticket;
  currentUser: Profile | null;
  onRefresh: () => void;
  onOpenHealthModal?: () => void;
}

export const TicketActionBar: React.FC<TicketActionBarProps> = ({
  ticket,
  currentUser,
  onRefresh,
  onOpenHealthModal,
}) => {
  const { toast } = useToast();
  const [modalMode, setModalMode] = useState<
    "escalate" | "resolve" | "reopen" | "comment" | null
  >(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!currentUser) return null;

  const isCreator = currentUser.id === ticket.created_by;
  const isLeader = currentUser.role !== "student";
  const isResolved = ticket.status === "resolved";

  const handleAction = async () => {
    setLoading(true);
    try {
      if (modalMode === "escalate") {
        const res = await escalateTicket(ticket, currentUser, note);
        if (res.success) {
          toast("Ticket escalated successfully", "success");
          onRefresh();
        } else {
          toast(res.error || "Failed to escalate", "error");
        }
      } else if (modalMode === "resolve") {
        const res = await resolveTicket(ticket, currentUser, note);
        if (res.success) {
          toast("Ticket marked as resolved", "success");
          onRefresh();
        } else {
          toast(res.error || "Failed to resolve", "error");
        }
      } else if (modalMode === "reopen") {
        const res = await reopenTicket(ticket, currentUser, note);
        if (res.success) {
          toast("Ticket reopened", "info");
          onRefresh();
        } else {
          toast(res.error || "Failed to reopen", "error");
        }
      } else if (modalMode === "comment") {
        const res = await addTicketComment(ticket, currentUser, note, isLeader);
        if (res.success) {
          toast("Comment added", "success");
          onRefresh();
        } else {
          toast(res.error || "Failed to add comment", "error");
        }
      }
      setModalMode(null);
      setNote("");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Action failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-line">
      {/* Emergency Medical Sheet for Responders */}
      {ticket.urgency === "health_emergency" && onOpenHealthModal && (
        <Button
          variant="danger"
          size="sm"
          onClick={onOpenHealthModal}
          className="border-danger bg-red-50 text-danger hover:bg-danger hover:text-white"
        >
          <HeartPulse className="w-4 h-4 mr-1" />
          View Patient Medical Info
        </Button>
      )}

      {/* Leadership actions when ticket is open */}
      {!isResolved && isLeader && (
        <>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalMode("resolve")}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Resolve
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setModalMode("escalate")}
          >
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Escalate
          </Button>
        </>
      )}

      {/* Reopen action when resolved */}
      {isResolved && (isCreator || isLeader) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setModalMode("reopen")}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reopen Issue
        </Button>
      )}

      {/* Comment action for anyone */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setModalMode("comment")}
      >
        <MessageSquare className="w-4 h-4 mr-1" />
        Add Update / Note
      </Button>

      {/* Action Dialog */}
      <Modal
        isOpen={modalMode !== null}
        onClose={() => {
          setModalMode(null);
          setNote("");
        }}
        title={
          modalMode === "escalate"
            ? "Escalate Ticket to Next Authority"
            : modalMode === "resolve"
            ? "Mark Incident as Resolved"
            : modalMode === "reopen"
            ? "Reopen Incident Report"
            : "Add Timeline Update Note"
        }
      >
        <div className="space-y-4">
          <Textarea
            label="Action Note or Comment"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Provide context or explanation..."
            required={modalMode !== "comment"}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setModalMode(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={loading}
              onClick={handleAction}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
