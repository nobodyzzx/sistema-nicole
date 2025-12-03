export type UUID = string;
export type ISODateString = string;
export type Currency = number;

export interface Cuenta {
  codigo: string;
  nombre: string;
  nivel: number;
  padre?: string;
  tipo?: 'activo' | 'pasivo' | 'patrimonio' | 'ingreso' | 'gasto' | 'orden';
  activa?: boolean;
}

export interface Movimiento {
  tipo: 'debe' | 'haber';
  cuentaCodigo: string;
  monto: Currency;
  descripcion?: string;
}

export interface Asiento {
  id: UUID;
  fecha: ISODateString;
  concepto: string;
  movimientos: ReadonlyArray<Movimiento>;
  numeroComprobante?: string;
}

export interface Totales {
  sumasDebe: Currency;
  sumasHaber: Currency;
  saldosDeudores: Currency;
  saldosAcreedores: Currency;
}

export interface BalanceCuenta {
  cuentaCodigo: string;
  cuentaNombre: string;
  sumasDebe: Currency;
  sumasHaber: Currency;
  saldoDeudor: Currency;
  saldoAcreedor: Currency;
}

export interface InfoLegalBO {
  entidad: string;
  nit: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  representante?: string;
}

export interface Configuracion {
  periodo: string;
  infoLegal: InfoLegalBO;
}

export interface EstadoContable {
  cuentas: ReadonlyArray<Cuenta>;
  asientos: ReadonlyArray<Asiento>;
  configuracion: Configuracion;
  balances?: {
    comprobacion?: ReadonlyArray<BalanceCuenta>;
    totales?: Totales;
  };
}

export type TipoMovimiento = Movimiento['tipo'];

export interface Persistible<T> {
  version: string;
  payload: T;
}
// Strict TypeScript definitions for the modernized accounting domain
// These are framework-agnostic and ready for use with Astro + Tailwind + TypeScript

// Helpers
export type UUID = string; // e.g., crypto.randomUUID()
export type ISODateString = string; // YYYY-MM-DD
export type Currency = number; // store as number in Bs.

// Cuenta: element of plan de cuentas
export interface Cuenta {
  codigo: string; // canonical account code (e.g., "101", "1011")
  nombre: string; // human label
  nivel: number; // hierarchical level inferred from code structure
  padre?: string; // parent account code, if applicable
  tipo?: 'activo' | 'pasivo' | 'patrimonio' | 'ingreso' | 'gasto' | 'orden'; // optional classification
  activa?: boolean; // whether can post movements
}

// Movimiento: debit/credit line inside an Asiento
export interface Movimiento {
  tipo: 'debe' | 'haber';
  cuentaCodigo: string; // references Cuenta.codigo
  monto: Currency; // >= 0.01
  descripcion?: string; // optional line description
}

// Asiento: journal entry (partida doble). Must balance: sum(debe) === sum(haber)
export interface Asiento {
  id: UUID;
  fecha: ISODateString;
  concepto: string;
  movimientos: ReadonlyArray<Movimiento>;
  numeroComprobante?: string; // displayed voucher number
}

// Totals used by reports
export interface Totales {
  sumasDebe: Currency;
  sumasHaber: Currency;
  saldosDeudores: Currency;
  saldosAcreedores: Currency;
}

// Balance row per account
export interface BalanceCuenta {
  cuentaCodigo: string;
  cuentaNombre: string;
  sumasDebe: Currency;
  sumasHaber: Currency;
  saldoDeudor: Currency; // usually max(sumDebe - sumHaber, 0)
  saldoAcreedor: Currency; // usually max(sumHaber - sumDebe, 0)
}

// Información legal (Bolivia)
export interface InfoLegalBO {
  entidad: string; // razón social
  nit: string; // NIT
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  representante?: string;
}

// Configuración general
export interface Configuracion {
  periodo: string; // e.g., "2025-12" (YYYY-MM)
  infoLegal: InfoLegalBO;
}

// Estado global para store
export interface EstadoContable {
  cuentas: ReadonlyArray<Cuenta>; // plan de cuentas disponible
  asientos: ReadonlyArray<Asiento>;
  configuracion: Configuracion;
  // caches/derived (optional, no persist):
  balances?: {
    comprobacion?: ReadonlyArray<BalanceCuenta>;
    totales?: Totales;
  };
}

// Utility guards
export type TipoMovimiento = Movimiento['tipo'];

export interface Persistible<T> {
  version: string; // data schema version
  payload: T;
}
