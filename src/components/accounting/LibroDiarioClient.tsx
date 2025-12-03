import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { asientos, deleteAsiento } from '../../stores/journal.store';
import { Trash2, Download } from 'lucide-react';
import { configuracion } from '../../stores/company.store';

export default function LibroDiarioClient() {
  const [mounted, setMounted] = useState(false);
  const lista = useStore(asientos);
  const config = useStore(configuracion);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = (id: string, concepto: string) => {
    if (confirm(`¿Eliminar asiento "${concepto}"?`)) {
      deleteAsiento(id);
    }
  };

  if (!mounted) {
    return (
      <section className="mt-6">
        <div className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-6 shadow">
          <div className="text-gray-600">Cargando...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="rounded-2xl border-2 border-blue-300 bg-white p-6 shadow">
        <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-blue-200">
          <div className="text-xl font-bold text-blue-700">Libro Diario</div>
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
                doc.text('LIBRO DIARIO', 105, 17, { align: 'center' });
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

                const cuerpo = lista.flatMap((a) =>
                  a.movimientos.map((m) => [
                    a.fecha,
                    a.concepto,
                    m.cuentaCodigo,
                    m.tipo === 'debe' ? 'Debe' : 'Haber',
                    `Bs. ${m.monto.toFixed(2)}`,
                  ])
                );

                autoTable(doc, {
                  startY: 39,
                  head: [['FECHA', 'CONCEPTO', 'CUENTA', 'TIPO', 'MONTO']],
                  body: cuerpo,
                  theme: 'grid',
                  headStyles: {
                    fillColor: [219, 234, 254],
                    textColor: [23, 37, 84],
                    fontStyle: 'bold',
                  },
                  styles: { fontSize: 9, cellPadding: 3 },
                  columnStyles: { 4: { halign: 'right' } },
                  margin: { left: 14, right: 14 },
                });

                doc.save('libro-diario.pdf');
              } catch (err) {
                console.error('Error exportando PDF (Libro Diario):', err);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md"
          >
            <Download size={16} />
            Exportar PDF
          </button>
        </div>
        {lista.length === 0 ? (
          <div className="text-gray-600">No hay asientos registrados aún.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-blue-900 bg-blue-100">
                <th className="py-2 px-3">Fecha</th>
                <th className="py-2 px-3">Concepto</th>
                <th className="py-2 px-3">Movimientos</th>
                <th className="py-2 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-200">
              {lista.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 px-3 font-mono">{a.fecha}</td>
                  <td className="py-2 px-3">{a.concepto}</td>
                  <td className="py-2 px-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {a.movimientos.map((m, i) => (
                        <div
                          key={`${a.id}-${i}`}
                          className={
                            m.tipo === 'debe'
                              ? 'p-2 rounded bg-emerald-100 text-emerald-800'
                              : 'p-2 rounded bg-blue-100 text-blue-800'
                          }
                        >
                          <span className="font-semibold">
                            {m.tipo === 'debe' ? 'Debe' : 'Haber'}
                          </span>{' '}
                          —<span className="ml-1">{m.cuentaCodigo}</span>
                          <span className="ml-1">Bs. {m.monto.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      onClick={() => handleDelete(a.id, a.concepto)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-sm hover:shadow"
                      title="Eliminar asiento"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
