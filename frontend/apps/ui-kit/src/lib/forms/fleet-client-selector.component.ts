import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';

export interface Client {
  id: string;
  clientName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  pincode: string;
  active: boolean;
}

@Component({
  selector: 'fleet-client-selector',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatCardModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="mb-6 border-0 shadow-md">
      <mat-card-header>
        <mat-card-title class="text-xl font-semibold text-slate-900">
          👥 Select Client
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        <!-- Client Search -->
        <mat-form-field class="w-full mb-4" appearance="outline">
          <mat-label>Search clients</mat-label>
          <input matInput 
                 [formControl]="searchControl"
                 placeholder="Search by name, email, or company">
        </mat-form-field>

        <!-- Client Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let client of filteredClients" 
               class="client-card border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md"
               [class]="getClientCardClasses(client)"
               (click)="selectClient(client)">
            
            <div class="flex items-center justify-between mb-2">
              <h4 class="font-semibold text-slate-900">{{client.clientName}}</h4>
              <mat-chip [class]="client.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'">
                {{client.active ? 'Active' : 'Inactive'}}
              </mat-chip>
            </div>
            
            <p class="text-sm text-slate-600 mb-1">{{client.contactPerson}}</p>
            <p class="text-sm text-slate-500">{{client.city}}</p>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .client-card {
      border: 2px solid transparent;
    }
    
    .client-card.selected {
      border-color: #3b82f6;
      background-color: #eff6ff;
    }
    
    .client-card:hover {
      border-color: #cbd5e1;
    }
    
    .client-card.selected:hover {
      border-color: #3b82f6;
    }
  `]
})
export class FleetClientSelectorComponent implements OnInit {
  @Input() selectedClient: Client | null = null;
  @Output() selectedClientChange = new EventEmitter<Client | null>();
  
  searchControl = new FormControl('');
  filteredClients: Client[] = [];
  
  // Demo clients data
  clients: Client[] = [
    {
      id: '1',
      clientName: 'First Promotional - Pune',
      contactPerson: 'Rajesh Gupta',
      email: 'rajesh@firstpromo.com',
      phone: '9876543210',
      city: 'Pune',
      address: 'Shivajinagar',
      pincode: '411005',
      active: true
    },
    {
      id: '2', 
      clientName: 'TechCorp Solutions',
      contactPerson: 'Priya Sharma',
      email: 'priya@techcorp.com',
      phone: '9123456789',
      city: 'Mumbai',
      address: 'Andheri East',
      pincode: '400069',
      active: true
    },
    {
      id: '3',
      clientName: 'Global Industries Ltd',
      contactPerson: 'Amit Kumar',
      email: 'amit@global.com',
      phone: '9234567890',
      city: 'Delhi',
      address: 'Connaught Place',
      pincode: '110001',
      active: false
    },
    {
      id: '4',
      clientName: 'Retail Express Co',
      contactPerson: 'Sneha Patel',
      email: 'sneha@retailexpress.com',
      phone: '9345678901',
      city: 'Bangalore',
      address: 'Koramangala',
      pincode: '560034',
      active: true
    }
  ];

  ngOnInit() {
    this.filteredClients = this.clients.filter(client => client.active);
    
    // Subscribe to search changes
    this.searchControl.valueChanges.subscribe(searchTerm => {
      this.filterClients(searchTerm || '');
    });
  }

  filterClients(searchTerm: string) {
    if (!searchTerm.trim()) {
      this.filteredClients = this.clients.filter(client => client.active);
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client => 
      client.active && (
        client.clientName.toLowerCase().includes(term) ||
        client.contactPerson.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.city.toLowerCase().includes(term)
      )
    );
  }

  selectClient(client: Client) {
    if (client.active) {
      this.selectedClient = client;
      this.selectedClientChange.emit(client);
    }
  }

  getClientCardClasses(client: Client): string {
    const baseClasses = 'client-card';
    const selectedClass = this.selectedClient?.id === client.id ? 'selected' : '';
    const disabledClass = !client.active ? 'opacity-50 cursor-not-allowed' : '';
    
    return `${baseClasses} ${selectedClass} ${disabledClass}`.trim();
  }
}