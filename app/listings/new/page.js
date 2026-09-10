import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import NewListingForm from '@/components/NewListingForm';

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login?callbackUrl=/listings/new');

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-1.5">List a service</h1>
      <p className="text-inksoft text-sm mb-8">
        Have a skill? Own a camera, know a subject, good with a laptop — list it here and set your own price.
      </p>
      <NewListingForm />
    </main>
  );
}
