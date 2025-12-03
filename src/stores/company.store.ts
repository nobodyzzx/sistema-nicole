import { atom } from 'nanostores';
import type { Configuracion, InfoLegalBO, Asiento } from '../types/accounting';

const STORAGE_KEY = 'scu_config_v1';

function currentPeriodo(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const defaultConfig: Configuracion = {
  periodo: currentPeriodo(),
  infoLegal: {
    entidad: 'Mutual La Primera',
    nit: '1020304050',
    ciudad: 'La Paz',
    direccion: 'Av. Camacho No. 1234, Edificio Mutual, Piso 5',
    telefono: '(+591) 2-2345678',
    representante: 'Lic. María Elena Gutiérrez Vásquez',
  },
};

export const configuracion = atom<Configuracion>(defaultConfig);

export function loadConfiguracion() {
  try {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Configuracion;
    if (parsed && typeof parsed === 'object') {
      configuracion.set({
        periodo: parsed.periodo || defaultConfig.periodo,
        infoLegal: {
          entidad: parsed.infoLegal?.entidad || defaultConfig.infoLegal.entidad,
          nit: parsed.infoLegal?.nit || defaultConfig.infoLegal.nit,
          ciudad: parsed.infoLegal?.ciudad,
          direccion: parsed.infoLegal?.direccion,
          telefono: parsed.infoLegal?.telefono,
          representante: parsed.infoLegal?.representante,
        },
      });
      console.info('[company.store] Configuración cargada');
    }
  } catch (err) {
    console.error('Error cargando configuración:', err);
  }
}

export function saveConfiguracion() {
  try {
    if (typeof window === 'undefined') return;
    const curr = configuracion.get();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(curr));
    console.info('[company.store] Configuración guardada');
  } catch (err) {
    console.error('Error guardando configuración:', err);
  }
}

configuracion.subscribe(() => {
  if (typeof window === 'undefined') return;
  saveConfiguracion();
});

if (typeof window !== 'undefined') {
  loadConfiguracion();
}

export function setInfoLegal(info: Partial<InfoLegalBO>) {
  const curr = configuracion.get();
  configuracion.set({
    ...curr,
    infoLegal: { ...curr.infoLegal, ...info },
  });
}

export function setPeriodo(periodo: string) {
  const curr = configuracion.get();
  configuracion.set({ ...curr, periodo });
}

export function derivePeriodoFromAsientos(
  asientos: ReadonlyArray<Asiento>
): string {
  if (!asientos || asientos.length === 0) return currentPeriodo();
  // Tomar el mes del último asiento
  const last = asientos[asientos.length - 1];
  const d = new Date(last.fecha);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
