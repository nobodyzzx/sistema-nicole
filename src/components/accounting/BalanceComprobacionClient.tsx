import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { asientos } from '../../stores/journal.store';
import { cuentasPorCodigo } from '../../stores/accounts.store';
import { FileText, Download } from 'lucide-react';
import {
  configuracion,
  derivePeriodoFromAsientos,
} from '../../stores/company.store';

export default function BalanceComprobacionClient() {
  const [mounted, setMounted] = useState(false);
  const lista = useStore(asientos);
  const cuentasMap = useStore(cuentasPorCodigo);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const config = useStore(configuracion);

  useEffect(() => {
    setMounted(true);
  }, []);

  const rows = useMemo(() => {
    const sumas = new Map<string, { debe: number; haber: number }>();
    for (const a of lista) {
      for (const m of a.movimientos) {
        const curr = sumas.get(m.cuentaCodigo) || { debe: 0, haber: 0 };
        if (m.tipo === 'debe') curr.debe += m.monto;
        else curr.haber += m.monto;
        sumas.set(m.cuentaCodigo, curr);
      }
    }
    const out = Array.from(sumas.entries()).map(([codigo, s]) => {
      const cuenta = cuentasMap.get(codigo);
      const nombre = cuenta?.nombre ?? 'Cuenta desconocida';
      const saldoDeudor = Math.max(s.debe - s.haber, 0);
      const saldoAcreedor = Math.max(s.haber - s.debe, 0);
      return {
        cuentaCodigo: codigo,
        cuentaNombre: nombre,
        sumasDebe: s.debe,
        sumasHaber: s.haber,
        saldoDeudor,
        saldoAcreedor,
      };
    });
    out.sort((a, b) =>
      a.cuentaCodigo.localeCompare(b.cuentaCodigo, 'es', { numeric: true })
    );
    return out;
  }, [lista, cuentasMap]);

  const totals = useMemo(() => {
    const sumasDebe = rows.reduce((acc, r) => acc + r.sumasDebe, 0);
    const sumasHaber = rows.reduce((acc, r) => acc + r.sumasHaber, 0);
    const saldosDeudores = rows.reduce((acc, r) => acc + r.saldoDeudor, 0);
    const saldosAcreedores = rows.reduce((acc, r) => acc + r.saldoAcreedor, 0);
    const balanceado = Math.abs(sumasDebe - sumasHaber) < 0.01;
    return {
      sumasDebe,
      sumasHaber,
      saldosDeudores,
      saldosAcreedores,
      balanceado,
    };
  }, [rows]);

  if (!mounted) {
    return (
      <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-6 shadow">
        Cargando...
      </div>
    );
  }

  const periodo = config.periodo || derivePeriodoFromAsientos(lista);
  const fechaEmision = (() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  })();

  return (
    <div
      ref={sectionRef}
      className="report-print print-safe-hook rounded-2xl border-2 border-purple-300 bg-white p-6 shadow-lg print:bg-white print:shadow-none"
    >
      <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-purple-200">
        <div className="flex items-center gap-2">
          <FileText className="text-purple-700" size={24} />
          <h2 className="text-xl font-bold text-purple-700">
            Balance de Comprobación
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ring-2 ${
              totals.balanceado
                ? 'bg-emerald-100 text-emerald-700 ring-emerald-300'
                : 'bg-red-100 text-red-700 ring-red-300'
            }`}
          >
            {totals.balanceado
              ? 'Balanceado'
              : `Desbalanceado: Dif. Bs. ${Math.abs(
                  totals.sumasDebe - totals.sumasHaber
                ).toFixed(2)}`}
          </span>
          <button
            onClick={async () => {
              try {
                const { default: jsPDF } = await import('jspdf');
                // @ts-ignore
                const { default: autoTable } = await import('jspdf-autotable');
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
                    // tamaño sugerido en mm
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
                doc.text('BALANCE DE COMPROBACIÓN', 105, 17, {
                  align: 'center',
                });

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

                // Datos de la tabla
                const tableData = rows.map((r) => [
                  r.cuentaCodigo,
                  r.cuentaNombre,
                  fmt(r.sumasDebe),
                  fmt(r.sumasHaber),
                  fmt(r.saldoDeudor),
                  fmt(r.saldoAcreedor),
                ]);

                // Fila de totales
                tableData.push([
                  {
                    content: 'TOTALES',
                    colSpan: 2,
                    styles: { fontStyle: 'bold', fillColor: [243, 244, 246] },
                  },
                  {
                    content: fmt(totals.sumasDebe),
                    styles: {
                      fontStyle: 'bold',
                      fillColor: [243, 244, 246],
                      halign: 'right',
                    },
                  },
                  {
                    content: fmt(totals.sumasHaber),
                    styles: {
                      fontStyle: 'bold',
                      fillColor: [243, 244, 246],
                      halign: 'right',
                    },
                  },
                  {
                    content: fmt(totals.saldosDeudores),
                    styles: {
                      fontStyle: 'bold',
                      fillColor: [243, 244, 246],
                      halign: 'right',
                    },
                  },
                  {
                    content: fmt(totals.saldosAcreedores),
                    styles: {
                      fontStyle: 'bold',
                      fillColor: [243, 244, 246],
                      halign: 'right',
                    },
                  },
                ] as any);

                // Generar tabla con autoTable
                autoTable(doc, {
                  startY: 39,
                  head: [
                    [
                      'CÓDIGO',
                      'CUENTA',
                      'SUMAS DEBE',
                      'SUMAS HABER',
                      'SALDOS DEUDORES',
                      'SALDOS ACREEDORES',
                    ],
                  ],
                  body: tableData,
                  theme: 'grid',
                  headStyles: {
                    fillColor: [243, 244, 246],
                    textColor: [17, 17, 17],
                    fontStyle: 'bold',
                    halign: 'left',
                  },
                  bodyStyles: { textColor: [17, 17, 17] },
                  columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 'auto' },
                    2: { halign: 'right', cellWidth: 28 },
                    3: { halign: 'right', cellWidth: 28 },
                    4: { halign: 'right', cellWidth: 30 },
                    5: { halign: 'right', cellWidth: 32 },
                  },
                  margin: { left: 14, right: 14 },
                  styles: { fontSize: 9, cellPadding: 3 },
                });

                doc.save('balance-comprobacion.pdf');
              } catch (err) {
                console.error(
                  'Error exportando PDF (Balance de Comprobación):',
                  err
                );
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md transition-all"
            aria-label="Exportar Balance de Comprobación a PDF"
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
      </div>
      {/* Encabezado legal y periodo */}
      <div className="report-header mb-3">
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
      <div className="overflow-x-auto">
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-purple-900 bg-purple-100">
              <th className="py-3 px-3">Código</th>
              <th className="py-3 px-3">Cuenta</th>
              <th className="py-3 px-3 text-right">Sumas Debe</th>
              <th className="py-3 px-3 text-right">Sumas Haber</th>
              <th className="py-3 px-3 text-right">Saldos Deudores</th>
              <th className="py-3 px-3 text-right">Saldos Acreedores</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-200">
            {rows.map((r) => (
              <tr
                key={r.cuentaCodigo}
                className="hover:bg-purple-50 transition-colors"
              >
                <td className="py-2 px-3 font-mono text-purple-700">
                  {r.cuentaCodigo}
                </td>
                <td className="py-2 px-3 font-medium">{r.cuentaNombre}</td>
                <td className="py-2 px-3 text-right text-green-700 font-semibold">
                  Bs. {r.sumasDebe.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right text-blue-700 font-semibold">
                  Bs. {r.sumasHaber.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right text-emerald-700">
                  Bs. {r.saldoDeudor.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right text-purple-700">
                  Bs. {r.saldoAcreedor.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr className="font-bold bg-purple-100 border-t-2 border-purple-300">
              <td className="py-3 px-3" colSpan={2}>
                💰 TOTALES
              </td>
              <td className="py-3 px-3 text-right text-green-700">
                Bs. {totals.sumasDebe.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right text-blue-700">
                Bs. {totals.sumasHaber.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right text-emerald-700">
                Bs. {totals.saldosDeudores.toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right text-purple-700">
                Bs. {totals.saldosAcreedores.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
