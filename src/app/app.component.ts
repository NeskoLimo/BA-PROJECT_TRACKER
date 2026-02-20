// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar></app-navbar>
    <app-sidebar></app-sidebar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      margin-top: 60px;
      margin-left: 220px;
      padding: 32px;
      min-height: calc(100vh - 60px);
      background: #ffffff;
      font-family: 'Georgia', serif;
    }
  `]
})
export class AppComponent {
  title = 'BA-PROJECT_TRACKER';
}
