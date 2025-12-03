import { useEffect } from 'react';
import cuentasRaw from '../data/cuentas_limpias.json';
import { initCuentas } from '../stores/accounts.store';
import { loadAsientos } from '../stores/journal.store';
import { loadConfiguracion } from '../stores/company.store';

export default function InitStores() {
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    try {
      initCuentas(cuentasRaw as any);
      console.info('[InitStores] Cuentas inicializadas');
    } catch (err) {
      console.error('Error inicializando cuentas:', err);
    }

    try {
      loadConfiguracion();
      console.info('[InitStores] Configuración cargada');
    } catch (err) {
      console.error('Error inicializando configuración:', err);
    }

    try {
      loadAsientos();
      console.info('[InitStores] Asientos cargados');
    } catch (err) {
      console.error('Error inicializando asientos:', err);
    }
  }, []);

  return null;
}
