import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import LoginPage from "./components/auth/login-page"
import LogoutPage from "./components/auth/logout-page"
import DashboardContent from "./components/dashboard/dashboard-content"
import InvoicesPage from "./components/invoices/invoices-page"
import ClientsPage from "./components/clients/clients-page"
import SettingsPage from "./components/settings/settings-page"
import MainLayout from "./components/layout/main-layout"
import NotFound from "./components/pages/not-found"

const ProtectedRoute = ({ children, isLoggedIn, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  return isLoggedIn ? children : <Navigate to="/" replace />
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setIsLoggedIn(true)
    }
    setIsLoading(false)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/logout" element={<LogoutPage />} />
        
        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} isLoading={isLoading}><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardContent />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
