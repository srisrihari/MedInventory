
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, RoleGuard } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Inventory from "./pages/Inventory";
import Forecasting from "./pages/Forecasting";
import Suppliers from "./pages/Suppliers";
import Bidding from "./pages/Bidding";
import Maintenance from "./pages/Maintenance";
import Expiry from "./pages/Expiry";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Set the page title
  useEffect(() => {
    document.title = "MedInventory - Hospital Inventory Management System";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              
              {/* Inventory Routes - Staff+ Access */}
              <Route path="/inventory" element={
                <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "inventory_manager", "procurement_manager", "staff_user"]}>
                  <Inventory />
                </ProtectedRoute>
              } />
              
              <Route path="/forecasting" element={
                <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "inventory_manager"]}>
                  <Forecasting />
                </ProtectedRoute>
              } />
              
              {/* Supplier & Procurement Routes */}
              <Route path="/suppliers" element={
                <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "procurement_manager", "inventory_manager"]}>
                  <Suppliers />
                </ProtectedRoute>
              } />
              
              <Route path="/bidding" element={
                <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "procurement_manager"]}>
                  <Bidding />
                </ProtectedRoute>
              } />
              
              {/* Equipment Routes */}
              <Route path="/maintenance" element={
                <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "equipment_manager"]}>
                  <Maintenance />
                </ProtectedRoute>
              } />
              
              {/* General Routes - Most Roles */}
              <Route path="/expiry" element={
                <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "inventory_manager", "staff_user"]}>
                  <Expiry />
                </ProtectedRoute>
              } />
              
              {/* Reporting Routes */}
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "inventory_manager", "procurement_manager", "equipment_manager", "auditor", "viewer"]}>
                  <Reports />
                </ProtectedRoute>
              } />
              
              {/* Settings - Admin Only */}
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={["super_admin", "hospital_admin"]}>
                  <Settings />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
