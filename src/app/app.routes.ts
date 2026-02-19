import { Routes } from '@angular/router';

export const routes: Routes = [
  // Placeholder / default routes – replace with your actual pages
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'projects', loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent) },
  { path: '**', redirectTo: '/dashboard' }  // catch-all
];
