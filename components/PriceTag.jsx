import { fmt } from '@/lib/pricing';

export default function PriceTag({ listing, packages = [] }) {
  if (listing.pricingType === 'PACKAGES') {
    const min = packages.length ? Math.min(...packages.map((p) => p.price)) : 0;
    return <span className="font-bold text-ink">From {fmt(min)}</span>;
  }
  if (listing.pricingType === 'UNIT') {
    return <span className="font-bold text-ink">{fmt(listing.basePrice)} / {listing.unitLabel || 'item'}</span>;
  }
  if (listing.pricingType === 'HOURLY') {
    return <span className="font-bold text-ink">{fmt(listing.basePrice)}/hr</span>;
  }
  return <span className="font-bold text-ink">{fmt(listing.basePrice)}</span>;
}
