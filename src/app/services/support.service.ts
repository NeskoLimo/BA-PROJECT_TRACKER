import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService } from '../../services/governance.service';
import { AuthService } from '../../services/auth.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.ts', // or your inline template
})
export class SupportComponent {
  private gov = inject(GovernanceService);
  private auth = inject(AuthService);       // Added to fix currentUser errors
  private projectService = inject(ProjectService); // Added to fix projects errors

  // ... other existing properties ...

  /**
   * FIX: Uses AuthService for user details and ProjectService for status filtering
   * consistent with your last working state logic.
   */
  async generateAISupportContext() {
    const user = this.auth.currentUser();
    const projects = this.projectService.projects(); // Accesses the Signal from ProjectService

    if (!user) return 'No user context available';

    const context = `
      - Logged in user: ${user.name} (${user.role})
      - Total projects in registry: ${projects.length}
      - Critical projects: ${projects.filter((p: any) => p.status === 'Critical').length}
    `;
    
    return context;
  }

  /**
   * FIX: Corrects the ticket submission to use the active Auth signal
   * for the 'raisedBy' field.
   */
  submitSupportTicket(issueType: string, details: string) {
    const user = this.auth.currentUser();
    
    const ticketData = {
      type: issueType,
      description: details,
      raisedBy: user ? user.name : 'Unknown User',
      timestamp: new Date().toISOString()
    };

    this.gov.submitTicket(ticketData.type, ticketData.description);
    
    // Log the specific action in the audit trail
    this.gov.logAction(
      'SUPPORT_TICKET', 
      'Support', 
      `Action raised by ${user?.name || 'Unknown'} at ${new Date().toLocaleString()}`
    );
  }
}
