import { Directive, Input, Output, EventEmitter, HostListener, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appCarousel]',
  standalone: true,
  exportAs: 'appCarousel'
})
export class CarouselDirective implements OnInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() slideInterval: number = 3500; // Default to 3.5 seconds

  @Output() slideChange = new EventEmitter<number>();

  currentIndex: number = 0;
  previousIndex: number | null = null;
  intervalId: any;
  touchStartX: number = 0;
  touchEndX: number = 0;
  swipeThreshold: number = 50; // Minimum distance for a swipe to be registered

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    if (!this.intervalId && this.items.length > 1) {
      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, this.slideInterval);
    }
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  nextSlide(): void {
    this.previousIndex = this.currentIndex;
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.slideChange.emit(this.currentIndex);
  }

  prevSlide(): void {
    this.previousIndex = this.currentIndex;
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.slideChange.emit(this.currentIndex);
  }

  goToSlide(index: number): void {
    if (index === this.currentIndex || index < 0 || index >= this.items.length) {
      return;
    }
    this.previousIndex = this.currentIndex;
    this.currentIndex = index;
    this.stopAutoSlide();
    this.startAutoSlide();
    this.slideChange.emit(this.currentIndex);
  }

  isLeaving(index: number): boolean {
    return index === this.previousIndex && index !== this.currentIndex;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.stopAutoSlide();
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    this.touchEndX = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (swipeDistance > this.swipeThreshold) {
      this.nextSlide();
    } else if (swipeDistance < -this.swipeThreshold) {
      this.prevSlide();
    }
    this.startAutoSlide();
  }
}
