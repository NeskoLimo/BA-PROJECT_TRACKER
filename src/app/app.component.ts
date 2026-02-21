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
      /* Adjusted to 60px to align with Navbar height */
      margin-top: 60px; 
      /* Adjusted to 240px to match the new Sidebar width */
      margin-left: 240px; 
      padding: 32px;
      min-height: calc(100vh - 60px);
      background: #ffffff;
      font-family: 'Georgia', serif;
      box-sizing: border-box;
      display: block;
    }

    /* Ensure content is responsive if the sidebar visibility changes */
    @media (max-width: 768px) {
      .main-content {
        margin-left: 0;
        padding: 16px;
      }
    }
  `]
})
export class AppComponent {
  title = 'BA-PROJECT_TRACKER';
}
