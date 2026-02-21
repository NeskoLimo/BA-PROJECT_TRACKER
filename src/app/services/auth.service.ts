
// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  provider: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(this.loadUser());
  user = this._user.asReadonly();

  constructor(private router: Router) {}

  private loadUser(): AuthUser | null {
    try {
      const stored = localStorage.getItem('ba_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }

  private saveUser(user: AuthUser) {
    localStorage.setItem('ba_auth_user', JSON.stringify(user));
    this._user.set(user);
  }

  isAuthenticated(): boolean {
    return this._user() !== null;
  }

  // ── Placeholder: swap this for real PostgreSQL API call ──
  async loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const users = this.getRegisteredUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: 'Invalid email or password.' };
    if (found.status === 'pending') return { success: false, error: 'Your account is pending admin approval.' };
    const authUser: AuthUser = { id: found.id, name: found.name, email: found.email, role: found.role, avatar: found.name.charAt(0).toUpperCase(), provider: 'email' };
    this.saveUser(authUser);
    return { success: true };
  }

  // ── Placeholder: swap for Google OAuth ──
  async loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
    const mockUser: AuthUser = { id: 'google-001', name: 'Google User', email: 'user@gmail.com', role: 'Viewer', avatar: 'G', provider: 'google' };
    this.saveUser(mockUser);
    return { success: true };
  }

  // ── Placeholder: swap for Microsoft OAuth ──
  async loginWithMicrosoft(): Promise<{ success: boolean; error?: string }> {
    const mockUser: AuthUser = { id: 'ms-001', name: 'Microsoft User', email: 'user@outlook.com', role: 'Viewer', avatar: 'M', provider: 'microsoft' };
    this.saveUser(mockUser);
    return { success: true };
  }

  // ── Placeholder: swap for PostgreSQL INSERT ──
  async register(data: { name: string; email: string; password: string; role: string; reason: string }): Promise<{ success: boolean; error?: string }> {
    const users = this.getRegisteredUsers();
    if (users.find(u => u.email === data.email)) return { success: false, error: 'An account with this email already exists.' };
    const newUser = { id: `user-${Date.now()}`, name: data.name, email: data.email, password: data.password, role: data.role, reason: data.reason, status: 'pending' };
    users.push(newUser);
    localStorage.setItem('ba_registered_users', JSON.stringify(users));
    return { success: true };
  }

  logout() {
    localStorage.removeItem('ba_auth_user');
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  private getRegisteredUsers(): any[] {
    try {
      const stored = localStorage.getItem('ba_registered_users');
      const users = stored ? JSON.parse(stored) : [];
      // Seed default admin if no users exist
      if (!users.find((u: any) => u.email === 'admin@batracker.com')) {
        users.push({ id: 'admin-001', name: 'NeskoLimo', email: 'admin@batracker.com', password: 'Admin@1234', role: 'Admin', status: 'active' });
        localStorage.setItem('ba_registered_users', JSON.stringify(users));
      }
      return users;
    } catch { return []; }
  }
}
