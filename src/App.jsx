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
import MainLayout from "./components/layout/main-layout"
import NotFound from "./components/pages/not-found"

const ProtectedRoute = ({ children, isLoggedIn, isLoading, hasOrg, role, allowedRoles }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (!isLoggedIn) return <Navigate to="/" replace />
  
  // Setup is only for Owners
  if (!hasOrg && role === "Owner" && window.location.pathname !== "/setup") return <Navigate to="/setup" replace />
  
  // Team members without organization (shouldn't happen if invited correctly)
  if (!hasOrg && role !== "Owner") return <div className="flex items-center justify-center min-h-screen font-bold">Access Denied: No organization found.</div>

  // Skip setup for non-owners
  if (role !== "Owner" && window.location.pathname === "/setup") return <Navigate to="/dashboard" replace />

  // RBAC check
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasOrg, setHasOrg] = useState(false)
  const [userRole, setUserRole] = useState("")
  const [userEmail, setUserEmail] = useState("")
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
        setUserRole(data.user.role)
        setUserEmail(data.user.email)
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
        <Route path="/" element={isLoggedIn ? (hasOrg ? <Navigate to="/dashboard" replace /> : <Navigate to="/setup" replace />) : <LoginPage setIsLoggedIn={setIsLoggedIn} setHasOrg={setHasOrg} setUserEmail={setUserEmail} setUserRole={setUserRole} />} />
        <Route path="/logout" element={<LogoutPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/setup" element={
          <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading} hasOrg={true} role={userRole} allowedRoles={["Owner"]}>
            <SetupWizard userEmail={userEmail} />
          </ProtectedRoute>
        } />
        
        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading} hasOrg={hasOrg} role={userRole}><MainLayout userRole={userRole} /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/invoices" element={<InvoicesPage userRole={userRole} />} />
          <Route path="/payments" element={<PaymentsPage userRole={userRole} />} />
          <Route path="/clients" element={<ClientsPage userRole={userRole} />} />
          <Route path="/reports" element={<ReportsPage userRole={userRole} />} />
          <Route path="/team" element={
            <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading} hasOrg={hasOrg} role={userRole} allowedRoles={["Owner", "Admin"]}>
              <TeamPage />
            </ProtectedRoute>
          } />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={
            <ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading} hasOrg={hasOrg} role={userRole} allowedRoles={["Owner", "Admin"]}>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
