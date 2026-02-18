import { useAuth } from '@/contexts/AuthContext';
import { StaffDashboard } from '@/components/dashboard/StaffDashboard';
import { VerifikatorDashboard } from '@/components/dashboard/VerifikatorDashboard';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default function Dashboard() {
  const { userData } = useAuth();

  switch (userData?.role) {
    case 'admin_gudang':
      return <AdminDashboard />;
    case 'verifikator':
      return <VerifikatorDashboard />;
    default:
      return <StaffDashboard />;
  }
}
