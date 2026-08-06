import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiBox,
  FiTag,
  FiList,
  FiShoppingCart,
  FiUsers,
  FiPercent,
  FiLogOut,
  FiMessageSquare,
} from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/common/Toaster';
import { cn } from '@/utils/cn';

const links = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/categories', label: 'Categories', icon: FiList },
  { to: '/admin/brands', label: 'Brands', icon: FiTag },
  { to: '/admin/orders', label: 'Orders', icon: FiShoppingCart },
  { to: '/admin/inquiries', label: 'Requests', icon: FiMessageSquare },
  { to: '/admin/customers', label: 'Customers', icon: FiUsers },
  { to: '/admin/coupons', label: 'Coupons', icon: FiPercent },
];

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-paper-dim">
      <aside className="hidden w-64 shrink-0 border-r border-ink/10 bg-ink text-paper md:flex md:flex-col">
        <div className="px-6 py-6">
          <p className="font-display text-xl">Smaterr Roboticz</p>
          <p className="text-xs text-paper/50">Robotics Admin</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors',
                  isActive ? 'bg-forest text-paper' : 'text-paper/70 hover:bg-white/5'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-6 py-4">
          <p className="text-xs text-paper/50">Signed in as</p>
          <p className="text-sm">{user?.name}</p>
          <button onClick={handleLogout} className="mt-3 flex items-center gap-2 text-sm text-paper/70 hover:text-amber">
            <FiLogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 overflow-x-hidden">
        <Outlet />
      </div>
      <Toaster />
    </div>
  );
};
