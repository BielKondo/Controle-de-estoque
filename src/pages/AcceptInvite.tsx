import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package2, Lock, Eye, EyeOff, User, Building2, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase v2 automatically processes the URL hash token and signs the user in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
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
    if (password !== confirmPassword) { setError(t.passwordMismatch); return; }
    if (password.length < 6) { setError(t.passwordTooShort); return; }

    setLoading(true);
    setError(null);

    const { error: updateErr } = await supabase.auth.updateUser({
      password,
      data: { full_name: fullName },
    });

    if (updateErr) { setError(updateErr.message); setLoading(false); return; }

    // Update profile table
    if (session) {
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', session.user.id);
    }

    setDone(true);
    setTimeout(() => navigate('/'), 2000);
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light dark:bg-background-dark px-4 text-center gap-4">
        <Package2 className="text-slate-300" size={48} />
        <p className="text-slate-500 text-sm">{t.invalidInvite}</p>
        <button onClick={() => navigate('/login')} className="text-primary font-semibold text-sm hover:underline">
          {t.signIn}
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center p-6 justify-between max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg">
            <Package2 size={24} />
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold">StockFlow</h2>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="w-full max-w-[440px] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold">{t.acceptInviteTitle}</h1>
            <p className="text-slate-600 dark:text-slate-400 text-base">{t.acceptInviteDesc}</p>
          </div>

          {/* Company ID card */}
          {companyId && (
            <div className="bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-xl p-4 flex items-start gap-3">
              <Building2 className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {t.yourCompanyId}
                </p>
                <p className="text-xl font-bold text-primary mt-0.5">{companyId}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.yourCompanyIdNote}</p>
              </div>
            </div>
          )}

          {done ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="text-emerald-500" size={48} />
              <p className="font-bold text-lg text-emerald-600">{t.savedSuccess}</p>
              <p className="text-slate-500 text-sm">{t.redirecting}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              {/* Full name */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">{t.inviteName}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="João Silva"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">{t.newPassword}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 pl-12 pr-12 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">{t.confirmPasswordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                {loading ? t.saving : t.saveAndEnter}
              </button>
            </form>
          )}
        </div>
      </main>

      <div className="fixed top-0 right-0 z-0 w-1/3 h-[50vh] bg-gradient-to-bl from-primary/10 to-transparent blur-3xl rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 z-0 w-1/2 h-[50vh] bg-gradient-to-tr from-primary/5 to-transparent blur-3xl rounded-full pointer-events-none" />
    </div>
  );
}
