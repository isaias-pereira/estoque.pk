
import React from 'react';
import { User, View } from '../types';

interface HeaderProps {
  user: User;
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentView, onNavigate, onLogout }) => {
  return (
    <header className="bg-indigo-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-white p-1.5 rounded-lg">
            <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Estoque Pro</h1>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-4">
          <button
            onClick={() => onNavigate('consulta')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'consulta' ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600'
            }`}
          >
            Consulta
          </button>

          <button
            onClick={() => onNavigate('inventario')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentView === 'inventario' ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600'
            }`}
          >
            Inventário
          </button>
          
          {user.role === 'admin' && (
            <button
              onClick={() => onNavigate('database')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'database' ? 'bg-indigo-800 text-white' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              Base de Dados
            </button>
          )}

          <div className="h-6 w-px bg-indigo-500 hidden sm:block mx-2"></div>
          <div className="hidden md:flex items-center space-x-2 text-indigo-100 mr-2">
            <span className="text-xs uppercase font-semibold bg-indigo-800 px-2 py-0.5 rounded">
              {user.role}
            </span>
            <span className="text-sm">{user.username}</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-red-600 transition-colors flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Sair</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
