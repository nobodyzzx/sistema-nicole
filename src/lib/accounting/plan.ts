import type { Cuenta } from '../../types/accounting';

export interface CuentaRaw {
  codigo: string;
  nombre: string;
}

function classifyAccount(code: string): Cuenta['tipo'] | undefined {
  const first = code.charAt(0);
  switch (first) {
    case '0':
      return 'orden';
    case '1':
    case '2':
    case '3':
      return 'activo';
    case '4':
      return 'pasivo';
    case '5':
      return 'patrimonio';
    case '6':
    case '9':
      return 'gasto';
    case '7':
    case '8':
      return 'ingreso';
    default:
      return undefined;
  }
}

function sortByCodigo(a: string, b: string): number {
  if (a.length !== b.length) return a.length - b.length;
  return a.localeCompare(b, 'es', { numeric: true });
}

function findParentCode(
  code: string,
  existing: Set<string>
): string | undefined {
  for (let i = code.length - 1; i >= 1; i--) {
    const prefix = code.slice(0, i);
    if (existing.has(prefix)) return prefix;
  }
  return undefined;
}

export interface NormalizedPlan {
  cuentas: Cuenta[];
  byCodigo: Map<string, Cuenta>;
  children: Map<string, string[]>; // parent -> children codigos
}

export function normalizePlan(raw: ReadonlyArray<CuentaRaw>): NormalizedPlan {
  const sorted = [...raw].sort((a, b) => sortByCodigo(a.codigo, b.codigo));
  const codes = new Set(sorted.map((r) => r.codigo));

  // First pass: build base cuentas with tentative parent and tipo
  const tentative: Array<Cuenta & { _parent?: string }> = sorted.map((r) => {
    const padre = findParentCode(r.codigo, codes);
    return {
      codigo: r.codigo,
      nombre: r.nombre,
      nivel: 0, // fill later
      padre,
      tipo: classifyAccount(r.codigo),
      activa: undefined,
      _parent: padre,
    };
  });

  // Build children map
  const children = new Map<string, string[]>();
  for (const c of tentative) {
    if (!c._parent) continue;
    const arr = children.get(c._parent) || [];
    arr.push(c.codigo);
    children.set(c._parent, arr);
  }

  // Compute niveles via ancestor chain length
  const byCode = new Map<string, Cuenta & { _parent?: string }>(
    tentative.map((c) => [c.codigo, c])
  );

  const nivelCache = new Map<string, number>();
  function nivelFor(code: string): number {
    if (nivelCache.has(code)) return nivelCache.get(code)!;
    const c = byCode.get(code);
    if (!c || !c._parent) {
      nivelCache.set(code, 1);
      return 1;
    }
    const n = nivelFor(c._parent) + 1;
    nivelCache.set(code, n);
    return n;
  }

  for (const c of tentative) {
    c.nivel = nivelFor(c.codigo);
  }

  // Mark leaf accounts as activas
  for (const c of tentative) {
    const hasChildren = children.has(c.codigo);
    c.activa = !hasChildren;
  }

  // Finalize
  const cuentas: Cuenta[] = tentative.map(({ _parent, ...c }) => c);
  const byCodigo = new Map<string, Cuenta>(cuentas.map((c) => [c.codigo, c]));

  // Ensure children lists are sorted
  for (const [k, arr] of children) arr.sort(sortByCodigo);

  return { cuentas, byCodigo, children };
}

export function buildIndexes(cuentas: ReadonlyArray<Cuenta>) {
  const byCodigo = new Map<string, Cuenta>(cuentas.map((c) => [c.codigo, c]));
  const children = new Map<string, string[]>();
  for (const c of cuentas) {
    if (!c.padre) continue;
    const arr = children.get(c.padre) || [];
    arr.push(c.codigo);
    children.set(c.padre, arr);
  }
  for (const [k, arr] of children) arr.sort(sortByCodigo);
  return { byCodigo, children };
}
