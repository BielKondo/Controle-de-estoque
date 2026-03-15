import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package2, Building2, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Cloud } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenant, setTenant] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display">
      {/* Header / Logo Area */}
      <header className="flex items-center p-6 justify-between max-w-[480px] mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg flex items-center justify-center">
            <Package2 size={24} />
          </div>
          <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">StockFlow</h2>
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          v2.4.0
        </div>
      </header>

      {/* Login Card Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-12 z-10">
        <div className="w-full max-w-[440px] space-y-8">
          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-slate-600 dark:text-slate-400 text-base">Enter your credentials to access your warehouse</p>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            {/* Company ID Field */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">
                Company ID
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text"
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                  placeholder="e.g. ACME-CORP-01"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold px-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 pl-12 pr-4 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Password</label>
                <a href="#" className="text-primary text-xs font-bold hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-4 pl-12 pr-12 text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 px-1">
              <input 
                id="remember" 
                type="checkbox" 
                className="rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400">Remember this device</label>
            </div>

            {/* Login Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 group disabled:opacity-70"
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center pt-4">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              New to the platform? <a href="#" className="text-primary font-bold hover:underline">Contact Support</a>
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Branding / Logo Area */}
      <footer className="mt-auto w-full py-10 px-6 border-t border-slate-200 dark:border-slate-800 z-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} />
              <span className="text-xs font-bold tracking-widest uppercase">Enterprise Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud size={20} />
              <span className="text-xs font-bold tracking-widest uppercase">99.9% Uptime</span>
            </div>
          </div>
          <div className="text-slate-400 text-xs text-center">
            © 2024 StockFlow Systems Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Decorative Background Element */}
      <div className="fixed top-0 right-0 z-0 w-1/3 h-[50vh] bg-gradient-to-bl from-primary/10 to-transparent blur-3xl rounded-full"></div>
      <div className="fixed bottom-0 left-0 z-0 w-1/2 h-[50vh] bg-gradient-to-tr from-primary/5 to-transparent blur-3xl rounded-full"></div>
    </div>
  );
}
