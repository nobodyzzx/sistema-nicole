import { atom } from 'nanostores';

export interface ItemCompra {
  id: string;
  cantidad: number;
  detalle: string;
  precioUnitario: number;
  subtotal: number;
}

export interface Compra {
  id: string;
  fecha: string;
  proveedor: {
    nombre: string;
    nit: string;
  };
  factura: {
    numero: string;
    autorizacion: string;
    codigoControl: string;
  };
  items: ItemCompra[];
  subtotal: number;
  descuento: number;
  total: number;
  observaciones?: string;
}

export const compras = atom<ReadonlyArray<Compra>>([]);

const STORAGE_KEY = 'scu_compras_v1';
let initialized = false;

export function loadCompras() {
  try {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as ReadonlyArray<Compra>;
    if (Array.isArray(parsed)) {
      compras.set(parsed);
      console.info('[compras.store] Compras cargadas:', parsed.length);
    }
    initialized = true;
  } catch (err) {
    console.error('Error cargando compras desde storage:', err);
  }
}

export function saveCompras() {
  try {
    if (typeof window === 'undefined') return;
    const curr = compras.get();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(curr));
    console.info('[compras.store] Compras guardadas:', curr.length);
  } catch (err) {
    console.error('Error guardando compras en storage:', err);
  }
}

compras.subscribe(() => {
  if (!initialized && typeof window !== 'undefined') {
    return;
  }
  saveCompras();
});

if (typeof window !== 'undefined') {
  try {
    loadCompras();
  } catch (err) {
    console.error('Error inicializando compras en módulo:', err);
  }
}

export function agregarCompra(compra: Compra) {
  const curr = compras.get();
  compras.set([...curr, compra]);
}

export function eliminarCompra(id: string) {
  const curr = compras.get();
  compras.set(curr.filter((c) => c.id !== id));
}
