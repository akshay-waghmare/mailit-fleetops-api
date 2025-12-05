import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ClientService } from '../../../services/client.service';
import { Client } from '../../../models/client.model';
import { ClientDialogComponent } from '../client-dialog/client-dialog.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatPaginatorModule, 
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit, AfterViewInit {
  dataSource = new MatTableDataSource<Client>([]);
  displayedColumns: string[] = ['contractNo', 'subContractCode', 'name', 'address', 'contactPerson', 'actions'];
  isLoading = true;
  searchText = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private clientService: ClientService, 
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    // Custom filter predicate to search across multiple fields
    this.dataSource.filterPredicate = (data: Client, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        (data.name?.toLowerCase().includes(searchStr) || false) ||
        (data.contractNo?.toLowerCase().includes(searchStr) || false) ||
        (data.subContractCode?.toLowerCase().includes(searchStr) || false) ||
        (data.address?.toLowerCase().includes(searchStr) || false) ||
        (data.contactPerson?.toLowerCase().includes(searchStr) || false) ||
        (data.vcity?.toLowerCase().includes(searchStr) || false) ||
        (data.vcontactMobile?.toLowerCase().includes(searchStr) || false) ||
        (data.vcontactEmail?.toLowerCase().includes(searchStr) || false)
      );
    };
  }

  ngOnInit(): void {
    this.loadClients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchText.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilter();
  }

  loadClients(): void {
    this.isLoading = true;
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.isLoading = false;
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: (err) => {
        console.error('Error loading clients', err);
        this.isLoading = false;
      }
    });
  }

  navigateToImport(): void {
    this.router.navigate(['/clients/import']);
  }

  openAddClientDialog(): void {
    const dialogRef = this.dialog.open(ClientDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.clientService.createClient(result).subscribe({
          next: (newClient) => {
            this.snackBar.open('Client created successfully', 'Close', { duration: 3000 });
            this.loadClients();
          },
          error: (err) => {
            console.error('Error creating client', err);
            this.snackBar.open('Failed to create client', 'Close', { duration: 3000 });
            this.isLoading = false;
          }
        });
      }
    });
  }

  openEditClientDialog(client: Client): void {
    const dialogRef = this.dialog.open(ClientDialogComponent, {
      width: '600px',
      data: { client }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.clientService.updateClient(client.id!, result).subscribe({
          next: (updatedClient) => {
            this.snackBar.open('Client updated successfully', 'Close', { duration: 3000 });
            this.loadClients();
          },
          error: (err) => {
            console.error('Error updating client', err);
            this.snackBar.open('Failed to update client', 'Close', { duration: 3000 });
            this.isLoading = false;
          }
        });
      }
    });
  }

  deleteClient(client: Client): void {
    const confirmed = window.confirm(`Are you sure you want to delete client "${client.name}"? This action cannot be undone.`);
    
    if (confirmed) {
      this.isLoading = true;
      this.clientService.deleteClient(client.id!).subscribe({
        next: () => {
          this.snackBar.open('Client deleted successfully', 'Close', { duration: 3000 });
          this.loadClients();
        },
        error: (err) => {
          console.error('Error deleting client', err);
          this.snackBar.open('Failed to delete client', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    }
  }
}
