import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { X, Download } from "lucide-react"

export default function InvoicePreviewModal({ isOpen, onClose, invoice }) {
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && invoice) {
      fetchCompanySettings()
    }
  }, [isOpen, invoice])

  const fetchCompanySettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCompany(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch company settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices/${invoice._id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `invoice-${invoice.invoiceNumber}.pdf`
        link.click()
      }
    } catch (error) {
      console.error("Failed to download PDF:", error)
    }
  }

  if (!isOpen || !invoice) return null

  const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const total = subtotal + invoice.tax - invoice.discount

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Invoice Preview</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="p-8 bg-white text-black">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  {company?.logo && (
                    <img src={company.logo} alt="Company Logo" className="h-16 w-16 object-contain" />
                  )}
                  <div>
                    <h1 className="text-4xl font-bold">INVOICE</h1>
                    <p className="text-sm text-gray-600 mt-1">Invoice ID: {invoice.invoiceNumber}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-bold mb-2">INVOICE TO</h3>
                  <p className="font-semibold">{invoice.clientId?.name}</p>
                  <p className="text-sm text-gray-600">{invoice.clientId?.email}</p>
                  <p className="text-sm text-gray-600">{invoice.clientId?.phone}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold mb-2">FROM</h3>
                  <p className="font-semibold">{company?.businessName}</p>
                  <p className="text-sm text-gray-600">{company?.email}</p>
                  <p className="text-sm text-gray-600">{company?.phone}</p>
                  {company?.address && <p className="text-sm text-gray-600">{company.address}</p>}
                </div>
              </div>

              <div className="mb-8">
                <div className="grid grid-cols-3 gap-8 text-sm">
                  <div>
                    <p className="text-gray-600">Invoice Date</p>
                    <p className="font-semibold">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Due Date</p>
                    <p className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`font-semibold px-2 py-1 rounded text-white w-fit ${
                      invoice.status === "Paid" ? "bg-green-600" :
                      invoice.status === "Pending" ? "bg-yellow-600" :
                      "bg-red-600"
                    }`}>
                      {invoice.status}
                    </p>
                  </div>
                </div>
              </div>

              <table className="w-full mb-8">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="px-4 py-3 text-left font-bold">PRODUCT</th>
                    <th className="px-4 py-3 text-right font-bold">PRICE</th>
                    <th className="px-4 py-3 text-right font-bold">QTY</th>
                    <th className="px-4 py-3 text-right font-bold">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-right">${item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">SUB-TOTAL</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">TAX (${invoice.tax.toFixed(2)})</span>
                    <span className="font-semibold">${invoice.tax.toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">DISCOUNT</span>
                      <span className="font-semibold">-${invoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 bg-gray-800 text-white px-4 mt-4">
                    <span className="font-bold">TOTAL</span>
                    <span className="font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="mb-8 p-4 bg-gray-50 rounded">
                  <p className="text-sm font-semibold text-gray-700 mb-1">NOTES</p>
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6 text-center">
                <p className="text-sm text-gray-600 italic">Thank You For Your Business</p>
              </div>
            </div>

            <div className="p-6 bg-card border-t border-border flex gap-3">
              <Button
                onClick={handleDownloadPDF}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download as PDF
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Close
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
