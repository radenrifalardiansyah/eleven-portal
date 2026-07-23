"use client";

import { Check, X } from "lucide-react";

export default function ApprovalActions({
  onApprove,
  onReject,
  disabled,
}: {
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onApprove}
        disabled={disabled}
        title="Approve"
        className="grid h-8 w-8 place-items-center rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onReject}
        disabled={disabled}
        title="Reject"
        className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
