import { useEffect, useState } from 'react';
import { Package2, AlertTriangle, TrendingDown, ChevronRight, BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../lib/i18n';
import type { StockMovement } from '../lib/types';

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function Dashboard() {
  const { t } = useT();
  const [totalProducts, setTotalProducts] = useState<number | null>(null);
  const [lowStock, setLowStock] = useState<number | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [productsRes, movementsRes] = await Promise.all([
        supabase.from('products').select('quantity, min_quantity'),
        supabase.from('stock_movements').select('*, products(name)').order('created_at', { ascending: false }).limit(5),
      ]);
      if (productsRes.data) {
        setTotalProducts(productsRes.data.length);
        setLowStock(productsRes.data.filter(p => p.quantity <= p.min_quantity).length);
      }
      if (movementsRes.data) setMovements(movementsRes.data as StockMovement[]);
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
        ) : movements.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">{t.noMovements}</div>
        ) : (
          <div className="space-y-3">
            {movements.map((m) => (
              <div key={m.id} className="flex items-center gap-4 bg-white dark:bg-primary/10 p-3 rounded-xl border border-slate-200 dark:border-primary/20 shadow-sm">
                <div className="bg-primary/20 rounded-lg size-12 flex items-center justify-center shrink-0">
                  <Package2 className="text-primary" size={24} />
                </div>
                <div className="flex flex-col flex-1 overflow-hidden">
                  <p className="font-semibold text-sm truncate">{m.products?.name ?? '—'}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                    {m.type === 'IN' ? t.stockAdded : t.stockRemoved}: {m.quantity} {t.units}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">{timeAgo(m.created_at)}</p>
                  {m.type === 'IN' ? (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold mt-1">IN</span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold mt-1">OUT</span>
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
