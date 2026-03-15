import { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Loader2, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { useT } from '../lib/i18n';
import { clsx } from 'clsx';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  can_stock_in: boolean;
  can_stock_out: boolean;
  is_admin: boolean;
}

function getInitials(name: string | null, email: string | null) {
  const str = name || email || '?';
  return str.slice(0, 2).toUpperCase();
}

export function UserManagement() {
  const { t } = useT();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data } = await supabase.from('profiles').select('*').order('created_at');
      if (data) {
        setProfiles(data);
        const me = data.find(p => p.id === user.id);
        setIsAdmin(me?.is_admin ?? false);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function togglePermission(profile: Profile, field: 'can_stock_in' | 'can_stock_out' | 'is_admin') {
    if (!isAdmin) return;
    setUpdatingId(profile.id + field);
    const newValue = !profile[field];
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: newValue })
      .eq('id', profile.id);

    if (!error) {
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, [field]: newValue } : p));
    }
    setUpdatingId(null);
  }

  async function deleteUser(userId: string) {
    if (!isAdmin || !window.confirm(t.confirmDelete)) return;
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (!error) {
      setProfiles(prev => prev.filter(p => p.id !== userId));
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);

    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      inviteEmail.trim(),
      { data: { full_name: inviteName.trim() || inviteEmail.trim() } }
    );

    setInviting(false);

    if (error) {
      setInviteError(error.message);
      return;
    }

    setInviteSuccess(true);
    setInviteEmail('');
    setInviteName('');
    setTimeout(() => {
      setInviteSuccess(false);
      setShowInvite(false);
      // Refresh list
      supabase.from('profiles').select('*').order('created_at').then(({ data }) => {
        if (data) setProfiles(data);
      });
    }, 2000);
  }

  const PermToggle = ({ profile, field, icon: Icon, label }: {
    profile: Profile;
    field: 'can_stock_in' | 'can_stock_out';
    icon: React.ElementType;
    label: string;
  }) => {
    const active = profile[field];
    const loading = updatingId === profile.id + field;
    return (
      <button
        onClick={() => togglePermission(profile, field)}
        disabled={!isAdmin || loading}
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
          active
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700',
          isAdmin && !loading && 'hover:opacity-80 cursor-pointer',
          !isAdmin && 'cursor-default opacity-70'
        )}
      >
        {loading
          ? <Loader2 size={12} className="animate-spin" />
          : <Icon size={12} />
        }
        {label}
      </button>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  if (!isAdmin) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
      <ShieldCheck className="text-slate-300" size={48} />
      <p className="font-bold text-lg text-slate-600 dark:text-slate-400">{t.noPermission}</p>
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 dark:bg-primary/20 p-2.5 rounded-xl">
            <Users className="text-primary" size={22} />
          </div>
          <div>
            <h2 className="font-bold text-base leading-tight">{t.userManagement}</h2>
            <p className="text-xs text-slate-400">{profiles.length} {t.noUsers.includes('No') ? 'users' : 'usuários'}</p>
          </div>
        </div>
        <button
          onClick={() => { setShowInvite(true); setInviteError(null); setInviteSuccess(false); }}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={16} />
          {t.inviteUser}
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="bg-white dark:bg-primary/10 rounded-xl border border-slate-200 dark:border-primary/20 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm">{t.inviteUser}</p>
            <button onClick={() => setShowInvite(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          {inviteSuccess ? (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold py-2">
              <CheckCircle2 size={18} />{t.inviteSent}
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-3">
              {inviteError && (
                <p className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{inviteError}</p>
              )}
              <input
                type="text"
                value={inviteName}
                onChange={e => setInviteName(e.target.value)}
                placeholder={t.inviteName}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 py-2.5 px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder={t.inviteEmail}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 py-2.5 px-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={inviting}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {inviting ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                {inviting ? t.sending : t.sendInvite}
              </button>
            </form>
          )}
        </div>
      )}

      {/* User list */}
      <div className="space-y-3">
        {profiles.map(profile => {
          const isMe = profile.id === currentUserId;
          return (
            <div key={profile.id} className="bg-white dark:bg-primary/10 rounded-xl border border-slate-200 dark:border-primary/20 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="size-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  {getInitials(profile.full_name, profile.email)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-sm truncate">{profile.full_name || profile.email}</p>
                    {profile.is_admin && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{t.adminBadge}</span>
                    )}
                    {isMe && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">{t.youLabel}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{profile.email}</p>

                  {/* Permission toggles */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <PermToggle profile={profile} field="can_stock_in"  icon={ArrowDownToLine} label={t.permStockIn}  />
                    <PermToggle profile={profile} field="can_stock_out" icon={ArrowUpFromLine}  label={t.permStockOut} />
                    <button
                      onClick={() => togglePermission(profile, 'is_admin')}
                      disabled={isMe || updatingId === profile.id + 'is_admin'}
                      className={clsx(
                        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                        profile.is_admin
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700',
                        !isMe && 'hover:opacity-80 cursor-pointer',
                        isMe && 'cursor-default opacity-50'
                      )}
                    >
                      {updatingId === profile.id + 'is_admin'
                        ? <Loader2 size={12} className="animate-spin" />
                        : <ShieldCheck size={12} />
                      }
                      {t.adminBadge}
                    </button>
                  </div>
                </div>

                {/* Delete */}
                {!isMe && (
                  <button
                    onClick={() => deleteUser(profile.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0"
                    title={t.deleteUser}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
