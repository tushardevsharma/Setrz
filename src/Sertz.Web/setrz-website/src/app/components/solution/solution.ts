import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { CarouselDirective } from '../../shared/directives/carousel.directive';

@Component({
  selector: 'app-solution',
  standalone: true, // Mark as standalone
  imports: [CommonModule, CarouselDirective], // Add CommonModule to imports
  templateUrl: './solution.html',
  styleUrl: './solution.scss',
})
export class Solution implements OnInit, OnDestroy {
  // Removed duplicated carousel properties
  // currentIndex: number = 0;
  // previousIndex: number | null = null; // Track the previously active index
  // intervalId: any;
  // touchStartX: number = 0;
  // touchEndX: number = 0;
  // swipeThreshold: number = 50; // Minimum distance for a swipe to be registered

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
    // Initialize component and start auto-slide - Handled by directive
    // this.startAutoSlide();
  }

  ngOnDestroy(): void {
    // this.stopAutoSlide(); // Handled by directive
  }

  // Removed duplicated carousel methods
  // startAutoSlide(): void { ... }
  // stopAutoSlide(): void { ... }
  // nextSlide(): void { ... }
  // prevSlide(): void { ... }
  // isLeaving(index: number): boolean { ... }
  // goToSlide(index: number): void { ... }
  // onTouchStart(event: TouchEvent): void { ... }
  // onTouchMove(event: TouchEvent): void { ... }
  // onTouchEnd(event: TouchEvent): void { ... }
}
