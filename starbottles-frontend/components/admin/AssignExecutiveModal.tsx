"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import { useAssignEnquiry } from "@/hooks/useEnquiries";
import type { EnquiryListItem } from "@/hooks/useEnquiries";

interface Props {
  enquiry: EnquiryListItem | null;
  onClose: () => void;
}

export default function AssignExecutiveModal({ enquiry, onClose }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data } = useUsers({ role: "executive", is_active: 1, per_page: 100 });
  const assignEnquiry = useAssignEnquiry();

  const executives = data?.data ?? [];

  async function handleAssign() {
    if (!enquiry || !selectedId) return;
    await assignEnquiry.mutateAsync({ enquiryId: enquiry.id, assigned_to: selectedId });
    onClose();
  }

  return (
    <Dialog open={!!enquiry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Assign Enquiry — {enquiry?.customer_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {executives.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No active executives found.</p>
          )}
          {executives.map((exec) => (
            <button
              key={exec.id}
              className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                selectedId === exec.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
              onClick={() => setSelectedId(exec.id)}
            >
              <p className="font-medium text-sm">{exec.name}</p>
              <p className="text-xs text-slate-500">{exec.phone ?? "—"}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedId || assignEnquiry.isPending}
          >
            {assignEnquiry.isPending ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
