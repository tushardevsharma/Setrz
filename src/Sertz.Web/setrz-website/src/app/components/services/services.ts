import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ViewChildren, QueryList, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.html',
  styleUrl: './services.scss',
})
export class Services implements OnInit, OnDestroy, AfterViewInit { // Implement AfterViewInit
  @ViewChild('carouselContainer') carouselContainer!: ElementRef;
  @ViewChildren('carouselCard') carouselCards!: QueryList<ElementRef>;

  currentIndex: number = 0;
  previousIndex: number | null = null;
  intervalId: any;

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
    this.startAutoSlide();
  }

  ngAfterViewInit(): void { // Implement AfterViewInit
    // Adjust height after view is initialized and cards are rendered
    this.adjustCarouselHeight();
    // Re-adjust height if cards change (e.g., dynamic content)
    this.carouselCards.changes.subscribe(() => this.adjustCarouselHeight());
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.adjustCarouselHeight();
  }

  startAutoSlide(): void {
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.nextSlide();
      }, 3500);
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
    this.currentIndex = (this.currentIndex + 1) % this.services.length;
    this.adjustCarouselHeight(); // Adjust height after slide change
  }

  prevSlide(): void {
    this.previousIndex = this.currentIndex;
    this.currentIndex = (this.currentIndex - 1 + this.services.length) % this.services.length;
    this.adjustCarouselHeight(); // Adjust height after slide change
  }

  goToSlide(index: number): void {
    if (index === this.currentIndex) {
      return;
    }
    this.previousIndex = this.currentIndex;
    this.currentIndex = index;
    this.stopAutoSlide();
    this.startAutoSlide();
    this.adjustCarouselHeight(); // Adjust height after slide change
  }

  isLeaving(index: number): boolean {
    return index === this.previousIndex && index !== this.currentIndex;
  }

  private adjustCarouselHeight(): void {
    // Only adjust height on mobile (or smaller screens)
    if (window.innerWidth < 768 && this.carouselContainer && this.carouselCards) {
      const activeCardElement = this.carouselCards.toArray()[this.currentIndex]?.nativeElement;
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