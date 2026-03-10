import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Check, Zap, Star, ShieldCheck, CreditCard, Calendar, Clock, Receipt, ExternalLink } from "lucide-react"
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
  
  const [paymentData, setPaymentData] = useState({
    method: "Bank Transfer",
    transactionId: "",
    screenshot: null
  })

  useEffect(() => {
    fetchUserData()
    fetchPaymentHistory()
  }, [])

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

  const plans = [
    {
      name: "Free",
      price: "$0",
      priceNum: 0,
      duration: "Forever",
      features: ["1 Invoice per day", "1 Client per day", "Basic Templates"],
      icon: Zap,
      color: "text-slate-500",
    },
    {
      name: "Monthly",
      price: "$19",
      priceNum: 19,
      duration: "per month",
      features: ["Unlimited Invoices", "Unlimited Clients", "Team Members", "Advanced Reports"],
      icon: Star,
      color: "text-blue-500",
      popular: true,
    },
    {
      name: "Yearly",
      price: "$199",
      priceNum: 199,
      duration: "per year",
      features: ["Everything in Monthly", "Priority Support", "Custom Branding", "Save 20%"],
      icon: ShieldCheck,
      color: "text-purple-500",
    },
    {
      name: "Lifetime",
      price: "$499",
      priceNum: 499,
      duration: "once",
      features: ["Everything in Yearly", "Lifetime Access", "No Monthly Fees", "Early Access to Features"],
      icon: ShieldCheck,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="p-6 space-y-12 max-w-6xl mx-auto pb-20">
      {/* 1. Current Plan Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Clock size={24} className="text-primary" /> Current Subscription
        </h2>
        <Card className="p-6 border-0 shadow-sm bg-gradient-to-r from-primary/5 to-transparent border-l-4 border-primary">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Plan</span>
                <Badge variant="default" className="bg-primary text-primary-foreground font-bold">
                  {currentPlan}
                </Badge>
              </div>
              <h3 className="text-3xl font-bold text-foreground">
                {currentPlan === "Free" ? "Free Forever" : `${currentPlan} Plan`}
              </h3>
              {subscriptionEnd && currentPlan !== "Free" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
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
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Available Plans</h2>
          <p className="text-muted-foreground mt-1">Select a plan to upgrade your account features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4`}>
                    <Icon className={plan.color} size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.duration}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <Check className="text-green-500" size={16} />
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

      {/* 3. Payment History Section */}
      <div className="space-y-4 pt-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Receipt size={24} className="text-primary" /> Payment History
        </h2>
        
        <Card className="border-0 shadow-sm overflow-hidden">
          {historyLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading history...</div>
          ) : paymentHistory.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Receipt size={40} className="opacity-20" />
              <p>No subscription payments found in your history.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Screenshot</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-medium text-xs">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-bold">{payment.plan?.name || "Premium"}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{payment.paymentMethod}</TableCell>
                    <TableCell className="text-xs font-mono">{payment.transactionId}</TableCell>
                    <TableCell>
                      <Badge className={payment.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.screenshot ? (
                        <a 
                          href={payment.screenshot} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center justify-end gap-1 text-xs"
                        >
                          View <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <Card className="p-6 border-0 shadow-sm bg-muted/30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <h4 className="font-semibold text-foreground text-lg">Need custom enterprise features?</h4>
            <p className="text-sm text-muted-foreground">Contact our team for personalized plans and priority setup.</p>
          </div>
          <Button variant="outline" className="gap-2">
            Contact Support
          </Button>
        </div>
      </Card>

      {/* Payment Confirmation Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Proceed to Payment</DialogTitle>
            <DialogDescription className="text-base">
              Complete the payment to activate your <strong>{selectedPlan?.name}</strong> subscription.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="bg-muted/50 p-5 rounded-xl space-y-3 border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Business:</span>
                <span className="font-bold">{organizationName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Plan Selection:</span>
                <span className="font-bold">{selectedPlan?.name}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-3 mt-2">
                <span className="font-bold text-foreground">Total Payable:</span>
                <span className="text-3xl font-extrabold text-primary">{selectedPlan?.price}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="font-bold">Choose Payment Method</Label>
                <select 
                  id="paymentMethod"
                  className="w-full h-12 px-4 border rounded-xl text-sm bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                >
                  <option value="Bank Transfer">Bank Transfer (Recommended)</option>
                  <option value="Manual Payment">Other Manual Payment</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionId" className="font-bold">Transaction/Reference ID</Label>
                <Input 
                  id="transactionId" 
                  placeholder="Enter the ID from your receipt"
                  className="h-12 rounded-xl"
                  value={paymentData.transactionId}
                  onChange={(e) => setPaymentData({...paymentData, transactionId: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenshot" className="font-bold">Upload Proof of Payment (Screenshot)</Label>
                <Input 
                  id="screenshot" 
                  type="file" 
                  accept="image/*"
                  className="h-auto py-3 px-4 rounded-xl cursor-pointer"
                  onChange={(e) => setPaymentData({...paymentData, screenshot: e.target.files[0]})}
                  required
                />
                <p className="text-[11px] text-muted-foreground italic px-1">PNG, JPG or PDF accepted.</p>
              </div>
            </div>

            <Card className="p-4 border-dashed border-2 border-primary/20 bg-primary/5 space-y-3 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <Receipt size={14} /> Official Bank Details
              </h4>
              <div className="text-[12px] space-y-2">
                <div className="flex justify-between border-b border-primary/10 pb-1">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-semibold">Example Global Bank</span>
                </div>
                <div className="flex justify-between border-b border-primary/10 pb-1">
                  <span className="text-muted-foreground">Account:</span>
                  <span className="font-semibold">Invoice Pro Tech Ltd.</span>
                </div>
                <div className="flex justify-between border-b border-primary/10 pb-1">
                  <span className="text-muted-foreground">A/C Number:</span>
                  <span className="font-bold text-primary font-mono tracking-tighter">1234 5678 9000 1122</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SWIFT:</span>
                  <span className="font-semibold">EXAMPBKXXXX</span>
                </div>
              </div>
            </Card>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} disabled={loading} className="px-6 rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmPayment} 
              disabled={loading || !paymentData.transactionId || !paymentData.screenshot} 
              className="gap-2 px-10 h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
            >
              {loading ? "Processing..." : "Submit My Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
