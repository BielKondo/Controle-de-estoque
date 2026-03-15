import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../lib/i18n';

interface Category {
  id: string;
  name: string;
}

export function AddProduct() {
  const { t } = useT();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '', sku: '', barcode: '', description: '',
    price: '', quantity: '0', min_quantity: '5', category_id: '',
  });

  useEffect(() => {
    supabase.from('categories').select('id, name').order('name').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error: err } = await supabase.from('products').insert({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      barcode: form.barcode.trim() || null,
      description: form.description.trim() || null,
      price: parseFloat(form.price) || 0,
      quantity: parseInt(form.quantity) || 0,
      min_quantity: parseInt(form.min_quantity) || 5,
      category_id: form.category_id || null,
    });

    setSubmitting(false);

    if (err) {
      if (err.message.includes('products_sku_key')) setError(t.skuInUse);
      else if (err.message.includes('products_barcode_key')) setError(t.barcodeInUse);
      else setError(err.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/'), 1500);
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <CheckCircle2 className="text-emerald-500" size={52} />
      <p className="text-xl font-bold">{t.productRegistered}</p>
      <p className="text-slate-500 text-sm">{t.redirecting}</p>
    </div>
  );

  const inputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="p-4 max-w-lg mx-auto pb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-xl">
          <PackagePlus className="text-primary" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">{t.newProduct}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.newProductDesc}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-3 text-sm">{error}</div>
        )}

        <div>
          <label className={labelClass}>{t.productName} <span className="text-red-500">*</span></label>
          <input type="text" value={form.name} onChange={set('name')} placeholder={t.productNamePlaceholder} className={inputClass} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t.skuLabel} <span className="text-red-500">*</span></label>
            <input type="text" value={form.sku} onChange={set('sku')} placeholder="e.g. MBP-M3-16" className={inputClass} required />
          </div>
          <div>
            <label className={labelClass}>{t.barcodeLabel} <span className="text-slate-400 font-normal">({t.optional})</span></label>
            <input type="text" value={form.barcode} onChange={set('barcode')} placeholder="e.g. 7891234560012" className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t.price} <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">R$</span>
            <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0,00" className={inputClass + ' pl-10'} required />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t.category}</label>
          <select value={form.category_id} onChange={set('category_id')} className={inputClass}>
            <option value="">{t.selectCategory}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t.initialStock}</label>
            <input type="number" min="0" value={form.quantity} onChange={set('quantity')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{t.minStock} <span className="text-slate-400 font-normal text-xs">({t.minStockNote})</span></label>
            <input type="number" min="0" value={form.min_quantity} onChange={set('min_quantity')} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t.description} <span className="text-slate-400 font-normal">({t.optional})</span></label>
          <textarea value={form.description} onChange={set('description')} placeholder={t.descriptionPlaceholder} rows={3} className={inputClass + ' resize-none'} />
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2">
          {submitting ? <Loader2 className="animate-spin" size={20} /> : <><PackagePlus size={20} />{t.registerProduct}</>}
        </button>
      </form>
    </div>
  );
}
