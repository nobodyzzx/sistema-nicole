import { atom, computed } from 'nanostores';
import type { Cuenta } from '../types/accounting';
import { normalizePlan, type CuentaRaw } from '../lib/accounting/plan';

export const cuentas = atom<Cuenta[]>([]);

export const cuentasPorCodigo = computed(cuentas, (arr) => {
  return new Map(arr.map((c) => [c.codigo, c]));
});

export const cuentasHojas = computed(cuentas, (arr) =>
  arr.filter((c) => c.activa)
);

export const cuentasHojasCount = computed(
  cuentas,
  (arr) => arr.filter((c) => c.activa).length
);

export function initCuentas(raw: ReadonlyArray<CuentaRaw>) {
  const { cuentas: normalized } = normalizePlan(raw);
  cuentas.set(normalized);
}
