import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ScrollService } from '../../shared/services/scroll.service';
import { Subscription, firstValueFrom } from 'rxjs';

// Declare gtag_report_conversion function globally
declare function gtag_report_conversion(url?: string): boolean;

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements OnInit, AfterViewInit, OnDestroy {
  @Output() getConsultation = new EventEmitter<void>();

  @ViewChild('typewriterText') typewriterTextRef!: ElementRef;
  @ViewChild('typedCursor') typedCursorRef!: ElementRef;
  @ViewChild('heroForm') heroForm!: NgForm;
  @ViewChild('heroSection') heroSection!: ElementRef;

  private textArray: string[] = [
    "Experience the future of relocation.",
    "The new standard in moving.",
    "Seamless, stress-free relocation.",
    "Powered by technology, designed for your peace of mind.",
    "Your personal home settling partners."
  ];
  private textArrayIndex: number = 0;
  private typedText: string = "";
  private charIndex: number = 0;
  private typingSpeed: number = 100;
  private deletingSpeed: number = 50;
  private pauseBetweenTexts: number = 1500;
  private isDeleting: boolean = false;
  private typingTimeout: any;
  private cursorBlinkInterval: any;
  private scrollSubscription!: Subscription;

  formData = {
    name: '',
    phoneNumber: '',
    desiredMoveOutDate: '',
    moveSize: '',
  };

  todayDate: string;
  maxMoveOutDate: string;
  formSubmittedSuccessfully: boolean = false;
  isSubmitting: boolean = false; // New flag for submission state

  constructor(private http: HttpClient, private scrollService: ScrollService) {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    this.maxMoveOutDate = maxDate.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.scrollSubscription = this.scrollService.scrollToForm$.subscribe(() => {
      if (this.heroSection) {
        this.heroSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  ngAfterViewInit() {
    this.typingTimeout = setTimeout(() => {
      this.handleTypeWriter();
    }, 500);

    this.blinkCursor();
  }

  ngOnDestroy() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
    }
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  onGetConsultationClick(): void {
    if (this.heroSection) {
      this.heroSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.getConsultation.emit();
  }

  handleTypeWriter = () => {
    const currentText = this.textArray[this.textArrayIndex];

    if (this.isDeleting) {
      this.typedText = currentText.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.typedText = currentText.substring(0, this.charIndex + 1);
      this.charIndex++;
    }

    if (this.typewriterTextRef && this.typewriterTextRef.nativeElement) {
      this.typewriterTextRef.nativeElement.textContent = this.typedText;
    }

    let currentSpeed = this.typingSpeed;
    if (this.isDeleting) {
      currentSpeed = this.deletingSpeed;
    }

    if (!this.isDeleting && this.typedText === currentText) {
      currentSpeed = this.pauseBetweenTexts;
      this.isDeleting = true;
    } else if (this.isDeleting && this.typedText === '') {
      this.isDeleting = false;
      this.textArrayIndex = (this.textArrayIndex + 1) % this.textArray.length;
      currentSpeed = this.typingSpeed;
    }

    this.typingTimeout = setTimeout(this.handleTypeWriter, currentSpeed);
  }

  blinkCursor = () => {
    this.cursorBlinkInterval = setInterval(() => {
      if (this.typedCursorRef && this.typedCursorRef.nativeElement) {
        this.typedCursorRef.nativeElement.style.opacity =
          (this.typedCursorRef.nativeElement.style.opacity === '0' ? '1' : '0');
      }
    }, 500);
  }

  private getUserAgent(): string {
    return navigator.userAgent;
  }

  private async getIpAddress(): Promise<string> {
    try {
      const response: any = await firstValueFrom(this.http.get('https://api.ipify.org?format=json'));
      return response.ip;
    } catch (error) {
      console.error('Could not fetch IP address:', error);
      return 'unknown';
    }
  }

  async onSubmit(): Promise<void> {
    if (this.heroForm.valid) {
      this.isSubmitting = true;

      const ipAddress = await this.getIpAddress();

      const moveSizeForBackend = this.formData.moveSize.replace(/\s/g, '');
      const payload = {
        name: this.formData.name,
        phoneNumber: this.formData.phoneNumber,
        moveDetails: {
          desiredMoveOutDate: this.formData.desiredMoveOutDate,
          moveSize: moveSizeForBackend,
        },
        metadata: {
          // source: 'zeeroni_legacy_landing_page_v1',
          // formId: 'zeeroni_house_shifting_v1',
          // utmSource: 'google',
          // utmCampaign: 'house_shifting_india',
          userAgent: this.getUserAgent(),
          ipAddress: ipAddress,
        },
      };

      const apiUrl = `${environment.backendApiUrl}/marketing/leads`;

      this.http.post(apiUrl, payload).subscribe({
        next: (response) => {
          console.log('Form Submitted Successfully!', response);
          gtag_report_conversion(); // Call Google Ads conversion tracking
          this.formSubmittedSuccessfully = true;
          this.heroForm.resetForm();
          setTimeout(() => {
            this.formSubmittedSuccessfully = false;
          }, 5000);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Form Submission Error:', error);
          // Optionally, show an error message to the user
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      console.log('Form is invalid');
    }
  }
}
