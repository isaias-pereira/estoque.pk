
import React, { useState } from 'react';
import { FileSpreadsheet, Search, ChevronRight, Info, PlusCircle, ShoppingCart, DollarSign, Package, AlertCircle } from 'lucide-react';
import { Product, OrderItem } from '../types';

interface InventoryScreenProps {
  products: Product[];
  onImport: (products: Product[]) => void;
  onGoToOrder: () => void;
  onAddToOrder: (item: OrderItem) => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ products, onImport, onGoToOrder, onAddToOrder }) => {
  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<Product | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const XLSX = (window as any).XLSX;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          alert("A planilha está vazia.");
          return;
        }

        // Validate mandatory columns
        const firstRowKeys = Object.keys(data[0] as object).map(k => k.toLowerCase());
        const required = ['codigo', 'descricao', 'estoque', 'preco'];
        const missing = required.filter(r => !firstRowKeys.includes(r));

        if (missing.length > 0) {
          alert(`Planilha inválida. Colunas ausentes: ${missing.join(', ')}`);
          return;
        }

        const formattedProducts: Product[] = data.map((item: any) => ({
          codigo: String(item.codigo || item.Codigo || ''),
          descricao: String(item.descricao || item.Descricao || ''),
          estoque: Number(item.estoque || item.Estoque || 0),
          preco: Number(item.preco || item.Preco || 0)
        })).filter((p: Product) => p.codigo !== '');

        onImport(formattedProducts);
      } catch (err) {
        alert("Erro ao processar o arquivo. Certifique-se de que é um CSV ou Excel válido.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSearch = () => {
    if (!searchCode.trim()) return;
    const found = products.find(p => p.codigo.toLowerCase() === searchCode.trim().toLowerCase());
    setSearchResult(found || null);
    setHasSearched(true);
  };

  const quickAdd = () => {
    if (searchResult) {
      onAddToOrder({
        codigo: searchResult.codigo,
        descricao: searchResult.descricao,
        quantidade: 1,
        precoOriginal: searchResult.preco,
        precoSugerido: searchResult.preco
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-blue-600" />
            Consulta e Importação
          </h2>
          <p className="text-slate-500 text-sm mt-1">Busque produtos ou atualize sua base de dados</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Main Controls */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 ml-1">Código do Produto</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Digite o código..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={products.length === 0}
                  className="bg-slate-800 text-white px-6 py-4 rounded-xl font-bold hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  Consultar
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 ml-1">Banco de Dados</label>
              <label className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-[1.125rem] rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                <FileSpreadsheet className="w-5 h-5" />
                Importar Planilha
                <input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          {products.length === 0 && (
            <div className="max-w-3xl mx-auto flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm">
              <Info className="w-5 h-5 shrink-0" />
              <p>O sistema está sem produtos. Por favor, utilize o botão <b>Importar Planilha</b> para carregar os dados (codigo, descricao, estoque, preco).</p>
            </div>
          )}

          {/* Results Area */}
          {hasSearched && (
            <div className={`max-w-3xl mx-auto p-6 rounded-2xl border-2 transition-all duration-300 ${
              searchResult ? 'border-green-100 bg-green-50/50 shadow-inner' : 'border-red-100 bg-red-50/50'
            }`}>
              {searchResult ? (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-4 flex-grow w-full">
                    <div className="flex items-center gap-2">
                      <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Produto Localizado</span>
                      <h3 className="text-2xl font-bold text-slate-800">{searchResult.descricao}</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Código</p>
                        <p className="font-mono font-bold text-slate-700">{searchResult.codigo}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Disponível</p>
                        <p className="font-bold text-blue-600 flex items-center gap-1">
                          <Package className="w-4 h-4" /> {searchResult.estoque} un
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Preço Atual</p>
                        <p className="font-bold text-green-600 flex items-center gap-1">
                          <DollarSign className="w-4 h-4" /> R$ {searchResult.preco.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={quickAdd}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-5 rounded-xl font-bold transition-all shadow-lg active:scale-95"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Adicionar à Lista
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-red-600 flex flex-col items-center gap-2">
                  <AlertCircle className="w-12 h-12 mb-2" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">Produto não encontrado</h3>
                  <p className="text-red-500">O código informado não corresponde a nenhum item da planilha.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          onClick={onGoToOrder}
          className="group flex items-center gap-3 bg-slate-900 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:bg-black transition-all shadow-2xl hover:-translate-y-1 active:translate-y-0"
        >
          <ShoppingCart className="w-6 h-6" />
          Nova Solicitação / Montar Lista
          <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default InventoryScreen;
