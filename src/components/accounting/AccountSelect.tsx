import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Cuenta } from '../../types/accounting';

interface AccountSelectProps {
  label: string;
  color: 'green' | 'blue';
  value: string;
  onChange: (codigo: string) => void;
  cuentas: ReadonlyArray<Cuenta>;
}

export default function AccountSelect({
  label,
  color,
  value,
  onChange,
  cuentas,
}: AccountSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const lista = useMemo(() => {
    const arr = [...cuentas].sort((a, b) =>
      a.codigo.localeCompare(b.codigo, 'es', { numeric: true })
    );
    const q = query.trim().toLowerCase();
    if (!q) return arr;
    return arr.filter(
      (c) =>
        c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q)
    );
  }, [cuentas, query]);

  const selected = useMemo(() => {
    return cuentas.find((c) => c.codigo === value) || null;
  }, [cuentas, value]);

  type Group = { header: string; items: Cuenta[] };
  const grupos: Group[] = useMemo(() => {
    const map = new Map<string, Cuenta[]>();
    for (const c of lista) {
      const h = c.codigo.length >= 2 ? c.codigo.slice(0, 2) : c.codigo;
      const arr = map.get(h) ?? [];
      arr.push(c);
      map.set(h, arr);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], 'es', { numeric: true }))
      .map(([h, items]) => ({
        header: h,
        items: items.sort((a, b) =>
          a.codigo.localeCompare(b.codigo, 'es', { numeric: true })
        ),
      }));
  }, [lista]);

  function indentLabel(codigo: string, nombre: string): string {
    const depth = Math.max(0, codigo.length - 1);
    const indent = ' \u00a0'.repeat(depth * 2); // espacio no rompible + espacio para mejor visual
    return `${indent}${codigo} - ${nombre}`;
  }

  const borderColor =
    color === 'green'
      ? 'border-green-200 focus:border-green-500 focus:ring-green-200'
      : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200';
  const tagColor = color === 'green' ? 'text-green-700' : 'text-blue-700';
  const itemBg = color === 'green' ? 'hover:bg-green-50' : 'hover:bg-blue-50';

  return (
    <div ref={containerRef} className="relative">
      <label className={`text-xs ${tagColor}`}>{label}</label>
      <div className="mt-1">
        <input
          ref={inputRef}
          className={`w-full border-2 rounded-lg p-2.5 text-sm transition-all focus:ring-2 bg-white ${borderColor}`}
          type="text"
          placeholder="Seleccione cuenta (filtre por código o nombre)"
          value={selected ? `${selected.codigo} - ${selected.nombre}` : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open) return;
            const flat = grupos.flatMap((g) => g.items);
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
              e.preventDefault();
              const sel = flat[activeIndex];
              if (sel) {
                onChange(sel.codigo);
                setQuery('');
                setOpen(false);
                inputRef.current?.blur();
              }
            } else if (e.key === 'Escape') {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
        />
      </div>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg max-h-64 overflow-auto">
          {lista.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">Sin resultados</div>
          ) : (
            <ul ref={listRef} className="py-1">
              {grupos.map((g, gi) => (
                <li
                  key={`h-${g.header}`}
                  className="px-3 py-1 text-xs font-semibold text-gray-500 sticky top-0 bg-white"
                >
                  {g.header}
                  <ul>
                    {g.items.map((c, idx) => {
                      const before = grupos
                        .slice(0, gi)
                        .reduce((acc, gg) => acc + gg.items.length, 0);
                      const globalIndex = before + idx;
                      const active = globalIndex === activeIndex;
                      return (
                        <li key={c.codigo}>
                          <button
                            type="button"
                            className={`w-full text-left px-3 py-2 text-sm ${itemBg} ${
                              active
                                ? 'bg-brand-50 outline-none ring-2 ring-brand-300'
                                : ''
                            }`}
                            onMouseEnter={() => setActiveIndex(globalIndex)}
                            onClick={() => {
                              onChange(c.codigo);
                              setQuery('');
                              setOpen(false);
                              inputRef.current?.blur();
                            }}
                          >
                            {indentLabel(c.codigo, c.nombre)}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
