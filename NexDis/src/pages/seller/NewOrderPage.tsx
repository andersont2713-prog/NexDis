import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  Camera, 
  MapPin, 
  CheckCircle2,
  Package,
  CreditCard,
  Percent,
  Share2,
  Download,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRegional } from '../../context/RegionalContext';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import type { Product, Customer, OrderItem } from '../../types';
import { generateOrderPDF, shareByWhatsApp } from '../../lib/pdfGenerator';

export default function NewOrderPage() {
  const { formatPrice, currency } = useRegional();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [photo, setPhoto] = useState<string | null>(null);
  const [gps, setGps] = useState<{lat: number, lng: number} | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    fetch('/api/customers').then(res => res.json()).then(setCustomers);
    fetch('/api/inventory').then(res => res.json()).then(setProducts);
    
    // Simulate GPS
    navigator.geolocation.getCurrentPosition((pos) => {
      setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, () => {
      // Fallback
      setGps({ lat: -12.046374, lng: -77.042793 });
    });
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, productName: product.name, quantity: 1, price: product.price || 5.5 }];
    });
    toast.success('Producto añadido');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async () => {
    const orderData = {
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      items: cart,
      total,
      gps,
      sellerId: 'USR-001',
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        setOrderDetails(orderData);
        setIsConfirmed(true);
        toast.success('Pedido enviado con éxito');
      }
    } catch (e) {
      toast.error('Error al enviar pedido');
    }
  };

  const handleDownloadPDF = () => {
    if (!orderDetails || !selectedCustomer) return;
    const doc = generateOrderPDF({
      ...orderDetails,
      customerName: orderDetails.customerName || selectedCustomer.name,
      customerAddress: selectedCustomer.address,
      customerRuc: '20600000000',
      currencySymbol: currency.symbol
    });
    doc.save(`Factura_${orderDetails.customerName.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  const handleShareWhatsApp = () => {
    if (!orderDetails) return;
    shareByWhatsApp({
      ...orderDetails,
      customerName: orderDetails.customerName || 'Cliente Genérico'
    }, selectedCustomer?.phone || '', currency.symbol);
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)' }}>
      <div className="decorative-blur top-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/10"></div>

      {/* Header */}
      <div className="p-6 shrink-0 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900/40 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/seller')} className="p-2.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all">
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase font-display">
            {step === 1 ? 'Cliente' : step === 2 ? 'Catálogo' : 'Finalizar'}
          </h2>
        </div>
        <div className="flex gap-1.5 items-center">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn("w-2 h-2 rounded-full transition-all duration-500", step === s ? "bg-indigo-500 w-6 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-white/10")}></div>
          ))}
        </div>
      </div>

      {/* Step 1: Customer Selection */}
      {step === 1 && (
        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
          <div className="space-y-4">
             <div className="space-y-1">
                <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Seleccionar Cliente</h3>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic border-l-2 border-indigo-500/30 pl-3">Identifique el punto de venta.</p>
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
               <input 
                 type="text" 
                 placeholder="Buscar cliente..." 
                 className="input-glass pl-10 h-12"
                 value={customerSearch}
                 onChange={(e) => setCustomerSearch(e.target.value)}
               />
             </div>
          </div>
          
          <div className="space-y-4">
            {customers
              .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.id.toLowerCase().includes(customerSearch.toLowerCase()))
              .map(c => (
              <button 
                key={c.id} 
                onClick={() => { setSelectedCustomer(c); setStep(2); }}
                className={cn(
                  "w-full frosted-card text-left flex items-center justify-between transition-all group relative overflow-hidden active:scale-[0.98]",
                  selectedCustomer?.id === c.id ? "border-indigo-500 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10" : "border-white/5 hover:border-indigo-500/30"
                )}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 bg-slate-800 border border-white/5 text-indigo-400 rounded-2xl flex items-center justify-center font-black italic text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {c.name.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white tracking-tight">{c.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase italic tracking-widest mt-1">{c.city} • Límite: {formatPrice(c.creditLimit)}</p>
                  </div>
                </div>
                <CheckCircle2 size={24} className={cn("transition-all duration-500", selectedCustomer?.id === c.id ? "text-indigo-500 opacity-100 scale-110" : "text-slate-700 opacity-20")} />
                {selectedCustomer?.id === c.id && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 shadow-[2px_0_10px_rgba(99,102,241,0.5)]"></div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Catalog Selection */}
      {step === 2 && (
        <div className="flex-1 overflow-y-auto p-4 flex flex-col relative z-10 pb-32">
          <div className="space-y-4 mb-6">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
               <input 
                 type="text" 
                 placeholder="Nombre o SKU..." 
                 className="input-glass pl-10 h-12"
                 value={productSearch}
                 onChange={(e) => setProductSearch(e.target.value)}
               />
             </div>
             <div className="flex gap-2 p-2 bg-white/5 border border-white/5 rounded-2xl overflow-x-auto shrink-0 no-scrollbar backdrop-blur-md">
                {['Todos', 'Lácteos', 'Abarrotes', 'Limpieza', 'Bebidas'].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className={cn("px-5 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all", selectedCategory === cat ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-transparent text-slate-500 hover:text-slate-300")}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {products
               .filter(p => {
                 const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase());
                 const matchesCategory = selectedCategory === 'Todos' || p.warehouse === selectedCategory;
                 return matchesSearch && matchesCategory;
               })
               .map(p => (
               <div key={p.id} className="frosted-card group hover:border-indigo-500/50 transition-all active:scale-[0.98]">
                  <div className="aspect-square bg-slate-800 rounded-xl mb-4 overflow-hidden border border-white/5 relative">
                     <img src={`https://picsum.photos/seed/${p.sku}/200/200`} alt="p" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                         <span className="text-[10px] font-black text-white italic uppercase tracking-widest">Stock: {p.stock}</span>
                      </div>
                  </div>
                  <h4 className="text-sm font-black text-white italic tracking-tight leading-tight uppercase h-10 overflow-hidden line-clamp-2">{p.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase italic tracking-widest mt-1">SKU: {p.sku}</p>
                  <div className="flex items-center justify-between mt-4">
                     <p className="text-lg font-black text-white font-mono tracking-tighter uppercase">{formatPrice(p.price || 4.50)}</p>
                     <button 
                       onClick={() => addToCart(p)}
                       className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-xl shadow-indigo-600/20 active:scale-90 transition-all active:rotate-12 border border-white/10 hover:bg-indigo-500"
                     >
                       <Plus size={20} className="stroke-[3]" />
                     </button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Step 3: Checkout Summary */}
      {step === 3 && !isConfirmed && (
        <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10 pb-32">
           <div className="frosted-card bg-indigo-600/5 border-indigo-500/20 p-6 space-y-6 relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10 border-b border-indigo-500/10 pb-4">
                 <div className="w-12 h-12 bg-indigo-600 shadow-lg shadow-indigo-600/30 rounded-2xl flex items-center justify-center text-white">
                    <MapPin size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-white tracking-tight uppercase italic">{selectedCustomer?.name}</h4>
                    <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest italic">Coordenadas verificadas vía GPS</p>
                 </div>
              </div>
              <div className="flex gap-4 relative z-10">
                 <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 italic hover:text-white hover:bg-white/10 transition-all backdrop-blur-md">
                    <Camera size={18} />
                    <span>Fachada</span>
                 </button>
                 <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 italic hover:text-white hover:bg-white/10 transition-all backdrop-blur-md">
                    <Percent size={18} />
                    <span>Promo</span>
                 </button>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-10 group-hover:scale-150 transition-transform duration-1000"></div>
           </div>

           <div className="space-y-4">
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                 <Package size={20} className="text-indigo-400" />
                 Detalle Estratégico
              </h3>
              <div className="space-y-4">
                 {cart.map(item => (
                   <div key={item.productId} className="frosted-card group border-white/5 p-5 relative overflow-hidden">
                      <div className="flex items-start justify-between relative z-10">
                        <div className="flex-1">
                           <h4 className="font-bold text-white text-base tracking-tight uppercase italic">{item.productName}</h4>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">${item.price} p.u. • {item.quantity} und</p>
                           <div className="flex items-center gap-4 mt-5">
                              <button onClick={() => updateQuantity(item.productId, -1)} className="w-9 h-9 rounded-xl border border-white/5 bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                 <Minus size={16} />
                              </button>
                              <span className="text-sm font-black text-white font-mono w-6 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, 1)} className="w-9 h-9 rounded-xl border border-white/5 bg-indigo-600/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-600/40 transition-all">
                                 <Plus size={16} />
                              </button>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xl font-black text-white font-mono tracking-tighter shadow-indigo-500/10 uppercase">{formatPrice(item.price * item.quantity)}</p>
                           <button className="text-rose-400/50 hover:text-rose-400 mt-4 transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </div>
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-all"></div>
                   </div>
                 ))}
                 {cart.length === 0 && (
                   <div className="frosted-card border-dashed border-white/10 flex flex-col items-center justify-center py-12 text-slate-600 italic uppercase font-black text-xs tracking-widest">
                      <Package className="mb-4 opacity-20" size={48} />
                      El carrito está vacío
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Step 4: Success View */}
      {isConfirmed && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 relative z-10 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 scale-125 mb-4 shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-emerald-500/20">
             <CheckCircle2 size={48} className="stroke-[3]" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">¡PEDIDO CONFIRMADO!</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">Transacción finalizada correctamente.</p>
          </div>

          <div className="w-full space-y-4 pt-10">
            <button 
              onClick={handleShareWhatsApp}
              className="w-full p-4 bg-[#25D366] text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
            >
              <MessageCircle size={24} />
              <span>Enviar por WhatsApp</span>
            </button>
            
            <button 
              onClick={handleDownloadPDF}
              className="w-full p-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-4 active:scale-95 transition-all"
            >
              <Download size={24} />
              <span>Descargar Comprobante</span>
            </button>

            <button 
              onClick={() => navigate('/seller')}
              className="w-full p-4 text-indigo-400 font-black uppercase italic tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-400/5 rounded-2xl transition-all"
            >
              <span>Volver al Inicio</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Persistent Footer Actions */}
      {!isConfirmed && (
        <div className="p-6 shrink-0 bg-slate-900/60 border-t border-white/10 flex items-center justify-between sticky bottom-0 z-30 backdrop-blur-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Total Neto</span>
           <span className="text-3xl font-black text-white font-mono tracking-tighter shadow-indigo-500/20 uppercase">{formatPrice(total)}</span>
        </div>
        
        {step === 2 && (
          <button 
            disabled={cart.length === 0}
            onClick={() => setStep(3)}
            className="px-10 py-3.5 bg-indigo-600 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center gap-4 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-indigo-600/30 active:scale-95 transition-all text-xs border border-white/10"
          >
            <span>Revisar</span>
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-[10px] font-black italic">{cart.length}</div>
          </button>
        )}

        {step === 3 && (
          <button 
            onClick={handleSubmit}
            disabled={cart.length === 0}
            className="px-10 py-3.5 bg-emerald-600 text-white rounded-2xl font-black uppercase italic tracking-widest flex items-center gap-4 shadow-2xl shadow-emerald-600/30 active:scale-95 transition-all text-xs border border-white/10"
          >
            <span>Confirmar</span>
            <CheckCircle2 size={24} className="stroke-[3]" />
          </button>
        )}

        {step === 1 && (
          <p className="text-[10px] text-slate-600 font-black italic max-w-[130px] uppercase tracking-tighter leading-tight">Seleccione cliente para iniciar transacción</p>
        )}
      </div>
      )}
    </div>
  );
}
