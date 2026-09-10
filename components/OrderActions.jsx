'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Send, MessageCircle } from 'lucide-react';
import { OrderStepper } from './StatusBadge';
import Avatar from './Avatar';

export default function OrderActions({ order, currentUserId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [msgText, setMsgText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const isBuyer = order.buyerId === currentUserId;
  const isSeller = order.listing.sellerId === currentUserId;

  async function doAction(action) {
    setError('');
    setBusy(true);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
    router.refresh();
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!msgText.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/orders/${order.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msgText }),
    });
    setBusy(false);
    if (res.ok) { setMsgText(''); router.refresh(); }
  }

  async function submitReview(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch(`/api/orders/${order.id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, text: reviewText }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
    router.refresh();
  }

  const flowLabel = { PENDING: 'Accepted', ACCEPTED: 'In Progress', IN_PROGRESS: 'Delivered', DELIVERED: 'Completed', REVISION_REQUESTED: 'Delivered' };
  const nextLabel = flowLabel[order.status];

  return (
    <div className="space-y-5">
      <div className="panel">
        <OrderStepper status={order.status} />
      </div>

      <div className="panel">
        <h4 className="font-bold text-sm mb-3">What's next</h4>
        {error && <div className="bg-danger-soft text-danger text-sm rounded-lg px-3.5 py-2.5 mb-3">{error}</div>}
        <div className="flex flex-wrap gap-2.5">
          {isSeller && nextLabel && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <button disabled={busy} onClick={() => doAction('advance')} className="btn btn-primary text-sm">
              Mark as {nextLabel}
            </button>
          )}
          {isBuyer && order.status === 'DELIVERED' && (
            <>
              <button disabled={busy} onClick={() => doAction('revise')} className="btn btn-secondary text-sm">Request revision</button>
              <button disabled={busy} onClick={() => doAction('complete')} className="btn btn-primary text-sm">Accept & complete</button>
            </>
          )}
          {(isBuyer || isSeller) && !['COMPLETED', 'CANCELLED'].includes(order.status) && (
            <button disabled={busy} onClick={() => doAction('cancel')} className="btn btn-danger text-sm">Cancel order</button>
          )}
          {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
            <span className="text-sm text-inkfaint">No further actions.</span>
          )}
        </div>
      </div>

      <div className="panel">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><MessageCircle size={16} /> Messages</h4>
        <div className="border border-line rounded-xl bg-bgsoft p-4 max-h-80 overflow-y-auto mb-3">
          {order.messages.length === 0 ? (
            <p className="text-sm text-inkfaint">No messages yet — say hello.</p>
          ) : (
            <div className="space-y-3">
              {order.messages.map((m) => {
                const mine = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={`flex gap-2 ${mine ? 'flex-row-reverse' : ''}`}>
                    <Avatar name={m.sender.name} size={26} />
                    <div className={mine ? 'text-right' : ''}>
                      <div className="text-[11px] text-inkfaint font-medium mb-0.5">{m.sender.name}</div>
                      <div className={`text-sm rounded-2xl px-3.5 py-2 inline-block ${mine ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-line rounded-tl-sm'}`}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input className="field-input" placeholder="Write a message…" value={msgText} onChange={(e) => setMsgText(e.target.value)} />
          <button disabled={busy} className="btn btn-secondary text-sm shrink-0"><Send size={15} /> Send</button>
        </form>
      </div>

      {order.status === 'COMPLETED' && (
        order.review ? (
          <div className="panel">
            <h4 className="font-bold text-sm mb-3">Review</h4>
            <div className="flex items-center gap-1 text-amber-600 mb-2">
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} fill={n <= order.review.rating ? 'currentColor' : 'none'} />)}
            </div>
            {order.review.text && <p className="text-sm text-inksoft">{order.review.text}</p>}
          </div>
        ) : isBuyer ? (
          <form onSubmit={submitReview} className="panel">
            <h4 className="font-bold text-sm mb-3">Leave a review</h4>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)}>
                  <Star size={24} className={n <= rating ? 'text-amber-600' : 'text-linestrong'} fill={n <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <textarea className="field-input min-h-[80px] mb-3" placeholder="How was your experience?" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
            <button disabled={busy} className="btn btn-primary">Submit review</button>
          </form>
        ) : (
          <div className="panel text-sm text-inkfaint">Waiting on the buyer's review.</div>
        )
      )}
    </div>
  );
}
