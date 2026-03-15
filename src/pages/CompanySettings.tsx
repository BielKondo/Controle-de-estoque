import { useEffect, useState } from 'react';
import { Building2, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../lib/i18n';

interface Company {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

const EMPTY: Omit<Company, 'id'> = {
  name: '', document: '', email: '', phone: '', address: '', city: '', state: '',
};

export function CompanySettings() {
  const { t } = useT();

  const [form, setForm] = useState(EMPTY);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('is_admin').eq('id', user.id).single();
        setIsAdmin(profile?.is_admin ?? false);
      }

      const { data } = await supabase.from('company').select('*').single();
      if (data) {
        setCompanyId(data.id);
        setForm({
          name: data.name ?? '',
          document: data.document ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          state: data.state ?? '',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  const set = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: err } = companyId
      ? await supabase.from('company').update(form).eq('id', companyId)
      : await supabase.from('company').insert(form).select().single();

    setSaving(false);
    if (err) { setError(err.message); return; }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass = "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 py-3 px-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="p-4 max-w-lg mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-xl">
          <Building2 className="text-primary" size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold leading-tight">{t.companyProfile}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.companyProfileDesc}</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
          <ShieldCheck size={16} className="shrink-0" />
          <span>Somente admins podem editar. Você está no modo leitura.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        {/* Company Name */}
        <div>
          <label className={labelClass}>{t.companyName} <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Ex: Acme Distribuidora Ltda"
            className={inputClass}
            disabled={!isAdmin}
            required
          />
        </div>

        {/* CNPJ + Phone */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t.document}</label>
            <input
              type="text"
              value={form.document}
              onChange={set('document')}
              placeholder="00.000.000/0001-00"
              className={inputClass}
              disabled={!isAdmin}
            />
          </div>
          <div>
            <label className={labelClass}>{t.phone}</label>
            <input
              type="text"
              value={form.phone}
              onChange={set('phone')}
              placeholder="(00) 00000-0000"
              className={inputClass}
              disabled={!isAdmin}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>{t.workEmail}</label>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="contato@empresa.com.br"
            className={inputClass}
            disabled={!isAdmin}
          />
        </div>

        {/* Address */}
        <div>
          <label className={labelClass}>{t.address}</label>
          <input
            type="text"
            value={form.address}
            onChange={set('address')}
            placeholder="Rua, número, complemento"
            className={inputClass}
            disabled={!isAdmin}
          />
        </div>

        {/* City + State */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{t.city}</label>
            <input
              type="text"
              value={form.city}
              onChange={set('city')}
              placeholder="São Paulo"
              className={inputClass}
              disabled={!isAdmin}
            />
          </div>
          <div>
            <label className={labelClass}>{t.state}</label>
            <input
              type="text"
              value={form.state}
              onChange={set('state')}
              placeholder="SP"
              maxLength={2}
              className={inputClass}
              disabled={!isAdmin}
            />
          </div>
        </div>

        {isAdmin && (
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {saving ? (
              <><Loader2 className="animate-spin" size={20} />{t.saving}</>
            ) : saved ? (
              <><CheckCircle2 size={20} />{t.savedSuccess}</>
            ) : (
              <><Building2 size={20} />{t.saveChanges}</>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
