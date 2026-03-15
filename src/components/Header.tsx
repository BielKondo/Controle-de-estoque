import { Bell, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="flex items-center bg-background-light dark:bg-background-dark p-4 sticky top-0 z-10 border-b border-slate-200 dark:border-primary/20">
      <button onClick={onMenuClick} className="flex items-center justify-center size-10 rounded-lg bg-primary/10 dark:bg-primary/30 text-primary dark:text-slate-100">
        <Menu size={24} />
      </button>
      <h2 className="ml-4 text-lg font-bold leading-tight tracking-tight flex-1">
        {title}
      </h2>
      <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-primary/20 transition-colors">
        <Bell size={24} />
      </button>
    </header>
  );
}
