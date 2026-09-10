import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Package, ShoppingBag, Wallet, TrendingUp } from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StatusBadge } from '@/components/StatusBadge';
import { fmt } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/admin');
  if (!session.user.isAdmin) redirect('/dashboard');

  const tab = searchParams?.tab || 'overview';

  const [users, listings, orders] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.listing.findMany({ include: { seller: true }, orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({ include: { listing: { include: { seller: true } }, buyer: true }, orderBy: { createdAt: 'desc' } }),
  ]);

  const gmv = orders.reduce((a, o) => a + o.totalPrice, 0);
  const commission = orders.reduce((a, o) => a + o.commissionAmt, 0);

  const byCategory = {};
  for (const o of orders) {
    const cat = o.listing.category;
    byCategory[cat] = (byCategory[cat] || 0) + o.totalPrice;
  }
  const maxCat = Math.max(1, ...Object.values(byCategory));

  const TABS = ['overview', 'users', 'listings', 'orders', 'commission'];

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-1">Admin</h1>
      <p className="text-sm text-inksoft mb-7">Platform-wide overview.</p>

      <div className="flex gap-1 border-b border-line mb-7 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin?tab=${t}`}
            className={`text-sm font-medium px-4 py-3 border-b-2 capitalize whitespace-nowrap ${tab === t ? 'border-primary text-primary' : 'border-transparent text-inksoft hover:text-ink'}`}
          >
            {t}
          </Link>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8">
            <Stat icon={Users} num={users.length} label="Total users" />
            <Stat icon={Package} num={listings.length} label="Listings" />
            <Stat icon={ShoppingBag} num={orders.length} label="Orders" />
            <Stat icon={Wallet} num={fmt(commission)} label="Commission revenue" />
          </div>
          <div className="panel">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><TrendingUp size={16} /> Revenue by category</h4>
            {Object.keys(byCategory).length === 0 ? (
              <p className="text-sm text-inkfaint">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{cat}</span>
                      <span className="text-inksoft">{fmt(val)}</span>
                    </div>
                    <div className="h-2 bg-bgsoft rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(val / maxCat) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm text-inksoft mt-4">Gross marketplace value: <strong>{fmt(gmv)}</strong></p>
        </>
      )}

      {tab === 'users' && (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-inkfaint text-xs uppercase"><th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">College</th><th className="pb-3">Role</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="py-3 font-medium">{u.name}</td>
                <td className="py-3 text-inksoft">{u.email}</td>
                <td className="py-3 text-inksoft">{u.college || '—'}</td>
                <td className="py-3">{u.isAdmin ? 'Admin' : 'Student'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'listings' && (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-inkfaint text-xs uppercase"><th className="pb-3">Title</th><th className="pb-3">Category</th><th className="pb-3">Seller</th><th className="pb-3"></th></tr></thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="py-3 font-medium">{l.title}</td>
                <td className="py-3 text-inksoft">{l.category}</td>
                <td className="py-3 text-inksoft">{l.seller.name}</td>
                <td className="py-3"><Link href={`/listings/${l.id}`} className="text-primary font-semibold">View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'orders' && (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-inkfaint text-xs uppercase"><th className="pb-3">Service</th><th className="pb-3">Buyer</th><th className="pb-3">Seller</th><th className="pb-3">Price</th><th className="pb-3">Status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="py-3 font-medium">{o.listing.title}</td>
                <td className="py-3 text-inksoft">{o.buyer.name}</td>
                <td className="py-3 text-inksoft">{o.listing.seller.name}</td>
                <td className="py-3">{fmt(o.totalPrice)}</td>
                <td className="py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'commission' && (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-inkfaint text-xs uppercase"><th className="pb-3">Order</th><th className="pb-3">Gross</th><th className="pb-3">Commission</th><th className="pb-3">Seller payout</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-line">
                <td className="py-3 font-medium">{o.listing.title}</td>
                <td className="py-3">{fmt(o.totalPrice)}</td>
                <td className="py-3">{fmt(o.commissionAmt)}</td>
                <td className="py-3">{fmt(o.sellerEarnings)}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-inkfaint">No transactions yet.</td></tr>}
          </tbody>
        </table>
      )}
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
