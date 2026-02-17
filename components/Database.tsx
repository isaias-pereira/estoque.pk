
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
  
  // AppSheet Credentials (Hardcoded as requested for direct communication)
  const appId = '983606345 isaias.pereira0003@gmail.com';
  const accessKey = 'estoquepro';
  const tableName = 'base';

  const fileConsultRef = useRef<HTMLInputElement>(null);

  const handleConsultationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading({ ...loading, consultation: true });
    setStatus({ ...status, consultation: null });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Esperamos 4 colunas: EAN, Descrição, Estoque, Preço
        const dataRows = rows.slice(1).filter(r => r.length >= 4);
        const formatted: Product[] = dataRows.map(row => ({
          ean: String(row[0] || '').trim(),
          descricao: String(row[1] || '').trim(),
          estoque: Number(row[2]) || 0,
          preco: Number(row[3]) || 0
        }));

        if (formatted.length === 0) throw new Error("Nenhum dado válido encontrado.");

        onUploadConsultation(formatted);
        setStatus({ ...status, consultation: { type: 'success', message: `${formatted.length} itens carregados para consulta.` } });
      } catch (err) {
        setStatus({ ...status, consultation: { type: 'error', message: 'Erro ao processar arquivo. Verifique se há 4 colunas (EAN, Descrição, Estoque, Preço).' } });
      } finally {
        setLoading({ ...loading, consultation: false });
      }
    };
    reader.readAsBinaryString(file);
  };

  const syncWithAppSheet = async () => {
    setLoading({ ...loading, appsheet: true });
    setStatus({ ...status, appsheet: null });

    try {
      const response = await fetch(`https://api.appsheet.com/api/v2/apps/${encodeURIComponent(appId)}/tables/${encodeURIComponent(tableName)}/Action`, {
        method: 'POST',
        headers: {
          'ApplicationAccessKey': accessKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Action: "Find",
          Properties: {
            Locale: "pt-BR",
            Timezone: "E. South America Standard Time"
          },
          Rows: []
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!Array.isArray(result)) {
        throw new Error("Resposta da API inválida ou sem dados.");
      }

      // Mapear dados do AppSheet para o formato InventoryItem do sistema
      // Assumindo que as colunas no AppSheet tenham nomes similares
      const formatted: InventoryItem[] = result.map((row: any) => ({
        ean: String(row.EAN || row.ean || ''),
        codigo: String(row.Codigo || row.codigo || row.ID || ''),
        descricao: String(row.Descricao || row.descricao || row.Nome || ''),
        quantidade: Number(row.Quantidade || row.quantidade || 0)
      }));

      onUploadInventory(formatted);
      setStatus({ ...status, appsheet: { type: 'success', message: `Sincronizado! ${formatted.length} itens importados do AppSheet.` } });
    } catch (err) {
      console.error(err);
      setStatus({ 
        ...status, 
        appsheet: { 
          type: 'error', 
          message: 'Falha na conexão direta. Verifique se o AppSheet permite chamadas de API ou se as credenciais estão ativas.' 
        } 
      });
    } finally {
      setLoading({ ...loading, appsheet: false });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Base de Dados</h2>
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
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Upload local para consulta de preços e estoque teórico. 
              <br/>Requer: <span className="font-bold text-blue-600">EAN, Descrição, Estoque, Preço</span>.
            </p>
            
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
              className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-black py-4 px-6 rounded-2xl border-2 border-dashed border-blue-200 transition-all flex items-center justify-center mb-4 text-xs uppercase tracking-widest"
            >
              {loading.consultation ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Lendo arquivo...
                </span>
              ) : 'Selecionar Planilha'}
            </button>

            {status.consultation && (
              <div className={`p-4 rounded-xl text-xs font-bold animate-slideUp ${status.consultation.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {status.consultation.message}
              </div>
            )}
          </div>
          <div className="bg-blue-600 p-3 text-center">
             <span className="text-[9px] text-white font-black uppercase tracking-[0.2em]">Upload de Arquivo Local</span>
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
            <h3 className="text-lg font-black text-slate-800 mb-2">2. Inventário AppSheet</h3>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Sincronização direta com a planilha do AppSheet configurada.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase">App ID</span>
                  <span className="text-[9px] font-bold text-slate-600 truncate max-w-[150px]">{appId}</span>
               </div>
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Tabela</span>
                  <span className="text-[9px] font-bold text-slate-600">{tableName}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Status</span>
                  <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                    Configurado
                  </span>
               </div>
            </div>

            <button
              onClick={syncWithAppSheet}
              disabled={loading.appsheet}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] text-xs uppercase tracking-widest flex items-center justify-center"
            >
              {loading.appsheet ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                  Conectando API...
                </span>
              ) : 'Sincronizar Agora'}
            </button>

            {status.appsheet && (
              <div className={`mt-4 p-4 rounded-xl text-xs font-bold animate-slideUp ${status.appsheet.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                {status.appsheet.message}
              </div>
            )}
          </div>
          <div className="bg-purple-600 p-3 text-center">
             <span className="text-[9px] text-white font-black uppercase tracking-[0.2em]">Conexão Google AppSheet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Database;
