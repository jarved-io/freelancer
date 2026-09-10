import Link from 'next/link';
import { Star } from 'lucide-react';
import CategoryIcon from './CategoryIcon';
import Avatar from './Avatar';
import PriceTag from './PriceTag';

export default function ListingCard({ listing }) {
  const avgRating = listing.reviews?.length
    ? (listing.reviews.reduce((a, r) => a + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null;

  return (
    <Link href={`/listings/${listing.id}`} className="card flex flex-col h-full">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="badge bg-primary-soft text-primary">
          <CategoryIcon category={listing.category} size={13} />
          {listing.category}
        </span>
      </div>
      <div className="flex items-center gap-2.5 mb-3">
        <Avatar name={listing.seller?.name || '?'} size={30} />
        <div className="text-sm font-semibold">{listing.seller?.name}</div>
      </div>
      <h3 className="font-bold text-[15.5px] mb-1.5">{listing.title}</h3>
      <p className="text-sm text-inksoft mb-4 line-clamp-2">{listing.description}</p>
      <div className="flex items-center justify-between text-sm border-t border-line pt-3 mt-auto">
        <span className="flex items-center gap-1 text-amber-600 font-semibold">
          <Star size={14} fill="currentColor" />
          {avgRating ?? 'New'}
        </span>
        <PriceTag listing={listing} packages={listing.packages} />
      </div>
    </Link>
  );
}
