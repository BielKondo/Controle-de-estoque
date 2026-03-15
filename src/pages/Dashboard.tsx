import { useEffect, useState } from 'react';
import { Package2, AlertTriangle, TrendingDown, ChevronRight, BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../lib/i18n';
import type { Product } from '../lib/types';

function timeAgo(dateStr: string, locale: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  const pt = locale === 'pt';
  if (diff < 60) return pt ? `${diff}s atrás` : `${diff}s ago`;
  if (diff < 3600) return pt ? `${Math.floor(diff / 60)}min atrás` : `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return pt ? `${Math.floor(diff / 3600)}h atrás` : `${Math.floor(diff / 3600)}h ago`;
  return pt ? `${Math.floor(diff / 86400)}d atrás` : `${Math.floor(diff / 86400)}d ago`;
}

export function Dashboard() {
  const { t, locale } = useT();
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [lowStock, setLowStock] = useState<number | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [statsRes, recentRes] = await Promise.all([
        supabase.from('products').select('quantity, min_quantity'),
        supabase.from('products').select('id, name, sku, quantity, min_quantity, created_at').order('created_at', { ascending: false }).limit(10),
      ]);
      if (statsRes.data) {
        setTotalProducts(statsRes.data.length);
        setLowStock(statsRes.data.filter(p => p.quantity <= p.min_quantity).length);
      }
      if (recentRes.data) setRecentProducts(recentRes.data as Product[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-[160px] flex-1 flex-col gap-2 rounded-xl p-5 bg-white dark:bg-primary/20 border border-slate-200 dark:border-primary/30 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t.totalProducts}</p>
            <Package2 className="text-primary" size={20} />
          </div>
          {loading ? <Loader2 className="animate-spin text-primary" size={20} /> : (
            <p className="text-2xl font-bold leading-tight mt-1">{totalProducts ?? 0}</p>
          )}
        </div>

        <div className="flex min-w-[160px] flex-1 flex-col gap-2 rounded-xl p-5 bg-white dark:bg-primary/20 border border-slate-200 dark:border-primary/30 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t.lowStock}</p>
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          {loading ? <Loader2 className="animate-spin text-primary" size={20} /> : (
            <>
              <p className="text-2xl font-bold leading-tight mt-1">{lowStock ?? 0}</p>
              {(lowStock ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-red-500 text-sm font-semibold">
                  <TrendingDown size={16} /><span>{t.critical}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between px-1 mb-4">
          <h3 className="text-lg font-bold leading-tight">{t.recentMovements}</h3>
          <button className="text-sm font-semibold text-primary dark:text-slate-300 flex items-center">
            {t.viewAll} <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : recentProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">{t.noProducts}</div>
        ) : (
          <div className="space-y-3">
            {recentProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-primary/10 p-3 rounded-xl border border-slate-200 dark:border-primary/20 shadow-sm">
                <div className="bg-primary/20 rounded-lg size-12 flex items-center justify-center shrink-0">
                  <Package2 className="text-primary" size={24} />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                    SKU: {p.sku} · {t.stockLabel}: {p.quantity} {t.units}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">{timeAgo(p.created_at, locale)}</p>
                  {p.quantity <= p.min_quantity ? (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold mt-1">{t.lowStock}</span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold mt-1">{t.inStock}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-primary/10 dark:bg-primary/30 rounded-xl p-4 border border-primary/20 mt-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg text-white shrink-0"><BarChart3 size={24} /></div>
          <div>
            <p className="font-bold text-sm">{t.weeklyReport}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.weeklyReportDesc}</p>
          </div>
        </div>
        <button className="w-full sm:w-auto px-4 bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg text-sm transition-colors whitespace-nowrap">
          {t.generatePdf}
        </button>
      </div>
    </div>
  );
}
