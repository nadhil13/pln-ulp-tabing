import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';

export function AppLayout() {
  const { userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full overflow-x-hidden">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col w-full max-w-full overflow-x-hidden">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-4 md:px-6">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1" />
            <NotificationBell />
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-6 w-full max-w-full">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
