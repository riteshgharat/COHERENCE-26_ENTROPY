import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/** Routes where we want full-bleed (no top bar, no padding) */
const isEditorRoute = (pathname: string) => {
  if (pathname === '/workflows/new') return true;
  if (pathname.startsWith('/workflows/') && pathname.endsWith('/edit')) return true;
  if (pathname.startsWith('/workflows/') && !pathname.endsWith('/edit') && pathname !== '/workflows') return true;
  return false;
};

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const editor = isEditorRoute(location.pathname);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {!editor && <TopBar />}
        <main className={`flex-1 overflow-y-auto ${editor ? '' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
