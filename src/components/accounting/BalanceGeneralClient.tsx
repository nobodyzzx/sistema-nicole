import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { asientos } from '../../stores/journal.store';
import { cuentasPorCodigo } from '../../stores/accounts.store';
import { Download, Scale } from 'lucide-react';
import {
  configuracion,
  derivePeriodoFromAsientos,
} from '../../stores/company.store';

export default function BalanceGeneralClient() {
  const [mounted, setMounted] = useState(false);
  const lista = useStore(asientos);
  const cuentasMap = useStore(cuentasPorCodigo);
  const config = useStore(configuracion);

  useEffect(() => {
    setMounted(true);
  }, []);

  const balanceData = useMemo(() => {
    const saldos = new Map<string, number>();
    for (const a of lista) {
      for (const m of a.movimientos) {
        const tipo = String(m.tipo).toLowerCase();
        const monto = typeof m.monto === 'number' ? m.monto : Number(m.monto);
        const codigo = String(m.cuentaCodigo);
        const current = saldos.get(codigo) || 0;
        if (tipo === 'debe') saldos.set(codigo, current + monto);
        else if (tipo === 'haber') saldos.set(codigo, current - monto);
      }
    }

    const activos: Array<{ codigo: string; nombre: string; saldo: number }> =
      [];
    const pasivos: Array<{ codigo: string; nombre: string; saldo: number }> =
      [];
    const patrimonio: Array<{ codigo: string; nombre: string; saldo: number }> =
      [];
    let totalIngresos = 0;
    let totalGastos = 0;

    for (const [codigo, saldo] of saldos.entries()) {
      if (saldo === 0) continue;
      const cuenta = cuentasMap.get(codigo);
      const nombre = cuenta?.nombre || 'Cuenta desconocida';
      const tipo = cuenta?.tipo;
      const item = { codigo, nombre, saldo: Math.abs(saldo) };
      if (tipo === 'activo') activos.push(item);
      else if (tipo === 'pasivo') pasivos.push(item);
      else if (tipo === 'patrimonio') patrimonio.push(item);
      else if (tipo === 'ingreso') totalIngresos += Math.abs(saldo);
      else if (tipo === 'gasto') totalGastos += Math.abs(saldo);
    }

    activos.sort((a, b) =>
      a.codigo.localeCompare(b.codigo, 'es', { numeric: true })
    );
    pasivos.sort((a, b) =>
      a.codigo.localeCompare(b.codigo, 'es', { numeric: true })
    );
    patrimonio.sort((a, b) =>
      a.codigo.localeCompare(b.codigo, 'es', { numeric: true })
    );

    const resultadoEjercicio = totalIngresos - totalGastos;
    if (Math.abs(resultadoEjercicio) > 0) {
      patrimonio.push({
        codigo: 'RE',
        nombre: 'Resultado del Ejercicio',
        saldo: Math.abs(resultadoEjercicio),
      });
    }

    const totalActivo = activos.reduce((sum, c) => sum + c.saldo, 0);
    const totalPasivo = pasivos.reduce((sum, c) => sum + c.saldo, 0);
    const totalPatrimonio = patrimonio.reduce((sum, c) => sum + c.saldo, 0);

    return {
      activoCorriente: activos,
      activoNoCorriente: [] as typeof activos,
      pasivoCorriente: pasivos,
      pasivoNoCorriente: [] as typeof pasivos,
      patrimonio,
      totalActivoCorriente: totalActivo,
      totalActivoNoCorriente: 0,
      totalActivo,
      totalPasivoCorriente: totalPasivo,
      totalPasivoNoCorriente: 0,
      totalPasivo,
      totalPatrimonio,
      totalPasivoPatrimonio: totalPasivo + totalPatrimonio,
      balanceado:
        Math.abs(totalActivo - (totalPasivo + totalPatrimonio)) < 0.01,
      diferencia: totalActivo - (totalPasivo + totalPatrimonio),
    };
  }, [lista, cuentasMap]);

  if (!mounted) {
    return (
      <section className="mt-6">
        <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-6 shadow">
          <div className="text-gray-600">Cargando...</div>
        </div>
      </section>
    );
  }

  const {
    activoCorriente,
    activoNoCorriente,
    pasivoCorriente,
    pasivoNoCorriente,
    patrimonio,
    totalActivoCorriente,
    totalActivoNoCorriente,
    totalActivo,
    totalPasivoCorriente,
    totalPasivoNoCorriente,
    totalPasivo,
    totalPatrimonio,
    totalPasivoPatrimonio,
    balanceado,
    diferencia,
  } = balanceData;

  const periodo = config.periodo || derivePeriodoFromAsientos(lista);
  const fechaEmision = (() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  })();

  return (
    <section className="mt-6 report-print">
      <div className="rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-purple-200">
          <div className="flex items-center gap-2">
            <Scale className="text-purple-700" size={28} />
            <h2 className="text-2xl font-bold text-purple-700">
              Balance General
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {balanceado ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300">
                Balanceado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 ring-2 ring-red-300">
                Desbalanceado: Dif. Bs. {diferencia.toFixed(2)}
              </span>
            )}
            <button
              onClick={async () => {
                try {
                  const { default: jsPDF } = await import('jspdf');
                  // @ts-ignore
                  const { default: autoTable } = await import(
                    'jspdf-autotable'
                  );
                  const tryLoadLogo = async (): Promise<{
                    dataUrl: string;
                    w: number;
                    h: number;
                  } | null> => {
                    try {
                      const res = await fetch('/logo.png');
                      if (!res.ok) return null;
                      const blob = await res.blob();
                      const dataUrl = await new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(String(reader.result));
                        reader.readAsDataURL(blob);
                      });
                      return { dataUrl, w: 18, h: 18 };
                    } catch {
                      return null;
                    }
                  };

                  const doc = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4',
                  });
                  const fmt = (n: number) => `Bs. ${n.toFixed(2)}`;

                  // Logo y título
                  const logo = await tryLoadLogo();
                  if (logo) {
                    doc.addImage(logo.dataUrl, 'PNG', 14, 12, logo.w, logo.h);
                  }
                  doc.setFontSize(16);
                  doc.setFont('helvetica', 'bold');
                  doc.text('BALANCE GENERAL', 105, 17, { align: 'center' });

                  // Encabezado legal
                  doc.setFontSize(10);
                  doc.setFont('helvetica', 'normal');
                  doc.text(`${config.infoLegal?.entidad || 'Entidad'}`, 14, 32);
                  doc.text(
                    `NIT: ${
                      config.infoLegal?.nit || 'N/A'
                    } | Periodo: ${periodo}`,
                    105,
                    32,
                    { align: 'center' }
                  );
                  doc.text(`Fecha emisión: ${fechaEmision}`, 196, 32, {
                    align: 'right',
                  });

                  let yPos = 39;

                  // ACTIVO (columna izquierda)
                  doc.setFontSize(12);
                  doc.setFont('helvetica', 'bold');
                  doc.text('ACTIVO', 14, yPos);
                  yPos += 5;

                  const activoData = activoCorriente.map((c) => [
                    `${c.codigo} - ${c.nombre}`,
                    fmt(c.saldo),
                  ]);
                  activoData.push([
                    {
                      content: 'Total Activo',
                      styles: { fontStyle: 'bold', fillColor: [243, 244, 246] },
                    },
                    {
                      content: fmt(totalActivo),
                      styles: {
                        fontStyle: 'bold',
                        fillColor: [243, 244, 246],
                        halign: 'right',
                      },
                    },
                  ] as any);

                  autoTable(doc, {
                    startY: yPos,
                    body: activoData,
                    theme: 'grid',
                    bodyStyles: { textColor: [17, 17, 17] },
                    columnStyles: {
                      0: { cellWidth: 60 },
                      1: { halign: 'right', cellWidth: 'auto' },
                    },
                    margin: { left: 14, right: 105 },
                    styles: { fontSize: 9, cellPadding: 3 },
                  });

                  yPos = 35;

                  // PASIVO (columna derecha)
                  doc.setFontSize(12);
                  doc.setFont('helvetica', 'bold');
                  doc.text('PASIVO', 110, yPos);
                  yPos += 5;

                  const pasivoData = pasivoCorriente.map((c) => [
                    `${c.codigo} - ${c.nombre}`,
                    fmt(c.saldo),
                  ]);
                  pasivoData.push([
                    {
                      content: 'Total Pasivo',
                      styles: { fontStyle: 'bold', fillColor: [243, 244, 246] },
                    },
                    {
                      content: fmt(totalPasivo),
                      styles: {
                        fontStyle: 'bold',
                        fillColor: [243, 244, 246],
                        halign: 'right',
                      },
                    },
                  ] as any);

                  autoTable(doc, {
                    startY: yPos,
                    body: pasivoData,
                    theme: 'grid',
                    bodyStyles: { textColor: [17, 17, 17] },
                    columnStyles: {
                      0: { cellWidth: 60 },
                      1: { halign: 'right', cellWidth: 'auto' },
                    },
                    margin: { left: 110, right: 14 },
                    styles: { fontSize: 9, cellPadding: 3 },
                  });

                  // @ts-ignore
                  const pasivoEndY = doc.lastAutoTable.finalY + 8;

                  // PATRIMONIO (columna derecha, debajo de pasivo)
                  doc.setFontSize(12);
                  doc.setFont('helvetica', 'bold');
                  doc.text('PATRIMONIO', 110, pasivoEndY);

                  const patrimonioData = patrimonio.map((c) => [
                    `${c.codigo} - ${c.nombre}`,
                    fmt(c.saldo),
                  ]);
                  patrimonioData.push([
                    {
                      content: 'Total Patrimonio',
                      styles: { fontStyle: 'bold', fillColor: [243, 244, 246] },
                    },
                    {
                      content: fmt(totalPatrimonio),
                      styles: {
                        fontStyle: 'bold',
                        fillColor: [243, 244, 246],
                        halign: 'right',
                      },
                    },
                  ] as any);

                  autoTable(doc, {
                    startY: pasivoEndY + 5,
                    body: patrimonioData,
                    theme: 'grid',
                    bodyStyles: { textColor: [17, 17, 17] },
                    columnStyles: {
                      0: { cellWidth: 60 },
                      1: { halign: 'right', cellWidth: 'auto' },
                    },
                    margin: { left: 110, right: 14 },
                    styles: { fontSize: 9, cellPadding: 3 },
                  });

                  // @ts-ignore
                  const finalY = doc.lastAutoTable.finalY + 5;
                  doc.setFontSize(10);
                  doc.setFont('helvetica', 'bold');
                  doc.text(
                    `Pasivo + Patrimonio: ${fmt(totalPasivoPatrimonio)}`,
                    196,
                    finalY,
                    { align: 'right' }
                  );

                  doc.save('balance-general.pdf');
                } catch (err) {
                  console.error('Error exportando PDF (Balance General):', err);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md transition-all"
              aria-label="Exportar Balance General a PDF"
            >
              <Download size={16} />
              Exportar PDF
            </button>
          </div>
        </div>
        {/* Encabezado legal y periodo */}
        <div className="report-header mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="text-sm">
              <div className="font-semibold">
                {config.infoLegal?.entidad || 'Entidad'}
              </div>
              <div className="text-gray-700">
                NIT: {config.infoLegal?.nit || 'N/A'} &nbsp;|&nbsp; Periodo:{' '}
                {periodo}
              </div>
            </div>
            <div className="text-sm text-gray-700">
              Fecha emisión: {fechaEmision}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <h3 className="font-bold text-lg text-gray-900">Activo</h3>
            </div>
            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2 uppercase">
                Corriente
              </h4>
              {activoCorriente.length === 0 ? (
                <p className="text-sm text-gray-500 italic ml-4">Sin datos.</p>
              ) : (
                activoCorriente.map((c) => (
                  <div
                    key={c.codigo}
                    className="flex justify-between items-start py-1.5 px-2 hover:bg-gray-50 rounded text-sm"
                  >
                    <span className="text-gray-700">
                      {c.codigo} - {c.nombre}
                    </span>
                    <span className="font-semibold text-gray-900 ml-2">
                      Bs. {c.saldo.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center py-2 px-2 bg-gray-100 rounded mt-2 font-semibold text-sm">
                <span>Total Activo Corriente</span>
                <span className="text-gray-900">
                  Bs. {totalActivoCorriente.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2 uppercase">
                No Corriente
              </h4>
              {activoNoCorriente.length === 0 ? (
                <p className="text-sm text-gray-500 italic ml-4">Sin datos.</p>
              ) : (
                activoNoCorriente.map((c) => (
                  <div
                    key={c.codigo}
                    className="flex justify-between items-start py-1.5 px-2 hover:bg-gray-50 rounded text-sm"
                  >
                    <span className="text-gray-700">
                      {c.codigo} - {c.nombre}
                    </span>
                    <span className="font-semibold text-gray-900 ml-2">
                      Bs. {c.saldo.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center py-2 px-2 bg-gray-100 rounded mt-2 font-semibold text-sm">
                <span>Total Activo No Corriente</span>
                <span className="text-gray-900">
                  Bs. {totalActivoNoCorriente.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 px-3 bg-purple-600 text-white rounded-lg font-bold">
              <span>Total Activo</span>
              <span>Bs. {totalActivo.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <h3 className="font-bold text-lg text-gray-900">
                Pasivo y Patrimonio
              </h3>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2 uppercase">
                Pasivo Corriente
              </h4>
              {pasivoCorriente.length === 0 ? (
                <p className="text-sm text-gray-500 italic ml-4">Sin datos.</p>
              ) : (
                pasivoCorriente.map((c) => (
                  <div
                    key={c.codigo}
                    className="flex justify-between items-start py-1.5 px-2 hover:bg-gray-50 rounded text-sm"
                  >
                    <span className="text-gray-700">
                      {c.codigo} - {c.nombre}
                    </span>
                    <span className="font-semibold text-gray-900 ml-2">
                      Bs. -{c.saldo.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center py-2 px-2 bg-gray-100 rounded mt-2 font-semibold text-sm">
                <span>Total Pasivo Corriente</span>
                <span className="text-gray-900">
                  Bs. -{totalPasivoCorriente.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2 uppercase">
                Pasivo No Corriente
              </h4>
              {pasivoNoCorriente.length === 0 ? (
                <p className="text-sm text-gray-500 italic ml-4">Sin datos.</p>
              ) : (
                pasivoNoCorriente.map((c) => (
                  <div
                    key={c.codigo}
                    className="flex justify-between items-start py-1.5 px-2 hover:bg-gray-50 rounded text-sm"
                  >
                    <span className="text-gray-700">
                      {c.codigo} - {c.nombre}
                    </span>
                    <span className="font-semibold text-gray-900 ml-2">
                      Bs. -{c.saldo.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center py-2 px-2 bg-gray-100 rounded mt-2 font-semibold text-sm">
                <span>Total Pasivo No Corriente</span>
                <span className="text-gray-900">
                  Bs. {totalPasivoNoCorriente.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 px-2 bg-gray-200 rounded font-semibold text-sm mb-4">
              <span>Total Pasivo</span>
              <span className="text-gray-900">
                Bs. -{totalPasivo.toFixed(2)}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-sm text-gray-700 mb-2 uppercase">
                Patrimonio
              </h4>
              {patrimonio.length === 0 ? (
                <p className="text-sm text-gray-500 italic ml-4">Sin datos.</p>
              ) : (
                patrimonio.map((c) => (
                  <div
                    key={c.codigo}
                    className="flex justify-between items-start py-1.5 px-2 hover:bg-gray-50 rounded text-sm"
                  >
                    <span className="text-gray-700">
                      {c.codigo} - {c.nombre}
                    </span>
                    <span className="font-semibold text-gray-900 ml-2">
                      Bs. {c.saldo.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center py-2 px-2 bg-gray-100 rounded mt-2 font-semibold text-sm">
                <span>Total Patrimonio</span>
                <span className="text-gray-900">
                  Bs. {totalPatrimonio.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 px-3 bg-purple-600 text-white rounded-lg font-bold">
              <span>Pasivo + Patrimonio</span>
              <span>Bs. {totalPasivoPatrimonio.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
