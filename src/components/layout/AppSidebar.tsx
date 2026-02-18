import { 
  LayoutDashboard, 
  Package, 
  CheckCircle, 
  Users, 
  Settings, 
  LogOut,
  PlusCircle,
  FileText,
  Zap
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ROLE_LABELS } from '@/types';

const staffMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Input Barang', url: '/input-barang', icon: PlusCircle },
  { title: 'Inventaris Saya', url: '/my-items', icon: Package },
];

const verifikatorMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Approval Center', url: '/approval', icon: CheckCircle },
  { title: 'Laporan', url: '/reports', icon: FileText },
];

const adminMenuItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Input Barang', url: '/input-barang', icon: PlusCircle },
  { title: 'Semua Inventaris', url: '/inventory', icon: Package },
  { title: 'Approval Center', url: '/approval', icon: CheckCircle },
  { title: 'Manajemen User', url: '/users', icon: Users },
  { title: 'Laporan', url: '/reports', icon: FileText },
];

export function AppSidebar() {
  const { userData, signOut } = useAuth();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  const getMenuItems = () => {
    switch (userData?.role) {
      case 'admin_gudang':
        return adminMenuItems;
      case 'verifikator':
        return verifikatorMenuItems;
      default:
        return staffMenuItems;
    }
  };

  const menuItems = getMenuItems();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <Zap className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground">PLN ULP TABING</span>
            <span className="text-xs text-sidebar-foreground/70">Kota Padang</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent',
                          isActive && 'bg-sidebar-accent font-medium'
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border-2 border-sidebar-primary">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium">
              {userData?.name ? getInitials(userData.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="text-sm font-medium text-sidebar-foreground truncate">
              {userData?.name || 'User'}
            </span>
            <span className="text-xs text-sidebar-foreground/70">
              {userData?.role ? ROLE_LABELS[userData.role] : 'Staff'}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
