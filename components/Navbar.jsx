'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Home, Compass, PlusCircle, LayoutGrid, LogOut, Menu, ShieldCheck } from 'lucide-react';
import Avatar from './Avatar';

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-teal-600 text-white flex items-center justify-center text-sm">S</span>
          SkillBridge
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink href="/" icon={<Home size={16} />}>Home</NavLink>
          <NavLink href="/browse" icon={<Compass size={16} />}>Browse</NavLink>
          {user && <NavLink href="/listings/new" icon={<PlusCircle size={16} />}>Sell a Service</NavLink>}
          {user && <NavLink href="/dashboard" icon={<LayoutGrid size={16} />}>Dashboard</NavLink>}
          {user?.isAdmin && <NavLink href="/admin" icon={<ShieldCheck size={16} />}>Admin</NavLink>}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <span className="hidden sm:flex items-center gap-2 text-sm font-medium border border-line bg-bgsoft rounded-full pl-1 pr-3 py-1">
                <Avatar name={user.name} size={24} />
                {user.name?.split(' ')[0]}
              </span>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="btn btn-secondary text-sm py-2 px-3.5">
                <LogOut size={15} /> Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary text-sm py-2 px-3.5">Log in</Link>
              <Link href="/register" className="btn btn-primary text-sm py-2 px-3.5">Sign up</Link>
            </>
          )}
          <button className="md:hidden border border-line rounded-lg p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            <Menu size={18} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden flex flex-col gap-1 px-6 pb-4 border-b border-line">
          <NavLink href="/" icon={<Home size={16} />}>Home</NavLink>
          <NavLink href="/browse" icon={<Compass size={16} />}>Browse</NavLink>
          {user && <NavLink href="/listings/new" icon={<PlusCircle size={16} />}>Sell a Service</NavLink>}
          {user && <NavLink href="/dashboard" icon={<LayoutGrid size={16} />}>Dashboard</NavLink>}
          {user?.isAdmin && <NavLink href="/admin" icon={<ShieldCheck size={16} />}>Admin</NavLink>}
        </div>
      )}
    </header>
  );
}

function NavLink({ href, icon, children }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-sm font-medium text-inksoft hover:text-ink hover:bg-bgsoft px-3.5 py-2 rounded-lg">
      {icon}
      {children}
    </Link>
  );
}
