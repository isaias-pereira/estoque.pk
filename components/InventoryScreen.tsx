
import React, { useState, useMemo } from 'react';
import { Search, PlusCircle, DollarSign, Package, AlertCircle, Database, SearchCode } from 'lucide-react';
import { Product, OrderItem } from '../types';

interface InventoryScreenProps {
  products: Product[];
  onGoToOrder: () => void;
  onAddToOrder: (item: OrderItem) => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ products, onGoToOrder, onAddToOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lastSearchedTerm, setLastSearchedTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Filtra apenas pelo código exato conforme solicitado
  const filteredProducts = useMemo(() => {
    if (!hasSearched || !lastSearchedTerm.trim()) return [];
    const term = lastSearchedTerm.trim().toLowerCase();
    return products.filter(p => p.codigo.toLowerCase() === term);
  }, [lastSearchedTerm, products, hasSearched]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setLastSearchedTerm(searchTerm);
    setHasSearched(true);
  };

  const handleQuickAdd = (p: Product) => {
    onAddToOrder({
      codigo: p.codigo,
      descricao: p.descricao,
      quantidade: 1,
      precoOriginal: p.preco,
      precoSugerido: p.preco
    });
  };

  return (
    <div className="relative -m-4 sm:-m-8 min-h-[calc(100vh-160px)] flex flex-col items-center justify-start p-4 sm:p-12 overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=2074&auto=format&fit=crop")',
        }}
      />
      {/* Overlay & Blur */}
      <div className="absolute inset-0 z-0 bg-slate-900/40 backdrop-blur-[6px]" />

      <div className="relative z-10 w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Card de Busca */}
        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center md:text-left">Consulta de Produto</h2>
              <p className="text-slate-500 font-medium text-center md:text-left">Insira o código numérico exato do produto para consultar detalhes.</p>
            </div>

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <Search className="w-5 h-5 sm:w-6 h-6" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={searchTerm}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setSearchTerm(val);
                    if (hasSearched) setHasSearched(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Digite o código (apenas números)..."
                  className="w-full pl-12 sm:pl-16 pr-6 py-5 sm:py-6 bg-slate-100/50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[1.5rem] outline-none text-base sm:text-xl font-bold text-slate-800 transition-all shadow-inner placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <SearchCode className="w-4 h-4" />
                Consultar Código
              </button>
            </div>

            {/* Alerta de Base Vazia */}
            {products.length === 0 && (
              <div className="flex items-center gap-4 p-6 bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-3xl text-blue-800">
                <div className="bg-blue-600 p-3 rounded-2xl">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-medium">
                  <p className="font-black uppercase text-xs tracking-wider">Base de dados não carregada</p>
                  <p className="opacity-80">Importe uma planilha para começar a consultar.</p>
                </div>
              </div>
            )}
          </div>

          {/* Exibição do Resultado */}
          {hasSearched && (
            <div className="px-8 pb-12 animate-in fade-in zoom-in-95 duration-300">
              {filteredProducts.length > 0 ? (
                <div className="bg-white rounded-[1.5rem] border-2 border-blue-100 overflow-hidden shadow-sm">
                  {filteredProducts.map((product) => (
                    <div key={product.codigo} className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-black bg-blue-600 text-white px-2 py-0.5 rounded uppercase">{product.codigo}</span>
                          <h4 className="text-xl font-bold text-slate-900">{product.descricao}</h4>
                        </div>
                        <div className="flex items-center gap-8 text-slate-500 text-sm font-bold">
                          <div className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-slate-300" />
                            <span>Estoque: <b className="text-slate-900">{product.estoque}</b></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-slate-300" />
                            <span>Preço: <b className="text-blue-600">R$ {product.preco.toFixed(2)}</b></span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleQuickAdd(product)}
                        className="flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md hover:bg-black active:scale-95 whitespace-nowrap"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Adicionar Lista
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center space-y-4 border-2 border-dashed border-rose-200 rounded-[2rem] bg-rose-50/80 backdrop-blur-sm">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 rounded-full">
                      <AlertCircle className="w-10 h-10 text-rose-500" />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-rose-800 uppercase tracking-tight">Produto não encontrado</h3>
                      <p className="text-rose-500 font-medium">O código "{lastSearchedTerm}" não existe na base atual.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryScreen;
