import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PackagePlus, AlertTriangle, Package2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../lib/i18n';
import { clsx } from 'clsx';
import type { Product } from '../lib/types';

interface Category { id: string; name: string; }

type StatusFilter = 'all' | 'inStock' | 'lowStock';

export function Products() {
  const { t } = useT();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    async function fetchData() {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('categories').select('id, name').order('name'),
      ]);
      if (prodRes.data) setProducts(prodRes.data as Product[]);
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchCategory = !categoryFilter || p.category_id === categoryFilter;
      const isLow = p.quantity <= p.min_quantity;
      const matchStatus =
        statusFilter === 'all' ? true :
        statusFilter === 'lowStock' ? isLow :
        !isLow;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t.allStatus },
    { value: 'inStock', label: t.inStock },
    { value: 'lowStock', label: t.lowStockFilter },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.searchProducts}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="shrink-0 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm text-slate-700 dark:text-slate-300 outline-none focus:border-primary transition-all"
        >
          <option value="">{t.allCategories}</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={clsx(
              'shrink-0 px-3 py-2 rounded-xl border text-sm font-medium transition-colors',
              statusFilter === opt.value
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Count + Add button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} {t.products.toLowerCase()}
        </p>
        <button
          onClick={() => navigate('/products/new')}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <PackagePlus size={16} />
          {t.addProduct}
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Package2 className="text-slate-300 dark:text-slate-600" size={48} />
          <p className="font-semibold text-slate-500">{t.noProducts}</p>
          <p className="text-sm text-slate-400">{products.length === 0 ? t.addFirst : t.noProductsDesc}</p>
          {products.length === 0 && (
            <button onClick={() => navigate('/products/new')} className="mt-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm">
              {t.addProduct}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => {
            const isLow = p.quantity <= p.min_quantity;
            const category = categories.find(c => c.id === p.category_id);
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/stock?code=${encodeURIComponent(p.sku)}`)}
                className="flex items-center gap-4 bg-white dark:bg-primary/10 p-4 rounded-xl border border-slate-200 dark:border-primary/20 shadow-sm cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
              >
                {/* Icon */}
                <div className={clsx('rounded-xl size-12 flex items-center justify-center shrink-0', isLow ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary/10 dark:bg-primary/20')}>
                  {isLow
                    ? <AlertTriangle className="text-red-500" size={22} />
                    : <Package2 className="text-primary" size={22} />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    {isLow && (
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                        {t.lowStockFilter.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">SKU: {p.sku}{category ? ` · ${category.name}` : ''}</p>
                </div>

                {/* Price + Stock */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm text-primary">
                    {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className={clsx('text-xs font-medium mt-0.5', isLow ? 'text-red-500' : 'text-slate-400')}>
                    {p.quantity} {t.units}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
