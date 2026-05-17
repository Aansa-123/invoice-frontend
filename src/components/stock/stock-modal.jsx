import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { X, Package, Tag, Hash, DollarSign, Layers, Percent, FileText } from "lucide-react"
import { toast } from "sonner"

export default function StockModal({ isOpen, onClose, product, onProductAction }) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState(["General"])
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    sku: "",
    buyingPrice: "",
    sellingPrice: "",
    quantity: "",
    tax: "",
    discount: "",
    description: "",
    unitType: "pcs",
    baseUnit: "pcs",
    packagingUnits: [],
    lowStockThreshold: 10
  })

  const unitTypes = [
    "pcs", "kg", "g", "L", "ml", "box", "pack", "carton", "bundle", 
    "crate", "bottle", "set", "pair", "dozen", "meter", "ft", 
    "hour", "day", "month"
  ]

  const specialUnits = ["carton", "box", "pack", "crate", "bundle", "dozen"]

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data?.categories?.length > 0) {
          setCategories(data.data.categories)
          if (!product && !formData.category) {
            setFormData(prev => ({ ...prev, category: data.data.categories[0] }))
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        category: product.category || "",
        sku: product.sku || "",
        buyingPrice: product.buyingPrice || 0,
        sellingPrice: product.sellingPrice || 0,
        quantity: product.quantity || 0,
        tax: product.tax || 0,
        discount: product.discount || 0,
        description: product.description || "",
        unitType: product.unitType || "pcs",
        baseUnit: product.baseUnit || "pcs",
        packagingUnits: product.packagingUnits || [],
        lowStockThreshold: product.lowStockThreshold || 10
      })
    } else {
      setFormData({
        name: "",
        category: "",
        sku: "",
        buyingPrice: "",
        sellingPrice: "",
        quantity: "",
        tax: "",
        discount: "",
        description: "",
        unitType: "pcs",
        baseUnit: "pcs",
        packagingUnits: [],
        lowStockThreshold: 10
      })
    }
  }, [product, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const url = product 
        ? `${import.meta.env.VITE_API_URL}/api/products/${product._id}`
        : `${import.meta.env.VITE_API_URL}/api/products`
      
      const method = product ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(`Product ${product ? 'updated' : 'added'} successfully`)
        onProductAction()
        onClose()
      } else {
        const data = await response.json()
        toast.error(data.error || `Failed to ${product ? 'update' : 'add'} product`)
      }
    } catch (error) {
      console.error("Product action failed:", error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const margin = formData.sellingPrice - formData.buyingPrice
  const marginPercentage = formData.buyingPrice > 0 ? (margin / formData.buyingPrice) * 100 : 0

  return (
    <div className="fixed inset-0 bg-[#050510]/80 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="w-full max-w-md bg-[#0B0B1E] border border-white/[0.08] shadow-2xl rounded-[1.2rem] overflow-hidden flex flex-col scale-[0.85] origin-center">
        {/* Header */}
        <div className="p-3 px-5 flex items-center justify-between border-b border-white/[0.05]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Package className="text-white" size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">{product ? 'Edit Product' : 'Add Product'}</h2>
              <p className="text-[9px] text-gray-400 font-medium tracking-tight">Manage your inventory item details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto scrollbar-none">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Product Name <span className="text-red-500">*</span></label>
            <div className="relative group">
              <Package size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Wireless Mouse"
                className="h-9 pl-12 bg-white/[0.03] border-white/[0.05] rounded-xl text-sm font-bold text-white focus-visible:ring-purple-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Category <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Tag size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-9 pl-12 bg-white/[0.03] border border-white/[0.05] rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className="bg-[#0B0B1E]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">SKU / Code <span className="text-red-500">*</span></label>
              <div className="relative group">
                <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="SKU-00123"
                  className="h-9 pl-12 bg-white/[0.03] border-white/[0.05] rounded-xl text-sm font-bold text-white focus-visible:ring-purple-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Buying Price</label>
                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">cost</span>
              </div>
              <div className="relative group">
                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.buyingPrice}
                  onChange={(e) => setFormData({ ...formData, buyingPrice: e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value)) })}
                  className="h-9 pl-12 bg-white/[0.03] border-white/[0.05] rounded-xl text-sm font-bold text-white focus-visible:ring-purple-500/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Selling Price</label>
                <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">public</span>
              </div>
              <div className="relative group">
                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value)) })}
                  className="h-9 pl-12 bg-white/[0.03] border-white/[0.05] rounded-xl text-sm font-bold text-white focus-visible:ring-purple-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Quantity</label>
              <div className="relative group">
                <Layers size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value === "" ? "" : Math.max(0, parseInt(e.target.value)) })}
                  className="h-9 pl-12 bg-white/[0.03] border-white/[0.05] rounded-xl text-sm font-bold text-white focus-visible:ring-purple-500/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tax %</label>
              <div className="relative group">
                <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value)) })}
                  className="h-9 pl-12 bg-white/[0.03] border-white/[0.05] rounded-xl text-sm font-bold text-white focus-visible:ring-purple-500/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Discount %</label>
              <div className="relative group">
                <Percent size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value === "" ? "" : Math.max(0, parseFloat(e.target.value)) })}
                  className="h-9 pl-12 bg-white/[0.03] border-white/[0.05] rounded-xl text-sm font-bold text-white focus-visible:ring-purple-500/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Unit Type</label>
              <select
                value={formData.unitType}
                onChange={(e) => {
                  const newUnit = e.target.value;
                  const isSpecial = specialUnits.includes(newUnit.toLowerCase());
                  
                  setFormData({ 
                    ...formData, 
                    unitType: newUnit,
                    baseUnit: isSpecial ? "pcs" : newUnit 
                  });
                }}
                className="w-full h-9 px-4 bg-white/[0.03] border border-white/[0.05] rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none"
              >
                {unitTypes.map(unit => (
                  <option key={unit} value={unit} className="bg-[#0B0B1E]">{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {specialUnits.includes(formData.unitType.toLowerCase()) && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">
                Contains How Many PCS? (per {formData.unitType})
              </label>
              <div className="relative group">
                <Layers size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 group-focus-within:text-purple-400 transition-colors" />
                <Input
                  type="number"
                  min="0"
                  value={formData.packagingUnits.find(u => u.unit === formData.unitType)?.contains || ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value));
                    const existingIdx = formData.packagingUnits.findIndex(u => u.unit === formData.unitType);
                    let newPackagingUnits = [...formData.packagingUnits];
                    
                    if (existingIdx >= 0) {
                      newPackagingUnits[existingIdx] = { ...newPackagingUnits[existingIdx], contains: val };
                    } else {
                      newPackagingUnits.push({ unit: formData.unitType, contains: val });
                    }
                    
                    setFormData({ ...formData, packagingUnits: newPackagingUnits });
                  }}
                  placeholder="e.g. 24"
                  className="h-10 pl-12 bg-purple-500/[0.03] border-purple-500/20 rounded-xl text-sm font-bold text-white focus-visible:ring-purple-500/20"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Description</label>
            <div className="relative group">
              <FileText size={18} className="absolute left-4 top-4 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional notes about this product..."
                className="min-h-[80px] pl-12 bg-white/[0.03] border-white/[0.05] rounded-xl text-sm font-bold text-white focus-visible:ring-purple-500/20 resize-none"
              />
            </div>
          </div>

          <div className="p-3 bg-white/[0.02] rounded-2xl border border-white/[0.05] flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Estimated Margin</span>
            <div className="text-right">
              <span className="text-sm font-black text-white">${Number(margin).toFixed(2)}</span>
              <span className={`ml-2 text-[10px] font-black ${margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({Number(marginPercentage).toFixed(1)}%)
              </span>
            </div>
          </div>
        </form>

        <div className="p-4 px-6 border-t border-white/[0.05] flex justify-end gap-3 bg-white/[0.01]">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="h-10 px-6 rounded-xl text-gray-400 font-black text-xs uppercase tracking-widest hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[#A855F7]/20 border-none transition-all active:scale-95"
          >
            {loading ? 'Saving...' : product ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
