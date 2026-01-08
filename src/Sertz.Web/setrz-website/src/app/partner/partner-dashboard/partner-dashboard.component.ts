import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpEventType } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DigitalManifestModalComponent } from '../digital-manifest-modal/digital-manifest-modal.component';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { UploadService, PresignedUrlResponse } from '../services/upload.service';
import { SurveyUpload, GeminiAnalyzedItem } from '../shared/models';
import { interval, Subscription, switchMap, startWith, tap, catchError, of, finalize, EMPTY } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-partner-dashboard',
  standalone: true,
  imports: [CommonModule, DigitalManifestModalComponent, FormsModule],
  templateUrl: './partner-dashboard.component.html',
  styleUrls: ['./partner-dashboard.component.scss'],
  providers: [UploadService] // Provide UploadService here
})
export class PartnerDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('fileUploadInput') fileUploadInput!: ElementRef;
  @ViewChild('cameraInput') cameraInput!: ElementRef;
  // Existing properties
  uploads: (SurveyUpload & { progress: number; videoName: string })[] = [];
  isModalOpen: boolean = false;
  selectedManifest: GeminiAnalyzedItem[] | null = null;
  isLoadingUploads: boolean = false;
  isLoadingManifest: boolean = false;
  private pollingSubscription: Subscription | undefined;
  private uploadsToPoll: string[] = [];
  private readonly API_BASE_URL = environment.backendApiUrl;
  private readonly MAX_FILE_SIZE_MB = 20; // Max upload limit set to 20MB

  // New properties for the upload flow
  selectedFile: File | null = null;
  filePreviewUrl: SafeResourceUrl | null = null;
  customFileName: string = '';
  isUploading: boolean = false;
  uploadProgress: number = 0;
  uploadStatusMessage: string = '';
  private uploadSubscription: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService,
    private uploadService: UploadService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.fetchUploads();
    this.startPolling();
    console.log('Environment Production:', environment.production);
    console.log('Environment Backend API URL:', environment.backendApiUrl);
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
    this.uploadSubscription?.unsubscribe();
  }

  logout() {
    this.authService.logout();
    this.notificationService.showInfo('You have been logged out.');
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // --- New Upload Flow Methods ---

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.type !== 'video/mp4' && file.type !== 'video/quicktime') {
        this.notificationService.showError('Invalid file type. Only .mp4 files are accepted.');
        this.clearFileInput(input);
        return;
      }

      // Validate file size
      const maxSizeBytes = this.MAX_FILE_SIZE_MB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        this.notificationService.showError(`File size exceeds the maximum limit of ${this.MAX_FILE_SIZE_MB}MB.`);
        this.clearFileInput(input);
        return;
      }

      this.selectedFile = file;
      this.customFileName = this.selectedFile.name;
      this.filePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(this.selectedFile));
    }
  }

  cancelSelection() {
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.customFileName = '';
    this.isUploading = false;
    this.uploadProgress = 0;
    this.uploadStatusMessage = '';
    this.clearFileInput(document.querySelector('input[type=file]'));
  }

  retryUpload(uploadId: string) {
    const upload = this.uploads.find(u => u.uploadId === uploadId);
    if (!upload) {
      this.notificationService.showError('Could not find the upload to retry.');
      return;
    }

    // Provide immediate UI feedback
    upload.status = 'Pending';
    upload.message = 'Retrying processing...';

    this.uploadService.processUpload(uploadId).pipe(
      catchError(error => {
        console.error(`Retry failed for ${uploadId}:`, error);
        this.notificationService.showError(`Retry failed: ${error.message || 'Unknown error'}`);
        // Revert status on failure
        upload.status = 'Failed';
        upload.message = `Retry failed: ${error.message || 'Unknown error'}`;
        return EMPTY; // Stop the observable chain
      })
    ).subscribe(response => {
      this.notificationService.showSuccess(`Retry initiated for ${upload.videoName}.`);
      upload.status = response.status;
      upload.message = response.message;
      // Ensure this upload is picked up by the poller if it's still processing
      if ((response.status === 'Pending' || response.status === 'Processing') && !this.uploadsToPoll.includes(uploadId)) {
        this.uploadsToPoll.push(uploadId);
      }
    });
  }

  onUpload() {
    if (!this.selectedFile || !this.customFileName) {
      this.notificationService.showError('Please select a file and provide a file name.');
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadStatusMessage = 'Requesting upload URL...';

    let finalFileName = this.customFileName;
    if (!this.customFileName.includes('.')) {
      // Append extension if not present
      const fileExtension = this.selectedFile.type === 'video/quicktime' ? '.mov' : '.mp4';
      finalFileName = `${this.customFileName}${fileExtension}`;
    }

    this.uploadSubscription = this.uploadService.getPresignedUrl(finalFileName, this.selectedFile.type).pipe(
      tap(() => {
        this.uploadStatusMessage = 'Uploading video to secure storage...';
      }),
      switchMap((presignedResponse: PresignedUrlResponse) => {
        if (!this.selectedFile) return EMPTY;
        return this.uploadService.uploadFileToS3(presignedResponse.preSignedUrl, this.selectedFile).pipe(
          tap(event => {
            if (event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = Math.round(100 * event.loaded / (event.total || 1));
            }
          }),
          switchMap(event => {
            if (event.type === HttpEventType.Response) {
              this.uploadProgress = 100;
              this.uploadStatusMessage = 'Finalizing upload...';
              return this.uploadService.processUpload(presignedResponse.uploadId);
            }
            return EMPTY;
          })
        );
      }),
      catchError(error => {
        console.error('Upload failed:', error);
        this.notificationService.showError(`Upload failed: ${error.message || 'Unknown error'}`);
        this.isUploading = false;
        return EMPTY;
      }),
      finalize(() => {
        this.isUploading = false;
      })
    ).subscribe({
      next: (processResponse) => {
        this.notificationService.showSuccess('Upload successful! Your video is now being processed.');
        this.cancelSelection();
        this.fetchUploads(); // Refresh the list
      },
      error: (err) => {
        // This block is for safety, but catchError should handle it.
        this.notificationService.showError('An unexpected error occurred during the upload process.');
        this.isUploading = false;
      }
    });
  }

  private clearFileInput(input: HTMLInputElement | null) {
    if (input) {
      input.value = '';
    }
  }


  // --- Existing Methods for Fetching and Polling ---

  fetchUploads() {
    this.isLoadingUploads = true;
    this.http.get<SurveyUpload[]>(`${this.API_BASE_URL}/uploads/user`, { headers: this.getHeaders() })
      .pipe(catchError(() => {
        this.notificationService.showError('Failed to fetch uploads.');
        return of([]);
      }))
      .subscribe((apiUploads) => {
        this.uploadsToPoll = [];
        this.uploads = apiUploads.map(apiUpload => {
          const id = apiUpload.uploadId;
          const shortId = id.length > 8 ? `${id.slice(0, 4)}...${id.slice(-4)}` : id;
          if (apiUpload.status === 'Pending' || apiUpload.status === 'Processing' || apiUpload.status === 'Queued') {
            this.uploadsToPoll.push(apiUpload.uploadId);
          }
          return {
            ...apiUpload,
            progress: (apiUpload.status === 'Completed' || apiUpload.status === 'Failed') ? 100 : 0,
            videoName: apiUpload.fileName || `Video_${shortId}.mp4`
          };
        });
        this.isLoadingUploads = false;
      });
  }

  startPolling() {
    this.pollingSubscription = interval(5000).pipe(
      startWith(0),
      tap(() => {
        if (this.uploadsToPoll.length > 0) {
          this.pollUploadsStatus();
        }
      })
    ).subscribe();
  }

  pollUploadsStatus() {
    this.uploadsToPoll.forEach(uploadId => {
      this.http.get<SurveyUpload>(`${this.API_BASE_URL}/survey/upload/status/${uploadId}`, { headers: this.getHeaders() })
        .pipe(catchError(() => of(null)))
        .subscribe(apiUpload => {
          if (apiUpload) {
            const localUpload = this.uploads.find(u => u.uploadId === apiUpload.uploadId);
            if (localUpload && localUpload.status !== apiUpload.status) {
              localUpload.status = apiUpload.status;
              localUpload.message = apiUpload.message;
              if (apiUpload.status === 'Completed' || apiUpload.status === 'Failed') {
                this.uploadsToPoll = this.uploadsToPoll.filter(id => id !== uploadId);
                this.notificationService.showInfo(`Upload status for ${apiUpload.fileName} is now ${apiUpload.status}.`);
              }
            }
          }
        });
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Processing': return 'status-processing';
      case 'Queued': return 'status-queued';
      case 'Completed': return 'status-completed';
      case 'Failed': return 'status-failed';
      default: return '';
    }
  }

  openDigitalManifest(uploadId: string) {
    this.isLoadingManifest = true;
    this.http.get<GeminiAnalyzedItem[]>(`${this.API_BASE_URL}/uploads/${uploadId}/analysis`, { headers: this.getHeaders() })
      .pipe(catchError(() => {
        this.notificationService.showError('Failed to fetch digital manifest.');
        return of(null);
      }))
      .subscribe((manifest) => {
        if (manifest) {
          this.selectedManifest = manifest;
          this.isModalOpen = true;
        }
        this.isLoadingManifest = false;
      });
  }

  closeDigitalManifest() {
    this.isModalOpen = false;
    this.selectedManifest = null;
  }
}