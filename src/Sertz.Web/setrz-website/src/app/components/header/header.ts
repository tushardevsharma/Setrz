import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Import Router
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

  constructor(private router: Router) {} // Inject Router

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  navigateTo(path: string, fragment?: string) {
    this.router.navigate([path], { fragment: fragment }).then(() => {
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
