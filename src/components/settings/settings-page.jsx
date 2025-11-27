
import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: "",
    address: "",
    phone: "",
    logo: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("Settings saved successfully!")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your business information</p>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div>
              <label className="text-sm font-medium text-foreground">Business Name</label>
              <Input
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                className="mt-2"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Address</label>
              <Input
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="mt-2"
                placeholder="Business address"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="mt-2"
                placeholder="Business phone"
              />
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
