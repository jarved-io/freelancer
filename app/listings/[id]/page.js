import { notFound } from 'next/navigation';
import { Star, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Avatar from '@/components/Avatar';
import CategoryIcon from '@/components/CategoryIcon';
import OrderWidget from '@/components/OrderWidget';

export const dynamic = 'force-dynamic';

export default async function ListingDetailPage({ params }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: true,
      packages: true,
      reviews: { include: { author: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  if (!listing) notFound();

  const avgRating = listing.reviews.length
    ? (listing.reviews.reduce((a, r) => a + r.rating, 0) / listing.reviews.length).toFixed(1)
    : null;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="text-sm text-inkfaint mb-5">
        <a href="/browse" className="hover:text-primary">Browse</a> / {listing.category}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-10">
        <div>
          <span className="badge bg-primary-soft text-primary mb-4">
            <CategoryIcon category={listing.category} size={14} /> {listing.category}
          </span>
          <h1 className="text-3xl font-extrabold mt-3 mb-4">{listing.title}</h1>

          <div className="flex items-center gap-3 mb-6">
            <Avatar name={listing.seller.name} size={40} />
            <div>
              <div className="font-semibold text-sm flex items-center gap-1.5">
                {listing.seller.name}
                <ShieldCheck size={14} className="text-primary" />
              </div>
              <div className="text-xs text-inkfaint">
                {listing.seller.college || 'Verified student'}
                {avgRating && <> · <Star size={12} className="inline -mt-0.5" fill="currentColor" /> {avgRating} ({listing.reviews.length})</>}
              </div>
            </div>
          </div>

          <p className="text-inksoft max-w-xl leading-relaxed">{listing.description}</p>

          {listing.guidelines && (
            <>
              <hr className="border-line my-6" />
              <h3 className="font-bold text-sm mb-2">Good to know</h3>
              <p className="text-sm text-inksoft max-w-xl">{listing.guidelines}</p>
            </>
          )}

          <hr className="border-line my-6" />
          <h3 className="font-bold text-sm mb-4">Reviews</h3>
          {listing.reviews.length === 0 ? (
            <p className="text-sm text-inkfaint">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {listing.reviews.map((r) => (
                <div key={r.id} className="border-b border-line pb-4">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <div className="flex items-center gap-2 font-semibold">
                      <Avatar name={r.author.name} size={24} /> {r.author.name}
                    </div>
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Star size={13} fill="currentColor" /> {r.rating}
                    </span>
                  </div>
                  {r.text && <p className="text-sm text-inksoft">{r.text}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <OrderWidget listing={listing} />
        </div>
      </div>
    </main>
  );
}
