import { useEffect } from 'react';
import cuentasRaw from '../data/cuentas_limpias.json';
import { initCuentas } from '../stores/accounts.store';
import { loadAsientos } from '../stores/journal.store';

export default function InitStores() {
  useEffect(() => {
    try {
      initCuentas(cuentasRaw as any);
    } catch (err) {
      console.error('Error inicializando cuentas:', err);
    }
    try {
      loadAsientos();
    } catch (err) {
      console.error('Error inicializando asientos:', err);
    }
  }, []);
  return null;
}
