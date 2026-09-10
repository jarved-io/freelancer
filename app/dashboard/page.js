import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Package, Wallet, Star } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import CategoryIcon from '@/components/CategoryIcon';
import { fmt } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

const TABS = [
  { slug: 'purchases', label: 'My Purchases', icon: ShoppingBag },
  { slug: 'listings', label: 'My Listings', icon: Package },
  { slug: 'sales', label: 'Incoming Orders', icon: ShoppingBag },
  { slug: 'earnings', label: 'Earnings', icon: Wallet },
];

export default async function DashboardPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/dashboard');
  const userId = session.user.id;
  const tab = searchParams?.tab || 'purchases';

  const [purchases, myListings] = await Promise.all([
    prisma.order.findMany({ where: { buyerId: userId }, include: { listing: { include: { seller: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.listing.findMany({ where: { sellerId: userId }, include: { packages: true, reviews: true }, orderBy: { createdAt: 'desc' } }),
  ]);
  const myListingIds = myListings.map((l) => l.id);
  const sales = await prisma.order.findMany({
    where: { listingId: { in: myListingIds } },
    include: { listing: true, buyer: true },
    orderBy: { createdAt: 'desc' },
  });
  const earnings = sales.filter((o) => o.status === 'COMPLETED').reduce((a, o) => a + o.sellerEarnings, 0);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-1">Dashboard</h1>
      <p className="text-sm text-inksoft mb-7">Welcome back, {session.user.name}.</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8">
        <Stat icon={ShoppingBag} num={purchases.length} label="Purchases made" />
        <Stat icon={Package} num={myListings.length} label="Active listings" />
        <Stat icon={ShoppingBag} num={sales.length} label="Orders received" />
        <Stat icon={Wallet} num={fmt(earnings)} label="Earnings to date" />
      </div>

      <div className="flex gap-1 border-b border-line mb-7 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.slug}
            href={`/dashboard?tab=${t.slug}`}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-3 border-b-2 whitespace-nowrap ${tab === t.slug ? 'border-primary text-primary' : 'border-transparent text-inksoft hover:text-ink'}`}
          >
            <t.icon size={15} /> {t.label}
          </Link>
        ))}
      </div>

      {tab === 'purchases' && <OrdersTable orders={purchases} emptyText="You haven't bought anything yet." emptyHref="/browse" emptyCta="Browse services" showParty="seller" />}
      {tab === 'sales' && <OrdersTable orders={sales} emptyText="No orders yet on your listings." emptyHref="/listings/new" emptyCta="Create a listing" showParty="buyer" />}
      {tab === 'listings' && <ListingsGrid listings={myListings} />}
      {tab === 'earnings' && <EarningsTable orders={sales.filter((o) => o.status === 'COMPLETED')} />}
    </main>
  );
}

function Stat({ icon: Icon, num, label }) {
  return (
    <div className="border border-line rounded-xl2 p-5 bg-white shadow-card">
      <Icon size={16} className="text-primary mb-2" />
      <div className="text-2xl font-extrabold">{num}</div>
      <div className="text-xs text-inksoft mt-0.5">{label}</div>
    </div>
  );
}

function OrdersTable({ orders, emptyText, emptyHref, emptyCta, showParty }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-linestrong rounded-xl2 bg-bgsoft text-inksoft">
        {emptyText}
        <div className="mt-3"><Link href={emptyHref} className="btn btn-secondary text-sm">{emptyCta}</Link></div>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-inkfaint text-xs uppercase tracking-wide">
            <th className="pb-3 font-semibold">Service</th>
            <th className="pb-3 font-semibold">{showParty === 'seller' ? 'Seller' : 'Buyer'}</th>
            <th className="pb-3 font-semibold">Price</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-line">
              <td className="py-3 pr-3 font-medium">{o.listing.title}</td>
              <td className="py-3 pr-3 text-inksoft">{showParty === 'seller' ? o.listing.seller?.name : o.buyer?.name}</td>
              <td className="py-3 pr-3">{fmt(o.totalPrice)}</td>
              <td className="py-3 pr-3"><StatusBadge status={o.status} /></td>
              <td className="py-3"><Link href={`/orders/${o.id}`} className="text-primary font-semibold">View →</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ListingsGrid({ listings }) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-14 border border-dashed border-linestrong rounded-xl2 bg-bgsoft text-inksoft">
        You haven&apos;t listed a service yet.
        <div className="mt-3"><Link href="/listings/new" className="btn btn-secondary text-sm">Create a listing</Link></div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {listings.map((l) => {
        const avg = l.reviews.length ? (l.reviews.reduce((a, r) => a + r.rating, 0) / l.reviews.length).toFixed(1) : null;
        return (
          <Link key={l.id} href={`/listings/${l.id}`} className="card">
            <span className="badge bg-primary-soft text-primary mb-2.5"><CategoryIcon category={l.category} size={13} /> {l.category}</span>
            <h3 className="font-bold text-[15px] mb-1.5">{l.title}</h3>
            <div className="text-sm text-inkfaint flex items-center gap-1.5">
              <Star size={13} fill="currentColor" className="text-amber-600" /> {avg ?? 'No reviews yet'}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function EarningsTable({ orders }) {
  if (orders.length === 0) return <p className="text-sm text-inkfaint">No completed orders yet.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-inkfaint text-xs uppercase tracking-wide">
          <th className="pb-3 font-semibold">Service</th>
          <th className="pb-3 font-semibold">Gross</th>
          <th className="pb-3 font-semibold">Commission</th>
          <th className="pb-3 font-semibold">You received</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} className="border-t border-line">
            <td className="py-3 pr-3 font-medium">{o.listing.title}</td>
            <td className="py-3 pr-3">{fmt(o.totalPrice)}</td>
            <td className="py-3 pr-3 text-danger">-{fmt(o.commissionAmt)}</td>
            <td className="py-3 pr-3 font-semibold">{fmt(o.sellerEarnings)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
