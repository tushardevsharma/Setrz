import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Import Router
import { ViewportScroller } from '@angular/common'; // Import ViewportScroller
declare var bootstrap: any; // Declare bootstrap to avoid TypeScript errors

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  isScrolled = false;
  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;

  constructor(private router: Router, private scroller: ViewportScroller) {} // Inject Router and ViewportScroller

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  navigateTo(path: string, fragment?: string) {
    this.router.navigate([path], { fragment: fragment }).then(() => {
      if (fragment) {
        // Use a timeout to ensure the element is rendered before attempting to scroll
        setTimeout(() => {
          this.scroller.scrollToAnchor(fragment);
        }, 100); // Small delay
      }
      this.closeNavbar(); // Close navbar after navigation
    });
  }

  closeNavbar() {
    if (this.navbarCollapse && this.navbarCollapse.nativeElement.classList.contains('show')) {
      const bsCollapse = new bootstrap.Collapse(this.navbarCollapse.nativeElement, {
        toggle: false
      });
      bsCollapse.hide();
    }
  }
}
