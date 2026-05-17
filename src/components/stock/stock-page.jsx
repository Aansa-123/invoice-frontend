import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Badge } from "../ui/badge"
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
  Package, CheckCircle2, AlertTriangle, XCircle, ArrowUpDown
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import StockModal from "./stock-modal"
import { toast } from "sonner"

export default function StockPage({ userRole }) {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [sortOrder, setSortOrder] = useState("none") // none, lowToHigh, highToLow
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    fetchProducts()
    fetchSettings()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, categoryFilter, sortOrder])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/company`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data?.currency) {
          setCurrency(data.data.currency)
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    if (categoryFilter !== "All") {
      filtered = filtered.filter((p) => p.category === categoryFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      )
    }

    if (sortOrder === "lowToHigh") {
      filtered.sort((a, b) => a.sellingPrice - b.sellingPrice)
    } else if (sortOrder === "highToLow") {
      filtered.sort((a, b) => b.sellingPrice - a.sellingPrice)
    }

    setFilteredProducts(filtered)
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setProducts(products.filter((p) => p._id !== productId))
        toast.success("Product deleted successfully")
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      console.error("Delete failed:", error)
      toast.error("An error occurred while deleting")
    }
  }

  const getStatusInfo = (product) => {
    if (product.quantity <= 0) {
      return { 
        label: "Out of Stock", 
        color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
        icon: XCircle
      }
    }
    if (product.quantity <= product.lowStockThreshold) {
      return { 
        label: "Low Stock", 
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        icon: AlertTriangle
      }
    }
    return { 
      label: "In Stock", 
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: CheckCircle2
    }
  }

  const getCurrencySymbol = (code) => {
    const symbols = { USD: "$", EUR: "€", GBP: "£", PKR: "Rs", INR: "₹" }
    return symbols[code] || "$"
  }

  const categories = ["All", ...new Set(products.map(p => p.category))]

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.quantity > p.lowStockThreshold).length,
    lowStock: products.filter(p => p.quantity > 0 && p.quantity <= p.lowStockThreshold).length,
    outOfStock: products.filter(p => p.quantity <= 0).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-3 lg:p-4 bg-transparent min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="text-lg font-black text-white tracking-tight">Stock</h1>
          <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Track your inventory, prices and availability</p>
        </div>
        
        {userRole !== "Viewer" && (
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="h-8 px-4 rounded-full bg-gradient-to-r from-[#A855F7] to-[#06B6D4] hover:opacity-90 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-[#A855F7]/20 border-none transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={14} />
            Add Product
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-[#14142B] border border-white/[0.05] rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/10">
            <Package className="text-purple-500" size={18} />
          </div>
          <div>
            <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Products</p>
            <p className="text-base font-black text-white">{stats.total}</p>
          </div>
        </Card>
        <Card className="p-3 bg-[#14142B] border border-white/[0.05] rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
            <CheckCircle2 className="text-emerald-500" size={18} />
          </div>
          <div>
            <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">In Stock</p>
            <p className="text-base font-black text-white">{stats.inStock}</p>
          </div>
        </Card>
        <Card className="p-3 bg-[#14142B] border border-white/[0.05] rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
            <AlertTriangle className="text-amber-500" size={18} />
          </div>
          <div>
            <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Low Stock</p>
            <p className="text-base font-black text-white">{stats.lowStock}</p>
          </div>
        </Card>
        <Card className="p-3 bg-[#14142B] border border-white/[0.05] rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/10">
            <XCircle className="text-rose-500" size={18} />
          </div>
          <div>
            <p className="text-[8px] font-black text-[#94A3B8] uppercase tracking-widest">Out of Stock</p>
            <p className="text-base font-black text-white">{stats.outOfStock}</p>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-3 bg-[#14142B] border border-white/[0.05] rounded-xl shadow-xl overflow-visible">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 relative w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search products, SKU..."
              className="pl-10 bg-[#0B0B1E]/50 border-white/[0.05] focus-visible:ring-1 focus-visible:ring-[#A855F7]/30 h-9 rounded-lg w-full text-[10px] font-bold placeholder:text-[#94A3B8] text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 bg-[#0B0B1E] border-white/5 rounded-lg px-3 flex items-center gap-2 text-[#94A3B8] hover:text-white">
                  <Filter size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#14142B] border-white/5 text-white w-40 rounded-lg p-1.5">
                <div className="px-2 py-1 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest opacity-50">Category</div>
                {categories.map(cat => (
                  <DropdownMenuItem 
                    key={cat} 
                    onClick={() => setCategoryFilter(cat)}
                    className={`rounded-md text-[10px] font-bold ${categoryFilter === cat ? 'bg-purple-500/20 text-purple-400' : ''}`}
                  >
                    {cat}
                  </DropdownMenuItem>
                ))}
                <div className="h-px bg-white/5 my-1" />
                <div className="px-2 py-1 text-[8px] font-black text-[#94A3B8] uppercase tracking-widest opacity-50">Price</div>
                <DropdownMenuItem onClick={() => setSortOrder("lowToHigh")} className="rounded-md text-[10px] font-bold">Price: Low to High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("highToLow")} className="rounded-md text-[10px] font-bold">Price: High to Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("none")} className="rounded-md text-[10px] font-bold">Clear Sort</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="bg-[#14142B] border border-white/[0.05] rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto relative scrollbar-thin scrollbar-thumb-white/5">
          <table className="w-full text-left">
            <thead className="bg-[#0B0B1E] border-b border-white/5">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Product</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">SKU</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Category</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Qty</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Buy</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Sell</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Tax</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Disc</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">Status</th>
                <th className="px-4 py-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredProducts.map((product) => {
                const status = getStatusInfo(product)
                const StatusIcon = status.icon
                return (
                  <tr key={product._id} className="hover:bg-white/[0.02] transition-all group/item">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                          <Package className="text-purple-500" size={14} />
                        </div>
                        <span className="text-[10px] font-bold text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[10px] font-medium text-[#94A3B8]">{product.sku}</td>
                    <td className="px-4 py-2.5 text-[10px] font-medium text-white/80">{product.category}</td>
                    <td className="px-4 py-2.5 text-[10px] font-black text-white">{product.quantity}</td>
                    <td className="px-4 py-2.5 text-[10px] font-bold text-[#94A3B8]">{getCurrencySymbol(currency)}{product.buyingPrice}</td>
                    <td className="px-4 py-2.5 text-[10px] font-black text-emerald-400">{getCurrencySymbol(currency)}{product.sellingPrice}</td>
                    <td className="px-4 py-2.5 text-[10px] font-medium text-[#94A3B8]">{product.tax}%</td>
                    <td className="px-4 py-2.5 text-[10px] font-medium text-[#94A3B8]">{product.discount}%</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black border ${status.color} uppercase tracking-widest`}>
                        <StatusIcon size={9} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setSelectedProduct(product)
                            setEditModalOpen(true)
                          }}
                          className="h-7 w-7 text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-lg"
                        >
                          <Edit2 size={12} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProduct(product._id)}
                          className="h-7 w-7 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="text-white/10" size={32} />
                      <p className="text-[10px] font-bold text-[#94A3B8]">No products found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <StockModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductAction={fetchProducts}
      />

      <StockModal 
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
        onProductAction={fetchProducts}
      />
    </div>
  )
}
