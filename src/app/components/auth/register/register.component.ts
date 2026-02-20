import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { GovernanceService } from '../../../services/governance.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in">
        <div class="auth-logo">
          <div class="logo-icon">📊</div>
          <div class="logo-text">BA Project Tracker</div>
        </div>

        <div class="success-state" *ngIf="submitted">
          <div class="success-icon">✉️</div>
          <h2 class="success-title">Request Queued</h2>
          <p class="success-msg">
            Your request for <strong>{{ form.role }}</strong> access has been sent to the System Administrator. 
            You will be notified once your credentials are white-listed in the Master Registry.
          </p>
          <a routerLink="/auth/login" class="btn-primary-outline">Return to Login</a>
        </div>

        <div *ngIf="!submitted">
          <h1 class="auth-title">Request System Access</h1>
          <p class="auth-subtitle">All new accounts require Administrator approval for data integrity.</p>

          <div class="form">
            <div class="form-row">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" [(ngModel)]="form.name" placeholder="John Doe" />
              </div>
              <div class="form-group">
                <label>Requested Role</label>
                <select [(ngModel)]="form.role">
                  <option value="BA">Business Analyst</option>
                  <option value="PM">Project Manager</option>
                  <option value="Viewer">Guest Viewer</option>
                  <option value="Admin" disabled>Administrator (Invite Only)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Corporate Email</label>
              <input type="email" [(ngModel)]="form.email" placeholder="name@champion.com" />
            </div>

            <div class="form-group">
              <label>Secure Password</label>
              <div class="password-wrap">
                <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="form.password" placeholder="••••••••" />
                <button class="toggle-pw" (click)="showPassword = !showPassword" type="button">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <div class="pw-strength" *ngIf="form.password">
                <div class="pw-bar"><div class="pw-fill" [style.width.%]="passwordStrength.pct" [style.background]="passwordStrength.color"></div></div>
                <span [style.color]="passwordStrength.color">{{ passwordStrength.label }}</span>
              </div>
            </div>

            <div class="form-group">
              <label>Reason for Access</label>
              <textarea [(ngModel)]="form.reason" placeholder="e.g. Managing the upcoming EA expansion registry..." rows="2"></textarea>
            </div>

            <div class="error-msg" *ngIf="error">⚠️ {{ error }}</div>

            <button class="btn-primary" (click)="register()" [disabled]="loading || !isValid()">
              <span *ngIf="!loading">Submit Access Request</span>
              <span *ngIf="loading">Processing...</span>
            </button>
          </div>

          <p class="auth-footer">Existing user? <a routerLink="/auth/login">Sign in here</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; background: #f8fafc; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .auth-card { background: white; border-radius: 16px; padding: 40px; width: 100%; max-width: 480px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
    .logo-text { font-family: 'Georgia', serif; font-weight: 800; font-size: 20px; color: #0f172a; }
    .auth-title { font-size: 24px; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
    .auth-subtitle { font-size: 14px; color: #64748b; margin-bottom: 30px; }

    .form-row { display: flex; gap: 15px; }
    .form-group { margin-bottom: 18px; display: flex; flex-direction: column; flex: 1; }
    .form-group label { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; }
    .form-group input, .form-group select, .form-group textarea { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; transition: 0.2s; }
    .form-group input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

    .pw-strength { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
    .pw-bar { flex: 1; height: 4px; background: #f1f5f9; border-radius: 10px; overflow: hidden; }
    .pw-fill { height: 100%; transition: 0.3s; }
    .pw-strength span { font-size: 11px; font-weight: 700; }

    .btn-primary { background: #0f172a; color: white; border: none; padding: 14px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; }
    .btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
    .btn-primary-outline { display: block; text-align: center; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; color: #1e293b; text-decoration: none; font-weight: 600; margin-top: 20px; }

    .success-state { text-align: center; }
    .success-icon { font-size: 50px; margin-bottom: 16px; }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RegisterComponent {
  showPassword = false;
  loading = false;
  submitted = false;
  error = '';
  form = { name: '', email: '', password: '', confirm: '', role: 'BA', reason: '' };

  constructor(
    private auth: AuthService, 
    private gov: GovernanceService, // Injected to link registration to Support/Audit logs
    private router: Router
  ) {}

  get passwordStrength() {
    const p = this.form.password;
    if (!p) return { pct: 0, color: '#e2e8f0', label: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const map = [
      { pct: 25, color: '#ef4444', label: 'Weak' },
      { pct: 50, color: '#f59e0b', label: 'Fair' },
      { pct: 75, color: '#3b82f6', label: 'Good' },
      { pct: 100, color: '#22c55e', label: 'Strong' },
    ];
    return map[Math.max(score - 1, 0)];
  }

  isValid(): boolean {
    return !!(this.form.name && this.form.email && this.form.password && this.form.password.length >= 8);
  }

  async register() {
    this.loading = true; 
    this.error = '';
    
    // 1. Submit to Auth Service
    const result = await this.auth.register(this.form);
    
    if (result.success) {
      // 2. Log the request in the Governance Audit Trail
      this.gov.logAction('CREATE', 'User Request', `${this.form.email} requested ${this.form.role} role`);
      
      // 3. Optional: Trigger a support ticket automatically so the Admin sees it in their inbox
      this.gov.submitTicket('Access Denied', `New registration request from ${this.form.name} (${this.form.role}). Reason: ${this.form.reason}`);
      
      this.submitted = true;
    } else {
      this.error = result.error || 'The registry is currently busy. Please try again.';
    }
    this.loading = false;
  }
}
