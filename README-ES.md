# 📊 Sistema Contable - Mutual La Primera

Sistema contable universitario moderno desarrollado con **Astro**, **Tailwind CSS v4**, **React** y **Nano Stores**. Gestiona asientos contables, compras, reportes financieros y facturación con una interfaz moderna y colorida.

## 🎯 Características Principales

- ✅ **Registro de Asientos Contables** - Sistema de partida doble con validación automática de balance
- 🛒 **Módulo de Compras** - Gestión completa de proveedores, facturas y documentación
- 📊 **Reportes Financieros Completos**
  - Balance General
  - Balance de Comprobación
  - Libro Diario
  - Libro Mayor
- 📄 **Generación de Facturas PDF** - Cumple con normativa boliviana (SIN)
- 💾 **Importar/Exportar Datos** - Sistema de backup completo en formato JSON
- 🔐 **Sistema de Autenticación** - Login protegido con demo
- 📱 **Diseño Responsive** - Optimizado para escritorio y dispositivos móviles
- 🎨 **Interfaz Moderna** - Diseño colorido y profesional con gradientes

## 🚀 Despliegue de la Aplicación

### Requisitos Previos

Antes de desplegar la aplicación, asegúrate de tener instalado:

- **Node.js** versión 18.x o superior ([Descargar aquí](https://nodejs.org/))
- **pnpm** (recomendado) o npm

Para instalar pnpm globalmente:

```bash
npm install -g pnpm
```

### Instalación Local (Desarrollo)

1. **Clonar o descargar el proyecto**

   ```bash
   cd sistema-contable-mlp
   ```

2. **Instalar dependencias**

   ```bash
   pnpm install
   ```

   O si usas npm:

   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo**

   ```bash
   pnpm dev
   ```

   O con npm:

   ```bash
   npm run dev
   ```

4. **Acceder a la aplicación**

   Abre tu navegador en: `http://localhost:4321`

### Compilación para Producción

Para desplegar en un servidor web:

1. **Compilar el proyecto**

   ```bash
   pnpm build
   ```

   Esto generará todos los archivos optimizados en la carpeta `/dist`

2. **Vista previa local del build**

   ```bash
   pnpm preview
   ```

   Esto inicia un servidor local para verificar el build de producción

3. **Desplegar archivos**

   Copia todo el contenido de la carpeta `/dist` a tu servidor web (Apache, Nginx, etc.)

### Despliegue en Servicios Cloud

#### Vercel (Recomendado)

1. Crea una cuenta en [Vercel](https://vercel.com)
2. Importa el proyecto desde GitHub/GitLab
3. Vercel detectará automáticamente que es un proyecto Astro
4. Haz clic en "Deploy"

#### Netlify

1. Crea una cuenta en [Netlify](https://netlify.com)
2. Arrastra la carpeta `/dist` a Netlify Drop
3. O conecta tu repositorio Git para despliegue automático

#### Servidor tradicional (Apache/Nginx)

1. Ejecuta `pnpm build`
2. Sube el contenido de `/dist` via FTP/SSH
3. Configura el servidor para servir archivos estáticos
4. Asegúrate de configurar las rutas para SPA

### Comandos Disponibles

| Comando          | Acción                                            |
| ---------------- | ------------------------------------------------- |
| `pnpm install`   | Instala todas las dependencias del proyecto       |
| `pnpm dev`       | Inicia servidor de desarrollo en `localhost:4321` |
| `pnpm build`     | Compila el sitio para producción en `./dist/`     |
| `pnpm preview`   | Vista previa local del build de producción        |
| `pnpm astro ...` | Ejecuta comandos CLI de Astro                     |

## 🔑 Acceso al Sistema

### Credenciales de Demo

Para acceder al sistema usa las siguientes credenciales:

- **Usuario:** `demo@mlp.com`
- **Contraseña:** `mlp123`

> **Nota:** Al ingresar por primera vez, serás redirigido automáticamente a `/login`. Todas las rutas están protegidas excepto la página de login.

## 🔄 Migración desde la Versión Anterior

### ¿Por qué se Migró el Proyecto?

La versión anterior del sistema estaba desarrollada con **HTML, CSS y JavaScript vanilla en un solo archivo monolítico** (`index.html`). Aunque funcional, presentaba serias limitaciones:

#### Problemas del Sistema Anterior (Monolítico)

❌ **Mantenibilidad Difícil**

- Todo el código en un solo archivo de más de 2000 líneas
- Difícil de leer, entender y modificar
- Imposible trabajar en equipo sin conflictos

❌ **Sin Separación de Responsabilidades**

- HTML, CSS, JavaScript mezclados
- Lógica de negocio junto con presentación
- No hay componentes reutilizables

❌ **Escalabilidad Limitada**

- Agregar nuevas funcionalidades requiere modificar todo
- Alto riesgo de romper funcionalidades existentes
- Sin sistema de módulos o imports

❌ **Rendimiento Subóptimo**

- Todo se carga al inicio
- Sin optimización de assets
- Sin lazy loading o code splitting

❌ **Sin Control de Estado**

- Estado disperso en variables globales
- Difícil sincronización entre componentes
- Propenso a bugs y inconsistencias

❌ **Experiencia de Desarrollo Pobre**

- Sin hot reload
- Sin TypeScript ni autocompletado
- Debugging complejo

### Ventajas de la Nueva Arquitectura

✅ **Arquitectura Modular con Astro + React**

- Componentes separados y reutilizables
- Código organizado por funcionalidad
- Fácil de mantener y extender

✅ **Gestión de Estado con Nano Stores**

- Estado reactivo y predecible
- Sincronización automática entre componentes
- Persistencia en localStorage

✅ **TypeScript**

- Detección de errores en tiempo de desarrollo
- Autocompletado inteligente
- Código más robusto y mantenible

✅ **Tailwind CSS v4**

- Diseño consistente y profesional
- Responsive por defecto
- Optimización automática de CSS

✅ **Rendimiento Optimizado**

- Islands Architecture de Astro
- Hidratación parcial
- Build optimizado y comprimido
- Carga rápida

✅ **Mejor Experiencia de Desarrollo**

- Hot Module Replacement (HMR)
- Dev server rápido con Vite
- Debugging mejorado
- ESLint y Prettier

✅ **Nuevas Funcionalidades**

- Sistema de autenticación
- Módulo de compras
- Generación de facturas PDF
- Importar/Exportar datos
- Reportes mejorados

### Comparativa Técnica

| Aspecto              | Versión Anterior       | Versión Nueva                     |
| -------------------- | ---------------------- | --------------------------------- |
| **Arquitectura**     | Monolítica (1 archivo) | Modular (múltiples componentes)   |
| **Lenguaje**         | JavaScript vanilla     | TypeScript + React                |
| **CSS**              | Inline CSS             | Tailwind CSS v4                   |
| **Estado**           | Variables globales     | Nano Stores                       |
| **Líneas de código** | ~2000 en 1 archivo     | ~3000 organizadas en 50+ archivos |
| **Mantenibilidad**   | Baja                   | Alta                              |
| **Escalabilidad**    | Limitada               | Excelente                         |
| **Performance**      | Regular                | Optimizada                        |
| **DX**               | Básico                 | Profesional                       |

### Proceso de Migración

La migración se realizó en las siguientes fases:

1. **Análisis del código legacy** - Identificación de funcionalidades
2. **Diseño de arquitectura** - Definición de componentes y stores
3. **Setup del proyecto** - Configuración de Astro + React + Tailwind
4. **Migración de lógica** - Conversión de funciones JS a TypeScript
5. **Creación de componentes** - Separación de UI en componentes React
6. **Sistema de estado** - Implementación de Nano Stores
7. **Nuevas funcionalidades** - Compras, facturación, autenticación
8. **Testing y refinamiento** - Pruebas y correcciones
9. **Documentación** - README y guías

## 📦 Importar Datos del Sistema Anterior

Si tienes datos guardados del sistema anterior, puedes importarlos fácilmente:

1. **Acceder al Dashboard** después de hacer login
2. Buscar el card **"Datos del Sistema"**
3. Click en **"Importar JSON"**
4. Seleccionar tu archivo JSON normalizado

### Formato Requerido

```json
{
  "version": "1.0",
  "exportDate": "2025-12-03T00:00:00.000Z",
  "configuracion": {
    "periodo": "2025-02",
    "infoLegal": {
      "entidad": "Mutual La Primera",
      "nit": "1020304050",
      "ciudad": "La Paz",
      "direccion": "Av. Camacho No. 1234",
      "telefono": "(+591) 2-2345678",
      "representante": "Lic. María Elena Gutiérrez Vásquez"
    }
  },
  "asientos": [
    {
      "id": "asiento-1733000000000",
      "fecha": "2025-02-01",
      "concepto": "Descripción del asiento contable",
      "movimientos": [
        {
          "cuentaCodigo": "10",
          "tipo": "debe",
          "monto": 65000
        },
        {
          "cuentaCodigo": "50",
          "tipo": "haber",
          "monto": 65000
        }
      ]
    }
  ],
  "compras": []
}
```

> **Nota:** Si tu archivo del sistema anterior tiene formato diferente, revisa el archivo `contabilidad-backup-2025-12-02.json` en la carpeta `/public` como ejemplo de cómo normalizarlo.

## 📂 Estructura del Proyecto

```
sistema-contable-mlp/
├── src/
│   ├── components/          # Componentes React reutilizables
│   │   └── accounting/      # Componentes específicos de contabilidad
│   │       ├── JournalForm.tsx
│   │       ├── ComprasForm.tsx
│   │       ├── BalanceGeneralClient.tsx
│   │       ├── DataImportExport.tsx
│   │       └── ...
│   ├── data/
│   │   └── cuentas_limpias.json  # Plan de cuentas contable
│   ├── layouts/
│   │   └── BaseLayout.astro      # Layout principal con navegación
│   ├── lib/
│   │   └── accounting/
│   │       └── plan.ts           # Lógica del plan de cuentas
│   ├── pages/                    # Páginas de la aplicación (routing)
│   │   ├── index.astro          # Dashboard principal
│   │   ├── login.astro          # Página de autenticación
│   │   ├── asientos.astro       # Registro de asientos
│   │   ├── compras.astro        # Gestión de compras
│   │   ├── reportes.astro       # Vista de reportes
│   │   ├── libro-diario.astro   # Libro diario
│   │   ├── libro-mayor.astro    # Libro mayor
│   │   └── api/                 # Endpoints de API
│   │       ├── login.ts         # POST login
│   │       └── logout.ts        # GET logout
│   ├── stores/                  # Nano Stores (estado global)
│   │   ├── accounts.store.ts    # Store de cuentas
│   │   ├── journal.store.ts     # Store de asientos
│   │   ├── compras.store.ts     # Store de compras
│   │   └── company.store.ts     # Store de configuración
│   ├── styles/
│   │   ├── global.css          # Estilos globales
│   │   └── globals.css         # Configuración Tailwind
│   ├── types/
│   │   └── accounting.d.ts     # Tipos TypeScript
│   ├── middleware.ts           # Middleware de autenticación
│   └── init.ts                 # Inicialización de stores
├── public/                     # Archivos estáticos
│   ├── logo.png
│   └── contabilidad-backup-2025-12-02.json
├── astro.config.mjs           # Configuración de Astro
├── tailwind.config.mjs        # Configuración de Tailwind
├── tsconfig.json              # Configuración de TypeScript
├── package.json               # Dependencias del proyecto
└── README-ES.md              # Este archivo
```

## 🛠️ Tecnologías Utilizadas

- **[Astro 5.x](https://astro.build/)** - Framework web moderno con Islands Architecture
- **[React 19](https://react.dev/)** - Biblioteca para componentes interactivos
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[Nano Stores](https://github.com/nanostores/nanostores)** - Gestión de estado mínima y reactiva
- **[TypeScript](https://www.typescriptlang.org/)** - Tipado estático para JavaScript
- **[jsPDF](https://github.com/parallax/jsPDF)** - Generación de PDFs
- **[jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)** - Tablas en PDFs
- **[Lucide React](https://lucide.dev/)** - Iconos modernos

## 💡 Mejoras Futuras Planificadas

### Corto Plazo (1-3 meses)

- [ ] **Edición de asientos** - Permitir modificar asientos existentes
- [ ] **Búsqueda avanzada** - Filtros por fecha, cuenta, monto
- [ ] **Dashboard con gráficos** - Visualización de KPIs
- [ ] **Exportar reportes a Excel** - Formato XLSX
- [ ] **Papelera de reciclaje** - Recuperar asientos eliminados

### Mediano Plazo (3-6 meses)

- [ ] **Multi-usuario** - Sistema de roles y permisos
- [ ] **Plantillas de asientos** - Asientos recurrentes
- [ ] **Conciliación bancaria** - Comparación con extractos
- [ ] **Flujo de caja** - Proyecciones y análisis
- [ ] **Módulo de inventario** - Control de stock

### Largo Plazo (6+ meses)

- [ ] **API REST completa** - Backend independiente
- [ ] **Base de datos** - PostgreSQL o MongoDB
- [ ] **Integración SIN** - Sistema de Impuestos Nacional
- [ ] **App móvil** - React Native
- [ ] **Sincronización en la nube** - Backup automático

## 🐛 Reporte de Bugs

Si encuentras algún error o tienes sugerencias:

1. Verifica que estés usando la última versión
2. Revisa si ya fue reportado en Issues
3. Crea un nuevo Issue con:
   - Descripción del problema
   - Pasos para reproducirlo
   - Screenshots si aplica
   - Navegador y versión

## 📄 Licencia

Proyecto académico desarrollado para **Mutual La Primera** - Universidad [Nombre].

## 👨‍💻 Autor

- **Desarrollador:** [Tu Nombre]
- **Universidad:** [Nombre de la Universidad]
- **Materia:** Contabilidad / Sistemas de Información Contable
- **Año:** 2025

## 📞 Contacto

Para soporte o consultas:

- Email: soporte@mutualprimera.bo
- Teléfono: (+591) 2-2345678

---

**Versión:** 1.0.0  
**Última actualización:** Diciembre 2025  
**Estado:** ✅ Producción
