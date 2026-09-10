'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('Incorrect email or password.');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <div className="panel">
        <h1 className="text-2xl font-extrabold mb-1.5">Log in</h1>
        <p className="text-sm text-inksoft mb-6">Welcome back.</p>

        {error && <div className="bg-danger-soft text-danger text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Email</label>
            <input required type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@college.edu" />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input required type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          </div>
          <button disabled={loading} className="btn btn-primary w-full">
            <LogIn size={16} /> {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-sm text-inksoft text-center mt-6">
          New here? <Link href="/register" className="text-primary font-semibold">Create an account</Link>
        </p>
        <p className="text-xs text-inkfaint text-center mt-3">
          Demo accounts (after seeding): admin@skillbridge.app / password123
        </p>
      </div>
    </main>
  );
}
