import { prisma } from '@/lib/prisma';
import ListingCard from '@/components/ListingCard';
import BrowseFilterBar from '@/components/BrowseFilterBar';
import { SUGGESTED_CATEGORIES } from '@/lib/categories';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BrowsePage({ searchParams }) {
  const category = searchParams?.category || '';
  const q = searchParams?.q || '';

  const [listings, categoriesInUse] = await Promise.all([
    prisma.listing.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { category: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { seller: true, packages: true, reviews: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.listing.findMany({ where: { active: true }, select: { category: true }, distinct: ['category'] }),
  ]);

  const allCategories = Array.from(new Set([...SUGGESTED_CATEGORIES.filter((c) => c !== 'Other'), ...categoriesInUse.map((c) => c.category)])).sort();

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Browse services</h1>
        <span className="text-sm text-inkfaint">{listings.length} listing{listings.length !== 1 ? 's' : ''}</span>
      </div>

      <BrowseFilterBar categories={allCategories} />

      {listings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-linestrong rounded-xl2 bg-bgsoft text-inksoft">
          No services match your search.
          <div className="mt-3">
            <Link href="/browse" className="btn btn-secondary text-sm">Clear filters</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </main>
  );
}
