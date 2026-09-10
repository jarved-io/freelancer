import {
  PenLine, GraduationCap, Camera, Palette, Code2, Wrench, Music, Video, PartyPopper, Sparkles,
} from 'lucide-react';
import { iconForCategory } from '@/lib/categories';

const MAP = { PenLine, GraduationCap, Camera, Palette, Code2, Wrench, Music, Video, PartyPopper, Sparkles };

export default function CategoryIcon({ category, size = 16, className = '' }) {
  const Icon = MAP[iconForCategory(category)] || Sparkles;
  return <Icon size={size} className={className} />;
}
