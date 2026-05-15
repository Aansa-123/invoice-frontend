import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Settings, Shield, Mail, Globe, Database, Save, Activity } from "lucide-react"

export default function AdminSettings() {
  const [platformSettings, setPlatformSettings] = useState({
    platformName: "Invoice Pro",
    supportEmail: "support@invoicepro.com",
    contactEmail: "contact@invoicepro.com",
    maintenanceMode: false,
    maxFileUpload: "5MB",
  })

  const [smtpSettings, setSmtpSettings] = useState({
    host: "smtp.mailtrap.io",
    port: "2525",
    user: "user123",
    pass: "********",
  })

  const handlePlatformSubmit = (e) => {
    e.preventDefault()
    alert("Platform settings updated successfully!")
  }

  const handleSmtpSubmit = (e) => {
    e.preventDefault()
    alert("SMTP settings updated successfully!")
  }

  return (
    <div className="p-6 space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
          <Settings className="text-primary" size={22} /> Admin Settings
        </h2>
        <p className="text-xs text-[#71717A] font-bold uppercase tracking-wider ml-1">Configure global platform parameters</p>
      </div>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="bg-[#1A1635] border border-white/[0.05] p-1 rounded-2xl h-12 mb-8 inline-flex">
          <TabsTrigger value="platform" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[#71717A] font-bold text-xs uppercase tracking-widest transition-all">
            <Globe size={14} className="mr-2" /> Platform
          </TabsTrigger>
          <TabsTrigger value="smtp" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[#71717A] font-bold text-xs uppercase tracking-widest transition-all">
            <Mail size={14} className="mr-2" /> SMTP
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[#71717A] font-bold text-xs uppercase tracking-widest transition-all">
            <Shield size={14} className="mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="database" className="rounded-xl px-6 data-[state=active]:bg-primary data-[state=active]:text-white text-[#71717A] font-bold text-xs uppercase tracking-widest transition-all">
            <Database size={14} className="mr-2" /> Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-8 bg-[#1A1635] border border-white/[0.03] rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">General Settings</h3>
                  <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest mt-1">Basic platform identity configuration</p>
                </div>
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary backdrop-blur-md">
                  <Globe size={20} />
                </div>
              </div>
              
              <form onSubmit={handlePlatformSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platformName" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Platform Name</Label>
                    <Input 
                      id="platformName" 
                      value={platformSettings.platformName} 
                      onChange={(e) => setPlatformSettings({...platformSettings, platformName: e.target.value})}
                      className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 text-white rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Support Email</Label>
                    <Input 
                      id="supportEmail" 
                      type="email"
                      value={platformSettings.supportEmail} 
                      onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
                      className="bg-white/[0.03] border-white/[0.08] focus:border-primary/50 text-white rounded-xl h-11"
                    />
                  </div>
                </div>
                
                <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${platformSettings.maintenanceMode ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-white/5 text-[#71717A] border-white/5'} border`}>
                      <Activity size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white tracking-tight">Maintenance Mode</p>
                      <p className="text-[10px] text-[#71717A] font-medium tracking-tight mt-0.5">Disable all public access to the platform</p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      id="maintenanceMode" 
                      checked={platformSettings.maintenanceMode}
                      onChange={(e) => setPlatformSettings({...platformSettings, maintenanceMode: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-10 h-11 border-0 shadow-lg shadow-primary/20 gap-2 font-bold uppercase tracking-widest text-[10px]">
                    <Save size={14} /> Save Changes
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Ambient glow */}
            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          </Card>
        </TabsContent>

        <TabsContent value="smtp" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-8 bg-[#1A1635] border border-white/[0.03] rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">SMTP Configuration</h3>
                  <p className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest mt-1">Outbound email service credentials</p>
                </div>
                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500 backdrop-blur-md">
                  <Mail size={18} />
                </div>
              </div>

              <form onSubmit={handleSmtpSubmit} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="smtpHost" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Host</Label>
                    <Input 
                      id="smtpHost" 
                      value={smtpSettings.host} 
                      onChange={(e) => setSmtpSettings({...smtpSettings, host: e.target.value})}
                      className="bg-white/[0.03] border-white/[0.08] focus:border-purple-500/50 text-white rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Port</Label>
                    <Input 
                      id="smtpPort" 
                      value={smtpSettings.port} 
                      onChange={(e) => setSmtpSettings({...smtpSettings, port: e.target.value})}
                      className="bg-white/[0.03] border-white/[0.08] focus:border-purple-500/50 text-white rounded-xl h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Username</Label>
                    <Input 
                      id="smtpUser" 
                      value={smtpSettings.user} 
                      onChange={(e) => setSmtpSettings({...smtpSettings, user: e.target.value})}
                      className="bg-white/[0.03] border-white/[0.08] focus:border-purple-500/50 text-white rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPass" className="text-[10px] font-black text-[#71717A] uppercase tracking-widest ml-1">Password</Label>
                    <Input 
                      id="smtpPass" 
                      type="password"
                      value={smtpSettings.pass} 
                      onChange={(e) => setSmtpSettings({...smtpSettings, pass: e.target.value})}
                      className="bg-white/[0.03] border-white/[0.08] focus:border-purple-500/50 text-white rounded-xl h-11"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl px-8 h-11 border-0 shadow-lg shadow-purple-500/20 gap-2 font-bold uppercase tracking-widest text-[10px]">
                    <Save size={14} /> Update Credentials
                  </Button>
                  <Button variant="outline" type="button" className="bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl h-11 px-6 border-0 transition-all font-bold uppercase tracking-widest text-[10px]">
                    Test Connection
                  </Button>
                </div>
              </form>
            </div>
            
            {/* Ambient glow */}
            <div className="absolute -left-20 -top-20 w-60 h-60 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-20 bg-[#1A1635] border border-white/[0.03] rounded-3xl shadow-2xl text-center">
            <div className="inline-flex p-5 rounded-3xl bg-amber-500/5 text-amber-500/50 border border-amber-500/10 mb-6 backdrop-blur-md">
              <Shield size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">Advanced Security</h3>
            <p className="text-[#71717A] font-medium tracking-tight max-w-sm mx-auto mt-2 italic text-xs">
              Access control protocols and multi-factor authentication parameters configuration coming soon.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="animate-in slide-in-from-bottom-4 duration-500">
          <Card className="p-20 bg-[#1A1635] border border-white/[0.03] rounded-3xl shadow-2xl text-center">
            <div className="inline-flex p-5 rounded-3xl bg-emerald-500/5 text-emerald-500/50 border border-emerald-500/10 mb-6 backdrop-blur-md">
              <Database size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">Database Architecture</h3>
            <p className="text-[#71717A] font-medium tracking-tight max-w-sm mx-auto mt-2 italic text-xs">
              Automated backup systems and performance optimization toolsets currently under development.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
