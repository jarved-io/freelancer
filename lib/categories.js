// Suggested categories shown in the "create listing" dropdown.
// Sellers can also type their own — this list is not a hard restriction.
export const SUGGESTED_CATEGORIES = [
  'Writing & Editing',
  'Tutoring',
  'Photography',
  'Design & Art',
  'Programming & Tech Help',
  'Repairs',
  'Music & Audio',
  'Video Editing',
  'Event Help',
  'Other',
];

// Returns a lucide-react icon name matched loosely by keyword in the category string.
export function iconForCategory(category) {
  const c = (category || '').toLowerCase();
  if (c.includes('writ') || c.includes('edit')) return 'PenLine';
  if (c.includes('tutor') || c.includes('math') || c.includes('exam')) return 'GraduationCap';
  if (c.includes('photo')) return 'Camera';
  if (c.includes('design') || c.includes('art')) return 'Palette';
  if (c.includes('program') || c.includes('tech') || c.includes('code')) return 'Code2';
  if (c.includes('repair') || c.includes('fix')) return 'Wrench';
  if (c.includes('music') || c.includes('audio')) return 'Music';
  if (c.includes('video')) return 'Video';
  if (c.includes('event')) return 'PartyPopper';
  return 'Sparkles';
}

export const PRICING_LABELS = {
  PACKAGES: 'Package pricing',
  UNIT: 'Per item',
  HOURLY: 'Per hour',
  FLAT: 'Flat price',
};
