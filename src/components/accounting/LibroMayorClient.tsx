import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { asientos } from '../../stores/journal.store';
import { cuentasPorCodigo } from '../../stores/accounts.store';
import { Scale, Download } from 'lucide-react';
import { configuracion } from '../../stores/company.store';

export default function LibroMayorClient() {
  const [mounted, setMounted] = useState(false);
  const lista = useStore(asientos);
  const cuentasMap = useStore(cuentasPorCodigo);
  const config = useStore(configuracion);

  useEffect(() => {
    setMounted(true);
  }, []);

  const movimientosPorCuenta = useMemo(() => {
    const map = new Map<
      string,
      Array<{
        fecha: string;
        concepto: string;
        tipo: 'debe' | 'haber';
        monto: number;
      }>
    >();
    for (const a of lista) {
      for (const m of a.movimientos) {
        const arr = map.get(m.cuentaCodigo) || [];
        arr.push({
          fecha: a.fecha,
          concepto: a.concepto,
          tipo: m.tipo,
          monto: m.monto,
        });
        map.set(m.cuentaCodigo, arr);
      }
    }
    return map;
  }, [lista]);

  const cuentasOrdenadas = useMemo(() => {
    return Array.from(movimientosPorCuenta.keys()).sort((a, b) =>
      a.localeCompare(b, 'es', { numeric: true })
    );
  }, [movimientosPorCuenta]);

  // Evitar hydration mismatch: renderizar vacío hasta montar
  if (!mounted) {
    return (
      <section className="mt-6">
        <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-6 shadow">
          Cargando...
        </div>
      </section>
    );
  }

  if (cuentasOrdenadas.length === 0) {
    return (
      <section className="mt-6">
        <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-6 shadow">
          No hay movimientos registrados.
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="rounded-2xl border-2 border-purple-300 bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-purple-200">
          <div className="flex items-center gap-2">
            <Scale className="text-purple-700" size={24} />
            <h2 className="text-xl font-bold text-purple-700">Libro Mayor</h2>
          </div>
          <button
            onClick={async () => {
              try {
                const { default: jsPDF } = await import('jspdf');
                // @ts-ignore
                const { default: autoTable } = await import('jspdf-autotable');
                const doc = new jsPDF({
                  orientation: 'portrait',
                  unit: 'mm',
                  format: 'a4',
                });

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

                const periodo = config.periodo;
                const d = new Date();
                const fechaEmision = `${String(d.getDate()).padStart(
                  2,
                  '0'
                )}/${String(d.getMonth() + 1).padStart(
                  2,
                  '0'
                )}/${d.getFullYear()}`;

                const logo = await tryLoadLogo();
                if (logo) {
                  doc.addImage(logo.dataUrl, 'PNG', 14, 12, logo.w, logo.h);
                }
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('LIBRO MAYOR', 105, 17, { align: 'center' });
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

                let startY = 39;

                for (const codigo of cuentasOrdenadas) {
                  const nombre =
                    cuentasMap.get(codigo)?.nombre ?? 'Cuenta desconocida';
                  const movs = movimientosPorCuenta.get(codigo)!;

                  doc.setFontSize(12);
                  doc.setFont('helvetica', 'bold');
                  doc.text(`${codigo} — ${nombre}`, 14, startY);
                  startY += 5;

                  let saldo = 0;
                  const cuerpo = movs.map((m) => {
                    saldo += m.tipo === 'debe' ? m.monto : -m.monto;
                    return [
                      m.fecha,
                      m.concepto,
                      m.tipo === 'debe' ? `Bs. ${m.monto.toFixed(2)}` : '—',
                      m.tipo === 'haber' ? `Bs. ${m.monto.toFixed(2)}` : '—',
                      `Bs. ${saldo.toFixed(2)}`,
                    ];
                  });

                  autoTable(doc, {
                    startY,
                    head: [['FECHA', 'CONCEPTO', 'DEBE', 'HABER', 'SALDO']],
                    body: cuerpo,
                    theme: 'grid',
                    headStyles: {
                      fillColor: [209, 250, 229],
                      textColor: [6, 78, 59],
                      fontStyle: 'bold',
                    },
                    styles: { fontSize: 9, cellPadding: 3 },
                    columnStyles: {
                      2: { halign: 'right' },
                      3: { halign: 'right' },
                      4: { halign: 'right' },
                    },
                    margin: { left: 14, right: 14 },
                  });

                  // @ts-ignore
                  startY = doc.lastAutoTable.finalY + 8;

                  // Salto de página si estamos cerca del final
                  if (startY > 260) {
                    doc.addPage('a4', 'portrait');
                    startY = 20;
                  }
                }

                doc.save('libro-mayor.pdf');
              } catch (err) {
                console.error('Error exportando PDF (Libro Mayor):', err);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md"
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
        <div className="space-y-6">
          {cuentasOrdenadas.map((codigo) => {
            const nombre =
              cuentasMap.get(codigo)?.nombre ?? 'Cuenta desconocida';
            const movs = movimientosPorCuenta.get(codigo)!;
            let saldo = 0;
            return (
              <div
                key={codigo}
                className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 shadow"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-emerald-700">
                    {codigo} — {nombre}
                  </h3>
                  <div className="text-sm text-emerald-800 font-semibold">
                    Saldo actual:&nbsp;
                    <span className="inline-block bg-white/70 rounded px-2 py-0.5">
                      Bs.{' '}
                      {movs
                        .reduce(
                          (acc, m) =>
                            acc + (m.tipo === 'debe' ? m.monto : -m.monto),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
                <table className="mt-3 w-full text-sm">
                  <thead>
                    <tr className="text-left text-emerald-900 bg-emerald-100">
                      <th className="py-2 px-3">Fecha</th>
                      <th className="py-2 px-3">Concepto</th>
                      <th className="py-2 px-3 text-right">Debe</th>
                      <th className="py-2 px-3 text-right">Haber</th>
                      <th className="py-2 px-3 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-200">
                    {movs.map((m, i) => {
                      if (m.tipo === 'debe') saldo += m.monto;
                      else saldo -= m.monto;
                      return (
                        <tr key={`${codigo}-${i}`}>
                          <td className="py-2 px-3 font-mono">{m.fecha}</td>
                          <td className="py-2 px-3">{m.concepto}</td>
                          <td className="py-2 px-3 text-right text-emerald-700">
                            {m.tipo === 'debe'
                              ? `Bs. ${m.monto.toFixed(2)}`
                              : '—'}
                          </td>
                          <td className="py-2 px-3 text-right text-blue-700">
                            {m.tipo === 'haber'
                              ? `Bs. ${m.monto.toFixed(2)}`
                              : '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-semibold">
                            Bs. {saldo.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-3 flex justify-end">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">
                    Total movimientos:&nbsp;
                    <span>{movs.length}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
