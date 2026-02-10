
import React, { useState, useMemo } from 'react';
import { Trash2, Send, Package, DollarSign, ListOrdered, PackagePlus, AlertCircle, Info, Calculator, FileDown, Mail, ShieldAlert } from 'lucide-react';
import { Product, OrderItem, User } from '../types';

interface OrderScreenProps {
  user: User;
  products: Product[];
  orderList: OrderItem[];
  onAddItem: (item: OrderItem) => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, item: OrderItem) => void;
  onClear: () => void;
}

const OrderScreen: React.FC<OrderScreenProps> = ({ user, products, orderList, onAddItem, onRemoveItem, onUpdateItem, onClear }) => {
  const [searchCode, setSearchCode] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const isAdmin = user.perfil === 'admin';

  const totalValue = useMemo(() => {
    return orderList.reduce((acc, item) => acc + (item.precoSugerido * item.quantidade), 0);
  }, [orderList]);

  const handleSearch = () => {
    setErrorMessage('');
    const found = products.find(p => p.codigo.toLowerCase() === searchCode.trim().toLowerCase());
    if (found) {
      setFoundProduct(found);
      const suggestedPrice = (found.preco * 0.7).toFixed(2);
      setPrice(suggestedPrice);
    } else {
      setFoundProduct(null);
      setErrorMessage('Produto não encontrado.');
    }
  };

  const handleAddItem = () => {
    if (!foundProduct) {
      setErrorMessage('Busque um produto válido primeiro.');
      return;
    }

    const qtyNum = parseInt(quantity);
    const priceNum = parseFloat(price);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMessage('Quantidade deve ser um número positivo.');
      return;
    }

    if (isNaN(priceNum)) {
      setErrorMessage('Sugestão de preço deve ser um valor numérico.');
      return;
    }

    onAddItem({
      codigo: foundProduct.codigo,
      descricao: foundProduct.descricao,
      quantidade: qtyNum,
      precoOriginal: foundProduct.preco,
      precoSugerido: priceNum
    });

    setFoundProduct(null);
    setSearchCode('');
    setQuantity('1');
    setPrice('');
    setErrorMessage('');
  };

  const handleExport = () => {
    if (!isAdmin) return;
    if (orderList.length === 0) return;
    setIsExporting(true);
    
    const XLSX = (window as any).XLSX;
    if (!XLSX) {
      alert("Erro: Biblioteca de exportação não carregada.");
      setIsExporting(false);
      return;
    }

    try {
      const worksheetData = orderList.map(item => ({
        'Código': item.codigo,
        'Descrição': item.descricao,
        'Quantidade': item.quantidade,
        'Preço Original': item.precoOriginal.toFixed(2),
        'Sugestão de Preço': item.precoSugerido.toFixed(2),
        'Total Item': (item.quantidade * item.precoSugerido).toFixed(2)
      }));
      
      const ws = XLSX.utils.json_to_sheet(worksheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Pedido_EstoquePro");
      XLSX.writeFile(wb, `pedido_estoque_pro_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`);
    } catch (e) {
      console.error("Erro ao gerar Excel:", e);
    }
    
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleSendEmail = () => {
    if (!isAdmin) return;
    if (orderList.length === 0) return;

    const emailTo = 'comercial@empresa.com.br';
    const subject = `[Estoque Pro] Nova Solicitação de Pedido - ${new Date().toLocaleDateString()}`;
    
    let bodyText = `Olá,\n\nSegue lista de produtos para atualização de preço/pedido:\n\n`;
    bodyText += `CÓDIGO | DESCRIÇÃO | QTD | P. SUGERIDO | SUBTOTAL\n`;
    bodyText += `-------|-----------|-----|-------------|----------\n`;
    
    orderList.forEach(item => {
      const sub = (item.quantidade * item.precoSugerido).toFixed(2);
      bodyText += `${item.codigo.padEnd(6)} | ${item.descricao.slice(0, 15).padEnd(15)} | ${String(item.quantidade).padEnd(3)} | R$${item.precoSugerido.toFixed(2).padEnd(9)} | R$${sub}\n`;
    });
    
    bodyText += `\nTOTAL GERAL: R$ ${totalValue.toFixed(2)}\n`;
    bodyText += `Total de itens: ${orderList.length}\n\n`;
    bodyText += `Favor anexar a planilha gerada pelo sistema Estoque Pro antes de enviar.`;

    const mailtoUrl = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 animate-in fade-in slide-in-from-right-8 duration-700">
      
      {/* LEFT: Order Form */}
      <div className="lg:col-span-5 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
               <PackagePlus className="w-4 h-4 sm:w-5 h-5 text-blue-400" />
               <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em]">Lançar Novo Item</h2>
            </div>
          </div>
          
          <div className="p-5 sm:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Código do Produto</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Ex: 85293"
                  className="flex-grow px-4 py-3 sm:px-5 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl focus:border-blue-500 outline-none font-bold text-sm sm:text-base text-slate-800 transition-all shadow-inner"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="bg-slate-100 text-slate-900 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:bg-slate-200 font-black text-[10px] sm:text-xs uppercase tracking-widest transition-colors shadow-sm whitespace-nowrap">Buscar</button>
              </div>
            </div>

            {foundProduct && (
              <div className="p-4 sm:p-6 bg-blue-50/50 border-2 border-blue-100 rounded-xl sm:rounded-[1.5rem] animate-in zoom-in-95 space-y-2">
                <div className="flex justify-between items-start gap-2">
                    <h3 className="font-black text-slate-800 text-[11px] sm:text-sm uppercase leading-tight">{foundProduct.descricao}</h3>
                    <span className="text-[8px] sm:text-[10px] bg-blue-600 text-white font-black px-1.5 py-0.5 rounded uppercase shrink-0">Ativo</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 sm:pt-2">
                    <div className="text-[8px] sm:text-[10px] text-blue-600 font-black flex items-center gap-1">
                        <Package className="w-2.5 h-2.5 sm:w-3 h-3" /> {foundProduct.estoque} ESTOQUE
                    </div>
                    <div className="text-[8px] sm:text-[10px] text-blue-600 font-black flex items-center gap-1">
                        <DollarSign className="w-2.5 h-2.5 sm:w-3 h-3" /> R$ {foundProduct.preco.toFixed(2)}
                    </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Qtd</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-3 sm:px-5 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl text-center font-black text-base sm:text-lg shadow-inner outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center block">Sugestão R$ (70%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-3 sm:px-5 sm:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl text-center font-black text-base sm:text-lg text-blue-600 shadow-inner outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 sm:p-4 bg-rose-50 text-rose-700 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold border border-rose-100">
                <AlertCircle className="w-3.5 h-3.5 sm:w-4 h-4" /> {errorMessage}
              </div>
            )}

            <button
              onClick={handleAddItem}
              disabled={!foundProduct}
              className="w-full py-4 sm:py-5 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2 sm:gap-3"
            >
              <PackagePlus className="w-4 h-4 sm:w-5 h-5" /> Adicionar à Lista
            </button>
          </div>
        </div>

        <div className="bg-emerald-600 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 text-white shadow-xl shadow-emerald-500/20 flex flex-col justify-between h-32 sm:h-40">
            <div className="flex justify-between items-start">
                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Total Pedido</p>
                <Calculator className="w-4 h-4 sm:w-5 h-5 opacity-40" />
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2">
                <span className="text-sm sm:text-xl font-bold opacity-70">R$</span>
                <span className="text-3xl sm:text-5xl font-black tracking-tighter">{totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6">
        <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden flex flex-col flex-grow min-h-[400px] sm:min-h-[500px]">
          
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 h-8 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                    <ListOrdered className="w-3 h-3 sm:w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                    Itens ({orderList.length})
                </h2>
            </div>
            {isAdmin && (
              <button 
                  onClick={onClear} 
                  disabled={orderList.length === 0}
                  className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-0"
              >
                  Limpar
              </button>
            )}
          </div>

          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-auto max-h-[500px] sm:max-h-[600px] flex-grow">
            {orderList.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {orderList.map((item, index) => (
                  <div key={`${item.codigo}-${index}`} className="group relative bg-white border-2 border-slate-100 hover:border-blue-100 p-4 sm:p-5 rounded-[1.25rem] sm:rounded-3xl transition-all hover:shadow-lg">
                    <div className="flex justify-between items-start gap-3 sm:gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-black">{item.codigo}</span>
                                <h4 className="text-[11px] sm:text-sm font-black text-slate-800">{item.descricao}</h4>
                            </div>
                            <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 pt-1.5 sm:pt-2">
                                <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Qtd: <span className="text-slate-900">{item.quantidade}</span></div>
                                <div className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Orig: <span className="text-slate-900 line-through decoration-rose-400 decoration-1 sm:decoration-2">R${item.precoOriginal.toFixed(2)}</span></div>
                                <div className="text-[8px] sm:text-[10px] font-black text-blue-600 uppercase">Sug: <span className="bg-blue-50 px-1.5 py-0.5 rounded">R${item.precoSugerido.toFixed(2)}</span></div>
                            </div>
                        </div>
                        {isAdmin && (
                          <button onClick={() => onRemoveItem(index)} className="p-2 sm:p-3 bg-slate-50 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl sm:rounded-2xl transition-all shrink-0">
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 sm:py-20 text-slate-300 space-y-3 sm:space-y-4">
                <div className="w-16 h-16 sm:w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 sm:w-12 h-12 opacity-20" />
                </div>
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest">Nenhum item na lista</p>
              </div>
            )}
          </div>

          {orderList.length > 0 && isAdmin ? (
            <div className="p-5 sm:p-8 bg-slate-50 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
               <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-white border-2 border-slate-200 text-slate-900 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:border-slate-900 transition-all shadow-sm active:scale-95"
               >
                 <FileDown className="w-3.5 h-3.5 sm:w-4 h-4" />
                 {isExporting ? '...' : 'Exportar Excel'}
               </button>
               <button
                  onClick={handleSendEmail}
                  className="flex items-center justify-center gap-2 sm:gap-3 bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
               >
                 <Mail className="w-3.5 h-3.5 sm:w-4 h-4" />
                 Enviar E-mail
               </button>
            </div>
          ) : orderList.length > 0 ? (
            <div className="p-6 sm:p-8 bg-amber-50 border-t border-amber-100 flex items-center gap-4">
              <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-tight text-amber-800">Ação Restrita</p>
                <p className="text-[10px] font-bold text-amber-600 leading-tight">Você pode montar a lista, mas apenas administradores podem exportar ou enviar o pedido por e-mail.</p>
              </div>
            </div>
          ) : null}
        </div>
        
        {orderList.length > 0 && isAdmin && (
           <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-blue-50/50 rounded-[1.25rem] sm:rounded-3xl border border-blue-100">
             <Info className="w-4 h-4 sm:w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
             <p className="text-[9px] sm:text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
               Dica: O email abre com os dados formatados. Lembre-se de baixar e anexar o Excel gerado pelo Estoque Pro antes de enviar.
             </p>
           </div>
        )}
      </div>
    </div>
  );
};

export default OrderScreen;
