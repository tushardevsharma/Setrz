import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy, Output, EventEmitter } from '@angular/core';
 // Import CommonModule

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements OnInit, AfterViewInit, OnDestroy { // Implement OnDestroy
  @Output() getConsultation = new EventEmitter<void>();

  @ViewChild('typewriterText') typewriterTextRef!: ElementRef;
  @ViewChild('typedCursor') typedCursorRef!: ElementRef;

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
  private typingSpeed: number = 100; // Milliseconds per character
  private deletingSpeed: number = 50; // Milliseconds per character for deleting
  private pauseBetweenTexts: number = 1500; // Milliseconds pause after typing/deleting
  private isDeleting: boolean = false;
  private typingTimeout: any; // To store timeout for typing/deleting
  private cursorBlinkInterval: any; // To store interval for blinking

  constructor() {}

  ngOnInit() {
    // Initialization logic if any
  }

  ngAfterViewInit() {
    // Start typing animation after a short delay
    this.typingTimeout = setTimeout(() => {
      this.handleTypeWriter();
    }, 500);

    // Start blinking cursor
    this.blinkCursor();
  }

  ngOnDestroy() { // Clear timeouts and intervals to prevent memory leaks
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.cursorBlinkInterval) {
      clearInterval(this.cursorBlinkInterval);
    }
  }

  onGetConsultationClick(): void {
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
      currentSpeed = this.typingSpeed; // Pause before typing next text
    }

    this.typingTimeout = setTimeout(this.handleTypeWriter, currentSpeed);
  }

  blinkCursor = () => {
    this.cursorBlinkInterval = setInterval(() => {
      if (this.typedCursorRef && this.typedCursorRef.nativeElement) {
        this.typedCursorRef.nativeElement.style.opacity =
          (this.typedCursorRef.nativeElement.style.opacity === '0' ? '1' : '0');
      }
    }, 500); // Blink every 500ms
  }
}
