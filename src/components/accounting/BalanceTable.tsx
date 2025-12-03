import React, { useMemo } from 'react';
import { cuentasHojas } from '../../stores/accounts.store';

export default function BalanceTable() {
  const hojas = useMemo(() => cuentasHojas.get(), []);
  return (
    <div className="rounded-lg border bg-white p-4 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="p-2">Código</th>
            <th className="p-2">Cuenta</th>
            <th className="p-2 text-right">Sumas Debe</th>
            <th className="p-2 text-right">Sumas Haber</th>
            <th className="p-2 text-right">Saldo Deudor</th>
            <th className="p-2 text-right">Saldo Acreedor</th>
          </tr>
        </thead>
        <tbody>
          {hojas.slice(0, 20).map((c) => (
            <tr key={c.codigo} className="border-t">
              <td className="p-2">{c.codigo}</td>
              <td className="p-2">{c.nombre}</td>
              <td className="p-2 text-right">0.00</td>
              <td className="p-2 text-right">0.00</td>
              <td className="p-2 text-right">0.00</td>
              <td className="p-2 text-right">0.00</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 text-sm text-gray-600">
        Mostrando {Math.min(hojas.length, 20)} de {hojas.length} cuentas hoja.
      </div>
    </div>
  );
}
