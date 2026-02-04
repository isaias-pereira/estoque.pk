
export interface Product {
  codigo: string;
  descricao: string;
  estoque: number;
  preco: number;
}

export interface OrderItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  precoOriginal: number;
  precoSugerido: number;
}

export type AppScreen = 'inventory' | 'order';
