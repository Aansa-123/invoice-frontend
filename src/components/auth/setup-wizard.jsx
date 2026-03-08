import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Check, ChevronRight, Building2, Globe, Users, FileText } from "lucide-react"

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

  // Pre-fill email when userEmail prop changes
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
      // 1. Create Organization
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

      const orgData = await orgRes.json()
      const organizationId = orgData.data._id

      // 2. Create First Client (Only if name is provided)
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

          // 3. Create First Invoice (Only if invoice items are provided)
          if (formData.itemName.trim()) {
            const invoiceRes = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
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

      // Success!
      navigate("/dashboard")
      window.location.reload() // Refresh to update user state
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-border p-6">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-400"
                    }`}
                  >
                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-primary" : "text-slate-500"
                    } hidden sm:block`}
                  >
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          {/* Step 1: Business Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Business Information</h2>
                <p className="text-slate-500">Tell us about your company.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name</label>
                  <Input name="name" value={formData.name} onChange={handleChange} placeholder="Acme Inc." required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Email</label>
                  <Input 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    readOnly 
                    className="bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-70"
                    placeholder="hello@acme.com" 
                  />
                  <p className="text-[10px] text-slate-400">Linked to your account email</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input name="address" value={formData.address} onChange={handleChange} placeholder="123 Main St, City, Country" />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Currency & Tax */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Currency & Tax</h2>
                <p className="text-slate-500">Configure your financial settings.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Currency</label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full h-10 px-3 py-2 bg-transparent border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="PKR">PKR (Rs)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax Number (Optional)</label>
                  <Input name="taxNumber" value={formData.taxNumber} onChange={handleChange} placeholder="VAT-123456" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: First Client */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Add Your First Client</h2>
                <p className="text-slate-500">You can add more clients later.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Name</label>
                  <Input name="clientName" value={formData.clientName} onChange={handleChange} placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Email</label>
                  <Input name="clientEmail" type="email" value={formData.clientEmail} onChange={handleChange} placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Phone</label>
                  <Input name="clientPhone" value={formData.clientPhone} onChange={handleChange} placeholder="+1 (555) 111-2222" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Client Address</label>
                  <Input name="clientAddress" value={formData.clientAddress} onChange={handleChange} placeholder="456 Client St, City" />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: First Invoice */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Create Your First Invoice</h2>
                <p className="text-slate-500">Let's get you ready for your first payment.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Number</label>
                  <Input name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} />
                </div>
                <div className="col-span-full border-t border-border pt-4">
                  <h3 className="text-sm font-bold mb-3">Invoice Item</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <label className="text-xs">Description</label>
                      <Input name="itemName" value={formData.itemName} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs">Price</label>
                      <Input name="itemPrice" type="number" value={formData.itemPrice} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleBack}
              className={currentStep === 1 ? "invisible" : ""}
            >
              Back
            </Button>
            <div className="flex gap-2">
              {(currentStep === 3 || currentStep === 4) && (
                <Button variant="ghost" onClick={handleNext} disabled={loading}>
                  Skip for now
                </Button>
              )}
              <Button onClick={handleNext} disabled={loading} className="px-8 gap-2">
                {loading ? "Saving..." : currentStep === 4 ? "Finish Setup" : "Continue"}
                {currentStep < 4 && <ChevronRight size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
