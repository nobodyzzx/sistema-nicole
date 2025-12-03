import { atom, computed } from 'nanostores';
import type {
  Asiento,
  BalanceCuenta,
  Currency,
  Movimiento,
  Totales,
} from '../types/accounting';
import { cuentasPorCodigo } from './accounts.store';

export const asientos = atom<ReadonlyArray<Asiento>>([]);

const STORAGE_KEY = 'scu_asientos_v1';
let initialized = false;

export function loadAsientos() {
  try {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as ReadonlyArray<Asiento>;
    if (Array.isArray(parsed)) {
      asientos.set(parsed);
      console.info('[journal.store] Asientos cargados:', parsed.length);
    }
    initialized = true;
  } catch (err) {
    console.error('Error cargando asientos desde storage:', err);
  }
}

export function saveAsientos() {
  try {
    if (typeof window === 'undefined') return;
    const curr = asientos.get();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(curr));
    console.info('[journal.store] Asientos guardados:', curr.length);
  } catch (err) {
    console.error('Error guardando asientos en storage:', err);
  }
}

// Persistir automáticamente cuando cambien
asientos.subscribe(() => {
  if (!initialized && typeof window !== 'undefined') {
    // Evitar persistir antes de completar la carga inicial
    return;
  }
  saveAsientos();
});

// Inicializar inmediatamente al cargar el módulo en el navegador
if (typeof window !== 'undefined') {
  try {
    loadAsientos();
  } catch (err) {
    console.error('Error inicializando asientos en módulo:', err);
  }
  // Mantener sincronizado si otra pestaña modifica el storage
  window.addEventListener('storage', (ev) => {
    if (ev.key === STORAGE_KEY) {
      try {
        const raw = ev.newValue;
        if (!raw) return;
        const parsed = JSON.parse(raw) as ReadonlyArray<Asiento>;
        if (Array.isArray(parsed)) {
          asientos.set(parsed);
          console.info(
            '[journal.store] Asientos sincronizados por storage event:',
            parsed.length
          );
        }
      } catch (err) {
        console.error('Error sincronizando asientos desde storage event:', err);
      }
    }
  });
}

function currency(n: number): Currency {
  return Math.round(n * 100) / 100;
}

export function addAsiento(a: Asiento) {
  // Validación: debe cuadrar y montos > 0
  const sumDebe = a.movimientos
    .filter((m) => m.tipo === 'debe')
    .reduce((acc, m) => acc + m.monto, 0);
  const sumHaber = a.movimientos
    .filter((m) => m.tipo === 'haber')
    .reduce((acc, m) => acc + m.monto, 0);
  if (
    sumDebe <= 0 ||
    sumHaber <= 0 ||
    currency(sumDebe) !== currency(sumHaber)
  ) {
    throw new Error('Asiento no balanceado o montos inválidos');
  }
  asientos.set([...asientos.get(), a]);
}

export function deleteAsiento(id: string) {
  const current = asientos.get();
  const filtered = current.filter((a) => a.id !== id);
  asientos.set(filtered);
  console.info('[journal.store] Asiento eliminado:', id);
}

export const sumasPorCuenta = computed(asientos, (arr) => {
  const map = new Map<string, { debe: number; haber: number }>();
  for (const a of arr) {
    for (const m of a.movimientos) {
      const curr = map.get(m.cuentaCodigo) || { debe: 0, haber: 0 };
      if (m.tipo === 'debe') curr.debe += m.monto;
      else curr.haber += m.monto;
      map.set(m.cuentaCodigo, curr);
    }
  }
  return map;
});

export const balanceComprobacion = computed(
  [sumasPorCuenta, cuentasPorCodigo],
  (sumas, byCuenta) => {
    const rows: BalanceCuenta[] = [];
    for (const [codigo, sums] of sumas.entries()) {
      const cuenta = byCuenta.get(codigo);
      const sumasDebe = currency(sums.debe);
      const sumasHaber = currency(sums.haber);
      const saldoDeudor = currency(Math.max(sumasDebe - sumasHaber, 0));
      const saldoAcreedor = currency(Math.max(sumasHaber - sumasDebe, 0));
      rows.push({
        cuentaCodigo: codigo,
        cuentaNombre: cuenta?.nombre ?? 'Cuenta desconocida',
        sumasDebe,
        sumasHaber,
        saldoDeudor,
        saldoAcreedor,
      });
    }
    // Orden por código ascendente
    rows.sort((a, b) =>
      a.cuentaCodigo.localeCompare(b.cuentaCodigo, 'es', { numeric: true })
    );
    return rows;
  }
);

export const totalesBalance = computed(balanceComprobacion, (rows): Totales => {
  const sumasDebe = currency(rows.reduce((acc, r) => acc + r.sumasDebe, 0));
  const sumasHaber = currency(rows.reduce((acc, r) => acc + r.sumasHaber, 0));
  const saldosDeudores = currency(
    rows.reduce((acc, r) => acc + r.saldoDeudor, 0)
  );
  const saldosAcreedores = currency(
    rows.reduce((acc, r) => acc + r.saldoAcreedor, 0)
  );
  return { sumasDebe, sumasHaber, saldosDeudores, saldosAcreedores };
});

export const estaBalanceado = computed(
  totalesBalance,
  (t) => t.sumasDebe === t.sumasHaber
);
