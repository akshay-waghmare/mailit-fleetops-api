import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ConfigService } from '../../../../../libs/shared/config.service';
import { Client } from '../models/client.model';

export interface ClientImportResponse {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: string[];
  importedClients: Client[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = `${this.configService.apiBaseUrl}/v1/clients`;
  }

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  getClientsPaginated(page: number, size: number, query?: string): Observable<any> {
    let params: any = { page, size };
    if (query) params.query = query;
    return this.http.get<any>(this.apiUrl, { params });
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  importClients(file: File): Observable<ClientImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ClientImportResponse>(`${this.apiUrl}/import`, formData);
  }

  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/template`, { responseType: 'blob' });
  }

  importClientsWithProgress(file: File): Observable<UploadProgress | ClientImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ClientImportResponse>(`${this.apiUrl}/import`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            // If total is known, calculate percentage. Otherwise return 0 (indeterminate)
            const total = event.total || 0;
            const percentage = total > 0 ? Math.round((100 * event.loaded) / total) : 0;
            
            return {
              loaded: event.loaded,
              total: total,
              percentage: percentage
            } as UploadProgress;
          
          case HttpEventType.Response:
            return event.body as ClientImportResponse;
          
          default:
            return { loaded: 0, total: 0, percentage: 0 } as UploadProgress;
        }
      })
    );
  }
}
