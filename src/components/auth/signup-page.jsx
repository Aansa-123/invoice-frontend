import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, FileText } from "lucide-react"

export default function SignupPage({ setIsLoggedIn, setHasOrg, setOrgId, setUserEmail, setUserId, setUserRole, setGlobalRole }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || data.error || "Registration failed")
        return
      }

      localStorage.setItem("token", data.token)
      setHasOrg(!!data.user?.currentOrganization)
      setOrgId(data.user?.currentOrganization?._id || data.user?.currentOrganization || "")
      setUserEmail(data.user?.email || "")
      setUserId(data.user?.id || data.user?._id || "")
      setUserRole(data.user?.orgRole || data.user?.role || "Owner")
      setGlobalRole(data.user?.role || "User")
      setIsLoggedIn(true)
      navigate("/setup")
    } catch (err) {
      setError("Connection error. Make sure backend is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0B21] flex flex-col items-center justify-center p-4 font-sans text-white">
      {/* Header Logo - Reduced size */}
      <div className="mb-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-[#A885FF] to-[#00CFE8] rounded-lg flex items-center justify-center shadow-lg">
          <FileText className="text-white" size={18} />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Invoice Pro</h1>
      </div>

      <Card className="w-full max-w-[380px] bg-[#1A1635]/50 border-[#2D2D44] backdrop-blur-xl shadow-2xl overflow-hidden rounded-[1.5rem]">
        <div className="p-7">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Create account</h2>
              </div>

          {error && (
            <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 bg-[#0D0B21] border-[#2D2D44] text-white text-sm placeholder:text-slate-600 rounded-xl focus:ring-[#7B5BE4] focus:border-[#7B5BE4]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-[#0D0B21] border-[#2D2D44] text-white text-sm placeholder:text-slate-600 rounded-xl focus:ring-[#7B5BE4] focus:border-[#7B5BE4]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-[#0D0B21] border-[#2D2D44] text-white text-sm placeholder:text-slate-600 rounded-xl focus:ring-[#7B5BE4] focus:border-[#7B5BE4]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-[#A885FF] to-[#00CFE8] hover:opacity-90 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(168,133,255,0.2)] mt-2"
            >
              {isLoading ? "Creating Account..." : (
                <>
                  Create Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-400 text-xs">
              Already have an account?{" "}
              <Link to="/login" className="text-[#7B5BE4] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

