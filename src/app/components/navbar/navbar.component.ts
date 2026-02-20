// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <div class="brand-icon">📊</div>
        <span class="brand-name">BA Project Tracker</span>
      </div>
      <div class="navbar-right">
        <div class="user-avatar">NL</div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: #ffffff;
      border-bottom: 1px solid #e8ecf0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 100;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-icon {
      font-size: 22px;
    }
    .brand-name {
      font-family: 'Georgia', serif;
      font-size: 17px;
      font-weight: 700;
      color: #1a2332;
      letter-spacing: -0.3px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1a2332;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Georgia', serif;
      cursor: pointer;
      letter-spacing: 0.5px;
    }
  `]
})
export class NavbarComponent {}
