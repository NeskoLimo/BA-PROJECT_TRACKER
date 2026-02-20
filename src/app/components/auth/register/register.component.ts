// src/app/components/auth/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">

        <div class="auth-logo">
          <div class="logo-icon">📊</div>
          <div class="logo-text">BA Project Tracker</div>
        </div>

        <!-- Success State -->
        <div class="success-state" *ngIf="submitted">
          <div class="success-icon">✅</div>
          <h2 class="success-title">Access Requested!</h2>
          <p class="success-msg">Your request has been submitted. An admin will review and approve your account shortly. You'll receive an email once approved.</p>
          <a routerLink="/auth/login" class="btn-primary" style="display:block;text-align:center;text-decoration:none;margin-top:20px;">Back to Sign In</a>
        </div>

        <div *ngIf="!submitted">
          <h1 class="auth-title">Request Access</h1>
          <p class="auth-subtitle">Create your account — an admin will approve your access</p>

          <!-- SSO -->
          <div class="sso-buttons">
            <button class="sso-btn" (click)="registerWithGoogle()" [disabled]="loading">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign up with Google
            </button>
            <button class="sso-btn" (click)="registerWithMicrosoft()" [disabled]="loading">
              <svg width="18" height="18" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
              </svg>
              Sign up with Microsoft
            </button>
          </div>

          <div class="divider"><span>or register with email</span></div>

          <div class="form">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name *</label>
                <input type="text" [(ngModel)]="form.name" placeholder="Jane Doe" />
              </div>
              <div class="form-group">
                <label>Requested Role *</label>
                <select [(ngModel)]="form.role">
                  <option value="Viewer">Viewer</option>
                  <option value="BA">BA</option>
                  <option value="PM">PM</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Work Email *</label>
              <input type="email" [(ngModel)]="form.email" placeholder="you@company.com" />
            </div>
            <div class="form-group">
              <label>Password *</label>
              <div class="password-wrap">
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="form.password" placeholder="Min. 8 characters" />
                <button class="toggle-pw" (click)="showPassword = !showPassword" type="button">{{ showPassword ? '🙈' : '👁️' }}</button>
              </div>
              <div class="pw-strength" *ngIf="form.password">
                <div class="pw-bar">
                  <div class="pw-fill" [style.width.%]="passwordStrength.pct" [style.background]="passwordStrength.color"></div>
                </div>
                <span [style.color]="passwordStrength.color">{{ passwordStrength.label }}</span>
              </div>
            </div>
            <div class="form-group">
              <label>Confirm Password *</label>
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="form.confirm" placeholder="Repeat password" [class.error-input]="form.confirm && form.password !== form.confirm" />
              <span class="field-error" *ngIf="form.confirm && form.password !== form.confirm">Passwords do not match</span>
            </div>
            <div class="form-group">
              <label>Reason for Access</label>
              <textarea [(ngModel)]="form.reason" placeholder="Briefly describe your role and why you need access..." rows="3"></textarea>
            </div>

            <div class="error-msg" *ngIf="error">⚠️ {{ error }}</div>

            <button class="btn-primary" (click)="register()" [disabled]="loading || !isValid()">
              <span *ngIf="!loading">Request Access</span>
              <span *ngIf="loading">Submitting...</span>
            </button>
          </div>

          <p class="auth-footer">Already have an account? <a routerLink="/auth/login">Sign in</a></p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; background: #f7f9fc; display: flex; align-items: center; justify-content: center; font-family: sans-serif; padding: 24px; }
    .auth-card { background: #fff; border: 1px solid #e8ecf0; border-radius: 14px; padding: 40px; width: 100%; max-width: 460px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
    .logo-icon { font-size: 26px; }
    .logo-text { font-size: 17px; font-weight: 700; font-family: 'Georgia', serif; color: #1a2332; }
    .auth-title { font-size: 22px; font-weight: 700; font-family: 'Georgia', serif; color: #1a2332; margin: 0 0 6px; }
    .auth-subtitle { font-size: 13px; color: #718096; margin: 0 0 20px; }

    .sso-buttons { display: flex; flex-direction: column; gap: 10px; }
    .sso-btn { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 11px; border: 1px solid #e8ecf0; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 600; color: #1a2332; cursor: pointer; }
    .sso-btn:hover:not(:disabled) { background: #f7f9fc; }
    .sso-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    .divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e8ecf0; }
    .divider span { font-size: 12px; color: #a0aec0; white-space: nowrap; }

    .form { display: flex; flex-direction: column; gap: 14px; }
    .form-row { display: flex; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; flex: 1; }
    .form-group label { font-size: 12px; font-weight: 700; color: #4a5568; }
    .form-group input, .form-group select, .form-group textarea { padding: 10px 12px; border: 1px solid #e8ecf0; border-radius: 8px; font-size: 13px; color: #1a2332; outline: none; width: 100%; box-sizing: border-box; font-family: sans-serif; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #1a2332; }
    .form-group textarea { resize: vertical; }
    .form-group input.error-input { border-color: #e53e3e; }
    .password-wrap { position: relative; }
    .password-wrap input { padding-right: 40px; }
    .toggle-pw { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 14px; }
    .field-error { font-size: 11px; color: #e53e3e; }

    .pw-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
    .pw-bar { flex: 1; height: 4px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
    .pw-fill { height: 100%; border-radius: 99px; transition: width 0.3s; }
    .pw-strength span { font-size: 11px; font-weight: 600; white-space: nowrap; }

    .error-msg { background: #fde8e8; color: #e53e3e; font-size: 12px; padding: 10px 12px; border-radius: 7px; }
    .btn-primary { background: #1a2332; color: white; border: none; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; }
    .btn-primary:hover:not(:disabled) { background: #2d3748; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .auth-footer { text-align: center; font-size: 13px; color: #718096; margin: 20px 0 0; }
    .auth-footer a { color: #1a2332; font-weight: 700; text-decoration: none; }

    .success-state { text-align: center; padding: 20px 0; }
    .success-icon { font-size: 48px; margin-bottom: 16px; }
    .success-title { font-size: 22px; font-weight: 700; font-family: 'Georgia', serif; color: #1a2332; margin: 0 0 10px; }
    .success-msg { font-size: 14px; color: #718096; line-height: 1.6; margin: 0; }
  `]
})
export class RegisterComponent {
  showPassword = false;
  loading = false;
  submitted = false;
  error = '';

  form = { name: '', email: '', password: '', confirm: '', role: 'Viewer', reason: '' };

  constructor(private auth: AuthService, private router: Router) {}

  get passwordStrength() {
    const p = this.form.password;
    if (!p) return { pct: 0, color: '#e2e8f0', label: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const map = [
      { pct: 25, color: '#e53e3e', label: 'Weak' },
      { pct: 50, color: '#d69e2e', label: 'Fair' },
      { pct: 75, color: '#3182ce', label: 'Good' },
      { pct: 100, color: '#38a169', label: 'Strong' },
    ];
    return map[Math.max(score - 1, 0)];
  }

  isValid(): boolean {
    return !!(this.form.name && this.form.email && this.form.password &&
      this.form.password === this.form.confirm && this.form.password.length >= 8);
  }

  async register() {
    if (!this.isValid()) return;
    this.loading = true; this.error = '';
    const result = await this.auth.register(this.form);
    this.loading = false;
    if (result.success) { this.submitted = true; }
    else { this.error = result.error || 'Registration failed.'; }
  }

  async registerWithGoogle() {
    this.loading = true;
    await this.auth.loginWithGoogle();
    this.router.navigate(['/dashboard']);
  }

  async registerWithMicrosoft() {
    this.loading = true;
    await this.auth.loginWithMicrosoft();
    this.router.navigate(['/dashboard']);
  }
}
