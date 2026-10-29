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
