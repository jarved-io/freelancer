import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const body = await req.json();
  const text = (body?.text || '').trim();
  if (!text) return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { listing: true } });
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const isBuyer = order.buyerId === session.user.id;
  const isSeller = order.listing.sellerId === session.user.id;
  if (!isBuyer && !isSeller) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 });

  const message = await prisma.message.create({
    data: { orderId: order.id, senderId: session.user.id, text },
    include: { sender: true },
  });

  return NextResponse.json(message, { status: 201 });
}
