import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { useT } from '../lib/i18n';

export function Layout() {
  const { t } = useT();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getTitle = () => {
    switch(location.pathname) {
      case '/': return t.inventoryOverview;
      case '/scan': return t.scanCode;
      case '/stock': return t.stock;
      case '/products': return t.products;
      case '/users': return t.userManagement;
      case '/company': return t.companies;
      case '/products/new': return t.addProduct;
      case '/settings': return t.settings;
      default: return 'Inventory App';
    }
  };

  const isLogin = location.pathname === '/login';

  if (isLogin) {
    return <Outlet />;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title={getTitle()} onMenuClick={() => setSidebarOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
