import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ViewChildren, QueryList, AfterViewInit, HostListener } from '@angular/core';
import { CarouselDirective } from '../../shared/directives/carousel.directive';


@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CarouselDirective],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements OnInit, OnDestroy, AfterViewInit { // Implement AfterViewInit
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  @ViewChildren('carouselCard') carouselCards!: QueryList<ElementRef>;
  @ViewChild(CarouselDirective) carouselDirective!: CarouselDirective;

  // Removed duplicated carousel properties
  // currentIndex: number = 0;
  // previousIndex: number | null = null;
  // intervalId: any;
  // touchStartX: number = 0;
  // touchEndX: number = 0;
  // swipeThreshold: number = 50; // Minimum distance for a swipe to be registered

  services = [
    {
      image: 'https://images.unsplash.com/photo-1624137308591-43f03e6d64c3?q=80&w=800&auto=format&fit=crop',
      title: 'Expert Packing & Moving',
      description: 'From fragile items to bulky furniture, we pack and transport everything with the utmost care.'
    },
    {
      image: 'https://images.unsplash.com/photo-1487015307662-6ce6210680f1?q=80&w=800&auto=format&fit=crop',
      title: 'Furniture Assembly',
      description: 'Beds, tables, shelves - we assemble all your furniture so you don\'t have to lift a finger.'
    },
    {
      image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop',
      title: 'Appliance Installation',
      description: 'We\'ll install your TV, washing machine, fridge, and other appliances so they\'re ready to use.'
    },
    {
      image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=800&auto=format&fit=crop',
      title: 'Kitchen Setup',
      description: 'We\'ll unpack and organize your kitchen, so you can cook your first meal without the hassle.'
    },
    {
      image: 'https://images.unsplash.com/photo-1687953413905-731f620177ae?q=80&w=800&auto=format&fit=fill',
      title: 'Wardrobe Organization',
      description: 'Your clothes are unpacked and arranged in your closets, making you feel right at home.'
    },
    {
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
      title: 'The Final Touches',
      description: 'We can help with small decor, hanging pictures, and making the space truly yours.'
    }
  ];

  ngOnInit(): void {
    // this.startAutoSlide(); // Handled by directive
  }

  ngAfterViewInit(): void { // Implement AfterViewInit
    // Adjust height after view is initialized and cards are rendered
    this.adjustCarouselHeight();
    // Re-adjust height if cards change (e.g., dynamic content)
    this.carouselCards.changes.subscribe(() => this.adjustCarouselHeight());
    // Subscribe to slide changes from the directive to adjust height
    this.carouselDirective.slideChange.subscribe((event) => this.adjustCarouselHeight());
  }

  ngOnDestroy(): void {
    // this.stopAutoSlide(); // Handled by directive
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.adjustCarouselHeight();
  }

  // Removed duplicated carousel methods
  // startAutoSlide(): void { ... }
  // stopAutoSlide(): void { ... }
  // nextSlide(): void { ... }
  // prevSlide(): void { ... }
  // goToSlide(index: number): void { ... }
  // isLeaving(index: number): boolean { ... }
  // onTouchStart(event: TouchEvent): void { ... }
  // onTouchMove(event: TouchEvent): void { ... }
  // onTouchEnd(event: TouchEvent): void { ... }

  public adjustCarouselHeight(): void {
    // Only adjust height on mobile (or smaller screens)
    if (window.innerWidth < 768 && this.carouselContainer && this.carouselCards && this.carouselDirective) {
      const activeCardElement = this.carouselCards.toArray()[this.carouselDirective.currentIndex]?.nativeElement;
      if (activeCardElement) {
        // Set height of container to active card's scrollHeight to ensure all content is visible
        this.carouselContainer.nativeElement.style.height = `${activeCardElement.scrollHeight}px`;
      }
    } else if (this.carouselContainer) {
      // Reset to fixed height for desktop
      this.carouselContainer.nativeElement.style.height = '500px';
    }
  }
}
