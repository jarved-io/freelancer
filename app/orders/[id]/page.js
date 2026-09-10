import { getServerSession } from 'next-auth/next';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Avatar from '@/components/Avatar';
import OrderActions from '@/components/OrderActions';
import { fmt } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect(`/login?callbackUrl=/orders/${params.id}`);

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      listing: { include: { seller: true } },
      buyer: true,
      package: true,
      messages: { include: { sender: true }, orderBy: { createdAt: 'asc' } },
      review: true,
    },
  });
  if (!order) notFound();

  const isBuyer = order.buyerId === session.user.id;
  const isSeller = order.listing.sellerId === session.user.id;
  if (!isBuyer && !isSeller && !session.user.isAdmin) redirect('/dashboard');

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="text-sm text-inkfaint mb-5">
        <a href="/dashboard" className="hover:text-primary">Dashboard</a> / Order
      </div>

      <div className="flex justify-between items-start gap-4 mb-2 flex-wrap">
        <h1 className="text-2xl font-extrabold">{order.listing.title}</h1>
      </div>
      <p className="text-sm text-inksoft mb-7 flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1.5"><Avatar name={order.buyer.name} size={20} /> Buyer: {order.buyer.name}</span>
        ·
        <span className="flex items-center gap-1.5"><Avatar name={order.listing.seller.name} size={20} /> Seller: {order.listing.seller.name}</span>
      </p>

      {order.requirements && (
        <div className="panel mb-5">
          <h4 className="font-bold text-sm mb-2">Requirements</h4>
          <p className="text-sm text-inksoft">{order.requirements}</p>
        </div>
      )}

      <div className="panel mb-5">
        <h4 className="font-bold text-sm mb-3">Transaction</h4>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-line">
              <td className="py-2.5 text-inkfaint">Buyer pays</td>
              <td className="py-2.5 text-right font-semibold">{fmt(order.totalPrice)}</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-2.5 text-inkfaint">Platform commission (10%)</td>
              <td className="py-2.5 text-right font-semibold">{fmt(order.commissionAmt)}</td>
            </tr>
            <tr>
              <td className="py-2.5 text-inkfaint">Seller receives</td>
              <td className="py-2.5 text-right font-semibold">{fmt(order.sellerEarnings)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <OrderActions order={order} currentUserId={session.user.id} />
    </main>
  );
}
