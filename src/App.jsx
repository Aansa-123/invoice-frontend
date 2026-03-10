import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./components/auth/login-page"
import LogoutPage from "./components/auth/logout-page"
import SetupWizard from "./components/auth/setup-wizard"
import DashboardContent from "./components/dashboard/dashboard-content"
import InvoicesPage from "./components/invoices/invoices-page"
import ClientsPage from "./components/clients/clients-page"
import PaymentsPage from "./components/payments/payments-page"
import ReportsPage from "./components/reports/reports-page"
import TeamPage from "./components/team/TeamPage"
import HistoryPage from "./components/history/HistoryPage"
import SettingsPage from "./components/settings/settings-page"
import SubscriptionPage from "./components/subscription/SubscriptionPage"
import MainLayout from "./components/layout/main-layout"
import NotFound from "./components/pages/not-found"
import AdminDashboard from "./components/admin/AdminDashboard"
import AdminUsers from "./components/admin/AdminUsers"
import AdminOrganizations from "./components/admin/AdminOrganizations"
import AdminSubscriptions from "./components/admin/AdminSubscriptions"
import AdminPlans from "./components/admin/AdminPlans"
import AdminPayments from "./components/admin/AdminPayments"
import AdminApprovals from "./components/admin/AdminApprovals"
import AdminLogs from "./components/admin/AdminLogs"
import AdminSettings from "./components/admin/AdminSettings"
import { Toaster } from "sonner"

const ProtectedRoute = ({ children, isLoggedIn, isLoading, hasOrg, role, globalRole, allowedRoles }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!isLoggedIn) return <Navigate to="/" replace />
  
  // Admin redirect
  if (globalRole === "Admin" && !window.location.pathname.startsWith("/admin") && window.location.pathname !== "/logout") {
    return <Navigate to="/admin" replace />
  }

  // Setup is only for Owners
  if (!hasOrg && role === "Owner" && window.location.pathname !== "/setup" && globalRole !== "Admin") return <Navigate to="/setup" replace />
  
  // Team members without organization (shouldn't happen if invited correctly)
  if (!hasOrg && role !== "Owner" && globalRole !== "Admin") return <div className="flex items-center justify-center min-h-screen font-bold">Access Denied: No organization found.</div>

  // Skip setup for non-owners
  if (role !== "Owner" && window.location.pathname === "/setup") return <Navigate to="/dashboard" replace />

  // RBAC check
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={globalRole === "Admin" ? "/admin" : "/dashboard"} replace />
  }
  
  return children
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasOrg, setHasOrg] = useState(false)
  const [userId, setUserId] = useState("")
  const [userRole, setUserRole] = useState("")
  const [globalRole, setGlobalRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userPlan, setUserPlan] = useState("Free")
  const [isExpired, setIsExpired] = useState(false)
  const [graceDays, setGraceDays] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setIsLoggedIn(false)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(true)
        setHasOrg(!!data.user.currentOrganization)
        setUserId(data.user._id || data.user.id)
        setUserRole(data.user.orgRole || data.user.role) // Default back to role if orgRole not found
        setGlobalRole(data.user.role)
        setUserEmail(data.user.email)
        setUserPlan(data.user.plan || "Free")
        setIsExpired(data.user.isSubscriptionExpired)
        setGraceDays(data.user.currentOrganization?.subscription?.graceDays || 0)
      } else {
        localStorage.removeItem("token")
        setIsLoggedIn(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          isLoggedIn ? (
            globalRole === "Admin" ? (
              <Navigate to="/admin" replace />
            ) : hasOrg ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/setup" replace />
            )
          ) : (
            <LoginPage 
              setIsLoggedIn={setIsLoggedIn} 
              setHasOrg={setHasOrg} 
              setUserEmail={setUserEmail} 
              setUserId={setUserId}
              setUserRole={setUserRole} 
              setGlobalRole={setGlobalRole} 
            />
          )
        } />
        <Route path="/logout" element={<LogoutPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/setup" element={
          <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading} hasOrg={true} role={userRole} globalRole={globalRole} allowedRoles={["Owner"]}>
            <SetupWizard userEmail={userEmail} />
          </ProtectedRoute>
        } />
        
        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading} hasOrg={hasOrg} role={userRole} globalRole={globalRole}><MainLayout userId={userId} userRole={userRole} userPlan={userPlan} isExpired={isExpired} graceDays={graceDays} /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/invoices" element={<InvoicesPage userRole={userRole} />} />
          <Route path="/payments" element={<PaymentsPage userRole={userRole} />} />
          <Route path="/clients" element={<ClientsPage userRole={userRole} />} />
          <Route path="/reports" element={<ReportsPage userPlan={userPlan} />} />
          <Route path="/team" element={
            <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading} hasOrg={hasOrg} role={userRole} globalRole={globalRole} allowedRoles={["Owner", "Admin"]}>
              <TeamPage userPlan={userPlan} />
            </ProtectedRoute>
          } />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/settings" element={
            <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading} hasOrg={hasOrg} role={userRole} globalRole={globalRole} allowedRoles={["Owner", "Admin"]}>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading} hasOrg={true} role={globalRole} globalRole={globalRole} allowedRoles={["Admin"]}><MainLayout userId={userId} userRole="Admin" isAdmin={true} /></ProtectedRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/orgs" element={<AdminOrganizations />} />
          <Route path="/admin/plans" element={<AdminPlans />} />
          <Route path="/admin/subscriptions" element={<AdminSubscriptions />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  )
}
