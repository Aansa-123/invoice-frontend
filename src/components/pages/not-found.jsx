import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button.jsx"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <p className="text-2xl font-semibold text-foreground">Page Not Found</p>
          <p className="text-muted-foreground max-w-md">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        <Button onClick={() => navigate("/dashboard")} className="gap-2">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )
}
