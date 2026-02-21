// src/app/services/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  email: string;
  role: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/auth';

  // The master signal that controls the UI visibility
  private _currentUser = signal<User | null>(null);
  
  // Public signal used by app.component.ts
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => {
        // Upon successful DB validation, we update the signal
        this._currentUser.set(response.user);
        localStorage.setItem('token', response.token);
      })
    );
  }

  logout() {
    this._currentUser.set(null);
    localStorage.removeItem('token');
  }
}
