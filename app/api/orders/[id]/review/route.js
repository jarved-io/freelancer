import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const body = await req.json();
  const rating = Number(body?.rating);
  const text = (body?.text || '').trim();
  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { review: true } });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (order.buyerId !== session.user.id) return NextResponse.json({ error: 'Only the buyer can leave a review.' }, { status: 403 });
  if (order.status !== 'COMPLETED') return NextResponse.json({ error: 'You can only review a completed order.' }, { status: 400 });
  if (order.review) return NextResponse.json({ error: 'You already reviewed this order.' }, { status: 400 });

  const review = await prisma.review.create({
    data: {
      orderId: order.id,
      listingId: order.listingId,
      authorId: session.user.id,
      rating,
      text: text || null,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
