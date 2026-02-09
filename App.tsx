
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PackageSearch, ShoppingCart, BadgePercent, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product, OrderItem, AppScreen } from './types';
import InventoryScreen from './components/InventoryScreen';
import OrderScreen from './components/OrderScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('rebaixa-pro-products');
    const savedOrder = localStorage.getItem('rebaixa-pro-order');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedOrder) setOrderList(JSON.parse(savedOrder));
  }, []);

  // Persist products
  useEffect(() => {
    localStorage.setItem('rebaixa-pro-products', JSON.stringify(products));
  }, [products]);

  // Persist order list
  useEffect(() => {
    localStorage.setItem('rebaixa-pro-order', JSON.stringify(orderList));
  }, [orderList]);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const XLSX = (window as any).XLSX;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          showNotification("A planilha está vazia.", 'error');
          return;
        }

        const formattedProducts: Product[] = data.map((item: any) => ({
          codigo: String(item.codigo || item.Codigo || item.CÓDIGO || item.Código || ''),
          descricao: String(item.descricao || item.Descricao || item.DESCRIÇÃO || item.Descrição || ''),
          estoque: Number(item.estoque || item.Estoque || item.ESTOQUE || 0),
          preco: Number(item.preco || item.Preco || item.PREÇO || item.Preço || 0)
        })).filter((p: Product) => p.codigo !== '');

        if (formattedProducts.length === 0) {
            showNotification("Nenhum produto válido encontrado. Verifique as colunas.", 'error');
            return;
        }

        setProducts(formattedProducts);
        showNotification(`${formattedProducts.length} produtos importados e salvos!`, 'success');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        showNotification("Erro ao processar o arquivo.", 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAddToOrder = (item: OrderItem) => {
    const product = products.find(p => p.codigo === item.codigo);
    if (product && item.quantidade > product.estoque) {
      showNotification(`Atenção: Quantidade (${item.quantidade}) excede o estoque disponível (${product.estoque}).`, 'warning');
    }

    setOrderList(prev => [...prev, item]);
    showNotification('Item adicionado à lista!', 'success');
  };

  const removeFromOrder = (index: number) => {
    setOrderList(prev => prev.filter((_, i) => i !== index));
    showNotification('Item removido.', 'success');
  };

  const updateOrderItem = (index: number, updatedItem: OrderItem) => {
    setOrderList(prev => {
      const newList = [...prev];
      newList[index] = updatedItem;
      return newList;
    });
  };

  return (
    <div className="flex flex-col min-h-screen text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentScreen('inventory')}>
            <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-500 transition-colors">
              <BadgePercent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">REBAIXA<span className="text-blue-500">PRO</span></h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Gestor de Ativos</p>
            </div>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-2 items-center">
            <input 
              type="file" 
              className="hidden" 
              accept=".csv, .xlsx" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 hover:bg-slate-800 text-slate-400"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Atualizar Base</span>
              <span className="sm:hidden">Base</span>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>

            <button
              onClick={() => setCurrentScreen('inventory')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                currentScreen === 'inventory' ? 'bg-white text-slate-900 shadow-lg' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <PackageSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Consultar Estoque</span>
              <span className="sm:hidden">Estoque</span>
            </button>
            
            <button
              onClick={() => setCurrentScreen('order')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
                currentScreen === 'order' ? 'bg-white text-slate-900 shadow-lg' : 'hover:bg-slate-800 text-slate-400'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Lista de Rebaixa</span>
              <span className="sm:hidden">Rebaixa</span>
              {orderList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center border-2 border-slate-900 animate-pulse font-black">
                  {orderList.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Notifications */}
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-8 zoom-in-90 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            notification.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : 
            notification.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800' :
            'bg-rose-50/90 border-rose-200 text-rose-800'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-8">
        {currentScreen === 'inventory' ? (
          <InventoryScreen 
            products={products} 
            onGoToOrder={() => setCurrentScreen('order')}
            onAddToOrder={handleAddToOrder}
          />
        ) : (
          <OrderScreen 
            products={products}
            orderList={orderList}
            onAddItem={handleAddToOrder}
            onRemoveItem={removeFromOrder}
            onUpdateItem={updateOrderItem}
            onClear={() => {
              if (confirm('Deseja realmente limpar toda a lista?')) {
                setOrderList([]);
              }
            }}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
            Estoque Pro 2025
          </p>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 opacity-40 grayscale">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[10px] font-bold text-slate-600">SISTEMA ONLINE</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
