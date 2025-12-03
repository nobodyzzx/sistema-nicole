import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { configuracion, setInfoLegal } from '../../stores/company.store';
import type { InfoLegalBO } from '../../types/accounting';
import { Edit3, RotateCcw, X, Save, Building2, FileCheck } from 'lucide-react';

interface CompanyInfoEdit {
  entidad: string;
  nit: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  representante: string;
}

export default function CompanyInfoCard() {
  const config = useStore(configuracion);
  const [isEditing, setIsEditing] = useState(false);
  const [editedInfo, setEditedInfo] = useState<CompanyInfoEdit>({
    entidad: config.infoLegal?.entidad || '',
    nit: config.infoLegal?.nit || '',
    ciudad: config.infoLegal?.ciudad || '',
    direccion: config.infoLegal?.direccion || '',
    telefono: config.infoLegal?.telefono || '',
    representante: config.infoLegal?.representante || '',
  });

  const handleEdit = () => {
    setEditedInfo({
      entidad: config.infoLegal?.entidad || '',
      nit: config.infoLegal?.nit || '',
      ciudad: config.infoLegal?.ciudad || '',
      direccion: config.infoLegal?.direccion || '',
      telefono: config.infoLegal?.telefono || '',
      representante: config.infoLegal?.representante || '',
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    setInfoLegal(editedInfo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleReset = () => {
    if (confirm('¿Está seguro de restaurar los valores por defecto?')) {
      setInfoLegal({
        entidad: 'Entidad',
        nit: 'N/A',
        ciudad: '',
        direccion: '',
        telefono: '',
        representante: '',
      });
      setIsEditing(false);
    }
  };

  const handleChange = (field: keyof CompanyInfoEdit, value: string) => {
    setEditedInfo({ ...editedInfo, [field]: value });
  };

  return (
    <div className="rounded-2xl border-2 border-amber-300 bg-linear-to-br from-amber-50 to-yellow-50 shadow-lg p-6">
      <div className="flex items-start gap-4">
        <Building2 className="text-amber-700" size={36} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-amber-800">
              Información Legal de la Empresa
            </h2>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md transition-all"
                >
                  <Edit3 size={14} />
                  Editar
                </button>
              ) : (
                <>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <RotateCcw size={14} />
                    Restaurar
                  </button>
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <Save size={14} />
                    Guardar
                  </button>
                </>
              )}
            </div>
          </div>

          {!isEditing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-amber-900 mb-1">
                    Razón Social / Entidad:
                  </p>
                  <p className="text-gray-700">{config.infoLegal?.entidad || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-900 mb-1">NIT:</p>
                  <p className="text-gray-700">{config.infoLegal?.nit || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-900 mb-1">
                    Ciudad:
                  </p>
                  <p className="text-gray-700">{config.infoLegal?.ciudad || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-900 mb-1">
                    Dirección:
                  </p>
                  <p className="text-gray-700">{config.infoLegal?.direccion || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-900 mb-1">
                    Teléfono:
                  </p>
                  <p className="text-gray-700">{config.infoLegal?.telefono || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-semibold text-amber-900 mb-1">
                    Representante Legal:
                  </p>
                  <p className="text-gray-700">{config.infoLegal?.representante || 'N/A'}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-semibold text-amber-900 mb-1 block">
                  Razón Social / Entidad:
                </label>
                <input
                  type="text"
                  value={editedInfo.entidad}
                  onChange={(e) => handleChange('entidad', e.target.value)}
                  className="w-full border-2 border-amber-200 rounded-lg p-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
              <div>
                <label className="font-semibold text-amber-900 mb-1 block">
                  NIT:
                </label>
                <input
                  type="text"
                  value={editedInfo.nit}
                  onChange={(e) => handleChange('nit', e.target.value)}
                  className="w-full border-2 border-amber-200 rounded-lg p-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
              <div>
                <label className="font-semibold text-amber-900 mb-1 block">
                  Ciudad:
                </label>
                <input
                  type="text"
                  value={editedInfo.ciudad}
                  onChange={(e) => handleChange('ciudad', e.target.value)}
                  className="w-full border-2 border-amber-200 rounded-lg p-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
              <div>
                <label className="font-semibold text-amber-900 mb-1 block">
                  Dirección:
                </label>
                <input
                  type="text"
                  value={editedInfo.direccion}
                  onChange={(e) => handleChange('direccion', e.target.value)}
                  className="w-full border-2 border-amber-200 rounded-lg p-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
              <div>
                <label className="font-semibold text-amber-900 mb-1 block">
                  Teléfono:
                </label>
                <input
                  type="text"
                  value={editedInfo.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  className="w-full border-2 border-amber-200 rounded-lg p-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
              <div>
                <label className="font-semibold text-amber-900 mb-1 block">
                  Representante Legal:
                </label>
                <input
                  type="text"
                  value={editedInfo.representante}
                  onChange={(e) => handleChange('representante', e.target.value)}
                  className="w-full border-2 border-amber-200 rounded-lg p-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                />
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-amber-100 border border-amber-300 rounded-lg">
            <p className="text-xs text-amber-900 flex gap-1.5">
              <FileCheck size={14} className="shrink-0 mt-0.5" />
              <span>
                <span className="font-semibold">Normativa aplicable:</span>{' '}
                Código de Comercio de Bolivia, Ley N° 843 (Impuestos), Ley N°
                1182 (Inversiones), y normas de FUNDEMPRESA para el registro
                mercantil.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
