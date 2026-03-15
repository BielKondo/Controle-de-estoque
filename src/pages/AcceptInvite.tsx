import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package2, Lock, Eye, EyeOff, User, Building2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT } from '../lib/i18n';
import type { Session } from '@supabase/supabase-js';

export function AcceptInvite() {
  const { t } = useT();
  const navigate = useNavigate();

  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const [fullName, setFullName] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase automatically exchanges the token from the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s && !session) {
        setSession(s);
        const meta = s.user.user_metadata;
        if (meta?.full_name) setFullName(meta.full_name as string);
        if (meta?.company_id) setCompanyId(meta.company_id as string);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        const meta = data.session.user.user_metadata;
        if (meta?.full_name) setFullName(meta.full_name as string);
        if (meta?.company_id) setCompanyId(meta.company_id as string);
      }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (password !== confirm) { setError(t.passwordMismatch); return; }
    if (password.length < 6) { setError(t.passwordTooShort); return; }

    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.updateUser({
      password,
      data: { full_name: fullName },
    });

    if (err) { setError(err.message); setLoading(false); return; }

    if (session) {
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', session.user.id);
    }

    setDone(true);
    setTimeout(() => navigate('/'), 2000);
  }

  /* ── Loading ── */
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  /* ── Invalid link ── */
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center bg-background-light dark:bg-background-dark">
        <AlertCircle className="text-red-400" size={48} />
        <p className="font-bold text-lg text-slate-700 dark:text-slate-300">{t.invalidInvite}</p>
        <button onClick={() => navigate('/login')} className="text-primary font-semibold text-sm hover:underline">
          {t.backToLogin}
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">

      {/* Background blobs */}
      <div className="fixed top-0 right-0 w-1/3 h-[50vh] bg-gradient-to-bl from-primary/10 to-transparent blur-3xl rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-1/2 h-[50vh] bg-gradient-to-tr from-primary/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <header className="flex items-center p-6 max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg">
            <Package2 size={24} />
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold">StockFlow</h2>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12 z-10">
        <div className="w-full max-w-[440px] space-y-6">

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold">{t.acceptInviteTitle}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{t.acceptInviteDesc}</p>
          </div>

          {/* Company ID card */}
          {companyId && (
            <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg shrink-0">
                <Building2 className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{t.yourCompanyId}</p>
                <p className="text-2xl font-bold text-primary leading-tight">{companyId}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{t.yourCompanyIdNote}</p>
              </div>
            </div>
          )}

          {done ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="text-emerald-500" size={52} />
              <p className="font-bold text-lg text-emerald-600">{t.savedSuccess}</p>
              <p className="text-slate-400 text-sm">{t.redirecting}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">{t.inviteName}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="João Silva"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">{t.newPassword}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-3.5 pl-11 pr-12 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">{t.confirmPasswordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-3.5 pl-11 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="animate-spin" size={18} />}
                {loading ? t.saving : t.saveAndEnter}
              </button>

              <p className="text-center text-sm text-slate-400">
                <button type="button" onClick={() => navigate('/login')} className="text-primary hover:underline font-medium">
                  {t.backToLogin}
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
