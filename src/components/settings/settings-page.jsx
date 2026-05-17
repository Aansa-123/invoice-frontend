
import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Building2, FileText, Lock, Upload, ShieldCheck, Globe, Mail, Phone, MapPin, Save, Check, X } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("business")
  const [settings, setSettings] = useState({
    businessName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logo: "",
    currency: "USD",
    taxPercentage: 0,
    defaultNotes: "Thank you for your business",
    paymentTerms: "Due on Receipt",
    categories: ["General"],
  })
  
  const [newCategory, setNewCategory] = useState("")
  
  const [showSuccess, setShowSuccess] = useState(false)
  
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
    if (e) e.preventDefault()
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
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
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
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
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
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A855F7]"></div>
      </div>
    )
  }

  const menuItems = [
    { id: "business", label: "Business", sub: "Company details", icon: Building2 },
    { id: "invoices", label: "Invoices", sub: "Defaults & templates", icon: FileText },
    { id: "security", label: "Security", sub: "Password & access", icon: Lock },
  ]

  return (
    <div className="space-y-4 p-4 lg:p-6 bg-transparent min-h-full pb-24 relative">
      <div className="space-y-0.5">
        <h1 className="text-lg font-black text-white tracking-tight">Settings</h1>
        <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Configure your business preferences and account</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 text-left group ${
                activeTab === item.id 
                  ? "bg-[#A855F7] text-white shadow-lg shadow-[#A855F7]/20" 
                  : "bg-[#14142B] text-[#94A3B8] border border-white/[0.03] hover:border-white/10 hover:bg-white/5"
              }`}
            >
              <div className={`p-2 rounded-xl ${activeTab === item.id ? "bg-white/20" : "bg-white/5"} transition-colors`}>
                <item.icon size={18} />
              </div>
              <div>
                <p className={`text-[11px] font-black ${activeTab === item.id ? "text-white" : "text-white/80"}`}>{item.label}</p>
                <p className={`text-[8px] font-medium ${activeTab === item.id ? "text-white/70" : "text-[#94A3B8]"}`}>{item.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card className="bg-[#14142B] border border-white/[0.03] rounded-[2rem] p-6 lg:p-8 shadow-xl min-h-[500px]">
            {activeTab === "business" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col md:flex-row gap-10">
                  {/* Logo Section */}
                  <div className="w-full md:w-48 space-y-4">
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wider">Company Profile</h3>
                    <p className="text-[8px] text-[#94A3B8]">Shown on invoices and receipts</p>
                    
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-2xl bg-[#0B0B1E] border-2 border-dashed border-white/5 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-[#A855F7]/30">
                        {settings.logo ? (
                          <img src={settings.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                        ) : (
                          <>
                            <div className="p-3 rounded-full bg-white/5 text-[#94A3B8] mb-2 group-hover:text-[#A855F7] transition-colors">
                              <Upload size={20} />
                            </div>
                            <span className="text-[10px] font-black text-[#94A3B8] uppercase">Upload Logo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          disabled={uploading}
                        />
                      </div>
                      <p className="text-[8px] text-[#94A3B8]/60 mt-3 text-center italic">Square PNG/JPG (min 400x400)</p>
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="flex-1 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Company Name</label>
                        <div className="relative">
                          <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                          <Input
                            value={settings.businessName}
                            onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                            className="pl-10 bg-[#0B0B1E]/50 border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white placeholder:text-[#94A3B8]"
                            placeholder="Your business name"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Official Email</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                          <Input
                            type="email"
                            value={settings.email}
                            readOnly
                            className="pl-10 bg-[#0B0B1E]/50 border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white/50 placeholder:text-[#94A3B8] cursor-not-allowed"
                            placeholder="billing@company.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                          <Input
                            value={settings.phone}
                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                            className="pl-10 bg-[#0B0B1E]/50 border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white placeholder:text-[#94A3B8]"
                            placeholder="+1 555-0123"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Website</label>
                        <div className="relative">
                          <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                          <Input
                            value={settings.website}
                            onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                            className="pl-10 bg-[#0B0B1E]/50 border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white placeholder:text-[#94A3B8]"
                            placeholder="https://yourcompany.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Business Address</label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3.5 top-4 text-[#94A3B8]" />
                          <textarea
                            value={settings.address}
                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            className="w-full pl-10 pt-3.5 pb-3.5 bg-[#0B0B1E]/50 border border-white/[0.05] rounded-xl text-xs font-bold text-white placeholder:text-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#A855F7]/30 min-h-[80px] resize-none"
                            placeholder="Street, City, ZIP, Country"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "invoices" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">Invoice Defaults</h3>
                    <p className="text-[8px] text-[#94A3B8]">Applied to every new invoice you create</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Product Categories</label>
                      <div className="flex gap-2">
                        <Input
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newCategory.trim()) {
                                setSettings({ ...settings, categories: [...(settings.categories || []), newCategory.trim()] });
                                setNewCategory("");
                              }
                            }
                          }}
                          placeholder="Add new category (e.g. Beverages)"
                          className="bg-[#0B0B1E]/50 border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white flex-1"
                        />
                        <Button 
                          type="button"
                          onClick={() => {
                            if (newCategory.trim()) {
                              setSettings({ ...settings, categories: [...(settings.categories || []), newCategory.trim()] });
                              setNewCategory("");
                            }
                          }}
                          className="h-10 px-4 bg-[#A855F7] hover:bg-[#A855F7]/80 text-white rounded-xl text-[10px] font-bold"
                        >
                          Add
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {(settings.categories || []).map((cat, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-[#0B0B1E] border border-white/5 px-3 py-1.5 rounded-lg group transition-all hover:border-[#A855F7]/30">
                            <span className="text-[10px] font-bold text-white/80">{cat}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                const newCats = settings.categories.filter((_, i) => i !== idx);
                                setSettings({ ...settings, categories: newCats });
                              }}
                              className="text-[#94A3B8] hover:text-rose-400 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Default Currency</label>
                      <select
                        value={settings.currency}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="w-full bg-[#0B0B1E]/50 border border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white px-3 focus:outline-none focus:ring-1 focus:ring-[#A855F7]/30 appearance-none"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="PKR">PKR (Rs)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Default Tax Rate (%)</label>
                      <Input
                        type="number"
                        value={settings.taxPercentage}
                        onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })}
                        className="bg-[#0B0B1E]/50 border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Default Notes</label>
                      <textarea
                        value={settings.defaultNotes}
                        onChange={(e) => setSettings({ ...settings, defaultNotes: e.target.value })}
                        className="w-full px-3 py-2 bg-[#0B0B1E]/50 border border-white/[0.05] rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-[#A855F7]/30 min-h-[60px] resize-none"
                      />
                    </div>
                  </div>
                </div>

               
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-wider mb-1">Change Password</h3>
                    <p className="text-[8px] text-[#94A3B8]">Update your login credentials</p>
                  </div>

                  <div className="space-y-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Current Password</label>
                      <Input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="bg-[#0B0B1E]/50 border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">New Password</label>
                      <Input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="bg-[#0B0B1E]/50 border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest ml-1">Confirm New Password</label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="bg-[#0B0B1E]/50 border-white/[0.05] h-10 rounded-xl text-xs font-bold text-white"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          onClick={handleSettingsSubmit}
          disabled={saving}
          className="h-10 px-6 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-[#A855F7]/30 border-none transition-all active:scale-95 group"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
          ) : (
            <Save size={16} className="mr-2 group-hover:scale-110 transition-transform" />
          )}
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <p className="text-[10px] text-[#94A3B8] font-medium text-center mt-8 italic">Changes are saved to your account immediately.</p>
    </div>
  )
}
