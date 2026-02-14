
import React, { useState, useRef } from 'react';
import { FileUp, HardDrive, Download, AlertCircle, CheckCircle2, FileSpreadsheet, Trash2, ArrowRight, Loader2, Link as LinkIcon } from 'lucide-react';
import { Product, GoogleDriveConfig } from '../types';

interface ImportScreenProps {
  productsCount: number;
  gdConfig: GoogleDriveConfig;
  onSaveGdConfig: (config: GoogleDriveConfig) => void;
  onUpdateProducts: (products: Product[]) => void;
  onSyncDrive: () => Promise<void>;
  isSyncing: boolean;
}

const ImportScreen: React.FC<ImportScreenProps> = ({ 
  productsCount, 
  gdConfig, 
  onSaveGdConfig, 
  onUpdateProducts, 
  onSyncDrive,
  isSyncing 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [tempLink, setTempLink] = useState(gdConfig.sharedLink);
  const [previewProducts, setPreviewProducts] = useState<Product[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const XLSX = (window as any).XLSX;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        const formatted: Product[] = json.map((item: any) => {
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

        setPreviewProducts(formatted);
      } catch (err) {
        alert("Erro ao processar arquivo. Certifique-se de que é um Excel (.xlsx) válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const confirmImport = () => {
    if (previewProducts) {
      onUpdateProducts(previewProducts);
      setPreviewProducts(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header da Tela */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Gestão da Base</h2>
          <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Atualize seu inventário manualmente ou via nuvem</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter leading-none">Total na Base</p>
            <p className="text-xl font-black text-blue-600 leading-none mt-1">{productsCount.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card: Upload Manual */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-900 text-white flex items-center gap-3">
            <FileUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-widest">Upload Manual (Excel)</h3>
          </div>
          
          <div className="p-8 flex-grow space-y-6">
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative h-64 border-2 border-dashed rounded-[1.5rem] transition-all flex flex-col items-center justify-center text-center p-6 gap-4
                ${dragActive ? 'border-blue-500 bg-blue-50 scale-[0.99]' : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'}
                ${previewProducts ? 'border-emerald-500 bg-emerald-50' : ''}
              `}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx" 
                onChange={handleFileChange}
                className="hidden" 
              />
              
              {!previewProducts ? (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Download className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Arraste seu arquivo aqui</p>
                    <p className="text-xs text-slate-400 mt-1">ou clique para selecionar do computador</p>
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:border-slate-900 transition-all active:scale-95"
                  >
                    Selecionar Arquivo
                  </button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center text-white">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-black text-emerald-800 uppercase tracking-tight">{previewProducts.length} Produtos Detectados</p>
                    <p className="text-xs text-emerald-600 font-bold mt-1">Pronto para importar para a base</p>
                  </div>
                  <div className="flex gap-2 w-full mt-2">
                    <button 
                      onClick={() => setPreviewProducts(null)}
                      className="flex-1 px-4 py-3 bg-white border border-emerald-200 rounded-xl text-xs font-black text-emerald-700 uppercase tracking-widest hover:bg-emerald-100 transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={confirmImport}
                      className="flex-[2] px-4 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                    >
                      Gravar Dados <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-700 uppercase leading-tight tracking-tight">
                Aviso: Carregar um novo arquivo substituirá completamente os dados atuais na base.
              </p>
            </div>
          </div>
        </div>

        {/* Card: Google Drive Sync */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-900 text-white flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xs font-black uppercase tracking-widest">Sincronização Nuvem</h3>
          </div>
          
          <div className="p-8 flex-grow space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" /> Link do Google Drive
                </label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={tempLink}
                    onChange={(e) => setTempLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="flex-grow px-4 py-3 bg-slate-100/60 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 outline-none font-bold text-slate-700 text-sm transition-all shadow-inner placeholder:text-slate-400/70 placeholder:font-medium"
                  />
                  <button 
                    onClick={() => {
                      onSaveGdConfig({ sharedLink: tempLink });
                      alert("Link atualizado!");
                    }}
                    className="px-4 py-3 bg-slate-900 text-white hover:bg-black rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                  >
                    Salvar
                  </button>
                </div>
              </div>

              <div className="p-5 border-2 border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status: Conectado</span>
                  </div>
                  {gdConfig.sharedLink && (
                    <span className="text-[10px] font-bold text-slate-400 italic">Vínculo Ativo</span>
                  )}
                </div>
                
                <button 
                  onClick={onSyncDrive}
                  disabled={isSyncing || !gdConfig.sharedLink}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/10 active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-3"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Sincronizar Agora
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Instruções G-Drive:</h4>
                <ul className="text-[10px] font-bold text-slate-500 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px]">1</div>
                    Certifique-se que o acesso está como "Qualquer pessoa com o link".
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[8px]">2</div>
                    O sistema buscará a primeira aba da planilha.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Seção Perigosa: Limpeza */}
      <div className="bg-rose-50 rounded-[1.5rem] p-6 border border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h4 className="font-black text-rose-900 uppercase tracking-tight">Apagar Base Atual</h4>
            <p className="text-xs text-rose-500 font-bold">Remove todos os produtos permanentemente.</p>
          </div>
        </div>
        <button 
          onClick={() => confirm("Tem certeza que deseja apagar toda a base de produtos?") && onUpdateProducts([])}
          className="px-8 py-3 bg-white border-2 border-rose-200 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95 shadow-sm"
        >
          Zerar Banco de Dados
        </button>
      </div>

    </div>
  );
};

// Subcomponente de ícone de refresh para reutilização local
const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default ImportScreen;
