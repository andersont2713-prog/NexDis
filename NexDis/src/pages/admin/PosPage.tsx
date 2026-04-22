import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  BadgePercent, 
  User, 
  Package, 
  X, 
  CheckCircle2,
  Printer,
  History,
  Zap,
  Camera,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';
import type { Product } from '../../types';

interface CartItem extends Product {
  quantity: number;
}

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Arroz Extra Costeño 1kg', sku: 'AR-001', price: 4.50, stock: 150, category: 'Granos', warehouse: 'A1', lot: 'L-2024', minStock: 20, maxStock: 500, expiry: '2025-12-01' },
  { id: '2', name: 'Aceite Girasol Primor 1L', sku: 'AC-002', price: 9.80, stock: 85, category: 'Aceites', warehouse: 'A1', lot: 'L-2024', minStock: 15, maxStock: 200, expiry: '2025-06-15' },
  { id: '3', name: 'Leche Gloria Six Pack', sku: 'LE-003', price: 24.50, stock: 40, category: 'Lácteos', warehouse: 'A2', lot: 'L-2024', minStock: 10, maxStock: 100, expiry: '2025-03-20' },
  { id: '4', name: 'Fideos Lavaggi 500g', sku: 'FI-004', price: 2.30, stock: 200, category: 'Pastas', warehouse: 'A1', lot: 'L-2024', minStock: 30, maxStock: 600, expiry: '2026-01-10' },
  { id: '5', name: 'Gaseosa Coca Cola 2.5L', sku: 'GA-005', price: 10.50, stock: 60, category: 'Bebidas', warehouse: 'B1', lot: 'L-2024', minStock: 20, maxStock: 150, expiry: '2024-12-31' },
  { id: '6', name: 'Detergente Opal 1kg', sku: 'DE-006', price: 7.20, stock: 120, category: 'Limpieza', warehouse: 'C1', lot: 'L-2024', minStock: 20, maxStock: 300, expiry: '2025-11-20' },
];

export default function PosPage() {
  const { formatPrice } = useRegional();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        searchInputRef.current?.focus();
      }
      if (e.key === 'F4') {
        setIsCheckoutOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isScannerOpen) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      const onScanSuccess = (decodedText: string) => {
        const product = MOCK_PRODUCTS.find(p => p.sku === decodedText);
        if (product) {
          addToCart(product);
          toast.success(`Añadido: ${product.name}`);
          setIsScannerOpen(false);
        } else {
          toast.error(`Producto no encontrado: ${decodedText}`);
        }
        scanner.clear();
      };

      scanner.render(onScanSuccess, (error) => {
        // Silently ignore errors
      });

      return () => {
        scanner.clear().catch(err => console.warn("Failed to clear scanner", err));
      };
    }
  }, [isScannerOpen]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const igv = subtotal * 0.18;
  const total = subtotal; // Assuming price includes IGV for POS

  const handleProcessSale = () => {
    const saleId = `V-${Math.floor(100000 + Math.random() * 900000)}`;
    const id = toast.loading('Procesando venta...');
    
    setTimeout(() => {
      toast.success(`Venta ${saleId} exitosa`, { id });
      setCart([]);
      setIsCheckoutOpen(false);
      setCashAmount('');
    }, 1500);
  };

  const filteredProducts = searchTerm.length > 0 
    ? MOCK_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden text-slate-200">
      {/* Left Column: Product Selection */}
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Punto de Venta (POS)</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Venta Directa - Terminal 01</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 border border-white/5 rounded-xl px-3 py-1 flex items-center gap-2 text-[10px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              EN LÍNEA
            </div>
            <button className="p-2 text-slate-500 hover:text-white transition-all">
              <History size={20} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={24} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Escanear Código de Barras o Buscar Producto (F2)..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl font-medium outline-none focus:border-indigo-500 focus:bg-slate-900 transition-all placeholder:text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="h-full px-6 bg-indigo-600 hover:bg-indigo-50 rounded-2xl flex items-center gap-2 group/scan transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Camera className="text-white group-hover/scan:text-indigo-600" size={24} />
            <span className="font-black uppercase italic tracking-widest text-xs text-white group-hover/scan:text-indigo-600">Escanear</span>
          </button>
        </div>

        {/* Product Results */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {searchTerm.length > 0 ? (
            filteredProducts.map((p) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors border border-white/5">
                    <Package size={28} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white uppercase italic tracking-tighter">{p.name}</p>
                    <div className="flex items-center gap-3 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                      <span>SKU: {p.sku}</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                      <span>Stock: {p.stock} und</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-white italic tracking-tighter">{formatPrice(p.price)}</p>
                  <button className="mt-1 bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    Añadir al Carro
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center opacity-20">
                <Search size={40} />
              </div>
              <p className="uppercase font-black text-sm tracking-[0.2em] italic">Inicia una búsqueda o escanea</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart & Summary */}
      <div className="w-full lg:w-[450px] bg-slate-900/80 backdrop-blur-3xl border-l border-white/10 flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <ShoppingCart size={24} />
            <h3 className="text-xl font-black uppercase italic tracking-tighter leading-none">Bolsa de Compra</h3>
          </div>
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black italic">{cart.length} ITEMS</span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={item.id}
                className="bg-white/5 rounded-2xl p-4 border border-white/5 group hover:border-indigo-500/30 transition-all flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-xs font-black text-white uppercase italic tracking-tight">{item.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Precio Unid: {formatPrice(item.price)}</p>
                </div>

                <div className="flex items-center gap-3 ml-4">
                   <div className="flex items-center bg-slate-800 rounded-xl border border-white/5 p-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-500 hover:text-white">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-black font-mono text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-500 hover:text-white">
                        <Plus size={14} />
                      </button>
                   </div>
                   <div className="text-right w-20">
                     <p className="text-[11px] font-black text-white italic">{formatPrice(item.price * item.quantity)}</p>
                   </div>
                   <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                     <Trash2 size={16} />
                   </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 opacity-50 py-20">
              <ShoppingCart size={48} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest italic">El carrito está vacío</p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="p-6 bg-slate-900 border-t border-white/10 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <span>IGV (18%) Incluido</span>
              <span>{formatPrice(igv)}</span>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-lg font-black text-white italic uppercase tracking-tighter">Total a Pagar</span>
              <span className="text-3xl font-black text-white italic tracking-tighter">{formatPrice(total)}</span>
            </div>
          </div>

          <button 
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full h-16 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <Banknote size={24} />
            <span>Pagar Venta (F4)</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative z-11"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Cerrar Transacción</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Finaliza el proceso de pago</p>
                  </div>
                </div>
                <button onClick={() => setIsCheckoutOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={28} />
                </button>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1 mb-3 block">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setPaymentMethod('cash')}
                        className={cn(
                          "h-20 rounded-2xl flex flex-col items-center justify-center gap-2 font-black uppercase italic text-[10px] tracking-widest border transition-all",
                          paymentMethod === 'cash' ? "bg-indigo-600 text-white border-white/10 shadow-lg" : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                        )}
                      >
                        <Banknote size={20} />
                        EFECTIVO
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('card')}
                        className={cn(
                          "h-20 rounded-2xl flex flex-col items-center justify-center gap-2 font-black uppercase italic text-[10px] tracking-widest border transition-all",
                          paymentMethod === 'card' ? "bg-indigo-600 text-white border-white/10 shadow-lg" : "bg-white/5 text-slate-500 border-white/5 hover:bg-white/10"
                        )}
                      >
                        <CreditCard size={20} />
                        T. CRÉDITO/DÉBITO
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'cash' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1 block">Recibido (Efectivo)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-600 italic uppercase tracking-tighter">S/</span>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-2xl font-black text-white italic outline-none focus:border-indigo-500 transition-all font-mono"
                          value={cashAmount}
                          onChange={(e) => setCashAmount(e.target.value)}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="bg-white/5 rounded-3xl p-6 flex flex-col justify-between border border-white/5">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                      <span>Total Venta</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {paymentMethod === 'cash' && cashAmount && (
                      <div className="flex justify-between items-center text-[10px] font-black text-emerald-400 uppercase tracking-widest italic">
                        <span>Recibido</span>
                        <span>{formatPrice(parseFloat(cashAmount))}</span>
                      </div>
                    )}
                    <div className="h-px bg-white/5"></div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-black text-slate-400 uppercase italic">Vuelto / Cambio</span>
                       <span className={cn(
                         "text-3xl font-black italic tracking-tighter font-mono",
                         parseFloat(cashAmount) >= total ? "text-emerald-400" : "text-slate-600"
                       )}>
                         {formatPrice(Math.max(0, (parseFloat(cashAmount || '0') - total)))}
                       </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <button 
                      onClick={handleProcessSale}
                      disabled={paymentMethod === 'cash' && (!cashAmount || parseFloat(cashAmount) < total)}
                      className="w-full h-16 bg-white hover:bg-slate-200 text-slate-900 rounded-2xl font-black uppercase italic tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Printer size={20} />
                      Finalizar & Recibo
                    </button>
                    <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest">Al finalizar se deducirá el stock maestro</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScannerOpen(false)}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Escáner de Barras</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Apunta la cámara al código del producto</p>
                  </div>
                </div>
                <button onClick={() => setIsScannerOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                  <X size={28} />
                </button>
              </div>
              <div className="p-8">
                <div id="reader" className="w-full overflow-hidden rounded-3xl border border-white/5 bg-black/40"></div>
                <div className="mt-6 flex items-center justify-center gap-3 text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest italic">Cámara Activa - Detectando...</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
