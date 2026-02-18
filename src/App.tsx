import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import InputBarang from "@/pages/InputBarang";
import MyItems from "@/pages/MyItems";
import ApprovalCenter from "@/pages/ApprovalCenter";
import Inventory from "@/pages/Inventory";
import UserManagement from "@/pages/UserManagement";
import Reports from "@/pages/Reports";
import MobileDownload from "@/pages/MobileDownload";
import NotFound from "@/pages/NotFound";
import SetupAdminSecret from "@/pages/SetupAdminSecret";
import ForgotPassword from "@/pages/ForgotPassword";

const queryClient = new QueryClient();

// App component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/setup-admin-secret" element={<SetupAdminSecret />} />
            <Route path="/mobile-download" element={<MobileDownload />} />
            
            {/* Protected Routes */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/input-barang" element={<InputBarang />} />
              <Route path="/my-items" element={<MyItems />} />
              <Route path="/approval" element={<ApprovalCenter />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/reports" element={<Reports />} />
              
            </Route>
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
