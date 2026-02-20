// src/app/components/auth/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <!-- Logo -->
        <div class="auth-logo">
          <div class="logo-icon">📊</div>
          <div class="logo-text">BA Project Tracker</div>
        </div>

        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to your account to continue</p>

        <!-- SSO Buttons -->
        <div class="sso-buttons">
          <button class="sso-btn" (click)="loginWithGoogle()" [disabled]="loading">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
          <button class="sso-btn" (click)="loginWithMicrosoft()" [disabled]="loading">
            <svg width="18" height="18" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Continue with Microsoft
          </button>
        </div>

        <!-- Divider -->
        <div class="divider"><span>or sign in with email</span></div>

        <!-- Email Form -->
        <div class="form">
          <div class="form-group">
            <label>Email address</label>
            <input type="email" [(ngModel)]="email" placeholder="you@example.com"
              (keydown.enter)="login()" [class.error-input]="!!error" />
          </div>
          <div class="form-group">
            <label>
              Password
              <a class="forgot-link" routerLink="/auth/forgot">Forgot password?</a>
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
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading" class="spinner">Signing in...</span>
          </button>
        </div>

        <p class="auth-footer">
          Don't have an account? <a routerLink="/auth/register">Request access</a>
        </p>

        <!-- Demo hint -->
        <div class="demo-hint">
          <strong>Demo credentials:</strong> admin&#64;batracker.com / Admin&#64;1234
        </div>

      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh; background: #f7f9fc;
      display: flex; align-items: center; justify-content: center;
      font-family: sans-serif; padding: 24px;
    }
    .auth-card {
      background: #fff; border: 1px solid #e8ecf0; border-radius: 14px;
      padding: 40px; width: 100%; max-width: 420px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    }
    .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; }
    .logo-icon { font-size: 26px; }
    .logo-text { font-size: 17px; font-weight: 700; font-family: 'Georgia', serif; color: #1a2332; }
    .auth-title { font-size: 22px; font-weight: 700; font-family: 'Georgia', serif; color: #1a2332; margin: 0 0 6px; }
    .auth-subtitle { font-size: 13px; color: #718096; margin: 0 0 24px; }

    .sso-buttons { display: flex; flex-direction: column; gap: 10px; }
    .sso-btn {
      display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 11px; border: 1px solid #e8ecf0; border-radius: 8px;
      background: #fff; font-size: 13px; font-weight: 600; color: #1a2332;
      cursor: pointer; transition: background 0.15s;
    }
    .sso-btn:hover:not(:disabled) { background: #f7f9fc; }
    .sso-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e8ecf0; }
    .divider span { font-size: 12px; color: #a0aec0; white-space: nowrap; }

    .form { display: flex; flex-direction: column; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group label { font-size: 12px; font-weight: 700; color: #4a5568; display: flex; justify-content: space-between; align-items: center; }
    .form-group input { padding: 10px 12px; border: 1px solid #e8ecf0; border-radius: 8px; font-size: 13px; color: #1a2332; outline: none; width: 100%; box-sizing: border-box; }
    .form-group input:focus { border-color: #1a2332; }
    .form-group input.error-input { border-color: #e53e3e; }
    .password-wrap { position: relative; }
    .password-wrap input { padding-right: 40px; width: 100%; box-sizing: border-box; }
    .toggle-pw { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 14px; }
    .forgot-link { font-size: 12px; color: #3182ce; text-decoration: none; font-weight: 500; }
    .forgot-link:hover { text-decoration: underline; }

    .error-msg { background: #fde8e8; color: #e53e3e; font-size: 12px; padding: 10px 12px; border-radius: 7px; }

    .btn-primary { background: #1a2332; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 4px; }
    .btn-primary:hover:not(:disabled) { background: #2d3748; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .auth-footer { text-align: center; font-size: 13px; color: #718096; margin: 20px 0 0; }
    .auth-footer a { color: #1a2332; font-weight: 700; text-decoration: none; }
    .auth-footer a:hover { text-decoration: underline; }

    .demo-hint { margin-top: 16px; background: #f7f9fc; border: 1px solid #e8ecf0; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #718096; text-align: center; }
    .demo-hint strong { color: #1a2332; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    if (!this.email || !this.password) { this.error = 'Please enter your email and password.'; return; }
    this.loading = true; this.error = '';
    const result = await this.auth.loginWithEmail(this.email, this.password);
    this.loading = false;
    if (result.success) { this.router.navigate(['/dashboard']); }
    else { this.error = result.error || 'Login failed.'; }
  }

  async loginWithGoogle() {
    this.loading = true;
    const result = await this.auth.loginWithGoogle();
    this.loading = false;
    if (result.success) this.router.navigate(['/dashboard']);
  }

  async loginWithMicrosoft() {
    this.loading = true;
    const result = await this.auth.loginWithMicrosoft();
    this.loading = false;
    if (result.success) this.router.navigate(['/dashboard']);
  }
}
