import { useStore } from '@nanostores/react';
import { asientos } from '../../stores/journal.store';
import { compras } from '../../stores/compras.store';
import { configuracion } from '../../stores/company.store';
import { Download, Upload, FileJson, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DataImportExport() {
  const asientosList = useStore(asientos);
  const comprasList = useStore(compras);
  const config = useStore(configuracion);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const exportarDatos = () => {
    try {
      const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        configuracion: config,
        asientos: asientosList,
        compras: comprasList,
      };

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sistema-contable-backup-${
        new Date().toISOString().split('T')[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage('✅ Datos exportados exitosamente');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error exportando datos:', err);
      setError('❌ Error al exportar los datos');
      setTimeout(() => setError(''), 3000);
    }
  };

  const importarDatos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validar estructura básica
        if (!data.version) {
          throw new Error('Archivo JSON inválido: falta versión');
        }

        // Importar configuración si existe
        if (data.configuracion) {
          configuracion.set(data.configuracion);
          localStorage.setItem(
            'scu_config_v1',
            JSON.stringify(data.configuracion)
          );
        }

        // Importar asientos si existen
        if (data.asientos && Array.isArray(data.asientos)) {
          asientos.set(data.asientos);
          localStorage.setItem(
            'scu_asientos_v1',
            JSON.stringify(data.asientos)
          );
        }

        // Importar compras si existen
        if (data.compras && Array.isArray(data.compras)) {
          compras.set(data.compras);
          localStorage.setItem('scu_compras_v1', JSON.stringify(data.compras));
        }

        setMessage(
          `✅ Datos importados: ${data.asientos?.length || 0} asientos, ${
            data.compras?.length || 0
          } compras`
        );
        setTimeout(() => setMessage(''), 5000);

        // Limpiar el input
        event.target.value = '';
      } catch (err) {
        console.error('Error importando datos:', err);
        setError('❌ Error al importar: archivo inválido o corrupto');
        setTimeout(() => setError(''), 5000);
        event.target.value = '';
      }
    };

    reader.readAsText(file);
  };

  const limpiarAsientos = () => {
    if (asientosList.length === 0) {
      setError('❌ No hay asientos para limpiar');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const confirmar = window.confirm(
      `¿Estás seguro de eliminar todos los ${asientosList.length} asientos?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      asientos.set([]);
      localStorage.setItem('scu_asientos_v1', JSON.stringify([]));
      setMessage('✅ Todos los asientos han sido eliminados');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error limpiando asientos:', err);
      setError('❌ Error al limpiar los asientos');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105">
      <div className="text-3xl mb-2">📚</div>
      <div className="font-bold text-lg text-blue-700 flex items-center gap-2">
        <FileJson size={20} />
        Datos del Sistema
      </div>
      <p className="mt-2 text-sm text-gray-700 mb-4">
        Importa o exporta todos los datos del sistema en formato JSON.
      </p>

      {/* Mensajes */}
      {message && (
        <div className="mb-3 p-2 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-semibold">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-100 border border-red-300 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Botones */}
      <div className="flex flex-col gap-2">
        <button
          onClick={exportarDatos}
          className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Download size={14} />
          Exportar JSON
        </button>

        <label className="w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
          <Upload size={14} />
          Importar JSON
          <input
            type="file"
            accept=".json"
            onChange={importarDatos}
            className="hidden"
          />
        </label>

        <button
          onClick={limpiarAsientos}
          className="w-full px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
        >
          <Trash2 size={14} />
          Limpiar Asientos
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        {asientosList.length} asientos • {comprasList.length} compras
      </div>
    </div>
  );
}
