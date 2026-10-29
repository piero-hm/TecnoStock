export interface Usuario {
  id: number;
  username: string;
  nombre_completo: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  fecha_creacion: string;
}

export interface CategoriaCreate {
  nombre: string;
  descripcion?: string | null;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  categoria_nombre: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  activo: boolean;
  stock_bajo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ProductoCreate {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  categoria_id: number;
  precio_compra: number;
  precio_venta: number;
  stock_minimo: number;
}

export interface Movimiento {
  id: number;
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  fecha: string;
  motivo: string;
  stock_anterior: number;
  stock_posterior: number;
  usuario_username: string | null;
  fecha_registro: string;
}

export interface MovimientoCreate {
  producto_id: number;
  cantidad: number;
  fecha: string;
  motivo: string;
}

export interface FiltroMovimientos {
  producto_id?: number | null;
  fecha_desde?: string | null;
  fecha_hasta?: string | null;
  tipo?: 'ENTRADA' | 'SALIDA' | null;
}

export interface Indicadores {
  productos_activos: number;
  productos_stock_bajo: number;
  valor_inventario_compra: number;
  valor_inventario_venta: number;
}

export interface ApiError {
  code: string;
  detail: string;
  errors?: { campo: string; mensaje: string }[];
}
