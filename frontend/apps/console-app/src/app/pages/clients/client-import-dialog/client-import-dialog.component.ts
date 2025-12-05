import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ClientService } from '../../../services/client.service';

@Component({
  selector: 'app-client-import-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './client-import-dialog.component.html',
  styleUrls: ['./client-import-dialog.component.scss']
})
export class ClientImportDialogComponent {
  selectedFile: File | null = null;
  uploading = false;
  error: string | null = null;

  constructor(
    private dialogRef: MatDialogRef<ClientImportDialogComponent>,
    private clientService: ClientService
  ) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.error = null;
    }
  }

  upload(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.error = null;

    this.clientService.importClients(this.selectedFile).subscribe({
      next: () => {
        this.uploading = false;
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.uploading = false;
        this.error = 'Failed to upload file. Please check the format and try again.';
        console.error(err);
      }
    });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
