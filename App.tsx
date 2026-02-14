
import React, { useState, useCallback, useEffect } from 'react';
import { PackageSearch, ShoppingCart, BadgePercent, AlertCircle, CheckCircle2, LogOut, Settings, X, Save, RefreshCw, ShieldCheck, User as UserIcon, Link as LinkIcon, Database, HardDrive, FileUp } from 'lucide-react';
import { Product, OrderItem, AppScreen, User, GoogleDriveConfig } from './types';
import InventoryScreen from './components/InventoryScreen';
import OrderScreen from './components/OrderScreen';
import LoginScreen from './components/LoginScreen';
import ImportScreen from './components/ImportScreen';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('estoque-pro-session');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

  const [currentScreen, setCurrentScreen] = useState<AppScreen>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [gdConfig, setGdConfig] = useState<GoogleDriveConfig>(() => {
    const saved = localStorage.getItem('estoque-pro-google-drive');
    const defaults = { sharedLink: '' };
    return saved ? JSON.parse(saved) : defaults;
  });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const syncWithGoogleDrive = useCallback(async (silent = false) => {
    if (!gdConfig.sharedLink) {
      if (!silent) showNotification("Configure o link do Google Drive primeiro.", "warning");
      return;
    }

    setIsSyncing(true);
    try {
      let fileId = '';
      const driveIdMatch = gdConfig.sharedLink.match(/\/d\/(.+?)\//) || gdConfig.sharedLink.match(/id=(.+?)(&|$)/);
      
      if (driveIdMatch && driveIdMatch[1]) {
        fileId = driveIdMatch[1];
      } else {
        throw new Error("Link do Google Drive inválido.");
      }

      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Erro ao acessar arquivo no G-Drive.");

      const arrayBuffer = await response.arrayBuffer();
      const XLSX = (window as any).XLSX;
      if (!XLSX) throw new Error("Biblioteca XLSX não carregada.");

      const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (Array.isArray(jsonData) && jsonData.length > 0) {
        const formatted: Product[] = jsonData.map((item: any) => {
          const findVal = (keys: string[]) => {
            const match = Object.keys(item).find(k => keys.includes(k.toLowerCase()));
            return match ? item[match] : null;
          };
          return {
            codigo: String(findVal(['codigo', 'código', 'id', 'sku']) || ''),
            descricao: String(findVal(['descricao', 'descrição', 'nome', 'produto']) || ''),
            estoque: Number(findVal(['estoque', 'quantidade', 'qtd', 'stock']) || 0),
            preco: Number(findVal(['preco', 'preço', 'valor', 'price']) || 0)
          };
        }).filter(p => p.codigo !== '');

        setProducts(formatted);
        if (!silent) showNotification(`${formatted.length} produtos sincronizados!`, 'success');
      }
    } catch (error: any) {
      if (!silent) showNotification(error.message || "Erro na sincronização.", "error");
    } finally {
      setIsSyncing(false);
    }
  }, [gdConfig, showNotification]);

  useEffect(() => {
    if (user) {
      const savedProducts = localStorage.getItem('estoque-pro-products');
      const savedOrder = localStorage.getItem('estoque-pro-order');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedOrder) setOrderList(JSON.parse(savedOrder));
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('estoque-pro-products', JSON.stringify(products));
      localStorage.setItem('estoque-pro-order', JSON.stringify(orderList));
    }
  }, [products, orderList, user]);

  const handleLogin = (loggedUser: User) => {
    localStorage.setItem('estoque-pro-session', JSON.stringify(loggedUser));
    setUser(loggedUser);
    showNotification(`Bem-vindo, ${loggedUser.nome}!`, 'success');
  };

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      localStorage.removeItem('estoque-pro-session');
      setUser(null);
      setCurrentScreen('inventory');
    }
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  const isAdmin = user.perfil === 'admin';

  return (
    <div className="flex flex-col min-h-screen text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 animate-in fade-in duration-500">
      <header className="bg-slate-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentScreen('inventory')}>
            <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-500 transition-colors">
              <BadgePercent className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight leading-none uppercase">ESTOQUE<span className="text-blue-500">PRO</span></h1>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest ${isAdmin ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {user.perfil}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Gestão de Ativos</p>
            </div>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-2 items-center">
            {isAdmin && (
              <button 
                onClick={() => setCurrentScreen('import')} 
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${currentScreen === 'import' ? 'bg-white text-slate-900 shadow-lg' : 'hover:bg-slate-800 text-blue-400'}`}
              >
                <FileUp className="w-4 h-4" />
                <span className="hidden sm:inline">Atualizar Base</span>
              </button>
            )}

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>
            
            <button onClick={() => setCurrentScreen('inventory')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${currentScreen === 'inventory' ? 'bg-white text-slate-900 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
              <PackageSearch className="w-4 h-4" />
              <span className="hidden sm:inline">Consulta</span>
            </button>
            
            <button onClick={() => setCurrentScreen('order')} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${currentScreen === 'order' ? 'bg-white text-slate-900 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Pedido</span>
              {orderList.length > 0 && <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] rounded-full min-w-[20px] h-[20px] px-1 flex items-center justify-center border-2 border-slate-900 font-black animate-pulse">{orderList.length}</span>}
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>

            <button 
              onClick={handleLogout} 
              className={`p-2.5 rounded-xl transition-colors text-white shadow-lg ${isAdmin ? 'bg-slate-800 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </header>

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-8 zoom-in-95 duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${notification.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : notification.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800' : 'bg-rose-50/90 border-rose-200 text-rose-800'}`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold text-sm tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}

      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
           <div className="flex items-center gap-2 text-slate-400">
              <UserIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{user.nome}</span>
           </div>
        </div>

        {currentScreen === 'inventory' && (
          <InventoryScreen products={products} onGoToOrder={() => setCurrentScreen('order')} onAddToOrder={item => {
            setOrderList(prev => [...prev, item]);
            showNotification('Item adicionado!', 'success');
          }} />
        )}

        {currentScreen === 'order' && (
          <OrderScreen 
            user={user}
            products={products} 
            orderList={orderList} 
            onAddItem={item => { setOrderList(prev => [...prev, item]); showNotification('Item adicionado!', 'success'); }} 
            onRemoveItem={(idx) => setOrderList(prev => prev.filter((_, i) => i !== idx))} 
            onUpdateItem={(idx, item) => setOrderList(prev => { const n = [...prev]; n[idx] = item; return n; })} 
            onClear={() => confirm('Limpar lista?') && setOrderList([])} 
          />
        )}

        {currentScreen === 'import' && isAdmin && (
          <ImportScreen 
            productsCount={products.length}
            gdConfig={gdConfig}
            onSaveGdConfig={(config) => {
              setGdConfig(config);
              localStorage.setItem('estoque-pro-google-drive', JSON.stringify(config));
            }}
            onUpdateProducts={(newProducts) => {
              setProducts(newProducts);
              showNotification("Base de produtos atualizada com sucesso!", "success");
              setCurrentScreen('inventory');
            }}
            onSyncDrive={() => syncWithGoogleDrive(false)}
            isSyncing={isSyncing}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Estoque Pro 2025</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 opacity-40 grayscale">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-600 uppercase">Seguro</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
