import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function LogoutPage({ setIsLoggedIn }) {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    navigate("/", { replace: true })
  }, [navigate, setIsLoggedIn])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}
