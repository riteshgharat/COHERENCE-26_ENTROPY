import { useLocation } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const breadcrumbs: Record<string, string[]> = {
  '/': ['Overview'],
  '/workflows': ['Workflows'],
  '/leads': ['Leads'],
  '/campaigns': ['Campaigns'],
  '/dashboard': ['Analytics'],
  '/channels': ['Channels'],
  '/ai-chat': ['AI', 'Chat'],
  '/templates': ['Templates'],
  '/settings': ['Settings'],
};

export default function TopBar() {
  const location = useLocation();

  const getCrumbs = (): string[] => {
    if (location.pathname.startsWith('/workflows/') && location.pathname.endsWith('/edit'))
      return ['Workflows', 'Editor'];
    if (location.pathname.startsWith('/workflows/') && location.pathname !== '/workflows/new')
      return ['Workflows', 'Detail'];
    if (location.pathname === '/workflows/new')
      return ['Workflows', 'New'];
    return breadcrumbs[location.pathname] ?? ['OutflowAI'];
  };

  const crumbs = getCrumbs();

  return (
    <header className="flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm px-5 sticky top-0 z-40 h-[46px] shrink-0">

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        {crumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-border" />}
            <span
              className={`text-[13px] ${
                i === crumbs.length - 1
                  ? 'font-semibold text-foreground'
                  : 'font-medium text-muted-foreground'
              }`}
            >
              {crumb}
            </span>
          </div>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-[6px] text-muted-foreground hover:text-foreground"
        >
          <Bell size={15} strokeWidth={1.6} />
          {/* Notification dot */}
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-foreground ring-1 ring-background" />
        </Button>

        {/* User avatar */}
        <div className="h-7 w-7 rounded-[6px] bg-foreground flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-[10px] font-bold text-background leading-none">AC</span>
        </div>
      </div>
    </header>
  );
}
