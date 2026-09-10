import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req, { params }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: true,
      packages: true,
      reviews: { include: { author: true }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(listing);
}
