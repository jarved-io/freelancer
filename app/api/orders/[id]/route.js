import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const FLOW = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'IN_PROGRESS',
  IN_PROGRESS: 'DELIVERED',
  DELIVERED: 'COMPLETED',
  REVISION_REQUESTED: 'DELIVERED',
};

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

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
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isBuyer = order.buyerId === session.user.id;
  const isSeller = order.listing.sellerId === session.user.id;
  if (!isBuyer && !isSeller && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const body = await req.json();
  const { action } = body || {};

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { listing: true } });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isBuyer = order.buyerId === session.user.id;
  const isSeller = order.listing.sellerId === session.user.id;
  if (!isBuyer && !isSeller) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });

  let newStatus = order.status;
  let meetingLink = order.meetingLink;

  if (action === 'advance') {
    if (!isSeller) return NextResponse.json({ error: 'Only the seller can advance the order.' }, { status: 403 });
    newStatus = FLOW[order.status] || order.status;
  } else if (action === 'revise') {
    if (!isBuyer) return NextResponse.json({ error: 'Only the buyer can request a revision.' }, { status: 403 });
    newStatus = 'REVISION_REQUESTED';
  } else if (action === 'complete') {
    if (!isBuyer) return NextResponse.json({ error: 'Only the buyer can mark this complete.' }, { status: 403 });
    newStatus = 'COMPLETED';
  } else if (action === 'cancel') {
    newStatus = 'CANCELLED';
  } else {
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: newStatus, meetingLink },
  });

  return NextResponse.json(updated);
}
