'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { SUGGESTED_CATEGORIES } from '@/lib/categories';

const PRICING_OPTIONS = [
  { value: 'FLAT', label: 'One flat price', hint: 'e.g. ₹500 to fix a laptop, no matter the job' },
  { value: 'UNIT', label: 'Price per item', hint: 'e.g. ₹10 per photo, ₹20 per page' },
  { value: 'HOURLY', label: 'Price per hour', hint: 'e.g. ₹350/hour for tutoring' },
  { value: 'PACKAGES', label: 'Package tiers', hint: 'e.g. Basic / Standard / Premium, like a freelancing site' },
];

const emptyPackage = () => ({ name: '', price: '', detail: '', deliveryDays: '' });

export default function NewListingForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [pricingType, setPricingType] = useState('FLAT');
  const [basePrice, setBasePrice] = useState('');
  const [unitLabel, setUnitLabel] = useState('');
  const [packages, setPackages] = useState([emptyPackage()]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finalCategory = category === 'Other' ? customCategory : category;

  function updatePackage(i, field, value) {
    setPackages((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }
  function addPackage() {
    setPackages((prev) => [...prev, emptyPackage()]);
  }
  function removePackage(i) {
    setPackages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !finalCategory.trim()) {
      setError('Please fill in the title, category, and description.');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        category: finalCategory,
        guidelines,
        pricingType,
        basePrice: pricingType !== 'PACKAGES' ? basePrice : undefined,
        unitLabel: pricingType === 'UNIT' ? unitLabel : undefined,
        packages: pricingType === 'PACKAGES' ? packages : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
      return;
    }
    router.push(`/listings/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-6">
      {error && <div className="bg-danger-soft text-danger text-sm rounded-lg px-4 py-3">{error}</div>}

      <div>
        <label className="field-label">What are you offering?</label>
        <input
          className="field-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. DSLR event & portrait photography"
        />
      </div>

      <div>
        <label className="field-label">Category</label>
        <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select a category</option>
          {SUGGESTED_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {category === 'Other' && (
          <input
            className="field-input mt-2.5"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Type your category, e.g. Bike Repair"
          />
        )}
      </div>

      <div>
        <label className="field-label">Describe your service</label>
        <textarea
          className="field-input min-h-[100px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What do you do, and what makes you a good fit for this?"
        />
      </div>

      <div>
        <label className="field-label">Anything buyers should know? <span className="text-inkfaint font-normal">(optional)</span></label>
        <textarea
          className="field-input min-h-[70px]"
          value={guidelines}
          onChange={(e) => setGuidelines(e.target.value)}
          placeholder="e.g. I need 2 days notice for bookings"
        />
      </div>

      <div>
        <label className="field-label mb-2.5">How do you want to price it?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PRICING_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setPricingType(opt.value)}
              className={`text-left border-[1.5px] rounded-xl p-3.5 ${pricingType === opt.value ? 'border-primary bg-primary-soft' : 'border-line hover:border-linestrong'}`}
            >
              <div className="font-semibold text-sm">{opt.label}</div>
              <div className="text-xs text-inkfaint mt-0.5">{opt.hint}</div>
            </button>
          ))}
        </div>
      </div>

      {pricingType === 'FLAT' && (
        <div>
          <label className="field-label">Price (₹)</label>
          <input type="number" min={1} className="field-input" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="e.g. 500" />
        </div>
      )}

      {pricingType === 'HOURLY' && (
        <div>
          <label className="field-label">Price per hour (₹)</label>
          <input type="number" min={1} className="field-input" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="e.g. 350" />
        </div>
      )}

      {pricingType === 'UNIT' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Price per unit (₹)</label>
            <input type="number" min={1} className="field-input" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="e.g. 10" />
          </div>
          <div>
            <label className="field-label">What's the unit?</label>
            <input className="field-input" value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} placeholder="e.g. photo, page, poster" />
          </div>
        </div>
      )}

      {pricingType === 'PACKAGES' && (
        <div>
          <label className="field-label mb-2.5">Package tiers</label>
          <div className="space-y-3">
            {packages.map((p, i) => (
              <div key={i} className="border border-line rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-inkfaint">Package {i + 1}</span>
                  {packages.length > 1 && (
                    <button type="button" onClick={() => removePackage(i)} className="text-danger">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input className="field-input" placeholder="Name (e.g. Basic)" value={p.name} onChange={(e) => updatePackage(i, 'name', e.target.value)} />
                  <input type="number" className="field-input" placeholder="Price (₹)" value={p.price} onChange={(e) => updatePackage(i, 'price', e.target.value)} />
                </div>
                <input className="field-input mb-3" placeholder="What's included" value={p.detail} onChange={(e) => updatePackage(i, 'detail', e.target.value)} />
                <input type="number" className="field-input" placeholder="Delivery time (days)" value={p.deliveryDays} onChange={(e) => updatePackage(i, 'deliveryDays', e.target.value)} />
              </div>
            ))}
          </div>
          <button type="button" onClick={addPackage} className="btn btn-secondary text-sm mt-3">
            <PlusCircle size={15} /> Add another package
          </button>
        </div>
      )}

      <button disabled={loading} className="btn btn-primary w-full">
        <Sparkles size={16} /> {loading ? 'Publishing…' : 'Publish listing'}
      </button>
    </form>
  );
}
