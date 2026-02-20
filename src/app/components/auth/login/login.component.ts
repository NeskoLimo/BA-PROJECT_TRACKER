import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GovernanceService } from '../../../services/governance.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <div class="auth-logo">
          <div class="logo-icon">📊</div>
          <div class="logo-text">BA Project Tracker</div>
        </div>

        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to manage global master data and project insights</p>

        <div class="sso-buttons">
          <button class="sso-btn" (click)="loginWithGoogle()" [disabled]="loading">
            <img src="assets/google-icon.svg" width="18" alt=""> Continue with Google
          </button>
          <button class="sso-btn" (click)="loginWithMicrosoft()" [disabled]="loading">
            <img src="assets/ms-icon.svg" width="18" alt=""> Continue with Microsoft
          </button>
        </div>

        <div class="divider"><span>or use credentials</span></div>

        <div class="form">
          <div class="form-group">
            <label>Email address</label>
            <input type="email" [(ngModel)]="email" placeholder="admin@batracker.com"
              (keydown.enter)="login()" [class.error-input]="!!error" />
          </div>
          
          <div class="form-group">
            <label>
              Password
              <a class="forgot-link" routerLink="/auth/forgot">Forgot?</a>
            </label>
            <div class="password-wrap">
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password"
                placeholder="••••••••" (keydown.enter)="login()" [class.error-input]="!!error" />
              <button class="toggle-pw" (click)="showPassword = !showPassword" type="button">
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <div class="error-msg" *ngIf="error">⚠️ {{ error }}</div>

          <button class="btn-primary" (click)="login()" [disabled]="loading">
            <span *ngIf="!loading">Sign In to Dashboard</span>
            <span *ngIf="loading" class="spinner">Verifying permissions...</span>
          </button>
        </div>

        <p class="auth-footer">
          New to the platform? <a routerLink="/auth/request">Request BA Access</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    /* Using your existing styles with slight 'Champion' refinements */
    .auth-page { min-height: 100vh; background: #f1f5f9; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card { background: white; border-radius: 16px; padding: 40px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
    .auth-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 32px; justify-content: center; }
    .logo-text { font-family: 'Georgia', serif; font-weight: 800; font-size: 20px; color: #0f172a; }
    
    .divider { display: flex; align-items: center; gap: 10px; margin: 24px 0; color: #94a3b8; font-size: 12px; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
    
    .btn-primary { background: #0f172a; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .btn-primary:hover { background: #1e293b; transform: translateY(-1px); }
    
    .error-msg { background: #fef2f2; color: #b91c1c; padding: 12px; border-radius: 8px; font-size: 12px; border: 1px solid #fee2e2; margin-bottom: 10px; }
    .fade-in { animation: fadeIn 0.5s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(
    private auth: AuthService, 
    private gov: GovernanceService, // Injected for session context
    private router: Router
  ) {}

  async login() {
    if (!this.email || !this.password) { 
      this.error = 'Please enter valid BA credentials.'; 
      return; 
    }
    
    this.loading = true; 
    this.error = '';
    
    try {
      const result = await this.auth.loginWithEmail(this.email, this.password);
      if (result.success) {
        // Log the successful entry for the HOD audit
        this.gov.logAction('LOGIN', 'User Session', `${this.email} authenticated`);
        this.router.navigate(['/dashboard']);
      } else {
        this.error = result.error || 'Access Denied: Invalid credentials.';
      }
    } catch (err) {
      this.error = 'System connectivity issue. Try again later.';
    } finally {
      this.loading = false;
    }
  }

  // Google/Microsoft login logic remains the same...
}
