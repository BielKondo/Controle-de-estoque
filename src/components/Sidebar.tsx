import { Link, useLocation } from 'react-router-dom';
import { X, LayoutDashboard, QrCode, Package, Settings as SettingsIcon, PackagePlus, List, Users, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useT } from '../lib/i18n';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useT();
  const location = useLocation();

  const navItems = [
    { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard },
    { name: t.scan, path: '/scan', icon: QrCode },
    { name: t.stock, path: '/stock-management', icon: Package },
    { name: t.products, path: '/product-management', icon: List },
    { name: t.addProduct, path: '/product-management/new', icon: PackagePlus },
    { name: t.company, path: '/company-management', icon: Building2 },
    { name: t.userManagement, path: '/user-management', icon: Users },
    { name: t.settings, path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={clsx(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-background-dark shadow-xl flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-primary/20">
          <span className="text-lg font-bold text-primary">Menu</span>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-primary/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-primary/10'
                )}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
