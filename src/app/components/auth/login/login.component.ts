// src/app/components/auth/login/login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GovernanceService } from '../../../services/governance.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-card fade-in">
      <div class="login-header">
        <span class="logo-icon">📊</span>
        <h1>BA Project Tracker</h1>
        <p>Enter your credentials to access the registry</p>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" [(ngModel)]="email" placeholder="name@champion.com" [disabled]="loading">
        </div>

        <div class="form-group">
          <label>Password</label>
          <input type="password" [(ngModel)]="password" placeholder="••••••••" [disabled]="loading">
        </div>

        <div class="error-msg" *ngIf="error">
          {{ error }}
        </div>

        <button class="btn-login" (click)="handleLogin()" [disabled]="loading || !email || !password">
          <span *ngIf="!loading">Sign In</span>
          <span *ngIf="loading">Verifying...</span>
        </button>
      </div>

      <div class="login-footer">
        <p>New here? <a routerLink="/register">Request Access Request</a></p>
      </div>
    </div>
  `,
  styles: [`
    .login-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }
    .login-header { text-align: center; margin-bottom: 32px; }
    .logo-icon { font-size: 40px; display: block; margin-bottom: 10px; }
    .login-header h1 { font-family: 'Georgia', serif; font-size: 24px; color: #0f172a; margin: 0; }
    .login-header p { color: #64748b; font-size: 14px; margin-top: 8px; }
    
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; }
    .form-group input { width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box; }
    
    .btn-login { 
      width: 100%; padding: 12px; background: #0f172a; color: white; border: none; 
      border-radius: 6px; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .btn-login:disabled { background: #94a3b8; cursor: not-allowed; }
    
    .error-msg { color: #dc2626; font-size: 13px; margin-bottom: 16px; text-align: center; }
    .login-footer { margin-top: 24px; text-align: center; font-size: 14px; color: #64748b; }
    .login-footer a { color: #3b82f6; text-decoration: none; font-weight: 600; }
    
    .fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  private auth = inject(AuthService);
  private gov = inject(GovernanceService);
  private router = inject(Router);

  handleLogin() {
    this.loading = true;
    this.error = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        // Success: Log the action for audit trail and redirect
        this.gov.logAction('LOGIN', 'Authentication', `User ${this.email} signed in.`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Invalid email or password. Please try again.';
      }
    });
  }
}
