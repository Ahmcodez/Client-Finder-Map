import { Menu, SearchCode, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/map', label: 'Map View' },
  { to: '/saved', label: 'Saved Leads' },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-abyss/80 backdrop-blur-xl">
      <div className="section-shell flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-neon text-slate-950 shadow-glow">
            <SearchCode size={20} />
          </div>
          <div>
            <p className="font-display text-lg font-bold">Client Finder Map</p>
            <p className="text-xs text-slate-400">for developers</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {user.name}
              </div>
              <button className="btn-secondary" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              {!isHome && (
                <Link to="/" className="text-sm text-slate-400 transition hover:text-white">
                  Home
                </Link>
              )}
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
              <Link to="/signup" className="btn-primary gap-2">
                <Sparkles size={16} />
                Start khojing Clients
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-2xl border border-white/10 p-3 md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 md:hidden"
          >
            <div className="section-shell flex flex-col gap-3 py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              {user ? (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link to="/signup" className="btn-primary" onClick={() => setOpen(false)}>
                    Start khojing Clients
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
