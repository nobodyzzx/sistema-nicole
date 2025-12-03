import React, { useMemo, useState, useEffect } from 'react';
import { cuentas, cuentasPorCodigo } from '../../stores/accounts.store';
import type { Movimiento, Asiento } from '../../types/accounting';
import { addAsiento, asientos } from '../../stores/journal.store';
import AccountSelect from './AccountSelect';
import { useStore } from '@nanostores/react';
import { CheckCircle2, BookOpen, Calculator, FileText } from 'lucide-react';

export default function JournalForm() {
  const [mounted, setMounted] = useState(false);
  const cuentasList = useStore(cuentas);
  const listaCuentas = useMemo(() => {
    const arr = cuentasList ?? [];
    return [...arr].sort((a, b) =>
      a.codigo.localeCompare(b.codigo, 'es', { numeric: true })
    );
  }, [cuentasList]);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [debe, setDebe] = useState<Movimiento>({
    tipo: 'debe',
    cuentaCodigo: '',
    monto: 0,
  });
  const [haber, setHaber] = useState<Movimiento>({
    tipo: 'haber',
    cuentaCodigo: '',
    monto: 0,
  });
  const [debeMontoStr, setDebeMontoStr] = useState<string>('');
  const [haberMontoStr, setHaberMontoStr] = useState<string>('');

  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [concepto, setConcepto] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [okMsg, setOkMsg] = useState<string>('');
  const asientosList = useStore(asientos);
  const cuentasMap = useStore(cuentasPorCodigo);
  function indentLabel(codigo: string, nombre: string): string {
    const depth = Math.max(0, codigo.length - 1);
    const indent = ' '.repeat(depth * 2);
    return `${indent}${codigo} - ${nombre}`;
  }

  // Usaremos <input list="..."> con <datalist> para filtrar dentro del campo

  function confirmar() {
    setError('');
    setOkMsg('');
    try {
      const debeMonto = parseFloat(debeMontoStr.replace(',', '.')) || 0;
      const haberMonto = parseFloat(haberMontoStr.replace(',', '.')) || 0;
      const movDebe: Movimiento = { ...debe, monto: debeMonto };
      const movHaber: Movimiento = { ...haber, monto: haberMonto };
      const asiento: Asiento = {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}`,
        fecha,
        concepto: concepto || 'Asiento',
        movimientos: [movDebe, movHaber],
      };
      addAsiento(asiento);
      console.info('[JournalForm] Asiento agregado:', asiento);
      setDebe({ tipo: 'debe', cuentaCodigo: '', monto: 0 });
      setHaber({ tipo: 'haber', cuentaCodigo: '', monto: 0 });
      setDebeMontoStr('');
      setHaberMontoStr('');
      setConcepto('');
      setOkMsg('Asiento registrado correctamente');
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'Error al registrar el asiento';
      setError(msg);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-purple-300 bg-linear-to-br from-white via-purple-50 to-fuchsia-50 p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="text-brand-700" size={24} />
        <h2 className="text-xl font-bold text-brand-700">
          Registrar Asiento Contable
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            📅 Fecha
          </label>
          <input
            className="mt-2 w-full border-2 border-purple-200 rounded-lg p-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            📝 Concepto
          </label>
          <input
            className="mt-2 w-full border-2 border-purple-200 rounded-lg p-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
            type="text"
            placeholder="Descripción de la transacción"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-4 rounded-xl bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-300">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-2 h-6 rounded-full bg-linear-to-b from-green-500 to-emerald-600 shadow"></span>
            <label className="text-sm font-bold text-green-700">
              💚 Cuenta Debe
            </label>
          </div>
          <AccountSelect
            label="Seleccione una cuenta"
            color="green"
            value={debe.cuentaCodigo}
            onChange={(codigo) => setDebe({ ...debe, cuentaCodigo: codigo })}
            cuentas={listaCuentas}
          />
          <label className="mt-4 text-sm font-bold text-green-700 block">
            💰 Monto Debe (Bs.)
          </label>
          <input
            className="mt-2 w-full border-2 border-green-200 rounded-lg p-2.5 text-right font-semibold text-green-700 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white"
            type="text"
            inputMode="decimal"
            placeholder="Ej: 12.50"
            value={debeMontoStr}
            onChange={(e) => setDebeMontoStr(e.target.value)}
            onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
          />
        </div>

        <div className="p-4 rounded-xl bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-2 h-6 rounded-full bg-linear-to-b from-blue-500 to-cyan-600 shadow"></span>
            <label className="text-sm font-bold text-blue-700">
              💙 Cuenta Haber
            </label>
          </div>
          <AccountSelect
            label="Seleccione una cuenta"
            color="blue"
            value={haber.cuentaCodigo}
            onChange={(codigo) => setHaber({ ...haber, cuentaCodigo: codigo })}
            cuentas={listaCuentas}
          />
          <label className="mt-4 text-sm font-bold text-blue-700 block">
            💰 Monto Haber (Bs.)
          </label>
          <input
            className="mt-2 w-full border-2 border-blue-200 rounded-lg p-2.5 text-right font-semibold text-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
            type="text"
            inputMode="decimal"
            placeholder="Ej: 12.50"
            value={haberMontoStr}
            onChange={(e) => setHaberMontoStr(e.target.value)}
            onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
          />
        </div>
      </div>

      <div className="mt-5 p-4 rounded-xl bg-linear-to-r from-purple-100 to-fuchsia-100 border-2 border-purple-300">
        <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
          <div className="text-green-700">
            💚 Debe: Bs.{' '}
            {(parseFloat(debeMontoStr.replace(',', '.')) || 0).toFixed(2)}
          </div>
          <div className="text-blue-700">
            💙 Haber: Bs.{' '}
            {(parseFloat(haberMontoStr.replace(',', '.')) || 0).toFixed(2)}
          </div>
        </div>
        <div className="mt-3 text-center">
          <span
            className={
              (parseFloat(debeMontoStr.replace(',', '.')) || 0) ===
                (parseFloat(haberMontoStr.replace(',', '.')) || 0) &&
              (parseFloat(debeMontoStr.replace(',', '.')) || 0) > 0
                ? 'text-lg font-bold text-emerald-600'
                : 'text-lg font-bold text-orange-600'
            }
          >
            ⚖️ Balance: Bs.{' '}
            {(
              (parseFloat(debeMontoStr.replace(',', '.')) || 0) -
              (parseFloat(haberMontoStr.replace(',', '.')) || 0)
            ).toFixed(2)}
          </span>
        </div>
      </div>
      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-100 border-2 border-red-300 text-sm font-semibold text-red-700">
          ⚠️ {error}
        </div>
      )}
      {okMsg && (
        <div className="mt-3 p-3 rounded-lg bg-emerald-50 border-2 border-emerald-500 text-sm font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600" />
          {okMsg}
        </div>
      )}

      <div className="mt-5 p-4 rounded-xl bg-white border-2 border-purple-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="md:col-span-1">
            <div className="flex items-center gap-1.5 font-bold text-brand-700">
              <Calculator size={16} />
              Conteo de Asientos
            </div>
            <div className="mt-1 text-gray-700">
              Total registrados: {mounted ? asientosList.length : 0}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5 font-bold text-brand-700">
              <FileText size={16} />
              Último Asiento
            </div>
            {!mounted || asientosList.length === 0 ? (
              <div className="mt-1 text-gray-500">
                Aún no hay asientos registrados.
              </div>
            ) : (
              <div className="mt-2">
                {(() => {
                  const last = asientosList[asientosList.length - 1];
                  return (
                    <div className="space-y-2">
                      <div className="text-gray-700">Fecha: {last.fecha}</div>
                      <div className="text-gray-700">
                        Concepto: {last.concepto}
                      </div>
                      <div className="mt-1">
                        <div className="text-green-700 font-semibold">
                          Movimientos Debe
                        </div>
                        <ul className="list-disc ml-6 text-sm">
                          {last.movimientos
                            .filter((m) => m.tipo === 'debe')
                            .map((m, i) => {
                              const nombre =
                                cuentasMap.get(m.cuentaCodigo)?.nombre ||
                                'Cuenta desconocida';
                              return (
                                <li key={`last-debe-${i}`}>
                                  {m.cuentaCodigo} — {nombre} — Bs.{' '}
                                  {m.monto.toFixed(2)}
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                      <div className="mt-1">
                        <div className="text-blue-700 font-semibold">
                          Movimientos Haber
                        </div>
                        <ul className="list-disc ml-6 text-sm">
                          {last.movimientos
                            .filter((m) => m.tipo === 'haber')
                            .map((m, i) => {
                              const nombre =
                                cuentasMap.get(m.cuentaCodigo)?.nombre ||
                                'Cuenta desconocida';
                              return (
                                <li key={`last-haber-${i}`}>
                                  {m.cuentaCodigo} — {nombre} — Bs.{' '}
                                  {m.monto.toFixed(2)}
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
      <button
        className="mt-5 w-full px-6 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all disabled:hover:shadow-lg flex items-center justify-center gap-2"
        disabled={
          !debe.cuentaCodigo ||
          !haber.cuentaCodigo ||
          (parseFloat(debeMontoStr.replace(',', '.')) || 0) <= 0 ||
          (parseFloat(haberMontoStr.replace(',', '.')) || 0) <= 0 ||
          (parseFloat(debeMontoStr.replace(',', '.')) || 0) !==
            (parseFloat(haberMontoStr.replace(',', '.')) || 0)
        }
        onClick={confirmar}
      >
        <CheckCircle2 size={20} />
        Confirmar Asiento Contable
      </button>
    </div>
  );
}
