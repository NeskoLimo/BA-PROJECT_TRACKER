import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Project { 
  id: string; 
  name: string; 
  category: string; 
  location: string;
  manager: string; 
  status: 'Active' | 'Planning' | 'Critical' | 'Closure'; 
  budget: number;
  spent: number;
  currency: string;
  progress: number;
  startDate: string;
  projectedEndDate: string;
  actualEndDate?: string;
  hasAttachment: boolean;
}

@Injectable({ providedIn: 'root' })
export class GovernanceService {
  public projects: Project[] = [
    { 
      id: 'PRJ-101', name: 'ERP System Migration', category: 'INFRASTRUCTURE', location: 'Kenya', 
      manager: 'Alice M.', status: 'Active', budget: 850000, spent: 612000, currency: 'KES', 
      progress: 72, startDate: '2026-01-01', projectedEndDate: '2026-06-30', hasAttachment: true 
    },
    { 
      id: 'PRJ-102', name: 'Warehouse Expansion', category: 'OPERATIONS', location: 'Uganda', 
      manager: 'Unassigned', status: 'Planning', budget: 1200000, spent: 0, currency: 'UGX', 
      progress: 0, startDate: '2026-03-15', projectedEndDate: '2026-12-20', hasAttachment: false 
    },
    { 
      id: 'PRJ-103', name: 'Cloud Migration', category: 'INFRASTRUCTURE', location: 'Kenya', 
      manager: 'Alice M.', status: 'Critical', budget: 1200000, spent: 1100000, currency: 'KES', 
      progress: 92, startDate: '2025-11-10', projectedEndDate: '2026-02-28', hasAttachment: true 
    }
  ];

  // Logic to feed Dashboard storytelling
  getPortfolioSummary() {
    return {
      total: this.projects.length,
      critical: this.projects.filter(p => p.status === 'Critical').length,
      unassigned: this.projects.filter(p => p.manager === 'Unassigned').length
    };
  }
}
