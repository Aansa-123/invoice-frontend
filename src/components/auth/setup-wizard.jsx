import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { 
  Check, 
  ChevronRight, 
  Building2, 
  Globe, 
  Users, 
  FileText, 
  ChevronLeft,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  Sparkles
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const steps = [
  { id: 1, name: "Business Info", icon: Building2 },
  { id: 2, name: "Currency & Tax", icon: Globe },
  { id: 3, name: "First Client", icon: Users },
  { id: 4, name: "First Invoice", icon: FileText },
]

export default function SetupWizard({ userEmail }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    // Step 1: Business Info
    name: "",
    email: userEmail || "",
    phone: "",
    address: "",
    // Step 2: Currency & Tax
    currency: "USD",
    taxNumber: "",
    // Step 3: First Client
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    // Step 4: First Invoice
    invoiceNumber: "INV-001",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    itemName: "Service Fee",
    itemQuantity: 1,
    itemPrice: 100,
  })

  useEffect(() => {
    if (userEmail) {
      setFormData(prev => ({ ...prev, email: userEmail }))
    }
  }, [userEmail])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError("")
    const token = localStorage.getItem("token")

    try {
      const orgRes = await fetch(`${import.meta.env.VITE_API_URL}/api/organizations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          currency: formData.currency,
          taxNumber: formData.taxNumber,
        }),
      })

      if (!orgRes.ok) {
        const data = await orgRes.json()
        throw new Error(data.error || "Failed to create organization")
      }

      if (formData.clientName.trim()) {
        const clientRes = await fetch(`${import.meta.env.VITE_API_URL}/api/clients`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.clientName,
            email: formData.clientEmail,
            phone: formData.clientPhone,
            address: formData.clientAddress,
          }),
        })

        if (clientRes.ok) {
          const clientData = await clientRes.json()
          const clientId = clientData.data._id

          if (formData.itemName.trim()) {
            await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                invoiceNumber: formData.invoiceNumber,
                clientId,
                dueDate: formData.dueDate,
                items: [
                  {
                    name: formData.itemName,
                    quantity: formData.itemQuantity,
                    price: formData.itemPrice,
                  },
                ],
                status: "Pending",
              }),
            })
          }
        }
      }

      navigate("/dashboard")
      window.location.reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderStepIcon = (step) => {
    const Icon = step.icon
    const isActive = currentStep === step.id
    const isCompleted = currentStep > step.id

    if (isCompleted) {
      return (
        <div className="w-7 h-7 rounded-full bg-[#27AE60] flex items-center justify-center text-white shadow-[0_0_6px_rgba(39,174,96,0.3)]">
          <Check size={14} />
        </div>
      )
    }

    return (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
        isActive 
          ? "bg-gradient-to-r from-[#A885FF] to-[#00CFE8] text-white shadow-[0_0_10px_rgba(168,133,255,0.4)] scale-110" 
          : "bg-[#1A1635] text-slate-400 border border-[#2D2D44]"
      }`}>
        <Icon size={14} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0B21] flex flex-col items-center justify-center p-4 font-sans text-white">
      {/* Header Logo - Extra Compact */}
      <div className="mb-4 flex items-center gap-1.5">
        <div className="w-6 h-6 bg-gradient-to-br from-[#A885FF] to-[#00CFE8] rounded-md flex items-center justify-center shadow-lg">
          <FileText className="text-white" size={14} />
        </div>
        <h1 className="text-base font-bold tracking-tight text-white">Invoice Pro</h1>
      </div>

      <Card className="w-full max-w-[460px] bg-[#1A1635]/50 border-[#2D2D44] backdrop-blur-xl shadow-2xl overflow-hidden rounded-[1rem]">
        {/* Step Indicators - Extra Compact */}
        <div className="px-5 pt-6 pb-2">
          <div className="flex justify-between items-center relative">
            {/* Background Line */}
            <div className="absolute top-3.5 left-0 w-full h-[1px] bg-[#2D2D44] z-0" />
            
            {/* Progress Line */}
            <div 
              className="absolute top-3.5 left-0 h-[1px] bg-[#27AE60] z-0 transition-all duration-500" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center gap-1">
                {renderStepIcon(step)}
                <span className={`text-[7px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  currentStep >= step.id ? "text-white" : "text-slate-500"
                }`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {error && <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-[9px]">{error}</div>}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Business Info */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A885FF]/20 to-[#00CFE8]/20 flex items-center justify-center">
                      <Building2 className="text-[#A885FF]" size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Business Information</h2>
                      <p className="text-slate-400 text-[10px]">Tell us about your company for professional invoices.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Business Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          placeholder="Acme Inc." 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Business Email</label>
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="email" 
                          type="email" 
                          value={formData.email} 
                          readOnly 
                          className="pl-8 h-9 bg-[#0D0B21]/50 border-[#2D2D44] text-slate-400 text-[11px] rounded-lg cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleChange} 
                          placeholder="+1 (555) 000-0000" 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="address" 
                          value={formData.address} 
                          onChange={handleChange} 
                          placeholder="123 Main St, City" 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Currency & Tax */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A885FF]/20 to-[#00CFE8]/20 flex items-center justify-center">
                      <Globe className="text-[#A885FF]" size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Currency & Tax</h2>
                      <p className="text-slate-400 text-[10px]">Configure your default financial settings.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Currency</label>
                      <div className="relative">
                        <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3 pointer-events-none" />
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleChange}
                          className="w-full pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4] focus:outline-none appearance-none"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="INR">INR (₹)</option>
                          <option value="PKR">PKR (Rs)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Tax Number</label>
                      </div>
                      <div className="relative">
                        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="taxNumber" 
                          value={formData.taxNumber} 
                          onChange={handleChange} 
                          placeholder="VAT-1234" 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gradient-to-r from-[#A885FF]/10 to-[#00CFE8]/10 border border-[#A885FF]/20 rounded-lg flex items-start gap-2">
                    <div className="p-1 bg-[#A885FF]/20 rounded-md">
                      <Sparkles className="text-[#A885FF]" size={12} />
                    </div>
                    <p className="text-[10px] text-slate-200">
                      <strong className="text-white">Tip:</strong> Tax number will appear on invoices.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: First Client */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A885FF]/20 to-[#00CFE8]/20 flex items-center justify-center">
                      <Users className="text-[#A885FF]" size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">First client</h2>
                      <p className="text-slate-400 text-[10px]">You can manage more clients later.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Client Name</label>
                      <div className="relative">
                        <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="clientName" 
                          value={formData.clientName} 
                          onChange={handleChange} 
                          placeholder="John Doe" 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Client Email</label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="clientEmail" 
                          type="email" 
                          value={formData.clientEmail} 
                          onChange={handleChange} 
                          placeholder="john@example.com" 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Client Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="clientPhone" 
                          value={formData.clientPhone} 
                          onChange={handleChange} 
                          placeholder="+1 (555) 111-2222" 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Client Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="clientAddress" 
                          value={formData.clientAddress} 
                          onChange={handleChange} 
                          placeholder="456 Client St" 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: First Invoice */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A885FF]/20 to-[#00CFE8]/20 flex items-center justify-center">
                      <FileText className="text-[#A885FF]" size={16} />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Create first invoice</h2>
                      <p className="text-slate-400 text-[10px]">Get ready for your first payment.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Invoice No</label>
                      <div className="relative">
                        <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3" />
                        <Input 
                          name="invoiceNumber" 
                          value={formData.invoiceNumber} 
                          onChange={handleChange} 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Due Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 h-3 w-3 pointer-events-none" />
                        <Input 
                          name="dueDate" 
                          type="date" 
                          value={formData.dueDate} 
                          onChange={handleChange} 
                          className="pl-8 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4] block w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">Invoice Item</label>
                    <div className="flex gap-2">
                      <div className="flex-[3]">
                        <Input 
                          name="itemName" 
                          value={formData.itemName} 
                          onChange={handleChange} 
                          placeholder="Service Fee"
                          className="h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                      <div className="flex-1 relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-[11px] font-bold">$</span>
                        <Input 
                          name="itemPrice" 
                          type="number" 
                          value={formData.itemPrice} 
                          onChange={handleChange} 
                          className="pl-5 h-9 bg-[#0D0B21] border-[#2D2D44] text-white text-[11px] rounded-lg focus:ring-[#7B5BE4]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-[#1A1635] to-[#0D0B21] border border-[#2D2D44] rounded-lg flex justify-between items-center shadow-inner">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Total Due</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-[#A885FF] to-[#00CFE8] bg-clip-text text-transparent">
                      ${Number(formData.itemPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls - Extra Compact */}
          <div className="mt-6 pt-4 border-t border-[#2D2D44] flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={handleBack}
              className={`h-8 px-3 border-[#2D2D44] text-slate-400 hover:text-white hover:bg-[#2D2D44] rounded-lg flex items-center gap-1 text-[10px] ${
                currentStep === 1 ? "invisible" : ""
              }`}
            >
              <ChevronLeft size={12} /> Back
            </Button>

            <div className="flex items-center gap-3">
              {currentStep >= 3 && (
                <button 
                  onClick={handleNext} 
                  disabled={loading}
                  className="text-slate-400 hover:text-white transition-colors text-[10px] font-medium underline-offset-2 hover:underline"
                >
                  {currentStep === 4 ? "skip for now and finish setup" : "Skip for now"}
                </button>
              )}
              <Button 
                onClick={handleNext} 
                disabled={loading} 
                className="h-9 px-5 bg-gradient-to-r from-[#A885FF] to-[#00CFE8] hover:opacity-90 text-white font-bold rounded-lg flex items-center gap-1 text-[11px] transition-all shadow-[0_0_8px_rgba(168,133,255,0.2)]"
              >
                {loading ? "Saving..." : currentStep === 4 ? (
                  <>
                    <Sparkles size={12} /> Finish Setup
                  </>
                ) : (
                  <>
                    Continue <ChevronRight size={12} />
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-slate-500 text-[9px]">
              Step {currentStep} of 4 • You can change everything later
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
