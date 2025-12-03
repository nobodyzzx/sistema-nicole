import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { ShoppingCart, Plus, Trash2, Save } from 'lucide-react';
import {
  compras,
  agregarCompra,
  type ItemCompra,
  type Compra,
} from '../../stores/compras.store';

export default function ComprasForm() {
  const [fecha, setFecha] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [proveedor, setProveedor] = useState({
    nombre: '',
    nit: '',
  });
  const [factura, setFactura] = useState({
    numero: '',
    autorizacion: '',
    codigoControl: '',
  });
  const [items, setItems] = useState<ItemCompra[]>([
    {
      id: crypto.randomUUID(),
      cantidad: 1,
      detalle: '',
      precioUnitario: 0,
      subtotal: 0,
    },
  ]);
  const [descuento, setDescuento] = useState(0);
  const [observaciones, setObservaciones] = useState('');
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');

  const comprasList = useStore(compras);

  const calcularSubtotal = () => {
    return items.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() - descuento;
  };

  const agregarItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        cantidad: 1,
        detalle: '',
        precioUnitario: 0,
        subtotal: 0,
      },
    ]);
  };

  const eliminarItem = (id: string) => {
    if (items.length === 1) {
      setError('Debe haber al menos un item en la compra');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const actualizarItem = (
    id: string,
    campo: keyof ItemCompra,
    valor: string | number
  ) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [campo]: valor };

        // Recalcular subtotal
        if (campo === 'cantidad' || campo === 'precioUnitario') {
          updated.subtotal = updated.cantidad * updated.precioUnitario;
        }

        return updated;
      })
    );
  };

  const limpiarFormulario = () => {
    setFecha(new Date().toISOString().slice(0, 10));
    setProveedor({ nombre: '', nit: '' });
    setFactura({ numero: '', autorizacion: '', codigoControl: '' });
    setItems([
      {
        id: crypto.randomUUID(),
        cantidad: 1,
        detalle: '',
        precioUnitario: 0,
        subtotal: 0,
      },
    ]);
    setDescuento(0);
    setObservaciones('');
  };

  const guardarCompra = () => {
    setError('');
    setOkMsg('');

    // Validaciones
    if (!fecha) {
      setError('La fecha es requerida');
      return;
    }
    if (!proveedor.nombre.trim()) {
      setError('El nombre del proveedor es requerido');
      return;
    }
    if (!proveedor.nit.trim()) {
      setError('El NIT del proveedor es requerido');
      return;
    }
    if (!factura.numero.trim()) {
      setError('El número de factura es requerido');
      return;
    }
    if (items.some((item) => !item.detalle.trim())) {
      setError('Todos los items deben tener un detalle');
      return;
    }
    if (items.some((item) => item.cantidad <= 0)) {
      setError('Las cantidades deben ser mayores a 0');
      return;
    }
    if (items.some((item) => item.precioUnitario < 0)) {
      setError('Los precios no pueden ser negativos');
      return;
    }

    const nuevaCompra: Compra = {
      id: crypto.randomUUID(),
      fecha,
      proveedor,
      factura,
      items: items.map((item) => ({ ...item })),
      subtotal: calcularSubtotal(),
      descuento,
      total: calcularTotal(),
      observaciones: observaciones.trim() || undefined,
    };

    agregarCompra(nuevaCompra);
    setOkMsg(
      `✅ Compra registrada exitosamente. Total: Bs. ${nuevaCompra.total.toFixed(
        2
      )}`
    );
    limpiarFormulario();
    setTimeout(() => setOkMsg(''), 5000);
  };

  return (
    <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-white via-blue-50 to-cyan-50 p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="text-blue-700" size={24} />
        <h2 className="text-xl font-bold text-blue-700">Registrar Compra</h2>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border-2 border-red-300 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-100 border-2 border-emerald-300 text-emerald-700 text-sm font-semibold">
          {okMsg}
        </div>
      )}

      {/* Fecha y Proveedor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            📅 Fecha
          </label>
          <input
            className="mt-2 w-full border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            🏢 Proveedor
          </label>
          <input
            className="mt-2 w-full border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            type="text"
            placeholder="Razón social del proveedor"
            value={proveedor.nombre}
            onChange={(e) =>
              setProveedor({ ...proveedor, nombre: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            🆔 NIT Proveedor
          </label>
          <input
            className="mt-2 w-full border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            type="text"
            placeholder="NIT del proveedor"
            value={proveedor.nit}
            onChange={(e) =>
              setProveedor({ ...proveedor, nit: e.target.value })
            }
          />
        </div>
      </div>

      {/* Datos de Factura */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            📄 Nº Factura
          </label>
          <input
            className="mt-2 w-full border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            type="text"
            placeholder="Número de factura"
            value={factura.numero}
            onChange={(e) => setFactura({ ...factura, numero: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            🔐 Nº Autorización
          </label>
          <input
            className="mt-2 w-full border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            type="text"
            placeholder="Número de autorización (opcional)"
            value={factura.autorizacion}
            onChange={(e) =>
              setFactura({ ...factura, autorizacion: e.target.value })
            }
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            🔑 Código de Control
          </label>
          <input
            className="mt-2 w-full border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            type="text"
            placeholder="Código de control (opcional)"
            value={factura.codigoControl}
            onChange={(e) =>
              setFactura({ ...factura, codigoControl: e.target.value })
            }
          />
        </div>
      </div>

      {/* Items de Compra */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
            📦 Items de Compra
          </label>
          <button
            onClick={agregarItem}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Plus size={14} />
            Agregar Item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-lg bg-white border-2 border-blue-200"
            >
              <div className="md:col-span-1">
                <label className="text-xs font-semibold text-gray-600">
                  Cant.
                </label>
                <input
                  className="mt-1 w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  type="number"
                  min="1"
                  value={item.cantidad}
                  onChange={(e) =>
                    actualizarItem(
                      item.id,
                      'cantidad',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="md:col-span-5">
                <label className="text-xs font-semibold text-gray-600">
                  Detalle
                </label>
                <input
                  className="mt-1 w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  type="text"
                  placeholder="Descripción del producto/servicio"
                  value={item.detalle}
                  onChange={(e) =>
                    actualizarItem(item.id, 'detalle', e.target.value)
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600">
                  P. Unitario
                </label>
                <input
                  className="mt-1 w-full border border-gray-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.precioUnitario}
                  onChange={(e) =>
                    actualizarItem(
                      item.id,
                      'precioUnitario',
                      parseFloat(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600">
                  Subtotal
                </label>
                <input
                  className="mt-1 w-full border border-gray-300 rounded p-2 text-sm bg-gray-50"
                  type="text"
                  value={`Bs. ${item.subtotal.toFixed(2)}`}
                  readOnly
                />
              </div>
              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={() => eliminarItem(item.id)}
                  className="w-full px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totales */}
      <div className="mb-5 p-4 rounded-lg bg-gradient-to-r from-blue-100 to-cyan-100 border-2 border-blue-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Subtotal
            </label>
            <div className="text-2xl font-bold text-blue-700">
              Bs. {calcularSubtotal().toFixed(2)}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Descuento
            </label>
            <input
              className="mt-1 w-full border-2 border-blue-200 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              type="number"
              min="0"
              step="0.01"
              value={descuento}
              onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Total a Pagar
            </label>
            <div className="text-2xl font-bold text-emerald-700">
              Bs. {calcularTotal().toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
          📝 Observaciones (opcional)
        </label>
        <textarea
          className="mt-2 w-full border-2 border-blue-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          rows={3}
          placeholder="Notas adicionales sobre la compra..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      {/* Botón Guardar */}
      <div className="flex justify-end">
        <button
          onClick={guardarCompra}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <Save size={18} />
          Guardar Compra
        </button>
      </div>

      {/* Lista de compras registradas */}
      {comprasList.length > 0 && (
        <div className="mt-8 pt-6 border-t-2 border-blue-200">
          <h3 className="text-lg font-bold text-blue-700 mb-4">
            📋 Compras Registradas ({comprasList.length})
          </h3>
          <div className="space-y-3">
            {comprasList
              .slice()
              .reverse()
              .map((compra) => (
                <div
                  key={compra.id}
                  className="p-4 rounded-lg bg-white border-2 border-blue-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-blue-700">
                          Factura Nº {compra.factura.numero}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(compra.fecha).toLocaleDateString('es-BO')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">Proveedor:</span>{' '}
                        {compra.proveedor.nombre} (NIT: {compra.proveedor.nit})
                      </div>
                      <div className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Items:</span>{' '}
                        {compra.items.length} |{' '}
                        <span className="font-semibold">Total:</span>{' '}
                        <span className="text-emerald-700 font-bold">
                          Bs. {compra.total.toFixed(2)}
                        </span>
                      </div>
                      {compra.observaciones && (
                        <div className="text-xs text-gray-600 italic">
                          {compra.observaciones}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
