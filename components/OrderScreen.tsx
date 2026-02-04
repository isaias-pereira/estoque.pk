
import React, { useState } from 'react';
import { ShoppingCart, Search, Plus, Trash2, Send, Package, DollarSign, ListOrdered, ClipboardList, PackagePlus, AlertCircle, Download, FileSpreadsheet } from 'lucide-react';
import { Product, OrderItem } from '../types';

interface OrderScreenProps {
  products: Product[];
  orderList: OrderItem[];
  onAddItem: (item: OrderItem) => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, item: OrderItem) => void;
  onClear: () => void;
}

const OrderScreen: React.FC<OrderScreenProps> = ({ products, orderList, onAddItem, onRemoveItem, onUpdateItem, onClear }) => {
  const [searchCode, setSearchCode] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<string>('1');
  const [price, setPrice] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const XLSX = (window as any).XLSX;

  const handleSearch = () => {
    setErrorMessage('');
    const found = products.find(p => p.codigo.toLowerCase() === searchCode.trim().toLowerCase());
    if (found) {
      setFoundProduct(found);
      setPrice(found.preco.toString());
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

    // Reset inputs
    setFoundProduct(null);
    setSearchCode('');
    setQuantity('1');
    setPrice('');
    setErrorMessage('');
  };

  const handleExportAndSend = () => {
    if (orderList.length === 0) {
      alert("Adicione itens à lista antes de enviar.");
      return;
    }

    // 1. Export Excel File
    const worksheetData = orderList.map(item => ({
      'Código': item.codigo,
      'Descrição': item.descricao,
      'Quantidade': item.quantidade,
      'Preço Original': item.precoOriginal,
      'Sugestão de Preço': item.precoSugerido
    }));
    
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Solicitacao");
    XLSX.writeFile(wb, "solicitacao_produtos.xlsx");

    // 2. Open Gmail Compose
    const emailTo = 'isaias.pereira@gmail.com';
    const subject = 'Solicitação de Produtos';
    
    let bodyText = `Olá,\n\nSolicito os seguintes produtos conforme lista abaixo:\n\n`;
    
    // Simple ASCII table for the email body
    bodyText += `CÓDIGO | DESCRIÇÃO | QTD | P. ORIGINAL | SUGERIDO\n`;
    bodyText += `-------|-----------|-----|-------------|----------\n`;
    
    orderList.forEach(item => {
      bodyText += `${item.codigo} | ${item.descricao} | ${item.quantidade} | R$${item.precoOriginal.toFixed(2)} | R$${item.precoSugerido.toFixed(2)}\n`;
    });
    
    bodyText += `\nTotal de itens: ${orderList.length}\n\n⚠️ O arquivo "solicitacao_produtos.xlsx" foi baixado. Por favor, anexe-o a este e-mail antes de enviar.`;

    // Gmail-specific compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTo)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    
    // Using timeout to ensure download starts
    setTimeout(() => {
      window.open(gmailUrl, '_blank');
    }, 800);
  };

  const handleInlineUpdate = (index: number, field: 'quantidade' | 'precoSugerido', value: string) => {
    const item = orderList[index];
    const updatedItem = { ...item };

    if (field === 'quantidade') {
      const val = parseInt(value);
      if (!isNaN(val)) updatedItem.quantidade = val;
      else if (value === '') updatedItem.quantidade = 0; // Temp allow empty for typing
    } else {
      const val = parseFloat(value);
      if (!isNaN(val)) updatedItem.precoSugerido = val;
      else if (value === '') updatedItem.precoSugerido = 0; // Temp allow empty for typing
    }

    onUpdateItem(index, updatedItem);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Left side: Form */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="p-6 bg-slate-900 text-white flex items-center gap-3">
            <PackagePlus className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold uppercase tracking-wide">Montar Lista</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Procurar Produto</label>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                    placeholder="Código..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="bg-slate-700 text-white px-5 py-3 rounded-xl hover:bg-slate-800 transition-colors font-bold shadow-sm"
                >
                  Buscar
                </button>
              </div>
            </div>

            {foundProduct && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{foundProduct.descricao}</h3>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Preço Original</p>
                    <span className="text-blue-700 font-bold">R$ {foundProduct.preco.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="bg-white px-2 py-1 rounded border border-blue-100 text-slate-500">Cód: <b className="text-slate-800">{foundProduct.codigo}</b></span>
                  <span className="text-slate-500 italic">Disponível: {foundProduct.estoque} un</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                  <ListOrdered className="w-3 h-3" /> Quantidade
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Sugestão R$
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-center"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleAddItem}
              disabled={!foundProduct}
              className="w-full py-5 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" />
              Adicionar à Lista
            </button>
          </div>
        </div>
      </div>

      {/* Right side: Dynamic List */}
      <div className="lg:col-span-7 flex flex-col h-full space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col flex-grow overflow-hidden">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-blue-600" />
              Lista Dinâmica ({orderList.length})
            </h2>
            {orderList.length > 0 && (
              <button 
                onClick={onClear} 
                className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Limpar Lista
              </button>
            )}
          </div>

          <div className="flex-grow overflow-auto min-h-[400px] p-6 bg-slate-50/20">
            {orderList.length > 0 ? (
              <div className="space-y-3">
                {orderList.map((item, index) => (
                  <div key={`${item.codigo}-${index}`} className="group bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                    <div className="space-y-3 flex-grow">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-bold border border-slate-200 shrink-0">{item.codigo}</span>
                        <h4 className="font-bold text-slate-800 text-base line-clamp-1">{item.descricao}</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-slate-500">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-slate-400">Qtd</p>
                          <input 
                            type="number" 
                            value={item.quantidade} 
                            onChange={(e) => handleInlineUpdate(index, 'quantidade', e.target.value)}
                            onBlur={(e) => {
                              if (parseInt(e.target.value) <= 0 || isNaN(parseInt(e.target.value))) {
                                handleInlineUpdate(index, 'quantidade', '1');
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-bold focus:border-blue-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-slate-400">Original</p>
                          <p className="text-slate-600 font-medium py-1">R$ {item.precoOriginal.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-blue-400">Sugestão R$</p>
                          <input 
                            type="number" 
                            step="0.01"
                            value={item.precoSugerido} 
                            onChange={(e) => handleInlineUpdate(index, 'precoSugerido', e.target.value)}
                            onBlur={(e) => {
                              if (isNaN(parseFloat(e.target.value))) {
                                handleInlineUpdate(index, 'precoSugerido', item.precoOriginal.toString());
                              }
                            }}
                            className="w-full bg-blue-50/50 border border-blue-100 rounded px-2 py-1 text-blue-700 font-bold focus:border-blue-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemoveItem(index)} 
                      className="ml-4 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 space-y-6 py-20">
                <div className="bg-slate-100 p-8 rounded-full">
                  <ShoppingCart className="w-20 h-20" strokeWidth={1} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-xl text-slate-600">Sua lista está vazia</p>
                  <p className="text-sm mt-1">Utilize o painel ao lado para buscar e adicionar itens.</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-white border-t border-slate-200 space-y-4">
            <button
              onClick={handleExportAndSend}
              disabled={orderList.length === 0}
              className="w-full py-5 bg-green-600 text-white rounded-2xl font-bold text-2xl hover:bg-green-700 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 group"
            >
              <FileSpreadsheet className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              Exportar e Abrir Gmail
              <Send className="w-7 h-7" />
            </button>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-700 italic">
              <Download className="w-4 h-4 shrink-0 mt-0.5" />
              <p>O arquivo <b>solicitacao_produtos.xlsx</b> será baixado automaticamente. O Gmail abrirá em seguida; lembre-se de anexar o arquivo antes de enviar!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;
