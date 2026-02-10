
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

export interface User {
  login: string;
  nome: string;
  perfil: 'admin' | 'user';
}

export interface AppSheetConfig {
  appId: string;
  accessKey: string;
  tableName: string;
}

export type AppScreen = 'inventory' | 'order';
