import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Check, Zap, Star, ShieldCheck, CreditCard, Calendar, Clock, Receipt, ExternalLink, Building2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState("Free")
  const [subscriptionEnd, setSubscriptionEnd] = useState(null)
  const [organizationName, setOrganizationName] = useState("")
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [availablePlans, setAvailablePlans] = useState([])
  
  const [paymentData, setPaymentData] = useState({
    method: "Bank Transfer",
    transactionId: "",
    screenshot: null
  })

  useEffect(() => {
    fetchUserData()
    fetchPaymentHistory()
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/plans`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (response.ok) {
        const data = await response.json()
        setAvailablePlans(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error)
    }
  }

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data.user.plan || "Free")
        setSubscriptionEnd(data.user.currentOrganization?.subscription?.end)
        setOrganizationName(data.user.currentOrganization?.name || "Your Organization")
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
    }
  }

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      if (response.ok) {
        const data = await response.json()
        setPaymentHistory(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch history:", error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleUpgradeClick = (plan) => {
    if (plan.name === "Free") return
    setSelectedPlan(plan)
    setIsPaymentModalOpen(true)
  }

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("planName", selectedPlan.name)
      formData.append("paymentMethod", paymentData.method)
      formData.append("transactionId", paymentData.transactionId)
      if (paymentData.screenshot) {
        formData.append("screenshot", paymentData.screenshot)
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/billing/upgrade`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      if (response.ok) {
        alert(`Payment submitted successfully! Your subscription for ${selectedPlan.name} is now active.`)
        window.location.reload()
      } else {
        const data = await response.json()
        alert(data.error || "Upgrade failed")
      }
    } catch (error) {
      console.error("Upgrade failed", error)
      alert("Upgrade failed. Please check your connection.")
    } finally {
      setLoading(false)
      setIsPaymentModalOpen(false)
    }
  }

  const getPlanConfig = (type) => {
    switch (type) {
      case "Free":
        return { icon: Zap, color: "text-slate-500", duration: "Forever" };
      case "Monthly":
        return { icon: Star, color: "text-blue-500", duration: "per month" };
      case "Yearly":
        return { icon: ShieldCheck, color: "text-purple-500", duration: "per year" };
      case "Lifetime":
        return { icon: ShieldCheck, color: "text-orange-500", duration: "once" };
      default:
        return { icon: Zap, color: "text-slate-500", duration: "Forever" };
    }
  }

  const plans = availablePlans.map(plan => {
    const config = getPlanConfig(plan.type);
    return {
      ...plan,
      ...config,
      price: `$${plan.price}`,
      popular: plan.isRecommended,
      features: plan.features?.length > 0 ? plan.features : getDefaultFeatures(plan.type)
    };
  });

  function getDefaultFeatures(type) {
    switch (type) {
      case "Free":
        return ["1 Invoice per day", "1 Client per day", "Basic Templates"];
      case "Monthly":
        return ["Unlimited Invoices", "Unlimited Clients", "Team Members", "Advanced Reports"];
      case "Yearly":
        return ["Everything in Monthly", "Priority Support", "Custom Branding", "Save 20%"];
      case "Lifetime":
        return ["Everything in Yearly", "Lifetime Access", "No Monthly Fees", "Early Access to Features"];
      default:
        return [];
    }
  }

  return (
    <div className="space-y-4 p-4 lg:p-6 bg-transparent min-h-full max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-lg font-black text-white tracking-tight">Subscription</h1>
          <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Manage your billing and subscription plans</p>
        </div>
      </div>

      {/* 1. Current Plan Section */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-widest">
          <Clock size={16} className="text-[#A855F7]" /> Current Subscription
        </h2>
        <Card className="p-4 border-0 shadow-sm bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Plan</span>
                <Badge variant="default" className="bg-primary text-primary-foreground font-bold text-[10px]">
                  {currentPlan}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {currentPlan === "Free" ? "Free Forever" : `${currentPlan} Plan`}
              </h3>
              {subscriptionEnd && currentPlan !== "Free" && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  <Calendar size={14} />
                  <span>Next billing date: {new Date(subscriptionEnd).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-2 text-right">
              {currentPlan === "Free" ? (
                <p className="text-sm text-muted-foreground max-w-xs">
                  You are currently on the Free plan with daily limits. Upgrade to unlock more features.
                </p>
              ) : (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                  Status: Active
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Upgrade Plan Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon
            const isCurrent = currentPlan === plan.name

            return (
              <Card key={plan.name} className={`relative p-6 border-0 shadow-lg flex flex-col h-full transition-all hover:shadow-xl ${plan.popular ? "ring-2 ring-primary scale-105" : ""}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-4">
                  <div className={`w-12 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4`}>
                    <Icon className={plan.color} size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-[10px] text-muted-foreground">{plan.duration}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <Check className="text-green-500" size={14} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleUpgradeClick(plan)}
                  variant={isCurrent ? "outline" : (plan.popular ? "default" : "secondary")}
                  disabled={isCurrent || loading}
                  className="w-full"
                >
                  {isCurrent ? "Current Plan" : "Upgrade"}
                </Button>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0B0B1E] border-white/[0.08] rounded-[2.5rem] p-0 overflow-hidden shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
          <div className="relative">
            {/* Header */}
            <div className="p-8 pb-4 flex items-center gap-4 border-b border-white/[0.05]">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#06B6D4] flex items-center justify-center text-white shadow-lg shadow-[#A855F7]/20">
                <CreditCard size={24} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-white tracking-tight">Proceed to Payment</DialogTitle>
                <DialogDescription className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Activate your {selectedPlan?.name} subscription</DialogDescription>
              </div>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-none">
              {/* Order Summary Box */}
              <div className="p-5 bg-[#14142B] border border-white/[0.05] rounded-3xl relative overflow-hidden group transition-all hover:border-[#A855F7]/30 shadow-inner">
                <div className="relative z-10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Business</span>
                    <span className="text-[11px] font-black text-white">{organizationName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Plan Selection</span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#A855F7]/10 text-[#A855F7] text-[8px] font-black uppercase tracking-widest border border-[#A855F7]/10">
                      {selectedPlan?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-white/[0.05] pt-4 mt-2">
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Total Payable</span>
                    <span className="text-2xl font-black text-white tracking-tighter">{selectedPlan?.price}</span>
                  </div>
                </div>
                <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-[#A855F7]/5 to-transparent" />
              </div>

              <div className="space-y-5">
                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Payment Method <span className="text-red-500">*</span></Label>
                  <div className="relative group">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#A855F7] transition-colors" />
                    <select 
                      className="w-full h-12 pl-11 pr-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl text-[11px] font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#A855F7]/20 transition-all appearance-none cursor-pointer"
                      value={paymentData.method}
                      onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                    >
                      <option value="Bank Transfer" className="bg-[#0B0B1E]">Bank Transfer (Recommended)</option>
                      <option value="Manual Payment" className="bg-[#0B0B1E]">Other Manual Payment</option>
                    </select>
                  </div>
                </div>

                {/* Transaction ID */}
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Transaction/Reference ID <span className="text-red-500">*</span></Label>
                  <div className="relative group">
                    <Receipt size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#A855F7] transition-colors" />
                    <Input 
                      placeholder="Enter the ID from your receipt"
                      className="h-12 pl-11 bg-white/[0.03] border-white/[0.05] rounded-2xl text-[11px] font-bold text-white placeholder:text-gray-600 focus-visible:ring-[#A855F7]/20 transition-all"
                      value={paymentData.transactionId}
                      onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Proof of Payment (Screenshot) <span className="text-red-500">*</span></Label>
                  <div className="relative group">
                    <ExternalLink size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#A855F7] transition-colors pointer-events-none" />
                    <Input 
                      type="file" 
                      accept="image/*"
                      className="h-12 pl-11 py-2.5 bg-white/[0.03] border-white/[0.05] rounded-2xl text-[10px] font-bold text-gray-400 cursor-pointer file:mr-4 file:py-0.5 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-black file:uppercase file:bg-[#A855F7]/20 file:text-[#A855F7] hover:file:bg-[#A855F7]/30 transition-all"
                      onChange={(e) => setPaymentData({...paymentData, screenshot: e.target.files[0]})}
                      required
                    />
                  </div>
                  <p className="text-[8px] text-gray-500 font-bold italic ml-1 uppercase tracking-tighter">PNG, JPG or PDF accepted.</p>
                </div>
              </div>

              {/* Bank Details Card */}
              <Card className="p-6 border-dashed border-2 border-[#A855F7]/20 bg-[#A855F7]/5 space-y-4 rounded-3xl relative overflow-hidden group">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#A855F7] flex items-center gap-2">
                  <ShieldCheck size={16} /> Official Bank Details
                </h4>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center border-b border-[#A855F7]/10 pb-2">
                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Bank</span>
                    <span className="text-xs font-black text-white">Example Global Bank</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#A855F7]/10 pb-2">
                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Account</span>
                    <span className="text-xs font-black text-white">Invoice Pro Tech Ltd.</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#A855F7]/10 pb-2">
                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">A/C Number</span>
                    <span className="text-sm font-black text-[#A855F7] font-mono tracking-tighter">1234 5678 9000 1122</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">SWIFT</span>
                    <span className="text-xs font-black text-white">EXAMPBKXXXX</span>
                  </div>
                </div>
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-[#A855F7]/10 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              </Card>
            </div>

            {/* Footer Buttons */}
            <div className="p-8 pt-4 flex items-center gap-3 border-t border-white/[0.05]">
              <button 
                type="button"
                onClick={() => setIsPaymentModalOpen(false)} 
                disabled={loading} 
                className="flex-1 h-12 rounded-2xl bg-white/5 text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest border border-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPayment} 
                disabled={loading || !paymentData.transactionId || !paymentData.screenshot} 
                className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#A855F7]/20 border-none transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <Check size={16} className="group-hover:scale-110 transition-transform" />
                    Submit Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
