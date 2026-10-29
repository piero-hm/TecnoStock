# TecnoStock Frontend

Frontend web del sistema de inventario TecnoStock S.A.C., construido con **Angular 22** (componentes standalone) y estilizado con **Bootstrap 5.3** (CDN) más CSS propio con tema oscuro moderno.

## Arquitectura

Estructura principal en `src/app/`:

- `interfaces/`: tipos TypeScript que reflejan los JSON de la API (snake_case).
- `services/`: un servicio por recurso (`AuthService`, `ProductoService`, `CategoriaService`, `MovimientoService`, `DashboardService`, `NotificacionService`, `ConfirmacionService`). Es el **único** lugar que usa `HttpClient`.
- `core/`: `authGuard`, `authInterceptor`, `errorInterceptor`.
- `layout/`: shell de la aplicación (sidebar fija/off-canvas, topbar, toasts y modal de confirmación).
- `components/`: pantallas por feature, cada una con `.ts`, `.html` y `.css`.
- `environments/`: `environment.ts` (desarrollo) y `environment.prod.ts` (producción) con `apiUrl`.

Flujo: componente → llama a service → service usa `HttpClient` con `environment.apiUrl`. Tras crear/editar/desactivar/registrar, se vuelve a pedir el listado a la API.

## Formularios

Se usan **exclusivamente Signal Forms** (`@angular/forms/signals`: `form()`, `FormField`, validadores `required`, `min`, `max`, etc.) y la directiva `[formField]` en el HTML.
Prohibido: Reactive Forms, `ngModel`, `FormsModule`, `ReactiveFormsModule`.

## Estado

Se usa `signal`, `computed` y `effect` solo cuando es necesario. Las agregaciones del dashboard (por día y por categoría) se calculan en `DashboardAgregacionService` con `computed`.

## Gráficos

No se usan librerías de gráficos. Los gráficos son componentes standalone propios con SVG:
- `grafico-area`: entradas vs. salidas por día, con tooltip y selector de rango.
- `grafico-donut`: valor de inventario por categoría.

Ambos incluyen `role="img"`, `aria-label` y una tabla/lista alternativa visualmente oculta (`visually-hidden`) para accesibilidad.

## Comandos

```bash
npm start        # servidor de desarrollo (ng serve) en http://localhost:4200
npm run build    # build de producción
npm test         # tests con Vitest
```

## Entornos

- Desarrollo (`environment.ts`): `apiUrl: 'http://localhost:8000/api/v1'`
- Producción (`environment.prod.ts`): `apiUrl: '/api/v1'` (nginx reenvía `/api/` al backend)

## Rutas principales

- `/login`
- `/dashboard`
- `/productos`, `/productos/nuevo`, `/productos/:id/editar`
- `/categorias`
- `/movimientos/entrada`, `/movimientos/salida`, `/movimientos`
- `/stock-bajo`

## Accesibilidad y responsive

- Contraste AA verificado, `:focus-visible` con anillo lima, respeta `prefers-reduced-motion`.
- Responsive en 360, 768, 1280 y 1920 px; tablas como tarjetas apiladas en móvil.
- Sin scroll horizontal de página.

## Notas

- No se agregan menús ni pantallas que no existan en la API.
- Ningún dato de negocio está quemado en el frontend; todo proviene de la API.
- Los estilos siguen el sistema de diseño definido en `src/styles.css` (tokens → base → layout → componentes → utilidades).
