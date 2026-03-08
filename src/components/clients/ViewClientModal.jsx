
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { X, Mail, Phone, MapPin, FileText, Plus, User } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function ViewClientModal({ isOpen, onClose, client }) {
  const navigate = useNavigate()

  if (!isOpen || !client) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
          <h2 className="text-2xl font-bold text-foreground">Client Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info Table section */}
            <div className="lg:col-span-2">
              <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="w-1/3 p-4 bg-muted/30 font-semibold text-muted-foreground border-r border-border">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-primary" />
                          <span>NAME</span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground font-semibold text-lg">{client.name}</td>
                    </tr>
                    
                    <tr className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="w-1/3 p-4 bg-muted/30 font-semibold text-muted-foreground border-r border-border">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-primary" />
                          <span>EMAIL</span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground">{client.email}</td>
                    </tr>

                    <tr className="border-b border-border hover:bg-muted/10 transition-colors">
                      <td className="w-1/3 p-4 bg-muted/30 font-semibold text-muted-foreground border-r border-border">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-primary" />
                          <span>PHONE</span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground">{client.phone}</td>
                    </tr>

                    <tr className="hover:bg-muted/10 transition-colors">
                      <td className="w-1/3 p-4 bg-muted/30 font-semibold text-muted-foreground border-r border-border align-top">
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin size={16} className="text-primary" />
                          <span>LOCATION</span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground leading-relaxed min-h-[80px]">
                        {client.address || "No address provided"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right side stats/actions */}
            <div className="flex flex-col gap-4">
              <Card className="p-6 border-primary/20 bg-primary/5 shadow-none flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary ring-4 ring-primary/5">
                  <FileText size={36} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Invoices</p>
                  <p className="text-5xl font-black text-foreground mt-1">{client.totalInvoices || 0}</p>
                </div>
              </Card>

              <Button 
                onClick={() => navigate("/invoices", { state: { clientName: client.name } })}
                className="w-full gap-2 h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
              >
                <Plus size={20} />
                Create Invoice
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end bg-muted/10">
          <Button variant="outline" onClick={onClose} className="px-8">
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
