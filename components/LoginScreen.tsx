
import React, { useState } from 'react';
import { Lock, User as UserIcon, LogIn, BadgePercent, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username === 'admin' && password === '123') {
        onLogin({ login: 'admin', nome: 'Administrador Master', perfil: 'admin' });
      } else if (username === 'user' && password === '123') {
        onLogin({ login: 'user', nome: 'Usuário Padrão', perfil: 'user' });
      } else {
        setError('Credenciais inválidas. Tente novamente.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2074&auto=format&fit=crop")',
          filter: 'brightness(0.4) saturate(0.8)'
        }}
      />
      
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-blue-900/40 backdrop-blur-[2px]" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
          
          <div className="bg-slate-900/90 p-10 flex flex-col items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
              <BadgePercent className="w-8 h-8 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                Estoque<span className="text-blue-500">Pro</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] uppercase mt-1">
                Varejo Inteligente v2.0
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold text-slate-800">Acesso Restrito</h2>
              <p className="text-sm text-slate-400 font-medium italic">Gerencie seu estoque com sofisticação.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuário</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex.: Jonas."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all shadow-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-bold border border-rose-100 animate-in shake duration-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Iniciar Sessão
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 flex flex-col items-center gap-1 border-t border-slate-100">
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Credenciais de Teste</span>
               <div className="flex gap-4">
                 <span className="text-[10px] font-bold text-slate-400">Admin: admin/123</span>
                 <span className="text-[10px] font-bold text-slate-400">User: user/123</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
