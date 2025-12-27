import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType } from '@angular/common/http';
import { DigitalManifestModalComponent } from '../digital-manifest-modal/digital-manifest-modal.component';
import { AuthService } from '../services/auth.service';
import { SurveyUpload, GeminiAnalyzedItem, UploadStatusResponse } from '../shared/models';
import { interval, Subscription, switchMap, startWith, takeWhile, tap, map, catchError, of, concatMap, combineLatest, filter, Observable } from 'rxjs'; // Added filter, Observable

@Component({
  selector: 'app-partner-dashboard',
  standalone: true,
  imports: [CommonModule, DigitalManifestModalComponent],
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.scss',
})
export class PartnerDashboardComponent implements OnInit, OnDestroy {
  uploads: (SurveyUpload & { progress: number; videoName: string })[] = [];
  isModalOpen: boolean = false;
  selectedManifest: GeminiAnalyzedItem[] | null = null;
  private pollingSubscription: Subscription | undefined;
  private uploadsToPoll: string[] = []; // Track uploadIds that need polling
  private readonly API_BASE_URL = 'http://localhost:5256/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    console.log('PartnerDashboardComponent: ngOnInit called.');
    this.fetchUploads();
    this.startPolling();
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }

  logout() {
    console.log('PartnerDashboardComponent: Logging out...');
    this.authService.logout();
  }

  private getHeaders(forFileUpload: boolean = false): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
    });
    if (!forFileUpload) {
      headers = headers.set('Content-Type', 'application/json');
    }
    console.log('PartnerDashboardComponent: Getting headers. Token:', token ? 'Present' : 'Missing', 'For file upload:', forFileUpload);
    return headers;
  }

  fetchUploads() {
    console.log('PartnerDashboardComponent: Fetching uploads...');
    this.http.get<SurveyUpload[]>(`${this.API_BASE_URL}/uploads/user`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error('PartnerDashboardComponent: Error fetching uploads:', error);
          return of([]); // Return an empty array on error
        })
      )
      .subscribe((apiUploads) => {
        console.log('PartnerDashboardComponent: Uploads fetched:', apiUploads);
        this.uploadsToPoll = []; // Clear previous list
        this.uploads = apiUploads.map(apiUpload => {
          const existingUpload = this.uploads.find(u => u.uploadId === apiUpload.uploadId);

          const id = apiUpload.uploadId;
          const shortId = id.length > 8 ? `${id.slice(0, 4)}...${id.slice(-4)}` : id;

          if (apiUpload.status === 'Pending' || apiUpload.status === 'Processing') {
            this.uploadsToPoll.push(apiUpload.uploadId);
          }

          return {
            ...apiUpload,
            progress: existingUpload?.progress || (apiUpload.status === 'Completed' || apiUpload.status === 'Failed' ? 100 : 0),
            videoName: existingUpload?.videoName || `Video_${shortId}.mp4`
          };
        });
      });
  }

  startPolling() {
    console.log('PartnerDashboardComponent: Starting polling for uploads...');
    this.pollingSubscription = interval(5000) // Poll every 5 seconds for active uploads
      .pipe(
        startWith(0), // Trigger immediately
        filter(() => this.uploadsToPoll.length > 0), // Only poll if there are uploads to check
        concatMap(() => { // Use concatMap to process polls sequentially
          const pollRequests = this.uploadsToPoll.map(uploadId =>
            this.pollSingleUploadStatus(uploadId).pipe(
              catchError(error => {
                console.error(`Error polling status for ${uploadId}:`, error);
                return of(null); // Continue with other polls even if one fails
              })
            )
          );
          return pollRequests.length > 0 ? combineLatest(pollRequests) : of([]);
        }),
        tap(() => {
          // After polling, re-evaluate uploadsToPoll
          this.uploadsToPoll = this.uploads.filter(u => u.status === 'Pending' || u.status === 'Processing').map(u => u.uploadId);
        }),
        takeWhile(() => this.uploadsToPoll.length > 0, true), // Continue while there are pending/processing uploads
        catchError((error) => {
          console.error('PartnerDashboardComponent: Error during polling:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  pollSingleUploadStatus(uploadId: string): Observable<SurveyUpload | null> {
    console.log(`PartnerDashboardComponent: Polling status for uploadId: ${uploadId}`);
    return this.http.get<SurveyUpload>(`${this.API_BASE_URL}/survey/upload/status/${uploadId}`, { headers: this.getHeaders() })
      .pipe(
        tap(apiUpload => {
          const localUploadIndex = this.uploads.findIndex(u => u.uploadId === apiUpload.uploadId);
          if (localUploadIndex > -1) {
            const localUpload = this.uploads[localUploadIndex];
            if (localUpload.status !== apiUpload.status) {
              localUpload.status = apiUpload.status;
              localUpload.message = apiUpload.message;
              if (apiUpload.status === 'Completed' || apiUpload.status === 'Failed') {
                localUpload.progress = 100;
                // Remove from uploadsToPoll if status is final
                this.uploadsToPoll = this.uploadsToPoll.filter(id => id !== uploadId);
              }
            }
          }
        }),
        catchError(error => {
          console.error(`Error fetching status for ${uploadId}:`, error);
          // If polling fails, keep it in the list for retry, or handle as failed
          return of(null);
        })
      );
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      console.log('PartnerDashboardComponent: File(s) dropped.');
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      console.log('PartnerDashboardComponent: File(s) selected.');
      this.handleFiles(input.files);
    }
  }

  handleFiles(files: FileList) {
    Array.from(files).forEach((file) => {
      console.log('PartnerDashboardComponent: Initiating upload for file:', file.name);

      const formData = new FormData();
      formData.append('videoFile', file, file.name);
      formData.append('customName', ''); // As per API spec

      // Add a temporary entry to the UI immediately
      const tempUpload: (SurveyUpload & { progress: number; videoName: string }) = {
        uploadId: 'temp-' + Math.random().toString(36).substring(2, 15), // Temporary client-side ID
        videoName: file.name,
        createdTimestamp: new Date().toISOString(),
        status: 'Pending',
        progress: 0,
        message: 'Uploading...',
      };
      this.uploads.unshift(tempUpload);

      this.http.post<UploadStatusResponse>(`${this.API_BASE_URL}/survey/upload`, formData, {
        headers: this.getHeaders(true), // Indicate for file upload
        reportProgress: true, // Enable progress tracking
        observe: 'events' // Observe all events for progress
      })
      .subscribe({
        next: (event: HttpEvent<UploadStatusResponse>) => {
          if (event.type === HttpEventType.UploadProgress) {
            tempUpload.progress = Math.round(100 * event.loaded / (event.total || 1));
            tempUpload.message = `Uploading: ${tempUpload.progress}%`;
            console.log(`Upload progress for ${file.name}: ${tempUpload.progress}%`);
          } else if (event.type === HttpEventType.Response) {
            const apiResponse = event.body;
            if (apiResponse) {
              // Find the temporary upload and update it with real API data
              const index = this.uploads.findIndex(u => u.uploadId === tempUpload.uploadId);
              if (index > -1) {
                this.uploads[index] = {
                  ...this.uploads[index],
                  uploadId: apiResponse.uploadId,
                  status: apiResponse.status,
                  message: apiResponse.message ?? null, // Handle undefined message
                  progress: 100 // Assuming 100% once response is received
                };
                // Add to uploadsToPoll if it's not a final status
                if (apiResponse.status === 'Pending' || apiResponse.status === 'Processing') {
                  this.uploadsToPoll.push(apiResponse.uploadId);
                }
                console.log(`Upload complete for ${file.name}. API Response:`, apiResponse);
              }
            }
            // No need to call fetchUploads here, polling will pick it up
          }
        },
        error: (error) => {
          console.error(`Error uploading file ${file.name}:`, error);
          const index = this.uploads.findIndex(u => u.uploadId === tempUpload.uploadId);
          if (index > -1) {
            this.uploads[index] = {
              ...this.uploads[index],
              status: 'Failed',
              message: `Upload failed: ${error.message || 'Unknown error'}`,
              progress: 100
            };
            // Remove from uploadsToPoll if it failed
            this.uploadsToPoll = this.uploadsToPoll.filter(id => id !== tempUpload.uploadId);
          }
        }
      });
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Processing':
        return 'status-processing';
      case 'Completed':
        return 'status-completed';
      case 'Failed':
        return 'status-failed';
      default:
        return '';
    }
  }

  openDigitalManifest(uploadId: string) {
    console.log('PartnerDashboardComponent: Opening digital manifest for uploadId:', uploadId);
    this.http.get<GeminiAnalyzedItem[]>(`${this.API_BASE_URL}/uploads/${uploadId}/analysis`, { headers: this.getHeaders() })
      .pipe(
        catchError((error) => {
          console.error(`PartnerDashboardComponent: Error fetching manifest for ${uploadId}:`, error);
          return of(null); // Return null on error
        })
      )
      .subscribe((manifest) => {
        if (manifest) {
          this.selectedManifest = manifest;
          this.isModalOpen = true;
          console.log('PartnerDashboardComponent: Manifest data loaded and modal opened.');
        }
      });
  }

  closeDigitalManifest() {
    this.isModalOpen = false;
    this.selectedManifest = null;
    console.log('PartnerDashboardComponent: Digital manifest modal closed.');
  }
}
