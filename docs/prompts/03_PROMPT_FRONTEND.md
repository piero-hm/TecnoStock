# PROMPT 3 — FRONTEND (Angular 22 + Signal Forms + Bootstrap 5)

> **Cómo usarlo:** abre tu agente en la raíz del proyecto.
> 1) Pega la **PARTE A** en el `AGENTS.md` de `frontend/` (créalo si no existe).
> 2) Pega la **PARTE B** como la tarea.
> Hazlo **después** del backend (necesita la API para probar).

---

## PARTE A — Para `frontend/AGENTS.md` (reglas permanentes)

```markdown
# Reglas de la carpeta frontend/

## Stack
- Angular 22 (standalone components, sin NgModules), TypeScript estricto, Node >= 22.12.
- Formularios: **SOLO Signal Forms** (`@angular/forms/signals`: `form()`, `FormField`, validadores `required`, `min`, `max`, `minLength`, `maxLength`, `pattern`, `validate`, `submit`).
  En el HTML cada control se enlaza con la directiva `[formField]` (con F mayúscula: `[formField]="miForm.campo"`).
  Prohibido: Reactive Forms (`FormGroup`, `FormControl`, `FormBuilder`), `ngModel`, `FormsModule`, `ReactiveFormsModule`.
- Estilos: Bootstrap 5.3 por CDN (link en `index.html`, versión fijada, sin npm). No se instala bootstrap por npm. Los componentes de Bootstrap que necesitan JS (navbar colapsable, modales) se implementan con signals y clases (`[class.show]`), sin depender del JS de Bootstrap.
- HTTP: `HttpClient` con `provideHttpClient(withInterceptors([...]))`. Estado con signals (`signal`, `computed`, `effect` solo si es necesario).

## Estructura (la vista en clase): componentes (html) -> component (ts) -> services, más interfaces
src/app/
  interfaces/        # tipos TypeScript de la API (snake_case, iguales al JSON de docs/CONTRATOS.md)
  services/          # un servicio por recurso (AuthService, CategoriaService, ProductoService, MovimientoService, DashboardService, NotificacionService)
  core/              # interceptors (auth, errores), guards (authGuard)
  layout/            # shell con navbar/sidebar
  components/<feature>/<feature>.component.{ts,html,css}   # cada componente con su archivo .html separado (templateUrl)
  environments/      # environment.ts (dev) y environment.prod.ts (producción) con apiUrl
Reglas:
- El componente (.ts) maneja estado y eventos y llama a services; el .html solo presenta; el service es el ÚNICO que usa HttpClient.
- Ninguna URL escrita a mano en componentes o services: siempre `environment.apiUrl`.
- Ningún dato "de negocio" quemado en el frontend: categorías, productos, etc. se piden a la API. (Se permite fijo solo el catálogo `ENTRADA`/`SALIDA`.)
- Fuente de verdad de rutas, JSON y errores: `docs/CONTRATOS.md`. No inventes endpoints ni campos.
- Tras crear/editar/desactivar/registrar, se vuelve a pedir el listado a la API (no se parchea a mano la lista local).
- Los errores del backend llegan como `{code, detail, errors?}`: se muestran con un componente de alertas/toasts, nunca con `alert()`.
- Código simple y legible; comentario breve en español al inicio de cada service y componente. El estudiante debe poder explicarlo todo.
- No modifiques `frontend/Dockerfile`, `frontend/nginx.conf` ni el `docker-compose.yml` de la raíz salvo error real (y avisa).
```

---

## PARTE B — La tarea

```markdown
Eres un desarrollador frontend senior de Angular. Implementa la interfaz del sistema de inventario "TecnoStock S.A.C.".

## Contexto
Lee primero `docs/CONTRATOS.md` (secciones 2 y 4: API y conexión) y revisa `backend/apis/` si ya existe. Sigue `frontend/AGENTS.md`.
Ya existen `frontend/Dockerfile` y `frontend/nginx.conf` (compilan con `npm run build` y sirven `dist/*/browser`).

## Paso 0 — Crear el proyecto (carpeta `frontend/`, que ya contiene Dockerfile, nginx.conf y .dockerignore: conserva esos archivos)
`ng new` se niega a crear el proyecto en una carpeta con archivos, así que se genera en una carpeta temporal y se mueve el contenido a `frontend/` **sin pisar** `Dockerfile`, `nginx.conf` ni `.dockerignore`:
```bash
npx @angular/cli@22 new tecnostock-web --directory ../_tmp_web --style=css --routing --ssr=false --skip-git --package-manager=npm
rm -rf ../_tmp_web/.git ; cp -rn ../_tmp_web/. . ; rm -rf ../_tmp_web     # -n = no sobrescribir lo existente
npx ng generate environments        # crea src/environments/ con fileReplacements en angular.json
```
(Ejecuta estos comandos dentro de `frontend/`. Si `cp -n` te avisa que omitió `.gitignore`, no importa: el de la raíz ya cubre `node_modules` y `dist`.)
Ajusta los environments para que:
- Desarrollo (`ng serve`): `apiUrl: 'http://localhost:8000/api/v1'`.
- Producción (build de Docker): `apiUrl: '/api/v1'` (nginx reenvía `/api` al backend).
(Si el CLI nombra los archivos distinto —por ejemplo `environment.development.ts`—, respeta la convención del CLI y verifica que `fileReplacements` los aplique en producción.)
Si Node no está instalado en la máquina, usa Docker: `docker run --rm --user $(id -u):$(id -g) -v "$PWD":/work:z -w /work node:22 npx @angular/cli@22 new ...`.
Verifica que `package.json` tenga el script `"build": "ng build"` y que la salida quede en `dist/<proyecto>/browser`.
Añade Bootstrap 5.3.x (CSS) y Bootstrap Icons por CDN en `src/index.html`.
Configura `app.config.ts` con `provideRouter` (rutas con carga diferida / `loadComponent`), `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`.

## Pantallas (todas responsive: móvil, tableta y escritorio)

| Ruta | Componente | Qué hace |
|---|---|---|
| `/login` | `login` | Formulario Signal Form (usuario, contraseña). Guarda el token y redirige a `/dashboard`. Muestra el error de credenciales. |
| `/dashboard` | `dashboard` | 4 tarjetas con `GET /dashboard/indicadores` (productos activos, productos con stock bajo, valor inventario a costo y a precio de venta; formato moneda `S/`) + tabla de los productos con stock bajo + últimos movimientos. |
| `/productos` | `producto-list` | Tabla/tarjetas con búsqueda por código o nombre (con *debounce*), filtro por categoría (select cargado desde la API), checkbox "incluir inactivos", botones Editar y Desactivar/Activar (con confirmación). Badge de stock bajo. |
| `/productos/nuevo` y `/productos/:id/editar` | `producto-form` | Signal Form: código, nombre, descripción, categoría (select dinámico), precio compra, precio venta, stock mínimo. En edición el código se puede cambiar y el stock se muestra solo lectura. |
| `/categorias` | `categoria-list` | Listado + formulario (nombre, descripción) en la misma pantalla. |
| `/movimientos/entrada` y `/movimientos/salida` | `movimiento-form` | **Un solo componente** parametrizado por `data: { tipo }` en la ruta. Signal Form: producto (select de productos activos), cantidad, fecha (por defecto ahora), motivo. En salida muestra el stock disponible del producto elegido y valida en cliente que la cantidad no lo supere (el servidor sigue siendo la autoridad). |
| `/movimientos` | `movimiento-historial` | Filtros por producto y rango de fechas (+ tipo opcional); tabla con tipo, producto, cantidad, fecha, motivo, stock anterior y stock posterior. |
| `/stock-bajo` | `stock-bajo` | Consulta de productos con stock <= mínimo (`GET /productos/stock-bajo`). |

`layout`: barra de navegación con enlaces a todas las pantallas (colapsable en móvil con un signal), nombre del usuario y botón "Cerrar sesión".
Rutas protegidas con `authGuard` (si no hay token válido → `/login`). `**` redirige a `/dashboard`.

## Signal Forms — cómo hacerlo bien (obligatorio)
- Modelo como signal: `model = signal<ProductoForm>({...})`; `miForm = form(this.model, (schema) => { required(schema.codigo, { message: '...' }); min(schema.precio_compra, 0.01, { message: '...' }); ... })`.
- Plantilla: `<input class="form-control" [formField]="miForm.codigo" />`. Importa `FormField` en el `imports` del componente.
- Mensajes de error visibles bajo cada campo (Bootstrap `.invalid-feedback`, `is-invalid` cuando el campo es inválido **y** fue tocado), leyendo el estado del campo (`errors()`, `touched()`, `invalid()`).
- Validaciones mínimas (mismas que la API): código obligatorio y máx. 30; nombre obligatorio y máx. 150; descripción máx. 500; categoría obligatoria; precios > 0 (2 decimales);
  stock mínimo entero >= 0; cantidad entero >= 1; motivo obligatorio y máx. 255; fecha obligatoria; en historial, `fecha_desde <= fecha_hasta` (validador personalizado).
- El botón enviar se deshabilita mientras el formulario es inválido o hay una petición en curso; al enviar, marca todos los campos como tocados para mostrar los errores.
- Usa la API oficial de Angular 22: **consulta https://angular.dev/essentials/signal-forms y https://angular.dev/guide/forms/signals** antes de escribir código y no inventes funciones.
  Puntos a verificar en la documentación: cómo enlazar `<select>` con valores numéricos (si el valor llega como string, convierte a número al enviar); cómo leer errores de un campo; cómo usar `submit()`; cómo resetear el formulario tras guardar (`.set()` sobre el signal del modelo, NO reasignar el signal).

## Servicios e interceptores
- Un service por recurso con métodos tipados que devuelven `Observable<T>` (o `resource`/`httpResource` si lo prefieres, pero sé consistente) y usan `environment.apiUrl`.
- `AuthService`: login, logout, token en `localStorage` (con try/catch), `usuario` y `estaAutenticado` como signals/computed.
- `authInterceptor`: añade `Authorization: Bearer <token>` a las peticiones a la API (no al login).
- `errorInterceptor`: ante 401 (salvo en login) cierra sesión y redirige a `/login`; normaliza el error `{code, detail, errors}` y lo envía a `NotificacionService` (toasts) para que los componentes no repitan lógica.

## Interfaces (`interfaces/`)
`Usuario`, `LoginRequest`, `LoginResponse`, `Categoria`, `CategoriaCreate`, `Producto`, `ProductoCreate` (también sirve para actualizar), `Movimiento`, `MovimientoCreate`, `FiltroMovimientos`, `Indicadores`, `ApiError` — idénticas al JSON del contrato.

## Diseño
Interfaz limpia y profesional con Bootstrap 5 (tarjetas con sombra suave, tablas `table-hover table-responsive`, badges de color para ENTRADA/SALIDA y stock bajo,
spinners durante la carga, estados vacíos con mensaje amigable, iconos de Bootstrap Icons). Una paleta coherente (variables CSS en `styles.css`). Sin librerías de UI adicionales.
Debe verse bien en 360 px de ancho: tablas con scroll horizontal o convertidas en tarjetas, botones apilados, navbar colapsada.

## Cómo verificar
```bash
cd frontend && npm install && npm run build        # debe compilar sin errores ni warnings graves
cd .. && docker compose up --build -d              # abre http://localhost:8080 (admin / la clave de ADMIN_PASSWORD de tu .env)
```
Prueba el recorrido completo: login → crear categoría → crear producto → registrar entrada → registrar salida → intentar una salida mayor al stock (debe mostrar el mensaje del servidor) →
ver historial filtrado → ver stock bajo → desactivar producto (su historial se conserva) → refrescar la página y comprobar que los datos persisten.

## Entrega
Proyecto Angular completo en `frontend/`, compilando y funcionando contra la API. Al final, un resumen de máximo 10 líneas: estructura de carpetas,
cómo funciona un Signal Form del proyecto (modelo → `form()` → `[formField]` → errores) y 3 decisiones técnicas que el estudiante debe saber explicar
(environments + proxy nginx, interceptores, por qué se vuelve a consultar la API tras guardar).
```
