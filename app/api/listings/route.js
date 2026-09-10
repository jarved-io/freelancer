import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const q = searchParams.get('q');

  const listings = await prisma.listing.findMany({
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
  });

  return NextResponse.json(listings);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });

  const body = await req.json();
  const { title, description, category, guidelines, pricingType, unitLabel, basePrice, packages } = body || {};

  if (!title || !description || !category || !pricingType) {
    return NextResponse.json({ error: 'Title, description, category, and pricing type are required.' }, { status: 400 });
  }

  if (pricingType === 'PACKAGES') {
    if (!Array.isArray(packages) || packages.length === 0) {
      return NextResponse.json({ error: 'Add at least one package.' }, { status: 400 });
    }
    for (const p of packages) {
      if (!p.name || !p.price || Number(p.price) <= 0) {
        return NextResponse.json({ error: 'Each package needs a name and a price greater than 0.' }, { status: 400 });
      }
    }
  } else {
    if (!basePrice || Number(basePrice) <= 0) {
      return NextResponse.json({ error: 'Enter a price greater than 0.' }, { status: 400 });
    }
    if (pricingType === 'UNIT' && !unitLabel) {
      return NextResponse.json({ error: 'Tell buyers what the unit is (e.g. "photo", "page").' }, { status: 400 });
    }
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: session.user.id,
      title,
      description,
      category,
      guidelines: guidelines || null,
      pricingType,
      unitLabel: pricingType === 'UNIT' ? unitLabel : null,
      basePrice: pricingType === 'PACKAGES' ? null : Number(basePrice),
      packages:
        pricingType === 'PACKAGES'
          ? { create: packages.map((p) => ({ name: p.name, price: Number(p.price), detail: p.detail || null, deliveryDays: p.deliveryDays ? Number(p.deliveryDays) : null })) }
          : undefined,
    },
    include: { packages: true },
  });

  return NextResponse.json(listing, { status: 201 });
}
