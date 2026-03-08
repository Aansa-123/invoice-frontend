
import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { X, Mail, User, Shield, Lock } from "lucide-react"

export default function InviteMemberModal({ isOpen, onClose, onMemberAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Viewer",
    password: Math.random().toString(36).slice(-8) // Generate a random initial password
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onMemberAdded()
        onClose()
        setFormData({
          name: "",
          email: "",
          role: "Viewer",
          password: Math.random().toString(36).slice(-8)
        })
      } else {
        const result = await response.json()
        alert(result.error || "Failed to invite member")
      }
    } catch (error) {
      console.error("Failed to invite member:", error)
      alert("Network error: Failed to invite member")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Invite Team Member</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User size={16} /> Full Name
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mail size={16} /> Email Address
            </label>
            <Input
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="mt-1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Shield size={16} /> Role
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full mt-1 p-2 border border-border rounded-lg bg-background text-foreground text-sm"
            >
              <option value="Admin">Admin</option>
              <option value="Accountant">Accountant</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Lock size={16} /> Initial Password
            </label>
            <div className="flex gap-2 mt-1">
              <Input
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Initial password"
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setFormData({...formData, password: Math.random().toString(36).slice(-8)})}
              >
                Regen
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Give this password to the team member for their first login.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? "Sending Invitation..." : "Invite Member"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
