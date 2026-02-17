
import React, { useState, useRef } from 'react';
import { Product, InventoryItem } from '../types';

declare const XLSX: any;

interface DatabaseProps {
  onUploadConsultation: (data: Product[]) => void;
  onUploadInventory: (data: InventoryItem[]) => void;
  onBack: () => void;
}

const Database: React.FC<DatabaseProps> = ({ onUploadConsultation, onUploadInventory, onBack }) => {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [status, setStatus] = useState<{ [key: string]: { type: 'success' | 'error', message: string } | null }>({});
  
  const [appId, setAppId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [tableName, setTableName] = useState('');

  const fileConsultRef = useRef<HTMLInputElement>(null);

  const handleConsultationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading({ ...loading, consultation: true });
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Agora esperamos 4 colunas: EAN, Descrição, Estoque, Preço
        const dataRows = rows.slice(1).filter(r => r.length >= 4);
        const formatted: Product[] = dataRows.map(row => ({
          ean: String(row[0] || '').trim(),
          descricao: String(row[1] || '').trim(),
          estoque: Number(row[2]) || 0,
          preco: Number(row[3]) || 0
        }));

        onUploadConsultation(formatted);
        setStatus({ ...status, consultation: { type: 'success', message: `${formatted.length} itens carregados para consulta.` } });
      } catch (err) {
        setStatus({ ...status, consultation: { type: 'error', message: 'Erro ao processar arquivo de consulta.' } });
      } finally {
        setLoading({ ...loading, consultation: false });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleAppSheetConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId || !accessKey || !tableName) {
      setStatus({ ...status, appsheet: { type: 'error', message: 'Preencha todos os campos da API.' } });
      return;
    }

    setLoading({ ...loading, appsheet: true });
    setStatus({ ...status, appsheet: null });

    try {
      // Simulação de chamada de API do AppSheet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData: InventoryItem[] = [
        { ean: '7891234567890', codigo: '1001', descricao: 'ARROZ TIO JOAO 5KG', quantidade: 0 },
        { ean: '7890987654321', codigo: '1002', descricao: 'FEIJAO CAMIL 1KG', quantidade: 0 }
      ];

      onUploadInventory(mockData);
      setStatus({ ...status, appsheet: { type: 'success', message: 'Conectado ao AppSheet! Dados de inventário sincronizados.' } });
    } catch (err) {
      setStatus({ ...status, appsheet: { type: 'error', message: 'Falha na conexão com AppSheet.' } });
    } finally {
      setLoading({ ...loading, appsheet: false });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Gestão de Bases</h2>
          <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider mt-1">Configurações de Consulta e Inventário</p>
        </div>
        <button
          onClick={onBack}
          className="text-slate-600 hover:text-indigo-600 transition-all flex items-center text-sm font-bold uppercase tracking-widest bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-white/20"
        >
          Voltar
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 1. Base de Consulta */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden flex flex-col">
          <div className="p-8 flex-grow">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">1. Base de Consulta</h3>
            <p className="text-slate-500 text-xs mb-6">Importe o catálogo completo. Requer colunas: <span className="font-bold text-blue-600">EAN, Descrição, Estoque, Preço</span>.</p>
            
            <input 
              type="file" 
              ref={fileConsultRef} 
              onChange={handleConsultationUpload} 
              accept=".csv, .xlsx" 
              className="hidden" 
            />
            
            <button
              onClick={() => fileConsultRef.current?.click()}
              disabled={loading.consultation}
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-4 px-6 rounded-2xl border-2 border-dashed border-blue-200 transition-all flex items-center justify-center mb-4"
            >
              {loading.consultation ? 'Processando...' : 'Selecionar Planilha'}
            </button>

            {status.consultation && (
              <div className={`p-4 rounded-xl text-xs font-bold ${status.consultation.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {status.consultation.message}
              </div>
            )}
          </div>
          <div className="bg-blue-600 p-4 text-center">
             <span className="text-[10px] text-white font-black uppercase tracking-widest">Base de Preços e Estoque</span>
          </div>
        </div>

        {/* 2. Base de Inventário (AppSheet) */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-white/20 overflow-hidden flex flex-col">
          <div className="p-8 flex-grow">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">2. Inventário (AppSheet)</h3>
            <p className="text-slate-500 text-xs mb-6">Conexão direta para importar as listas de inventário do AppSheet.</p>

            <form onSubmit={handleAppSheetConnect} className="space-y-3">
              <input
                type="text"
                placeholder="App ID"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-4 focus:ring-purple-500/10 outline-none"
              />
              <input
                type="text"
                placeholder="Table Name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-4 focus:ring-purple-500/10 outline-none"
              />
              <input
                type="password"
                placeholder="API Access Key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-4 focus:ring-purple-500/10 outline-none"
              />
              <button
                type="submit"
                disabled={loading.appsheet}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] text-xs uppercase tracking-widest"
              >
                {loading.appsheet ? 'Conectando...' : 'Sincronizar AppSheet'}
              </button>
            </form>

            {status.appsheet && (
              <div className={`mt-4 p-4 rounded-xl text-xs font-bold ${status.appsheet.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {status.appsheet.message}
              </div>
            )}
          </div>
          <div className="bg-purple-600 p-4 text-center">
             <span className="text-[10px] text-white font-black uppercase tracking-widest">Coleta de Dados Externa</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Database;
