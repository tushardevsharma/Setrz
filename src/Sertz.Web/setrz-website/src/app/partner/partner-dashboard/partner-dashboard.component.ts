import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DigitalManifestModalComponent } from '../digital-manifest-modal/digital-manifest-modal.component';
import { AuthService } from '../services/auth.service';
import { SurveyUpload, GeminiAnalyzedItem } from '../shared/models';
import { interval, Subscription, switchMap, startWith, takeWhile, tap, map, catchError, of } from 'rxjs';

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

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('PartnerDashboardComponent: Getting headers. Token:', token ? 'Present' : 'Missing');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
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
        // Merge API data with local state (e.g., simulated progress and videoName)
        this.uploads = apiUploads.map(apiUpload => {
          const existingUpload = this.uploads.find(u => u.uploadId === apiUpload.uploadId);
          return {
            ...apiUpload,
            progress: existingUpload?.progress || (apiUpload.status === 'Completed' || apiUpload.status === 'Failed' ? 100 : 0),
            videoName: existingUpload?.videoName || `Video_${apiUpload.uploadId.substring(0, 8)}.mp4` // Placeholder if not found locally
          };
        });
      });
  }

  startPolling() {
    console.log('PartnerDashboardComponent: Starting polling for uploads...');
    this.pollingSubscription = interval(5000) // Poll every 5 seconds
      .pipe(
        startWith(0), // Fetch immediately on init
        switchMap(() => this.http.get<SurveyUpload[]>(`${this.API_BASE_URL}/uploads/user`, { headers: this.getHeaders() })),
        tap((apiUploads) => {
          console.log('PartnerDashboardComponent: Polling update. API Uploads:', apiUploads);
          apiUploads.forEach(apiUpload => {
            const localUploadIndex = this.uploads.findIndex(u => u.uploadId === apiUpload.uploadId);
            if (localUploadIndex > -1) {
              // Update existing upload
              const localUpload = this.uploads[localUploadIndex];
              if (localUpload.status !== apiUpload.status) {
                localUpload.status = apiUpload.status;
                if (apiUpload.status === 'Completed' || apiUpload.status === 'Failed') {
                  localUpload.progress = 100;
                }
              }
              localUpload.message = apiUpload.message;
            } else {
              // Add new upload if it appeared on the backend
              this.uploads.unshift({
                ...apiUpload,
                progress: (apiUpload.status === 'Completed' || apiUpload.status === 'Failed' ? 100 : 0),
                videoName: `Video_${apiUpload.uploadId.substring(0, 8)}.mp4`
              });
            }
          });
          // Remove uploads that are no longer present in the API response (optional, depending on desired behavior)
          this.uploads = this.uploads.filter(localUpload =>
            apiUploads.some(apiUpload => apiUpload.uploadId === localUpload.uploadId) ||
            (localUpload.status !== 'Pending' && localUpload.status !== 'Processing') // Keep completed/failed local uploads
          );
        }),
        takeWhile(() => this.uploads.some(u => u.status === 'Pending' || u.status === 'Processing'), true), // Continue while there are pending/processing uploads
        catchError((error) => {
          console.error('PartnerDashboardComponent: Error during polling:', error);
          return of([]);
        })
      )
      .subscribe();
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
      console.log('PartnerDashboardComponent: Handling file:', file.name);
      // Simulate client-side upload progress
      const newUpload: (SurveyUpload & { progress: number; videoName: string }) = {
        uploadId: Math.random().toString(36).substring(2, 15), // Client-side ID for immediate feedback
        videoName: file.name,
        createdTimestamp: new Date().toISOString(),
        status: 'Pending',
        progress: 0,
        message: null,
      };
      this.uploads.unshift(newUpload); // Add to the beginning of the list

      let progress = 0;
      const intervalId = setInterval(() => {
        progress += 10;
        if (progress <= 100) {
          newUpload.progress = progress;
        }
        if (progress === 100) {
          clearInterval(intervalId);
          newUpload.status = 'Pending';
          this.fetchUploads(); // Trigger a fetch to potentially get the real uploadId from the backend
          console.log('PartnerDashboardComponent: Simulated upload complete for:', file.name);
        }
      }, 200);
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
