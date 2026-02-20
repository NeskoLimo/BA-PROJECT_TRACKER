import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GovernanceService } from '../../../services/governance.service';

@Component({ /* ... metadata ... */ })
export class LoginComponent {
  constructor(
    private gov: GovernanceService, 
    private router: Router
  ) {}

  async onLoginSuccess(userEmail: string) {
    // Record login in Audit Trail
    this.gov.logAction('LOGIN', 'Authentication', `User ${userEmail} signed in.`);
    this.router.navigate(['/dashboard']);
  }
}
