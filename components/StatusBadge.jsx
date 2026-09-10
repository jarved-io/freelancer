import { Check, Flag, Clock3 } from 'lucide-react';

const CLASS_MAP = {
  PENDING: 'bg-warning-soft text-warning',
  ACCEPTED: 'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  DELIVERED: 'bg-blue-50 text-blue-700',
  REVISION_REQUESTED: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-success-soft text-success',
  CANCELLED: 'bg-danger-soft text-danger',
};

const LABEL_MAP = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  IN_PROGRESS: 'In Progress',
  DELIVERED: 'Delivered',
  REVISION_REQUESTED: 'Revision Requested',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function StatusBadge({ status }) {
  const Icon = status === 'COMPLETED' ? Check : status === 'CANCELLED' ? Flag : Clock3;
  return (
    <span className={`status-pill ${CLASS_MAP[status] || 'bg-bgsoft text-inksoft'}`}>
      <Icon size={13} />
      {LABEL_MAP[status] || status}
    </span>
  );
}

const STEPS = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED'];

export function OrderStepper({ status }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 text-danger bg-danger-soft border border-red-200 rounded-lg px-4 py-3 text-sm">
        <Flag size={16} /> This order was cancelled.
      </div>
    );
  }
  let idx = STEPS.indexOf(status);
  let note = null;
  if (idx === -1) {
    idx = STEPS.indexOf('DELIVERED');
    note = (
      <div className="text-xs text-inkfaint mt-3 flex items-center gap-1.5">
        <Clock3 size={13} /> Revision requested — the seller is making changes.
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center flex-wrap">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  i <= idx ? 'bg-primary text-white' : 'bg-gray-100 text-inkfaint'
                }`}
              >
                {i < idx ? <Check size={12} /> : i + 1}
              </span>
              <span className={i <= idx ? 'text-ink' : 'text-inkfaint'}>{LABEL_MAP[s]}</span>
            </div>
            {i < STEPS.length - 1 && <div className="w-7 h-px bg-linestrong mx-2.5" />}
          </div>
        ))}
      </div>
      {note}
    </div>
  );
}
