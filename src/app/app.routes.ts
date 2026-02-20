// WRONG (current)
() => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
() => import('./projects/projects.component').then(m => m.ProjectsComponent)

// CORRECT (fix)
() => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
() => import('./components/projects/projects.component').then(m => m.ProjectsComponent)
