import { useState } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { Settings, Shield, Mail, Globe, Database } from "lucide-react"

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
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Settings className="text-primary" /> Admin Settings
      </h2>

      <Tabs defaultValue="platform" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="platform" className="gap-2"><Globe size={16} /> Platform</TabsTrigger>
          <TabsTrigger value="smtp" className="gap-2"><Mail size={16} /> Email (SMTP)</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield size={16} /> Security</TabsTrigger>
          <TabsTrigger value="database" className="gap-2"><Database size={16} /> Database</TabsTrigger>
        </TabsList>

        <TabsContent value="platform">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">General Settings</h3>
            <form onSubmit={handlePlatformSubmit} className="space-y-4 max-w-xl">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input 
                  id="platformName" 
                  value={platformSettings.platformName} 
                  onChange={(e) => setPlatformSettings({...platformSettings, platformName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input 
                  id="supportEmail" 
                  type="email"
                  value={platformSettings.supportEmail} 
                  onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="maintenanceMode" 
                  checked={platformSettings.maintenanceMode}
                  onChange={(e) => setPlatformSettings({...platformSettings, maintenanceMode: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
              </div>
              <div className="pt-4">
                <Button type="submit">Save Platform Settings</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="smtp">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">SMTP Configuration</h3>
            <form onSubmit={handleSmtpSubmit} className="space-y-4 max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Host</Label>
                  <Input 
                    id="smtpHost" 
                    value={smtpSettings.host} 
                    onChange={(e) => setSmtpSettings({...smtpSettings, host: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Port</Label>
                  <Input 
                    id="smtpPort" 
                    value={smtpSettings.port} 
                    onChange={(e) => setSmtpSettings({...smtpSettings, port: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpUser">Username</Label>
                <Input 
                  id="smtpUser" 
                  value={smtpSettings.user} 
                  onChange={(e) => setSmtpSettings({...smtpSettings, user: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPass">Password</Label>
                <Input 
                  id="smtpPass" 
                  type="password"
                  value={smtpSettings.pass} 
                  onChange={(e) => setSmtpSettings({...smtpSettings, pass: e.target.value})}
                />
              </div>
              <div className="pt-4 flex gap-2">
                <Button type="submit">Save SMTP Settings</Button>
                <Button variant="outline" type="button">Test Connection</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground italic">
              Access control and security parameters configuration coming soon.
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card className="p-6">
            <div className="text-center py-12 text-muted-foreground italic">
              Database backups and optimization tools coming soon.
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
