import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Project { 
  id: string; name: string; category: string; location: string; owner: string; 
  phase: 'Initiation' | 'Planning' | 'Execution' | 'Closure'; 
  status: 'Active' | 'Planning' | 'Critical' | 'Closure'; 
  budget: number; spent: number; currency: string;
  startDate: string; projectedEndDate: string; actualEndDate?: string; 
  attachmentUrl?: string; // Where the DB will store the link
  hasAttachment: boolean; 
}

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  public projects: Project[] = [
    { 
      id: 'PRJ-101', name: 'ERP System Migration', category: 'INFRASTRUCTURE', location: 'Kenya', 
      owner: 'Alice M.', phase: 'Execution', status: 'Active', budget: 850000, spent: 612000, currency: 'KES', 
      startDate: '2026-01-01', projectedEndDate: '2026-06-30', hasAttachment: true, attachmentUrl: 'scope_v1.pdf'
    },
    { 
      id: 'PRJ-102', name: 'Warehouse expansion', category: 'OPERATIONS', location: 'Uganda', 
      owner: 'James K.', phase: 'Planning', status: 'Planning', budget: 500000, spent: 0, currency: 'UGX', 
      startDate: '2026-03-01', projectedEndDate: '2026-08-30', hasAttachment: false
    }
  ];

  // LOGIC: Progress is measured by time elapsed between Start and Projected End
  getCalculatedProgress(p: Project): number {
    const start = new Date(p.startDate).getTime();
    const end = new Date(p.projectedEndDate).getTime();
    const now = new Date().getTime();

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  }

  // GOVERNANCE GATE: Prevents moving phase if attachment is missing
  canMoveToExecution(p: Project): boolean {
    if (p.phase === 'Planning' && !p.hasAttachment) {
      return false; // BLOCKED
    }
    return true;
  }

  // Satisfying build properties for other modules
  public masterRegions = [{ name: 'Kenya', currency: 'KES', projectCount: 12, status: 'Active' }];
  public repositoryDocs = [];
  public auditLog = [{ time: new Date(), action: 'GOV_LOCK', user: 'System', details: 'Planning gate active' }];
  public masterPMs$ = new BehaviorSubject<any[]>([]).asObservable();
  isAdmin() { return true; }
}
