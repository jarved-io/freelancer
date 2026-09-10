import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { computeOrderTotal } from '@/lib/pricing';

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const body = await req.json();
  const { listingId, packageId, quantity, requirements } = body || {};

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, include: { packages: true } });
  if (!listing || !listing.active) return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });

  if (listing.sellerId === session.user.id) {
    return NextResponse.json({ error: "You can't order your own listing." }, { status: 400 });
  }

  let pkg = null;
  if (listing.pricingType === 'PACKAGES') {
    pkg = listing.packages.find((p) => p.id === packageId);
    if (!pkg) return NextResponse.json({ error: 'Choose a package.' }, { status: 400 });
  }

  const qty = Math.max(1, Number(quantity) || 1);
  const { total, commissionAmt, sellerEarnings } = computeOrderTotal(listing, pkg, qty);

  const order = await prisma.order.create({
    data: {
      listingId: listing.id,
      buyerId: session.user.id,
      packageId: pkg ? pkg.id : null,
      quantity: qty,
      requirements: requirements || null,
      totalPrice: total,
      commissionAmt,
      sellerEarnings,
      status: 'PENDING',
    },
  });

  return NextResponse.json(order, { status: 201 });
}
