'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export default function BrowseFilterBar({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [text, setText] = useState(q);
  const timer = useRef(null);

  function updateParam(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/browse?${params.toString()}`);
  }

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (text !== q) updateParam('q', text);
    }, 350);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-inkfaint" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search services…"
          className="field-input pl-10"
        />
      </div>
      <select value={category} onChange={(e) => updateParam('category', e.target.value)} className="field-input w-auto">
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}
