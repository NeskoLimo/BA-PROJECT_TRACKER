import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService } from '../../services/governance.service';
import { AuthService, User } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.ts' // Ensure this points to your HTML file
})
export class SupportComponent {
  // 1. Inject the three core services
  public gov = inject(GovernanceService);
  public auth = inject(AuthService);
  public projectService = inject(ProjectService);

  // 2. Maintaining local state for the UI
  showMenu = false;
  loading = false;

  /**
   * FIX: Mapping old 'support' calls to the new Governance/Auth architecture.
   * This preserves your logic while fixing the 'Object is of type unknown' errors.
   */
  async handleSupportAction() {
    const user = this.auth.currentUser() as User;
    
    if (!user) {
      // Replaces old this.support.addMessage
      console.warn('Action attempted without user context');
      return;
    }

    // Logic for submitting a ticket through Governance
    const details = `Action raised by ${user.name} at ${new Date().toLocaleString()}`;
    
    this.gov.submitTicket('Support Request', details);
    
    this.gov.logAction(
      'SUPPORT_TICKET',
      'Support',
      details
    );
  }

  // Helper to fix the template errors regarding currentUser
  getUserName(): string {
    return this.auth.currentUser()?.name || 'Guest';
  }

  // Fixes the error at line 694 for project filtering
  getCriticalCount(): number {
    const projects = this.projectService.projects();
    return projects.filter((p: any) => p.status === 'Critical').length;
  }
}
