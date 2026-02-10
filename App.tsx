
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PackageSearch, ShoppingCart, BadgePercent, Upload, AlertCircle, CheckCircle2, LogOut, Cloud, Settings, X, Save, RefreshCw, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Product, OrderItem, AppScreen, User, AppSheetConfig } from './types';
import InventoryScreen from './components/InventoryScreen';
import OrderScreen from './components/OrderScreen';
import LoginScreen from './components/LoginScreen';

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
  const [showConfig, setShowConfig] = useState(false);
  
  const [appSheetConfig, setAppSheetConfig] = useState<AppSheetConfig>(() => {
    const saved = localStorage.getItem('estoque-pro-appsheet');
    const defaults = { 
      appId: '792aa598-0137-43ac-83a6-fb9e3195d87d', 
      accessKey: 'V2-ajwKG-btex2-Wl5DT-ZkJL2-e7R8x-5BsNH-kaumB-RHNy7', 
      tableName: 'Planilha1' 
    };
    return saved ? JSON.parse(saved) : defaults;
  });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const syncWithAppSheet = useCallback(async (silent = false) => {
    if (!appSheetConfig.appId || !appSheetConfig.accessKey || !appSheetConfig.tableName) {
      if (!silent) {
        showNotification("Configure as credenciais do AppSheet primeiro.", "warning");
        setShowConfig(true);
      }
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`https://api.appsheet.com/api/v2/apps/${appSheetConfig.appId}/tables/${appSheetConfig.tableName}/Action`, {
        method: 'POST',
        headers: {
          'ApplicationAccessKey': appSheetConfig.accessKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Action: "Find",
          Properties: { Locale: "pt-BR" },
          Rows: []
        })
      });

      if (!response.ok) throw new Error("Falha na comunicação com AppSheet");

      const data = await response.json();
      
      if (Array.isArray(data)) {
        const formatted: Product[] = data.map((item: any) => ({
          codigo: String(item.codigo || item.Codigo || item.ID || item.CÓDIGO || ''),
          descricao: String(item.descricao || item.Descricao || item.Nome || item.DESCRIÇÃO || ''),
          estoque: Number(item.estoque || item.Estoque || item.Quantidade || item.ESTOQUE || 0),
          preco: Number(item.preco || item.Preco || item.Valor || item.PREÇO || 0)
        })).filter(p => p.codigo !== '');

        setProducts(formatted);
        if (!silent) {
          showNotification(`${formatted.length} produtos sincronizados do AppSheet!`, 'success');
        }
      } else {
        throw new Error("Formato de dados inválido recebido.");
      }
    } catch (error) {
      console.error(error);
      if (!silent) {
        showNotification("Erro ao sincronizar com AppSheet.", "error");
      }
    } finally {
      setIsSyncing(false);
    }
  }, [appSheetConfig, showNotification]);

  useEffect(() => {
    if (user) {
      const savedProducts = localStorage.getItem('estoque-pro-products');
      const savedOrder = localStorage.getItem('estoque-pro-order');
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedOrder) setOrderList(JSON.parse(savedOrder));
      
      syncWithAppSheet(true);
    }
  }, [user, syncWithAppSheet]);

  useEffect(() => {
    if (user) {
      const intervalId = setInterval(() => {
        syncWithAppSheet(true);
      }, 86400000); 
      return () => clearInterval(intervalId);
    }
  }, [user, syncWithAppSheet]);

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
    const isAdmin = user?.perfil === 'admin';
    const message = isAdmin ? 'Deseja realmente sair do sistema?' : 'Deseja trocar de usuário?';
    
    if (confirm(message)) {
      localStorage.removeItem('estoque-pro-session');
      setUser(null);
      setCurrentScreen('inventory');
    }
  };

  const saveAppSheetConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('estoque-pro-appsheet', JSON.stringify(appSheetConfig));
    setShowConfig(false);
    showNotification("Configurações salvas!", "success");
    syncWithAppSheet();
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
            <button 
              onClick={() => syncWithAppSheet()} 
              disabled={isSyncing}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isSyncing ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800 text-blue-400'}`}
            >
              <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Sincronizando...' : 'Atualizar Base'}</span>
            </button>

            {isAdmin && (
              <button onClick={() => setShowConfig(true)} className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors" title="Configurar AppSheet">
                <Settings className="w-4 h-4" />
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
              title={isAdmin ? "Sair do Sistema" : "Trocar Usuário"}
            >
              {isAdmin ? <LogOut className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
            </button>
          </nav>
        </div>
      </header>

      {showConfig && isAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowConfig(false)} />
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Conectar AppSheet</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Configurações de Administrador</p>
              </div>
              <button onClick={() => setShowConfig(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={saveAppSheetConfig} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">App ID</label>
                <input type="text" required value={appSheetConfig.appId} onChange={e => setAppSheetConfig({...appSheetConfig, appId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                <input type="password" required value={appSheetConfig.accessKey} onChange={e => setAppSheetConfig({...appSheetConfig, accessKey: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Tabela</label>
                <input type="text" required value={appSheetConfig.tableName} onChange={e => setAppSheetConfig({...appSheetConfig, tableName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold text-slate-700 transition-all" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl flex items-center justify-center gap-3">
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            </form>
          </div>
        </div>
      )}

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
        {currentScreen === 'inventory' ? (
          <InventoryScreen products={products} onGoToOrder={() => setCurrentScreen('order')} onAddToOrder={item => {
            setOrderList(prev => [...prev, item]);
            showNotification('Item adicionado!', 'success');
          }} />
        ) : (
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
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Estoque Pro 2025</p>
            <div className="h-3 w-px bg-slate-200" />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{user.perfil} Mode</span>
          </div>
          <div className="flex items-center gap-4">
            {appSheetConfig.appId && (
              <div className="flex items-center gap-2 opacity-60">
                <RefreshCw className={`w-3 h-3 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Ciclo de 24h</span>
              </div>
            )}
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
