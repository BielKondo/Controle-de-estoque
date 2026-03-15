import { useEffect, useState } from 'react';
import {
  Building2, Plus, Search, Pencil, Trash2, Loader2,
  MapPin, Phone, Mail, FileText, X, CheckCircle2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../lib/i18n';
import { clsx } from 'clsx';

interface Company {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

const EMPTY_FORM = {
  name: '', document: '', email: '', phone: '', address: '', city: '', state: '',
};

type ModalMode = 'add' | 'edit';

export function Companies() {
  const { t } = useT();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [modal, setModal] = useState<{ mode: ModalMode; data?: Company } | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { fetchCompanies(); }, []);

  async function fetchCompanies() {
    setLoading(true);
    const { data } = await supabase.from('company').select('*').order('name');
    if (data) setCompanies(data);
    setLoading(false);
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setSaveError(null);
    setSaved(false);
    setModal({ mode: 'add' });
  }

  function openEdit(company: Company) {
    setForm({
      name: company.name ?? '',
      document: company.document ?? '',
      email: company.email ?? '',
      phone: company.phone ?? '',
      address: company.address ?? '',
      city: company.city ?? '',
      state: company.state ?? '',
    });
    setSaveError(null);
    setSaved(false);
    setModal({ mode: 'edit', data: company });
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t.confirmDeleteCompany)) return;
    await supabase.from('company').delete().eq('id', id);
    setCompanies(prev => prev.filter(c => c.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const payload = {
      name: form.name.trim(),
      document: form.document.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim().toUpperCase() || null,
    };

    if (modal?.mode === 'edit' && modal.data) {
      const { error } = await supabase.from('company').update(payload).eq('id', modal.data.id);
      if (error) { setSaveError(error.message); setSaving(false); return; }
      setCompanies(prev => prev.map(c => c.id === modal.data!.id ? { ...c, ...payload } : c));
    } else {
      const { data, error } = await supabase.from('company').insert(payload).select().single();
      if (error) { setSaveError(error.message); setSaving(false); return; }
      if (data) setCompanies(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => { setModal(null); setSaved(false); }, 1200);
  }

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const filtered = companies.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.document ?? '').includes(search) ||
    (c.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-xl">
            <Building2 className="text-primary" size={22} />
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">{t.companies}</h2>
            <p className="text-xs text-slate-400">{filtered.length} {t.companies.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          {t.newCompany}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`${t.searchProducts.split('name')[0]}${t.companyName.toLowerCase()}...`}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Building2 className="text-slate-300 dark:text-slate-600" size={48} />
          <p className="font-semibold text-slate-500">{t.noCompanies}</p>
          <p className="text-sm text-slate-400">{t.noCompaniesDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(company => (
            <div key={company.id} className="bg-white dark:bg-primary/10 rounded-xl border border-slate-200 dark:border-primary/20 shadow-sm p-4">
              <div className="flex items-start justify-between gap-3">
                {/* Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                    <Building2 className="text-primary" size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm leading-tight">{company.name}</p>
                    {company.document && (
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <FileText size={11} /> {company.document}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                      {(company.city || company.state) && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin size={11} />
                          {[company.city, company.state].filter(Boolean).join(' — ')}
                        </span>
                      )}
                      {company.phone && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Phone size={11} /> {company.phone}
                        </span>
                      )}
                      {company.email && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail size={11} /> {company.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(company)}
                    className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                    title={t.editCompany}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title={t.deleteCompany}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-white dark:bg-background-dark rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-primary/20">
              <h3 className="font-bold text-lg">
                {modal.mode === 'add' ? t.newCompany : t.editCompany}
              </h3>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-primary/20">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {saveError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-3 text-sm">
                  {saveError}
                </div>
              )}

              <div>
                <label className={labelClass}>{t.companyName} <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={set('name')} placeholder="Ex: Acme Ltda" className={inputClass} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t.document}</label>
                  <input type="text" value={form.document} onChange={set('document')} placeholder="00.000.000/0001-00" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t.phone}</label>
                  <input type="text" value={form.phone} onChange={set('phone')} placeholder="(00) 00000-0000" className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>{t.workEmail}</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="contato@empresa.com.br" className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>{t.address}</label>
                <input type="text" value={form.address} onChange={set('address')} placeholder="Rua, número, complemento" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t.city}</label>
                  <input type="text" value={form.city} onChange={set('city')} placeholder="São Paulo" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t.state}</label>
                  <input type="text" value={form.state} onChange={set('state')} placeholder="SP" maxLength={2} className={inputClass} />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={clsx(
                  'w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all',
                  saved ? 'bg-emerald-500' : 'bg-primary hover:bg-primary/90',
                  saving && 'opacity-70'
                )}
              >
                {saving ? (
                  <><Loader2 className="animate-spin" size={18} />{t.saving}</>
                ) : saved ? (
                  <><CheckCircle2 size={18} />{t.savedSuccess}</>
                ) : (
                  t.saveChanges
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
