import Link from 'next/link';
import { ShieldCheck, Compass, MessageCircle, CheckCircle2, PlusCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import ListingCard from '@/components/ListingCard';
import CategoryIcon from '@/components/CategoryIcon';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const listings = await prisma.listing.findMany({
    where: { active: true },
    include: { seller: true, packages: true, reviews: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  const categoriesInUse = await prisma.listing.groupBy({
    by: ['category'],
    where: { active: true },
    _count: true,
  });

  return (
    <main>
      <section className="bg-gradient-to-b from-bgsoft to-white border-b border-line py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary-soft px-3.5 py-1.5 rounded-full mb-5">
            <ShieldCheck size={15} /> Every seller is a verified student on your campus
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight max-w-2xl leading-tight">
            Hire a classmate for anything. Sell your own skill for anything.
          </h1>
          <p className="text-lg text-inksoft max-w-xl mt-4">
            Need an essay edited? A tutor before your exam? Someone with a DSLR to shoot your event?
            Browse real students on campus — or list your own skill and set your own price.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link href="/browse" className="btn btn-primary"><Compass size={16} /> Browse Services</Link>
            <Link href="/listings/new" className="btn btn-secondary"><PlusCircle size={16} /> Sell a Service</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-line py-9 bg-bgsoft">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap gap-8">
          <Step icon={<Compass size={16} />} n={1} title="Browse" text="Look through real listings and pick who's right for you." />
          <Step icon={<MessageCircle size={16} />} n={2} title="Order & chat" text="Send your request and message the seller directly." />
          <Step icon={<CheckCircle2 size={16} />} n={3} title="Get it done" text="Receive your work or service, then leave a rating." />
        </div>
      </section>

      {categoriesInUse.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-10 border-b border-line">
          <h2 className="text-xl font-bold mb-4">Browse by category</h2>
          <div className="flex flex-wrap gap-2">
            {categoriesInUse.map((c) => (
              <Link
                key={c.category}
                href={`/browse?category=${encodeURIComponent(c.category)}`}
                className="flex items-center gap-2 text-sm font-medium border border-line rounded-full px-4 py-2 hover:border-primary hover:text-primary"
              >
                <CategoryIcon category={c.category} size={15} />
                {c.category}
                <span className="text-inkfaint">({c._count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold">Freshly listed</h2>
          <Link href="/browse" className="text-sm font-semibold text-primary">Browse all →</Link>
        </div>
        {listings.length === 0 ? (
          <EmptyHome />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="panel flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1.5">Have a skill? Any skill.</h3>
            <p className="text-inksoft text-sm max-w-md">
              Own a DSLR, know how to code, good at editing, can fix a laptop — list it in two minutes and set your own price.
            </p>
          </div>
          <Link href="/listings/new" className="btn btn-primary shrink-0"><PlusCircle size={16} /> Create a listing</Link>
        </div>
      </section>
    </main>
  );
}

function Step({ icon, n, title, text }) {
  return (
    <div className="flex items-start gap-3 max-w-xs">
      <span className="text-primary mt-0.5">{icon}</span>
      <div>
        <div className="font-semibold text-sm">{n}. {title}</div>
        <div className="text-xs text-inkfaint mt-1">{text}</div>
      </div>
    </div>
  );
}

function EmptyHome() {
  return (
    <div className="text-center py-14 border border-dashed border-linestrong rounded-xl2 bg-bgsoft text-inksoft">
      No listings yet — be the first to <Link href="/listings/new" className="text-primary font-semibold">list a service</Link>.
    </div>
  );
}
