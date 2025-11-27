import { useState } from "react"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"

export default function LoginPage({ setIsLoggedIn }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const endpoint = isSignUp ? "/api/auth/register" : "/api/auth/login"
      const payload = isSignUp ? { name, email, password } : { email, password }

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Authentication failed")
        return
      }

      localStorage.setItem("token", data.token)
      setIsLoggedIn(true)
    } catch (err) {
      setError("Connection error. Make sure backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Invoice Pro</h1>
            <p className="text-muted-foreground">{isSignUp ? "Create your account" : "Welcome back"}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError("")
              }}
              className="text-sm text-primary hover:underline"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
