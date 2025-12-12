import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf

@Component({
  selector: 'app-solution',
  standalone: true, // Mark as standalone
  imports: [CommonModule], // Add CommonModule to imports
  templateUrl: './solution.html',
  styleUrl: './solution.scss',
})
export class Solution implements OnInit, OnDestroy {
  currentIndex: number = 0;
  previousIndex: number | null = null; // Track the previously active index
  intervalId: any;
  touchStartX: number = 0;
  touchEndX: number = 0;
  swipeThreshold: number = 50; // Minimum distance for a swipe to be registered

  features = [
    {
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=auto',
      icon: 'bi bi-headset me-2 text-secondary',
      title: 'One Point of Contact',
      description: 'We coordinate everything, so you don\'t have to. Your dedicated move consultant is with you every step of the way.'
    },
    {
      image: 'https://images.unsplash.com/photo-1552581234-26160f608093?q=80&w=1200&auto=format&fit=crop',
      icon: 'bi bi-people-fill me-2 text-secondary',
      title: 'Vetted, Professional Crew',
      description: 'Our partners are an extension of our team, trained to our high standards of care and professionalism.',
      imageRight: true // Set to true for this card
    },
    {
      image: 'https://images.unsplash.com/photo-1564669722947-c89159202d19?q=80&w=1200&auto=format&fit=crop',
      icon: 'bi bi-cash-stack me-2 text-secondary',
      title: 'Transparent Pricing',
      description: 'The price we quote is the price you pay. No surprises, no hidden fees. Ever.'
    }
  ];

  ngOnInit(): void {
    // Initialize component and start auto-slide
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    if (!this.intervalId) { // Removed isScrollingManually check
      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, 3500); // Change slide every 5 seconds
    }
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  nextSlide(): void {
    this.previousIndex = this.currentIndex; // Store current as previous
    this.currentIndex = (this.currentIndex + 1) % this.features.length;
    this.stopAutoSlide(); // Stop auto-sliding when user interacts
    this.startAutoSlide(); // Restart auto-sliding after a delay
  }

  prevSlide(): void {
    this.previousIndex = this.currentIndex; // Store current as previous
    this.currentIndex = (this.currentIndex - 1 + this.features.length) % this.features.length;
    this.stopAutoSlide(); // Stop auto-sliding when user interacts
    this.startAutoSlide(); // Restart auto-sliding after a delay
  }

  isLeaving(index: number): boolean {
    // A card is "leaving" if it was the previousIndex and is not the currentIndex
    return index === this.previousIndex && index !== this.currentIndex;
  }

  goToSlide(index: number): void {
    if (index === this.currentIndex) {
      return; // Do nothing if clicking on the current slide
    }
    this.previousIndex = this.currentIndex;
    this.currentIndex = index;
    this.stopAutoSlide(); // Stop auto-sliding when user interacts
    this.startAutoSlide(); // Restart auto-sliding after a delay
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.stopAutoSlide(); // Stop auto-slide on touch interaction
  }

  onTouchMove(event: TouchEvent): void {
    // Prevent default scroll behavior only if a horizontal swipe is likely
    // This can be tricky and might interfere with vertical scrolling.
    // For now, let's just record the touchEndX.
    this.touchEndX = event.touches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const swipeDistance = this.touchStartX - this.touchEndX;

    if (swipeDistance > this.swipeThreshold) {
      // Swiped left
      this.nextSlide();
    } else if (swipeDistance < -this.swipeThreshold) {
      // Swiped right
      this.prevSlide();
    }
    this.startAutoSlide(); // Restart auto-slide after swipe
  }
}
