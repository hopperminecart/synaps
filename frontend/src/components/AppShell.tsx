'use client';

import { Sidebar } from '@/components/Sidebar';
import { MediaViewer } from '@/components/MediaViewer';
import { useAppStore } from '@/lib/store';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="min-h-screen relative">
      <Sidebar />
      <MediaViewer />
      <main
        className="min-h-screen transition-all duration-300 ease-out lg:ml-[calc(var(--sidebar-width)+16px)]"
      >
        {children}
      </main>
    </div>
  );
}
