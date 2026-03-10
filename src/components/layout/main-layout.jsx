import { useState, useEffect } from "react"
import { LogOut, Menu, AlertTriangle, Bell } from "lucide-react"
import { Outlet, useNavigate, Link } from "react-router-dom"
import { Button } from "../ui/button.jsx"
import Sidebar from "./sidebar.jsx"
import pusher from "../../utils/pusher"
import { toast } from "sonner"

export default function MainLayout({ userId, userRole, userPlan, isAdmin = false, isExpired = false, graceDays = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showExpiredPopup, setShowExpiredPopup] = useState(isExpired)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) return

    // Admin channel
    if (isAdmin) {
      const adminChannel = pusher.subscribe("admin-channel")
      adminChannel.bind("new-org-request", (data) => {
        toast.info("New Organization Request", {
          description: data.message,
          action: {
            label: "View Requests",
            onClick: () => navigate("/admin/approvals")
          },
          duration: 10000,
        })
      })

      return () => {
        pusher.unsubscribe("admin-channel")
      }
    } else {
      // User channel
      const userChannel = pusher.subscribe(`user-${userId}-channel`)
      userChannel.bind("org-status-updated", (data) => {
        const isApproved = data.status === "approved"
        
        toast[isApproved ? "success" : "error"](
          isApproved ? "Organization Approved!" : "Organization Rejected",
          {
            description: data.message,
            duration: 10000,
          }
        )

        // Refresh the page or update state if needed
        if (isApproved) {
          // You might want to refresh organization list or just show the toast
          // window.location.reload()
        }
      })

      return () => {
        pusher.unsubscribe(`user-${userId}-channel`)
      }
    }
  }, [userId, isAdmin, navigate])

  const handleLogout = () => {
    navigate("/logout")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userRole={userRole}
        userPlan={userPlan}
        isAdmin={isAdmin}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Expiration Modal/Popup */}
        {showExpiredPopup && !isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="text-orange-600 dark:text-orange-400" size={40} />
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-4">Your subscription has expired.</h2>
                
                {graceDays > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg font-medium mb-4">
                    Admin granted you {graceDays} grace days.
                  </div>
                )}
                
                <p className="text-muted-foreground mb-8">
                  Upgrade now to continue using Invoice Pro and access all premium features without limits.
                </p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button 
                    variant="outline"
                    onClick={() => setShowExpiredPopup(false)}
                    className="w-full py-6"
                  >
                    Later
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowExpiredPopup(false)
                      navigate("/subscription")
                    }}
                    className="w-full bg-primary hover:bg-primary/90 py-6 font-bold"
                  >
                    Upgrade Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 hover:bg-muted rounded-lg">
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-foreground">Invoice Management</h1>
          </div>

          <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
            <LogOut size={16} />
            Logout
          </Button>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
