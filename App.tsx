
import React, { useState, useCallback } from 'react';
import { PackageSearch, ShoppingCart, BadgePercent, LayoutDashboard, FileSpreadsheet, Send, Search, PlusCircle, Trash2, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product, OrderItem, AppScreen } from './types';
import InventoryScreen from './components/InventoryScreen';
import OrderScreen from './components/OrderScreen';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleImportProducts = (importedProducts: Product[]) => {
    setProducts(importedProducts);
    showNotification(`${importedProducts.length} produtos importados com sucesso!`, 'success');
  };

  const handleAddToOrder = (item: OrderItem) => {
    setOrderList(prev => [...prev, item]);
    showNotification('Produto adicionado à lista!', 'success');
  };

  const removeFromOrder = (index: number) => {
    setOrderList(prev => prev.filter((_, i) => i !== index));
    showNotification('Item removido da lista.', 'success');
  };

  const updateOrderItem = (index: number, updatedItem: OrderItem) => {
    setOrderList(prev => {
      const newList = [...prev];
      newList[index] = updatedItem;
      return newList;
    });
  };

  return (
    <div className="flex flex-col min-h-screen text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BadgePercent className="w-8 h-8 text-yellow-400" />
            <h1 className="text-xl font-bold tracking-tight">Rebaixa Pro</h1>
          </div>
          <nav className="flex gap-1 bg-blue-800/50 p-1 rounded-lg">
            <button
              onClick={() => setCurrentScreen('inventory')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                currentScreen === 'inventory' ? 'bg-white text-blue-700 shadow-sm' : 'hover:bg-blue-600'
              }`}
            >
              <PackageSearch className="w-4 h-4" />
              Consulta
            </button>
            <button
              onClick={() => setCurrentScreen('order')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                currentScreen === 'order' ? 'bg-white text-blue-700 shadow-sm' : 'hover:bg-blue-600'
              }`}
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {orderList.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-blue-800">
                    {orderList.length}
                  </span>
                )}
              </div>
              Rebaixa
            </button>
          </nav>
        </div>
      </header>

      {/* Notifications */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] animate-bounce">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-semibold">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow max-w-5xl w-full mx-auto p-4 md:p-8">
        {currentScreen === 'inventory' ? (
          <InventoryScreen 
            products={products} 
            onImport={handleImportProducts} 
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
            onClear={() => setOrderList([])}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-200 py-6 text-center text-slate-500 text-sm border-t">
        <p>&copy; 2024 Gerenciador de Rebaixa Pro - Organização e Agilidade</p>
      </footer>
    </div>
  );
};

export default App;
