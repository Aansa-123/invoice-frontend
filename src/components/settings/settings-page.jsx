
import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Building2, FileText, Lock, Upload, CheckCircle2, ShieldCheck, Mail } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
    currency: "USD",
    taxPercentage: 0,
    invoicePrefix: "INV",
    paymentTerms: "Due on Receipt",
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

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
        if (data.data) {
          setSettings({
            ...settings,
            ...data.data
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsSubmit = async (e) => {
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match")
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        alert("Password updated successfully!")
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        const data = await response.json()
        alert(data.error || "Failed to update password")
      }
    } catch (error) {
      console.error("Password update error:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("logo", file)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company/logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSettings({ ...settings, logo: data.url })
        alert("Logo uploaded successfully!")
      }
    } catch (error) {
      console.error("Logo upload error:", error)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your business and security preferences</p>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="business" className="gap-2">
            <Building2 size={16} /> Business
          </TabsTrigger>
          <TabsTrigger value="invoice" className="gap-2">
            <FileText size={16} /> Invoices
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock size={16} /> Security
          </TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business">
          <Card className="p-6">
            <form onSubmit={handleSettingsSubmit} className="space-y-6 max-w-2xl">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <label className="text-sm font-medium text-foreground">Company Name</label>
                    <Input
                      value={settings.businessName}
                      onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Official Email</label>
                    <Input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <Input
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Business Address</label>
                    <textarea
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground text-sm"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="w-full md:w-48 flex flex-col items-center gap-4">
                  <label className="text-sm font-medium text-foreground self-start">Company Logo</label>
                  <div className="w-40 h-40 border-2 border-dashed border-border rounded-xl flex items-center justify-center overflow-hidden relative group">
                    {settings.logo ? (
                      <img src={settings.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="mx-auto text-muted-foreground mb-2" size={24} />
                        <span className="text-xs text-muted-foreground">Upload Logo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Recommended: Square PNG or JPG (min 400x400)
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                  {saving ? "Saving..." : "Save Business Settings"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Invoice Settings */}
        <TabsContent value="invoice">
          <Card className="p-6">
            <form onSubmit={handleSettingsSubmit} className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="PKR">PKR (Rs)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Default Tax (%)</label>
                  <Input
                    type="number"
                    value={settings.taxPercentage}
                    onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Invoice Number Prefix</label>
                  <Input
                    value={settings.invoicePrefix}
                    onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                    className="mt-2"
                    placeholder="e.g. INV"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Default Payment Terms</label>
                  <select
                    value={settings.paymentTerms}
                    onChange={(e) => setSettings({ ...settings, paymentTerms: e.target.value })}
                    className="w-full mt-2 p-2 border border-border rounded-lg bg-background text-foreground text-sm"
                  >
                    <option value="Due on Receipt">Due on Receipt</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90">
                  {saving ? "Saving..." : "Save Invoice Settings"}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="space-y-6 max-w-2xl">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} /> Change Password
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Current Password</label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="mt-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">New Password</label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="mt-2"
                      required
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button type="submit" disabled={saving} variant="outline">
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="text-primary" size={20} /> Email Verification
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Status: Verified</p>
                  <p className="text-xs text-muted-foreground mt-1">Your email is verified for receiving billing notifications.</p>
                </div>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none gap-1">
                  <CheckCircle2 size={12} /> Verified
                </Badge>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} /> Two-Factor Authentication (2FA)
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Protect your account with 2FA</p>
                  <p className="text-xs text-muted-foreground mt-1">Add an extra layer of security to your login process.</p>
                </div>
                <Button variant="outline" size="sm" disabled>Enable 2FA</Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-4 italic">* Coming soon in future updates</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
