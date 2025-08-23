import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PickupService } from '@libs/shared/pickup.service';
import { PickupRecord } from '@libs/shared/pickup.interface';

@Component({
  selector: 'app-pickup-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule
  ],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold">Pickup Management</h2>
        <div class="flex items-center gap-2">
          <button mat-raised-button color="primary" (click)="loadPickups(true)">Load Demo Data</button>
        </div>
      </div>

      <div class="mb-4 p-3 bg-white rounded shadow-sm text-sm text-slate-700" *ngIf="usingDemo">
        Showing demo data — backend unavailable or demo mode enabled.
      </div>

      <div class="mb-4 grid grid-cols-4 gap-4">
        <mat-form-field appearance="outline">
          <mat-label>Pickup ID</mat-label>
          <input matInput (keyup)="applyColumnFilter($event, 'pickupId')" placeholder="Filter pickup id" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Client</mat-label>
          <input matInput (keyup)="applyColumnFilter($event, 'client')" placeholder="Filter client" />
        </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Schedule</mat-label>
            <input matInput [matDatepicker]="picker" (dateChange)="applyDateFilter($event.value)" placeholder="Filter date" />
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <input matInput (keyup)="applyColumnFilter($event, 'status')" placeholder="Filter status" />
        </mat-form-field>
      </div>

      <table mat-table [dataSource]="dataSource" matSort class="w-full"> 
        <ng-container matColumnDef="pickupId">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Pickup ID</th>
          <td mat-cell *matCellDef="let row">{{row.pickupId}}</td>
        </ng-container>

        <ng-container matColumnDef="client">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Client</th>
          <td mat-cell *matCellDef="let row">{{row.clientName}} — {{row.clientCompany}}</td>
        </ng-container>

        <ng-container matColumnDef="schedule">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Schedule</th>
          <td mat-cell *matCellDef="let row">{{row.pickupDate | date}} {{row.pickupTime}}</td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
          <td mat-cell *matCellDef="let row">{{row.status}}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
    </div>
  `
})
export class PickupListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<PickupRecord>([]);
  displayedColumns = ['pickupId', 'client', 'schedule', 'status'];
  usingDemo = true;

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  demoData: PickupRecord[] = [
    {
      id: 'demo-1',
      pickupId: 'PKP00001',
      clientName: 'Acme Corp',
      clientCompany: 'Acme Corporation',
      clientId: 'c_demo_1',
      pickupAddress: '12 Demo Street, Springfield',
      contactNumber: '+1-555-0100',
      itemCount: 2,
      totalWeight: 5.5,
      itemDescription: 'Documents and small parcels',
      pickupType: 'direct',
      assignedStaff: 'John Doe',
      staffId: 's_demo_1',
      staffDepartment: 'Operations',
      pickupDate: new Date().toISOString(),
      pickupTime: '10:00',
      status: 'scheduled',
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo'
    },
    {
      id: 'demo-2',
      pickupId: 'PKP00002',
      clientName: 'Beta LLC',
      clientCompany: 'Beta Logistics',
      clientId: 'c_demo_2',
      pickupAddress: '99 Example Ave, Metropolis',
      contactNumber: '+1-555-0200',
      itemCount: 5,
      totalWeight: 12.3,
      itemDescription: 'Boxes - fragile',
      pickupType: 'vendor',
      carrierName: 'FastShip',
      assignedStaff: 'Jane Smith',
      staffId: 's_demo_2',
      staffDepartment: 'Field Ops',
      pickupDate: new Date().toISOString(),
      pickupTime: '14:30',
      status: 'in-progress',
      statusUpdatedAt: new Date().toISOString(),
      statusUpdatedBy: 'jane',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'demo'
    }
  ];

  constructor(private pickupService: PickupService) {}

  ngOnInit(): void {
    // Initialize with demo data for SSR-stable render, then attempt backend load
    this.dataSource.data = this.demoData;
    // Custom filterPredicate that supports either a plain string (global search)
    // or a JSON-encoded object for per-column filters.
    this.dataSource.filterPredicate = (data: PickupRecord, filter: string) => {
      if (!filter) return true;
      // Try parse JSON for column filters
      try {
        const fobj = JSON.parse(filter);
        // For each key in fobj, if value is truthy, ensure data matches
        for (const k of Object.keys(fobj)) {
          const val = (fobj as any)[k]?.toString().trim().toLowerCase();
          if (!val) continue;
          if (k === 'pickupId') {
            if (!data.pickupId?.toLowerCase().includes(val)) return false;
          } else if (k === 'client') {
            const hay = [data.clientName, data.clientCompany].filter(Boolean).join(' ').toLowerCase();
            if (!hay.includes(val)) return false;
          } else if (k === 'schedule') {
              // Compare date-only strings (YYYY-MM-DD)
              const pickDate = data.pickupDate ? new Date(data.pickupDate).toISOString().slice(0, 10) : '';
              if (!pickDate.includes(val)) return false;
            } else if (k === 'status') {
            if (!data.status?.toLowerCase().includes(val)) return false;
          } else {
            // fallback: check any field
            const hay = [
              data.pickupId,
              data.clientName,
              data.clientCompany,
              data.status,
              data.pickupTime,
              data.pickupAddress,
              data.itemDescription
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            if (!hay.includes(val)) return false;
          }
        }
        return true;
      } catch (e) {
        // fallback: global substring search
        const s = filter.trim().toLowerCase();
        const haystack = [
          data.pickupId,
          data.clientName,
          data.clientCompany,
          data.status,
          data.pickupTime,
          data.pickupAddress,
          data.itemDescription
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.indexOf(s) !== -1;
      }
    };
    // Initialize empty column filters map
    this.columnFilters = {};
    setTimeout(() => this.loadPickups(), 0);
  }

  // Per-column filter state
  columnFilters: { [key: string]: string } = {};

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

  loadPickups(forceDemo = false): void {
    if (forceDemo) {
      this.useDemoData();
      return;
    }

    this.pickupService.getPickups({ page: 0, limit: 20 }).subscribe(
      (res: { content: PickupRecord[] }) => {
        const items = res.content || [];
        this.dataSource.data = items;
        this.usingDemo = items.length === 0;
        if (!items || items.length === 0) {
          this.useDemoData();
        }
      },
      () => {
        this.useDemoData();
      }
    );
  }

  private useDemoData(): void {
    this.dataSource.data = this.demoData;
    this.usingDemo = true;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyColumnFilter(event: Event, column: string): void {
    const value = (event.target as HTMLInputElement).value || '';
    this.columnFilters[column] = value.trim().toLowerCase();
    // Create a JSON-encoded filter object consumed by filterPredicate
    this.dataSource.filter = JSON.stringify(this.columnFilters);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyDateFilter(date: Date | null): void {
    if (!date) {
      delete this.columnFilters['schedule'];
    } else {
      const iso = date.toISOString().slice(0, 10); // YYYY-MM-DD
      this.columnFilters['schedule'] = iso;
    }
    this.dataSource.filter = JSON.stringify(this.columnFilters);
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
