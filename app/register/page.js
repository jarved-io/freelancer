'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', college: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
        return;
      }
      const signInRes = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) {
        setError('Account created — please log in.');
        router.push('/login');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 py-16">
      <div className="panel">
        <h1 className="text-2xl font-extrabold mb-1.5">Create an account</h1>
        <p className="text-sm text-inksoft mb-6">Sign up to buy from other students, or list your own service.</p>

        {error && <div className="bg-danger-soft text-danger text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Your name</label>
            <input required className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Sharma" />
          </div>
          <div>
            <label className="field-label">College email</label>
            <input required type="email" className="field-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@college.edu" />
          </div>
          <div>
            <label className="field-label">College name <span className="text-inkfaint font-normal">(optional)</span></label>
            <input className="field-input" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} placeholder="e.g. Blue Ridge College" />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input required type="password" minLength={6} className="field-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </div>
          <button disabled={loading} className="btn btn-primary w-full">
            <UserPlus size={16} /> {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-inksoft text-center mt-6">
          Already have an account? <Link href="/login" className="text-primary font-semibold">Log in</Link>
        </p>
      </div>
    </main>
  );
}
