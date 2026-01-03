import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export interface PresignedUrlResponse {
  preSignedUrl: string;
  s3Key: string;
  uploadId: string;
}

export type UploadStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface ProcessUploadResponse {
  uploadId: string;
  status: UploadStatus;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private readonly API_BASE_URL = environment.backendApiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getPresignedUrl(fileName: string): Observable<PresignedUrlResponse> {
    const body = { fileName };
    return this.http.post<PresignedUrlResponse>(`${this.API_BASE_URL}/survey/presigned-url`, body, { headers: this.getHeaders() });
  }

  uploadFileToS3(presignedUrl: string, file: File): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': file.type });
    return this.http.put(presignedUrl, file, {
      headers: headers,
      reportProgress: true,
      observe: 'events'
    });
  }

  processUpload(uploadId: string): Observable<ProcessUploadResponse> {
    const body = { uploadId };
    return this.http.post<ProcessUploadResponse>(`${this.API_BASE_URL}/survey/process-upload`, body, { headers: this.getHeaders() });
  }
}
