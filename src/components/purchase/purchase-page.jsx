import { useState, useEffect } from "react"
import { Card } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { 
  Search, User, ShoppingCart, Plus, Minus, 
  ChevronDown, Check, Save, Package, Info
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export default function PurchasePage() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [clientSearch, setClientSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState("USD")

  useEffect(() => {
    fetchData()
    fetchSettings()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

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

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const [clientsRes, productsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (clientsRes.ok && productsRes.ok) {
        const clientsData = await clientsRes.json()
        const productsData = await productsRes.json()
        setClients(clientsData.data)
        setProducts(productsData.data)
        setFilteredProducts(productsData.data)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const addToOrder = (product) => {
    const existing = orderItems.find(item => item._id === product._id)
    if (existing) {
      const nextTotalPcs = (existing.quantity + 1) * (existing.conversionFactor || 1)
      if (nextTotalPcs > product.quantity) {
        toast.error(`Only ${product.quantity} pcs available`)
        return
      }
      setOrderItems(orderItems.map(item => 
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      let initialUnit = product.unitType || "pcs";
      let pu = product.packagingUnits?.find(u => u.unit === initialUnit);
      let factor = pu?.contains || 1;
      
      // Fallback to base unit if the default unit is too large for current stock
      if (factor > product.quantity && product.baseUnit && initialUnit !== product.baseUnit) {
        initialUnit = product.baseUnit;
        pu = product.packagingUnits?.find(u => u.unit === initialUnit);
        factor = pu?.contains || 1;
      }
      
      if (factor > product.quantity) {
        toast.error(`Insufficient stock. Only ${product.quantity} pcs available`)
        return
      }

      setOrderItems([...orderItems, { 
        ...product, 
        quantity: 1, 
        selectedUnit: initialUnit,
        conversionFactor: factor 
      }])
    }
  }

  const updateUnit = (productId, unit, contains) => {
    const product = products.find(p => p._id === productId)
    const factor = contains || 1
    const item = orderItems.find(i => i._id === productId)
    
    if (item && item.quantity * factor > product.quantity) {
      toast.error(`Insufficient stock for ${unit}. Only ${product.quantity} pcs available`)
      return
    }

    setOrderItems(orderItems.map(item => 
      item._id === productId ? { ...item, selectedUnit: unit, conversionFactor: factor } : item
    ))
  }

  const updateQuantity = (productId, delta) => {
    const product = products.find(p => p._id === productId)
    setOrderItems(orderItems.map(item => {
      if (item._id === productId) {
        const newQty = Math.max(1, item.quantity + delta)
        if (delta > 0 && newQty * (item.conversionFactor || 1) > product.quantity) {
          toast.error(`Only ${product.quantity} pcs available`)
          return item
        }
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromOrder = (productId) => {
    setOrderItems(orderItems.filter(item => item._id !== productId))
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.sellingPrice * (item.conversionFactor || 1)) * item.quantity, 0)
  }

  const handleSaveOrder = async () => {
    if (!selectedClient) {
      toast.error("Please select a client")
      return
    }
    if (orderItems.length === 0) {
      toast.error("Please add at least one product")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const invoiceData = {
        clientId: selectedClient._id,
        items: orderItems.map(item => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          unit: item.selectedUnit,
          conversionFactor: item.conversionFactor || 1,
          price: item.sellingPrice * (item.conversionFactor || 1)
        })),
        isDraft: true, // Mark as draft
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        invoiceDate: new Date().toISOString(),
        status: "Pending"
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(invoiceData)
      })

      if (response.ok) {
        toast.success("Order saved to invoices as draft")
        navigate("/invoices")
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to save order")
      }
    } catch (error) {
      console.error("Save order failed:", error)
      toast.error("An error occurred")
    }
  }

  const getCurrencySymbol = (code) => {
    const symbols = { USD: "$", EUR: "€", GBP: "£", PKR: "Rs", INR: "₹" }
    return symbols[code] || "$"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email?.toLowerCase().includes(clientSearch.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Top Bar */}
      <div className="p-3 lg:p-4 border-b border-white/[0.05] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="space-y-0.5">
          <h1 className="text-lg font-black text-white tracking-tight">Purchase</h1>
          <p className="text-[9px] text-[#94A3B8] font-medium uppercase tracking-wider">Build a purchase order for a client</p>
        </div>
        <Button 
          onClick={handleSaveOrder}
          className="h-8 px-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 border-none transition-all active:scale-95 flex items-center gap-2"
        >
          <Save size={14} />
          Save Order
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Product Selection */}
        <div className="flex-1 flex flex-col p-3 lg:p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
          {/* Client Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Select Client</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full h-9 px-3 bg-[#14142B] border border-white/[0.05] rounded-lg flex items-center justify-between text-white group hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <User size={10} className="text-purple-400" />
                      </div>
                      <span className="text-[10px] font-bold truncate">
                        {selectedClient ? selectedClient.name : "Search client..."}
                      </span>
                    </div>
                    <ChevronDown size={12} className="text-gray-500 group-hover:text-white" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[250px] bg-[#14142B] border-white/5 text-white p-1.5 rounded-lg shadow-2xl backdrop-blur-xl max-h-[300px] overflow-y-auto scrollbar-thin">
                  <div className="p-1.5 sticky top-0 bg-[#14142B] z-10">
                    <Input 
                      placeholder="Type to search..." 
                      className="h-8 bg-[#0B0B1E] border-white/5 text-[10px] rounded-md"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredClients.map(client => (
                    <DropdownMenuItem 
                      key={client._id}
                      onClick={() => setSelectedClient(client)}
                      className={`flex items-center gap-2.5 p-2 rounded-md cursor-pointer transition-all ${selectedClient?._id === client._id ? 'bg-purple-500/10 text-purple-400' : 'hover:bg-white/5'}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center font-black text-[9px] text-indigo-400">
                        {client.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold">{client.name}</span>
                        <span className="text-[8px] text-gray-500">{client.email}</span>
                      </div>
                      {selectedClient?._id === client._id && <Check size={12} className="ml-auto text-purple-400" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Order Summary</label>
              <div className="h-9 px-3 bg-[#14142B] border border-white/[0.05] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <ShoppingCart size={10} className="text-emerald-400" />
                  </div>
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">In Order</span>
                </div>
                <span className="text-[10px] font-black text-white">
                  {orderItems.length} items - {getCurrencySymbol(currency)}{calculateTotal().toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Product Search */}
          <div className="relative group">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
            <Input
              placeholder="Search products to add..."
              className="h-10 pl-10 bg-[#14142B] border-white/[0.05] rounded-lg text-xs font-bold text-white focus-visible:ring-purple-500/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Product List */}
          <div className="grid grid-cols-1 gap-1.5">
            {filteredProducts.map(product => {
              const inOrder = orderItems.find(item => item._id === product._id)
              return (
                <div key={product._id} className="p-2.5 bg-[#14142B] border border-white/[0.03] rounded-xl flex items-center justify-between group hover:border-white/[0.1] transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/10">
                      <Package className="text-purple-500" size={16} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-white">{product.name}</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {product.quantity <= 0 ? (
                          <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                            Out of Stock
                          </span>
                        ) : product.quantity <= product.lowStockThreshold ? (
                          <span className="text-[8px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1">
                            Low stock • {product.quantity} pcs left
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                            Available • {product.quantity} pcs in stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Price</p>
                      <p className="text-[10px] font-black text-white">{getCurrencySymbol(currency)}{product.sellingPrice}</p>
                    </div>
                    {inOrder ? (
                      <div className="flex items-center gap-2 bg-[#0B0B1E] p-1 rounded-lg border border-white/[0.05]">
                        {/* Unit Selector */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-7 px-2 bg-white/5 hover:bg-white/10 rounded-md text-[8px] font-black text-gray-400 uppercase tracking-widest transition-all flex items-center gap-1">
                              {inOrder.selectedUnit}
                              <ChevronDown size={8} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-[#14142B] border-white/5 text-white p-1 rounded-lg">
                            <DropdownMenuItem 
                              onClick={() => updateUnit(product._id, product.baseUnit || "pcs", 1)}
                              className="text-[9px] font-bold p-2 cursor-pointer hover:bg-white/5"
                            >
                              {product.baseUnit || "pcs"} (Base)
                            </DropdownMenuItem>
                            {/* Show unitType if it's different from baseUnit */}
                            {product.unitType !== product.baseUnit && (
                              <DropdownMenuItem 
                                onClick={() => {
                                  const pu = product.packagingUnits?.find(u => u.unit === product.unitType);
                                  updateUnit(product._id, product.unitType, pu?.contains || 1);
                                }}
                                className="text-[9px] font-bold p-2 cursor-pointer hover:bg-white/5"
                              >
                                {product.unitType} ({product.packagingUnits?.find(u => u.unit === product.unitType)?.contains || 1} {product.baseUnit})
                              </DropdownMenuItem>
                            )}
                            {/* Show other packaging units */}
                            {product.packagingUnits?.filter(pu => pu.unit !== product.unitType).map((pu, idx) => (
                              <DropdownMenuItem 
                                key={idx}
                                onClick={() => updateUnit(product._id, pu.unit, pu.contains)}
                                className="text-[9px] font-bold p-2 cursor-pointer hover:bg-white/5"
                              >
                                {pu.unit} ({pu.contains} {product.baseUnit})
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <button 
                          onClick={() => updateQuantity(product._id, -1)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-[10px] font-black text-white w-3 text-center">{inOrder.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(product._id, 1)}
                          disabled={(inOrder.quantity + 1) * (inOrder.conversionFactor || 1) > product.quantity}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={12} />
                        </button>
                        <div className="h-7 w-px bg-white/5 mx-0.5" />
                        <button 
                          onClick={() => removeFromOrder(product._id)}
                          className="h-7 px-2 bg-emerald-500/10 text-emerald-500 flex items-center gap-1 rounded-md border border-emerald-500/10 hover:bg-emerald-500/20 transition-all active:scale-95"
                        >
                          <Check size={10} strokeWidth={3} />
                          <span className="text-[8px] font-black uppercase tracking-widest">Added</span>
                        </button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => addToOrder(product)}
                        disabled={product.quantity <= 0}
                        className="h-8 px-4 rounded-lg bg-[#7B5BE4]/10 text-[#7B5BE4] hover:bg-[#7B5BE4] hover:text-white border border-[#7B5BE4]/20 transition-all active:scale-95 flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#7B5BE4]/10 disabled:hover:text-[#7B5BE4]"
                      >
                        <Plus size={12} />
                        {product.quantity <= 0 ? "Out of Stock" : "Add"}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side: Current Order Details - Optional desktop sidebar */}
      </div>
    </div>
  )
}
