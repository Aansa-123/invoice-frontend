import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { FileText, ExternalLink, Banknote } from "lucide-react"

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/payments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      const data = await res.json()
      if (data.success) {
        setPayments(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch payments", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Banknote className="text-primary" /> Payment Records
        </h2>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell className="font-medium">
                  {payment.organization?.name || "Deleted Organization"}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{payment.plan?.name || "Custom"}</Badge>
                </TableCell>
                <TableCell className="font-semibold">
                  ${payment.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-sm">
                  {payment.paymentMethod}
                  <div className="text-[10px] text-muted-foreground">{payment.transactionId}</div>
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(payment.paymentDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge className={
                    payment.status === "success" ? "bg-green-100 text-green-700" : 
                    payment.status === "pending" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {payment.screenshot ? (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={payment.screenshot} target="_blank" rel="noopener noreferrer" className="text-primary gap-1">
                        View <ExternalLink size={12} />
                      </a>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
