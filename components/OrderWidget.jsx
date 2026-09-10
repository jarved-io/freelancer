'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShoppingCart, Info } from 'lucide-react';
import { fmt } from '@/lib/pricing';

export default function OrderWidget({ listing }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [pkgId, setPkgId] = useState(listing.packages?.[0]?.id || null);
  const [quantity, setQuantity] = useState(1);
  const [requirements, setRequirements] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isOwner = session?.user?.id === listing.sellerId;

  let total = 0;
  if (listing.pricingType === 'PACKAGES') {
    const pkg = listing.packages.find((p) => p.id === pkgId);
    total = pkg ? pkg.price : 0;
  } else if (listing.pricingType === 'UNIT' || listing.pricingType === 'HOURLY') {
    total = (listing.basePrice || 0) * Math.max(1, quantity);
  } else {
    total = listing.basePrice || 0;
  }

  async function handleOrder() {
    setError('');
    if (!session) {
      router.push(`/login?callbackUrl=/listings/${listing.id}`);
      return;
    }
    setLoading(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listingId: listing.id,
        packageId: pkgId,
        quantity: listing.pricingType === 'UNIT' || listing.pricingType === 'HOURLY' ? quantity : 1,
        requirements,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }
    router.push(`/orders/${data.id}`);
  }

  if (isOwner) {
    return (
      <div className="panel">
        <div className="flex items-center gap-2 text-sm text-inksoft">
          <Info size={16} /> This is your own listing — you can&apos;t order it.
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      {listing.pricingType === 'PACKAGES' && (
        <>
          <div className="text-sm text-inkfaint mb-3">Choose a package</div>
          <div className="space-y-2.5 mb-4">
            {listing.packages.map((p) => (
              <button
                key={p.id}
                onClick={() => setPkgId(p.id)}
                className={`w-full text-left border-[1.5px] rounded-xl p-4 transition ${pkgId === p.id ? 'border-primary bg-primary-soft' : 'border-line hover:border-linestrong'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">{p.name}</span>
                  <span className="font-extrabold">{fmt(p.price)}</span>
                </div>
                {p.detail && <div className="text-xs text-inksoft mt-1">{p.detail}</div>}
                {p.deliveryDays && <div className="text-xs text-inkfaint mt-1">{p.deliveryDays}-day delivery</div>}
              </button>
            ))}
          </div>
        </>
      )}

      {(listing.pricingType === 'UNIT' || listing.pricingType === 'HOURLY') && (
        <div className="mb-4">
          <label className="field-label">
            {listing.pricingType === 'UNIT' ? `How many ${listing.unitLabel || 'item'}s?` : 'How many hours?'}
          </label>
          <input
            type="number"
            min={1}
            className="field-input"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          />
          <div className="text-xs text-inkfaint mt-1.5">{fmt(listing.basePrice)} per {listing.pricingType === 'UNIT' ? (listing.unitLabel || 'item') : 'hour'}</div>
        </div>
      )}

      <div className="mb-4">
        <label className="field-label">Tell the seller what you need <span className="text-inkfaint font-normal">(optional)</span></label>
        <textarea
          className="field-input min-h-[90px]"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="e.g. Shoot our club's fest on Saturday, 6-9pm, deliver edited photos"
        />
      </div>

      {error && <div className="bg-danger-soft text-danger text-sm rounded-lg px-3.5 py-2.5 mb-4">{error}</div>}

      <div className="flex items-center justify-between mb-4 pt-3 border-t border-line">
        <span className="text-sm text-inksoft">Total</span>
        <span className="text-xl font-extrabold">{fmt(total)}</span>
      </div>

      <button onClick={handleOrder} disabled={loading || (listing.pricingType === 'PACKAGES' && !pkgId)} className="btn btn-primary w-full">
        <ShoppingCart size={16} /> {loading ? 'Placing order…' : session ? 'Place order' : 'Log in to order'}
      </button>
    </div>
  );
}
