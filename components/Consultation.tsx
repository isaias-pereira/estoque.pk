
import React, { useState } from 'react';
import { Product } from '../types';

interface ConsultationProps {
  inventory: Product[];
  lastUpdate: string | null;
}

const Consultation: React.FC<ConsultationProps> = ({ inventory, lastUpdate }) => {
  const [searchCode, setSearchCode] = useState('');
  const [result, setResult] = useState<Product | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode) return;

    const found = inventory.find(item => 
      String(item.ean) === searchCode
    );
    setResult(found || null);
    setSearched(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setSearchCode(value);
    setSearched(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            Consulta de Itens
          </h2>
          {lastUpdate && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              Atualizado: {lastUpdate}
            </span>
          )}
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={searchCode}
            onChange={handleInputChange}
            className="flex-grow px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50/30 focus:bg-white text-black font-medium outline-none transition-all shadow-sm"
            placeholder="Aponte o leitor ou digite o EAN..."
          />
          <button
            type="submit"
            disabled={!searchCode}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-md whitespace-nowrap"
          >
            Buscar
          </button>
        </form>
      </div>

      <div className="min-h-[250px]">
        {searched && result ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-slideUp">
            <div className="p-10">
              <div className="mb-8">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Descrição do Produto</span>
                <h3 className="text-3xl font-black text-slate-800 leading-tight">{result.descricao}</h3>
                <div className="mt-2 flex items-center text-slate-400 font-bold text-sm">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  EAN: {result.ean}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 text-white">
                  <label className="text-[10px] font-black text-indigo-200 uppercase tracking-widest block mb-1">Estoque Teórico</label>
                  <p className="text-4xl font-black">{result.estoque}</p>
                </div>
                <div className="bg-emerald-600 p-6 rounded-3xl shadow-lg shadow-emerald-100 text-white">
                  <label className="text-[10px] font-black text-emerald-200 uppercase tracking-widest block mb-1">Preço de Venda</label>
                  <p className="text-4xl font-black">{formatCurrency(result.preco)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : searched ? (
          <div className="bg-red-50 text-red-700 p-10 rounded-3xl text-center border border-red-100">
             <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </div>
             <p className="font-black uppercase tracking-widest text-sm">Produto não encontrado na base</p>
             <p className="text-xs mt-1 text-red-500">Verifique se o EAN está correto ou se a base foi atualizada.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-50">
             <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
             </svg>
             <p className="font-medium text-sm">Aguardando leitura de código de barras...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultation;
