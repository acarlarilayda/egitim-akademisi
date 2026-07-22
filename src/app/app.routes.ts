import { Routes } from '@angular/router';
import { DashboardComponent } from './features/academy/pages/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';

/**
 * Uygulama rotaları.
 *
 * Dashboard dışındaki tüm ekranlar features/academy/academy.routes.ts
 * dosyasında tanımlı ve loadChildren ile lazy-load ediliyor. path: ''
 * kullanıldığı için URL'ler değişmedi, sadece kod ayrı bir chunk'a
 * bölündü.
 *
 * Rol bazlı erişim kontrolü (roleGuard, data.roles) academy.routes.ts
 * içinde tanımlı.
 */
export const routes: Routes = [
  {
    path: '',
    // Tüm alt route'lar buradan geçer; authGuard şu an hep true döner,
    // ileride gerçek bir login akışı eklenirse route'ları koruyacak.
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: '',
        loadChildren: () => import('./features/academy/academy.routes').then((m) => m.ACADEMY_ROUTES),
      },
    ],
  },
];