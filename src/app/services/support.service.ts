import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService } from '../../services/governance.service';
import { AuthService, User } from '../../services/auth.service'; // Added User interface import
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="support-container">
      <h2>System Support & Governance</h2>
      </div>
  `,
  styles: [`
    .support-container { padding: 20px; }
  `]
})
export class SupportComponent {
  // Explicitly typing the injected services to resolve "Object is of type unknown"
  private gov = inject(GovernanceService);
  private auth = inject(AuthService);
  private projectService = inject(ProjectService);

  async generateAISupportContext() {
    const user = this.auth.currentUser() as User; // Cast to known User type
    const projects = this.projectService.projects();

    if (!user) return 'No user context available';

    const context = `
      - Logged in user: ${user.name} (${user.role})
      - Total projects: ${projects.length}
      - Critical projects: ${projects.filter((p: any) => p.status === 'Critical').length}
    `;
    
    return context;
  }

  submitSupportTicket(issueType: string, details: string) {
    const user = this.auth.currentUser() as User;
    
    const ticketData = {
      type: issueType,
      description: details,
      raisedBy: user ? user.name : 'Unknown User',
      timestamp: new Date().toISOString()
    };

    this.gov.submitTicket(ticketData.type, ticketData.description);
    
    this.gov.logAction(
      'SUPPORT_TICKET', 
      'Support', 
      `Action raised by ${user?.name || 'Unknown'}`
    );
  }
}
