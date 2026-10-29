import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./layout/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'productos', loadComponent: () => import('./components/producto-list/producto-list.component').then((m) => m.ProductoListComponent) },
      { path: 'productos/nuevo', loadComponent: () => import('./components/producto-form/producto-form.component').then((m) => m.ProductoFormComponent), data: { modo: 'nuevo' } },
      { path: 'productos/:id/editar', loadComponent: () => import('./components/producto-form/producto-form.component').then((m) => m.ProductoFormComponent), data: { modo: 'editar' } },
      { path: 'categorias', loadComponent: () => import('./components/categoria-list/categoria-list.component').then((m) => m.CategoriaListComponent) },
      { path: 'movimientos/entrada', loadComponent: () => import('./components/movimiento-form/movimiento-form.component').then((m) => m.MovimientoFormComponent), data: { tipo: 'ENTRADA' } },
      { path: 'movimientos/salida', loadComponent: () => import('./components/movimiento-form/movimiento-form.component').then((m) => m.MovimientoFormComponent), data: { tipo: 'SALIDA' } },
      { path: 'movimientos', loadComponent: () => import('./components/movimiento-historial/movimiento-historial.component').then((m) => m.MovimientoHistorialComponent) },
      { path: 'stock-bajo', loadComponent: () => import('./components/stock-bajo/stock-bajo.component').then((m) => m.StockBajoComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
