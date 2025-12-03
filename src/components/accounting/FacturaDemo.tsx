import { useStore } from '@nanostores/react';
import { configuracion } from '../../stores/company.store';
import { FileText } from 'lucide-react';

export default function FacturaDemo() {
  const config = useStore(configuracion);

  const handleGenerarFactura = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      // @ts-ignore
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter', // 8.5" x 11" común en Bolivia
      });

      // Datos de demostración
      const nroFactura = '000123';
      const nroAutorizacion = '7901234567890';
      const fechaLimite = '31/12/2025';
      const codigoControl = 'A3-B7-C9-D2-E5';
      const fechaEmision = new Date().toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // Cliente demo
      const cliente = {
        nombre: 'Juan Carlos Pérez Mamani',
        nit: '987654321',
      };

      // Items demo
      const items = [
        {
          cantidad: 2,
          detalle: 'Servicio de consultoría contable',
          precioUnitario: 500.0,
          subtotal: 1000.0,
        },
        {
          cantidad: 1,
          detalle: 'Auditoría financiera anual',
          precioUnitario: 2500.0,
          subtotal: 2500.0,
        },
        {
          cantidad: 3,
          detalle: 'Declaración de impuestos mensuales',
          precioUnitario: 150.0,
          subtotal: 450.0,
        },
      ];

      const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
      const descuento = 0;
      const totalSinImpuesto = subtotal - descuento;
      const total = totalSinImpuesto;

      // Logo
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

      const logo = await tryLoadLogo();

      // ENCABEZADO
      if (logo) {
        doc.addImage(logo.dataUrl, 'PNG', 15, 12, logo.w, logo.h);
      }

      // Datos de la empresa
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(config.infoLegal?.entidad || 'Mutual La Primera', 40, 17);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`NIT: ${config.infoLegal?.nit || 'N/A'}`, 40, 22);
      doc.text(
        config.infoLegal?.direccion || 'Av. Camacho No. 1234, La Paz',
        40,
        27
      );
      doc.text(
        `Tel: ${config.infoLegal?.telefono || '(+591) 2-2345678'}`,
        40,
        32
      );

      // Cuadro de FACTURA (derecha superior)
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.rect(140, 12, 55, 25);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURA', 167.5, 18, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Nº ${nroFactura}`, 167.5, 24, { align: 'center' });

      doc.setFontSize(7);
      doc.text('ORIGINAL', 167.5, 35, { align: 'center' });

      // Información de autorización (debajo del encabezado)
      let yPos = 45;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Nº DE AUTORIZACIÓN:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(nroAutorizacion, 60, yPos);

      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('FECHA LÍMITE DE EMISIÓN:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(fechaLimite, 65, yPos);

      // Datos del cliente
      yPos += 8;
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 3, 180, 18, 'F');
      doc.setDrawColor(150, 150, 150);
      doc.rect(15, yPos - 3, 180, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('FECHA:', 17, yPos + 2);
      doc.setFont('helvetica', 'normal');
      doc.text(fechaEmision, 35, yPos + 2);

      doc.setFont('helvetica', 'bold');
      doc.text('SEÑOR(ES):', 17, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(cliente.nombre, 40, yPos + 8);

      doc.setFont('helvetica', 'bold');
      doc.text('NIT/CI:', 140, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.text(cliente.nit, 155, yPos + 8);

      // Tabla de items
      yPos += 22;

      const tableData = items.map((item) => [
        item.cantidad.toString(),
        item.detalle,
        `Bs. ${item.precioUnitario.toFixed(2)}`,
        `Bs. ${item.subtotal.toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['CANT.', 'DETALLE', 'P. UNITARIO', 'SUBTOTAL']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [76, 29, 149], // purple-900
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
        },
        bodyStyles: {
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          1: { cellWidth: 100 },
          2: { halign: 'right', cellWidth: 30 },
          3: { halign: 'right', cellWidth: 30 },
        },
        styles: { fontSize: 9, cellPadding: 3 },
        margin: { left: 15, right: 15 },
      });

      // @ts-ignore
      yPos = doc.lastAutoTable.finalY + 5;

      // Totales (alineados a la derecha)
      const xTotal = 165;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('SUBTOTAL:', xTotal, yPos, { align: 'right' });
      doc.text(`Bs. ${subtotal.toFixed(2)}`, 190, yPos, { align: 'right' });

      yPos += 5;
      doc.text('DESCUENTO:', xTotal, yPos, { align: 'right' });
      doc.text(`Bs. ${descuento.toFixed(2)}`, 190, yPos, { align: 'right' });

      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('TOTAL:', xTotal, yPos, { align: 'right' });
      doc.text(`Bs. ${total.toFixed(2)}`, 190, yPos, { align: 'right' });

      // Literal de total
      yPos += 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Son:', 15, yPos);
      doc.setFont('helvetica', 'bold');
      const literal = numeroALiteral(total);
      doc.text(literal, 25, yPos);

      // Código de control QR (representación simplificada)
      yPos += 10;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('CÓDIGO DE CONTROL:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(codigoControl, 55, yPos);

      // Leyendas legales
      yPos += 8;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.text(
        'Esta factura contribuye al desarrollo del país. El uso ilícito de ésta será sancionado de acuerdo a ley.',
        15,
        yPos,
        { maxWidth: 180 }
      );

      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.text('"Este documento es la representación gráfica de un', 15, yPos);
      doc.text(
        'Documento Fiscal Digital emitido en una Modalidad de',
        15,
        yPos + 4
      );
      doc.text('Facturación Electrónica en Línea"', 15, yPos + 8);

      // Pie de página
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Sistema Contable - ${
          config.infoLegal?.entidad || 'Mutual La Primera'
        }`,
        107.5,
        pageHeight - 10,
        { align: 'center' }
      );

      doc.save(`factura-${nroFactura}.pdf`);
    } catch (err) {
      console.error('Error generando factura PDF:', err);
    }
  };

  // Función auxiliar para convertir número a literal (simplificada)
  function numeroALiteral(num: number): string {
    const entero = Math.floor(num);
    const centavos = Math.round((num - entero) * 100);

    // Convertir solo el entero (simplificado)
    let literal = '';
    if (entero === 0) {
      literal = 'CERO';
    } else if (entero === 3950) {
      literal = 'TRES MIL NOVECIENTOS CINCUENTA';
    } else {
      literal = entero.toString(); // Fallback simplificado
    }

    return `${literal} ${centavos.toString().padStart(2, '0')}/100 BOLIVIANOS`;
  }

  return (
    <div
      className="rounded-2xl border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
      onClick={handleGenerarFactura}
    >
      <div className="text-3xl mb-2">📄</div>
      <div className="font-bold text-lg text-purple-700 flex items-center gap-2">
        <FileText size={20} />
        Factura Demo
      </div>
      <p className="mt-2 text-sm text-gray-700">
        Genera una factura de ejemplo siguiendo la normativa boliviana.
      </p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleGenerarFactura();
        }}
        className="mt-4 w-full px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md transition-all"
      >
        Generar PDF
      </button>
    </div>
  );
}
