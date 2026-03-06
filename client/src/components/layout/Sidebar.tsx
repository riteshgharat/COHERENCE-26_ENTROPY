import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  Sun,
  Moon,
  Zap,
  Link2,
  MessageCircle,
  Search,
  Plus,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/stores/useThemeStore';

const topNav = [
  { path: '/', icon: LayoutDashboard, label: 'Overview' },
  { path: '/workflows', icon: GitBranch, label: 'Workflows' },
  { path: '/leads', icon: Users, label: 'Leads' },
  { path: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { path: '/channels', icon: Link2, label: 'Channels' },
  { path: '/ai-chat', icon: MessageCircle, label: 'AI Chat' },
];

const bottomNav = [
  { path: '/dashboard', icon: BarChart3, label: 'Analytics' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { theme, toggle } = useThemeStore();
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : path === '/workflows'
        ? location.pathname === '/workflows' || location.pathname.startsWith('/workflows/')
        : location.pathname.startsWith(path);

  const NavItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => {
    const active = isActive(path);
    return (
      <NavLink
        to={path}
        className={cn(
          'group flex items-center gap-3 px-3 py-[7px] rounded-[6px] text-[13px] font-medium transition-all duration-150 relative',
          active
            ? 'bg-foreground text-background shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        <Icon
          size={15}
          strokeWidth={active ? 2.2 : 1.6}
          className="shrink-0 transition-all duration-150"
        />
        <span className="truncate leading-none">{label}</span>
        {active && (
          <span className="ml-auto w-1 h-1 rounded-full bg-background/60 shrink-0" />
        )}
      </NavLink>
    );
  };

  return (
    <aside className="flex h-screen w-[224px] shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground sticky top-0 z-50">

      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4 shrink-0">
        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[7px] bg-foreground text-background shadow-sm">
          <Zap size={14} strokeWidth={2.5} />
        </div>
        <div>
          <span className="text-[14px] font-bold tracking-tight leading-none">OutflowAI</span>
          <div className="text-[9px] font-semibold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Pro workspace</div>
        </div>
      </div>

      {/* ── New workflow CTA ── */}
      <div className="px-3 mb-2 shrink-0">
        <NavLink
          to="/workflows/new"
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] border border-dashed border-border text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/25 hover:bg-accent/40 transition-all duration-150 group"
        >
          <div className="h-5 w-5 flex items-center justify-center rounded-[4px] border border-dashed border-border group-hover:border-foreground/25 transition-colors shrink-0">
            <Plus size={11} />
          </div>
          New workflow
          <ChevronRight size={11} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
        </NavLink>
      </div>

      {/* ── Search ── */}
      <div className="px-3 mb-3 shrink-0">
        <div className="flex items-center gap-2 px-3 py-[7px] rounded-[6px] bg-muted/60 border border-border/60 text-muted-foreground text-[12px] cursor-pointer hover:bg-muted hover:border-border transition-colors group">
          <Search size={12} className="shrink-0" />
          <span className="flex-1 font-medium">Search</span>
          <kbd className="text-[9px] font-bold border border-border rounded-[3px] px-1.5 py-0.5 bg-background font-mono leading-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Section label ── */}
      <div className="px-4 mb-1 shrink-0">
        <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Menu</span>
      </div>

      {/* ── Main nav ── */}
      <nav className="flex-1 space-y-px px-2.5 overflow-y-auto pb-2 min-h-0">
        {topNav.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}

        {/* Divider */}
        <div className="flex items-center gap-2.5 py-3 px-1">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-wider">More</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {bottomNav.map((item) => (
          <NavItem key={item.path} {...item} />
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-2.5 pb-3 shrink-0">
        <div className="h-px bg-border mb-2" />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-[7px] rounded-[6px] text-[12px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
        >
          <div className="h-[26px] w-[26px] flex items-center justify-center rounded-[5px] border border-border bg-background shrink-0">
            {theme === 'dark'
              ? <Sun size={12} strokeWidth={1.8} />
              : <Moon size={12} strokeWidth={1.8} />
            }
          </div>
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* Help */}
        <button className="flex items-center gap-3 w-full px-3 py-[7px] rounded-[6px] text-[12px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
          <div className="h-[26px] w-[26px] flex items-center justify-center rounded-[5px] border border-border bg-background shrink-0">
            <HelpCircle size={12} strokeWidth={1.8} />
          </div>
          <span>Help & Docs</span>
        </button>

        {/* User card */}
        <div className="mt-2 flex items-center gap-2.5 px-2 py-2 rounded-[6px] border border-border bg-card hover:bg-accent transition-colors cursor-pointer">
          <div className="h-7 w-7 rounded-[6px] bg-foreground flex items-center justify-center shrink-0">
            <span className="text-[10px] font-extrabold text-background leading-none">AC</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold truncate leading-tight">Ayush Choudhar</div>
            <div className="text-[10px] text-muted-foreground font-medium leading-tight">Pro plan</div>
          </div>
          <ChevronRight size={11} className="text-muted-foreground/40 shrink-0" />
        </div>
      </div>
    </aside>
  );
}
