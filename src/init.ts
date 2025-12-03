import cuentasRaw from './data/cuentas_limpias.json';
import { initCuentas } from './stores/accounts.store';

// Inicializa el plan de cuentas en el store global
initCuentas(cuentasRaw);
