const COLORS = ['#4F46E5', '#0D9488', '#B45309', '#DC2626', '#7C3AED', '#0EA5E9', '#DB2777', '#65A30D'];

function colorFor(name) {
  let hash = 0;
  for (const ch of name || '') hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return COLORS[hash % COLORS.length];
}

export default function Avatar({ name, size = 36 }) {
  const initials = (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{ width: size, height: size, background: colorFor(name || ''), fontSize: Math.round(size * 0.4) }}
    >
      {initials}
    </div>
  );
}
