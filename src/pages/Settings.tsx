import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Shield, Database, BellRing, Moon, Sun, Smartphone, Loader2, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useT, type Locale } from '../lib/i18n';
import { clsx } from 'clsx';

function getInitials(email: string) {
  return email.slice(0, 2).toUpperCase();
}

function isDarkStored() {
  return localStorage.getItem('darkMode') === 'true';
}

const languages: { value: Locale; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'pt', label: 'Português', flag: '🇧🇷' },
];

export function Settings() {
  const { t, locale, setLocale } = useT();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(isDarkStored);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setLoadingUser(false);
    });
  }, []);

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', String(isDark));
    setDarkMode(isDark);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-primary/20 rounded-xl border border-slate-200 dark:border-primary/30 shadow-sm">
        <div className="h-16 w-16 bg-primary/20 text-primary rounded-full flex items-center justify-center shrink-0 text-lg font-bold">
          {loadingUser ? <Loader2 className="animate-spin" size={24} /> : userEmail ? getInitials(userEmail) : <User size={32} />}
        </div>
        <div>
          {loadingUser
            ? <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
            : <h2 className="text-xl font-bold leading-tight truncate max-w-[220px]">{userEmail ?? 'Unknown'}</h2>
          }
          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            Admin
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">{t.appSettings}</h3>

        <div className="bg-white dark:bg-primary/10 rounded-xl border border-slate-200 dark:border-primary/20 overflow-hidden shadow-sm">
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-primary/20 text-slate-700 dark:text-slate-300 rounded-lg">
                <Sun size={20} className="dark:hidden" />
                <Moon size={20} className="hidden dark:block" />
              </div>
              <span className="font-semibold">{t.darkMode}</span>
            </div>
            <button onClick={toggleDarkMode} className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-primary' : 'bg-slate-300'}`}>
              <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${darkMode ? 'left-[calc(100%-1.5rem)]' : 'left-1'}`} />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-primary/20 text-slate-700 dark:text-slate-300 rounded-lg">
                <Globe size={20} />
              </div>
              <span className="font-semibold">{t.language}</span>
            </div>
            <div className="flex gap-2">
              {languages.map(lang => (
                <button
                  key={lang.value}
                  onClick={() => setLocale(lang.value)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors border',
                    locale === lang.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-slate-100 dark:bg-primary/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-primary/20 hover:bg-slate-200 dark:hover:bg-primary/20'
                  )}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-primary/20 text-slate-700 dark:text-slate-300 rounded-lg">
                <BellRing size={20} />
              </div>
              <span className="font-semibold">{t.notifications}</span>
            </div>
            <span className="text-sm font-medium text-slate-400">{t.enabled}</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 pt-2">{t.system}</h3>

        <div className="bg-white dark:bg-primary/10 rounded-xl border border-slate-200 dark:border-primary/20 overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-primary/10">
            <div className="p-2 bg-slate-100 dark:bg-primary/20 text-slate-700 dark:text-slate-300 rounded-lg"><Database size={20} /></div>
            <div>
              <p className="font-semibold">{t.dataSync}</p>
              <p className="text-xs text-slate-500">{t.connectedSupabase}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-primary/10">
            <div className="p-2 bg-slate-100 dark:bg-primary/20 text-slate-700 dark:text-slate-300 rounded-lg"><Smartphone size={20} /></div>
            <span className="font-semibold">{t.deviceMgmt}</span>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="p-2 bg-slate-100 dark:bg-primary/20 text-slate-700 dark:text-slate-300 rounded-lg"><Shield size={20} /></div>
            <span className="font-semibold">{t.privacyPolicy}</span>
          </div>
        </div>

        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 mt-8 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 font-bold transition-colors border border-red-200 dark:border-red-900/50">
          <LogOut size={20} />
          {t.signOut}
        </button>
      </div>
    </div>
  );
}
