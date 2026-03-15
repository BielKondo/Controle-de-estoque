import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PackageCheck, Delete, Loader2, AlertCircle, ArrowDown, ArrowUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../lib/i18n';
import type { Product } from '../lib/types';
import { clsx } from 'clsx';

type MovementType = 'OUT' | 'IN';

interface UserPerms { can_stock_in: boolean; can_stock_out: boolean; }

export function Stock() {
  const { t } = useT();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [movementType, setMovementType] = useState<MovementType>('OUT');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perms, setPerms] = useState<UserPerms>({ can_stock_in: true, can_stock_out: true });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('profiles').select('can_stock_in, can_stock_out').eq('id', user.id).single()
        .then(({ data }) => {
          if (data) {
            setPerms(data);
            // Default to first allowed movement type
            if (!data.can_stock_out && data.can_stock_in) setMovementType('IN');
          }
        });
    });
  }, []);

  useEffect(() => {
    async function fetchProduct() {
      if (!code) { setLoadingProduct(false); return; }
      const { data } = await supabase.from('products').select('*').or(`sku.eq.${code},barcode.eq.${code}`).maybeSingle();
      if (data) setProduct(data);
      else setNotFound(true);
      setLoadingProduct(false);
    }
    fetchProduct();
  }, [code]);

  const handleKeypadPress = (val: string) => {
    if (val === 'C') setQuantity('');
    else if (val === 'backspace') setQuantity(prev => prev.slice(0, -1));
    else setQuantity(prev => {
      if (prev.length > 5) return prev;
      if (prev === '0' && val !== '0') return val;
      return prev + val;
    });
  };

  const submitQuantity = async () => {
    if (!quantity || quantity === '0' || !product) return;
    const qty = parseInt(quantity);
    if (movementType === 'OUT' && qty > product.quantity) {
      setError(t.insufficientStock(product.quantity));
      return;
    }
    setSubmitting(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from('stock_movements').insert({
      product_id: product.id, type: movementType, quantity: qty, user_id: user?.id ?? null,
    });
    setSubmitting(false);
    if (insertError) { setError(insertError.message); return; }
    navigate('/');
  };

  if (loadingProduct) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="animate-spin text-primary" size={32} />
      <p className="text-slate-500 text-sm">{t.loadingProduct}</p>
    </div>
  );

  if (notFound) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
      <AlertCircle className="text-red-500" size={40} />
      <p className="font-bold text-lg">{t.productNotFound}</p>
      <p className="text-slate-500 text-sm">{t.productNotFoundDesc(code ?? '')}</p>
      <button onClick={() => navigate('/scan')} className="mt-2 px-5 py-2 bg-primary text-white rounded-xl font-semibold text-sm">{t.scanAgain}</button>
    </div>
  );

  if (!product) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
      <AlertCircle className="text-slate-400" size={40} />
      <p className="text-slate-500 text-sm">{t.noProductSelected}</p>
      <button onClick={() => navigate('/scan')} className="mt-2 px-5 py-2 bg-primary text-white rounded-xl font-semibold text-sm">{t.goToScan}</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full mx-auto bg-background-light dark:bg-background-dark overflow-hidden font-display pb-20">
      <div className="p-4 bg-white dark:bg-primary/20 m-4 rounded-xl border border-slate-200 dark:border-primary/30 shadow-sm mt-8">
        <div className="flex items-start gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <p className="text-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wider">{t.productDetails}</p>
            <p className="text-slate-900 dark:text-white text-xl font-bold leading-tight">{product.name}</p>
            <div className="flex flex-col mt-1">
              <span className="text-slate-500 dark:text-slate-400 text-sm">SKU: {product.sku}</span>
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
                {t.currentStock}: <span className="text-slate-900 dark:text-white">{product.quantity} {t.units}</span>
              </span>
            </div>
          </div>
          <div className="w-20 h-20 shrink-0 bg-slate-200 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center">
            <PackageCheck size={32} className="text-primary/50" />
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-primary/30">
          <button
            onClick={() => setMovementType('OUT')}
            disabled={!perms.can_stock_out}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors',
              movementType === 'OUT' ? 'bg-red-500 text-white' : 'bg-white dark:bg-primary/10 text-slate-500 dark:text-slate-400',
              !perms.can_stock_out && 'opacity-30 cursor-not-allowed'
            )}
          >
            <ArrowUp size={16} /> OUT
          </button>
          <button
            onClick={() => setMovementType('IN')}
            disabled={!perms.can_stock_in}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-colors',
              movementType === 'IN' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-primary/10 text-slate-500 dark:text-slate-400',
              !perms.can_stock_in && 'opacity-30 cursor-not-allowed'
            )}
          >
            <ArrowDown size={16} /> IN
          </button>
        </div>
        {!perms.can_stock_in && !perms.can_stock_out && (
          <p className="mt-2 text-center text-sm text-red-500 font-medium">{t.noPermission}</p>
        )}
      </div>

      <div className="px-4 pb-2">
        <label className="block mb-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          {movementType === 'IN' ? t.quantityToAdd : t.quantityToRemove}
        </label>
        <div className="relative">
          <input type="text" value={quantity || '0'} readOnly
            className={clsx('w-full h-16 bg-white dark:bg-slate-900/50 border-2 rounded-xl text-3xl font-bold text-center focus:ring-0 transition-all outline-none', movementType === 'IN' ? 'border-emerald-400 text-emerald-600 dark:text-emerald-400' : 'border-red-300 text-red-500 dark:text-red-400')}
          />
          <div className="absolute inset-y-0 right-4 flex items-center">
            <span className="text-slate-400 font-medium">{t.units}</span>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>}
      </div>

      <div className="mt-auto px-4 pb-6 flex-1 flex flex-col justify-end">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1,2,3,4,5,6,7,8,9].map(num => (
            <button key={num} onClick={() => handleKeypadPress(num.toString())} className="h-16 flex items-center justify-center text-2xl font-semibold bg-white dark:bg-primary/20 border border-slate-200 dark:border-primary/30 hover:bg-slate-100 dark:hover:bg-primary/40 rounded-xl transition-colors shadow-sm">{num}</button>
          ))}
          <button onClick={() => handleKeypadPress('C')} className="h-16 flex items-center justify-center text-2xl font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm">C</button>
          <button onClick={() => handleKeypadPress('0')} className="h-16 flex items-center justify-center text-2xl font-semibold bg-white dark:bg-primary/20 border border-slate-200 dark:border-primary/30 hover:bg-slate-100 dark:hover:bg-primary/40 rounded-xl transition-colors shadow-sm">0</button>
          <button onClick={() => handleKeypadPress('backspace')} className="h-16 flex items-center justify-center text-2xl font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors shadow-sm"><Delete size={24} /></button>
        </div>

        <button onClick={submitQuantity} disabled={!quantity || quantity === '0' || submitting}
          className={clsx('w-full h-14 text-white text-lg font-bold rounded-xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100', movementType === 'IN' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30')}>
          {submitting ? <Loader2 className="animate-spin" size={22} /> : <><span>{movementType === 'IN' ? t.confirmEntry : t.confirmOutput}</span><PackageCheck size={20} /></>}
        </button>
      </div>
    </div>
  );
}
