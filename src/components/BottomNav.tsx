import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, QrCode, Package, Settings as SettingsIcon, ScanLine } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useT } from '../lib/i18n';

export function BottomNav() {
  const { t } = useT();
  const location = useLocation();

  const navItems = [
    { name: t.dashboard, path: '/dashboard', icon: LayoutDashboard },
    { name: t.scan, path: '/scan', icon: QrCode },
    { name: t.stock, path: '/stock-management', icon: Package },
    { name: t.settings, path: '/settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Centered FAB for Scan */}
      <div className="fixed bottom-24 right-6 z-50">
        <Link
          to="/scan"
          className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-105 transition-transform"
        >
          <ScanLine size={32} />
        </Link>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-t border-slate-200 dark:border-primary/30 px-2 pb-6 pt-2">
        <div className="flex justify-around items-end">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
            const Icon = item.icon;
            
            return (
              <div key={item.name} className="contents">
                {index === 2 && <div className="w-12"></div> /* Spacer for center */}
                <Link
                  to={item.path}
                  className={twMerge(
                    clsx(
                      "flex flex-col items-center gap-1",
                      isActive ? "text-primary dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
                    )
                  )}
                >
                  <Icon size={24} className={isActive ? "fill-current opacity-20" : ""} />
                  <span className={clsx("text-[10px]", isActive ? "font-bold" : "font-medium")}>
                    {item.name}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 -top-1 px-4 text-xs font-bold text-primary opacity-60">
          QUICK SCAN
        </div>
      </nav>
    </>
  );
}
