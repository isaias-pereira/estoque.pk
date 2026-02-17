
export interface Product {
  ean: string;
  descricao: string;
  estoque: number;
  preco: number;
}

export interface InventoryItem {
  ean: string;
  codigo: string;
  descricao: string;
  quantidade: number;
}

export interface User {
  username: string;
  role: 'admin' | 'user';
}

export type View = 'consulta' | 'database' | 'inventario';
