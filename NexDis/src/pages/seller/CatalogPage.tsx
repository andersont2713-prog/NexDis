import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, ChevronLeft, Info, Package, ArrowLeft, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegional } from '../../context/RegionalContext';
import { cn } from '../../lib/utils';
import type { Product } from '../../types';

export default function CatalogPage() {
  const { formatPrice } = useRegional();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/inventory')
      .then(res => res.json())
      .then(setProducts);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0F172A] relative overflow-hidden">
      <div className="decorative-blur top-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-500/10"></div>
      
      <div className="p-6 shrink-0 border-b border-white/5 flex items-center gap-4 relative z-10 backdrop-blur-md bg-slate-900/40">
        <button onClick={() => navigate('/seller')} className="p-2.5 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl border border-transparent hover:border-white/10 transition-all">
           <ArrowLeft size={22} />
        </button>
        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase font-display">Catálogo Express</h2>
      </div>

      <div className="p-4 shrink-0 bg-white/5 flex items-center gap-3 relative z-10 border-b border-white/5 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Nombre o SKU..." 
            className="input-glass pl-10 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all">
           <Filter size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 relative z-10 pb-28">
         {products
           .filter(p => 
             p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             p.sku.toLowerCase().includes(searchTerm.toLowerCase())
           )
           .map(product => (
           <div key={product.id} className="frosted-card flex gap-5 hover:border-indigo-500/30 transition-all active:scale-[0.98] group relative overflow-hidden">
              <div className="w-28 h-28 bg-slate-800 rounded-2xl overflow-hidden shrink-0 border border-white/5 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                 <img src={`https://picsum.photos/seed/${product.sku}/200/200`} alt="p" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                 <div>
                    <h4 className="font-black text-white italic tracking-tight leading-tight uppercase text-base">{product.name}</h4>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase italic tracking-widest mt-1">PRODUCT SKU: {product.sku}</p>
                 </div>
                 <div className="flex items-end justify-between">
                    <div>
                        <p className="text-xl font-black text-white font-mono tracking-tighter uppercase">{formatPrice(product.price ?? 4.50)}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                           <span className={cn(
                             "w-1.5 h-1.5 rounded-full shadow-[0_0_8px]",
                             product.stock > 100 ? "bg-emerald-500 shadow-emerald-500/50" : "bg-rose-500 shadow-rose-500/50"
                           )}></span>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter italic">
                              En Stock: {product.stock}
                           </p>
                        </div>
                    </div>
                    <button className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20 active:scale-90 transition-all active:rotate-12 border border-white/10 hover:bg-indigo-500 translate-y-1">
                       <Plus size={24} className="stroke-[3]" />
                    </button>
                 </div>
              </div>
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/30 group-hover:bg-indigo-500 transition-all"></div>
           </div>
         ))}
      </div>
    </div>
  );
}


