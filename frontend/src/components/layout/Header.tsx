import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiMenu, FiX, FiZap } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services';
import { useCartQuery } from '@/hooks/useCart';

export const Header = () => {
  const [query, setQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: cart } = useCartQuery();
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: () => categoryService.list() });

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="hidden bg-ink text-paper/75 md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
          <span>Electronics, robotics, IoT and project parts</span>
          <span>Need a product? Submit a request from the home page.</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <button className="md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
        </button>

        <Link to="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-forest text-paper">
            <FiZap className="h-5 w-5" />
          </span>
          Smaterr Roboticz
        </Link>

        <nav className="hidden items-center gap-5 md:flex ml-4">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c._id}
              to={`/shop?category=${c._id}`}
              className="text-sm text-ink/70 transition-colors hover:text-forest"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-md flex-1 items-center md:flex">
          <div className="flex w-full items-center rounded-sm border border-ink/15 bg-white/70 px-3">
            <FiSearch className="h-4 w-4 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="I am shopping for..."
              className="h-10 w-full bg-transparent px-2 text-sm outline-none placeholder:text-ink/40"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <Link to="/wishlist" aria-label="Wishlist" className="text-ink/70 hover:text-forest">
            <FiHeart className="h-5 w-5" />
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative text-ink/70 hover:text-forest">
            <FiShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber text-[10px] font-semibold text-ink">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            aria-label="Account"
            className="flex items-center gap-1 text-ink/70 hover:text-forest"
          >
            <FiUser className="h-5 w-5" />
            <span className="hidden text-sm sm:inline">{isAuthenticated ? user?.name.split(' ')[0] : 'Login'}</span>
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink/10 bg-paper px-4 py-3 md:hidden">
          <form onSubmit={submitSearch} className="mb-3 flex items-center rounded-sm border border-ink/15 bg-white/70 px-3">
            <FiSearch className="h-4 w-4 text-ink/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="I am shopping for..."
              className="h-10 w-full bg-transparent px-2 text-sm outline-none"
            />
          </form>
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <Link key={c._id} to={`/shop?category=${c._id}`} onClick={() => setMobileOpen(false)} className="py-1 text-sm">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
