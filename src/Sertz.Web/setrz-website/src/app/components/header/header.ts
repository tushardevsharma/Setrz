import { Component, HostListener, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  isScrolled = false;
  isHomePage = true; // New property to track if it's the home page
  private routerSubscription!: Subscription;

  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;

  constructor(private router: Router, private scroller: ViewportScroller, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isHomePage = (event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/home');
      // If not on home page, ensure header text is dark regardless of scroll
      if (!this.isHomePage) {
        this.isScrolled = true; // Force scrolled state for dark text
      } else {
        // Reset for home page, will be controlled by scroll listener
        this.isScrolled = window.scrollY > 50;
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.isHomePage) { // Only apply scroll effect on home page
      this.isScrolled = window.scrollY > 50;
    }
  }

  navigateTo(path: string, fragment?: string) {
    this.router.navigate([path], { fragment: fragment }).then(() => {
      if (fragment) {
        setTimeout(() => {
          this.scroller.scrollToAnchor(fragment);
        }, 100);
      }
      this.closeNavbar();
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
