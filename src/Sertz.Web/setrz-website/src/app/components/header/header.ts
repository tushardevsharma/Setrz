import { Component, HostListener, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common'; // Import CommonModule
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Subscription, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../partner/services/auth.service'; // Import AuthService

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink, CommonModule], // Add CommonModule here
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit, OnDestroy {
  isScrolled = false;
  isHomePage = true;
  showLogoutButton = false; // New property for logout button visibility
  private routerSubscription!: Subscription;
  private authSubscription!: Subscription;

  @ViewChild('navbarCollapse') navbarCollapse!: ElementRef;

  constructor(
    private router: Router,
    private scroller: ViewportScroller,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService // Inject AuthService
  ) {}

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
      this.updateLogoutButtonVisibility(event.urlAfterRedirects);
    });

    // Also subscribe to auth state changes
    this.authSubscription = combineLatest([
      this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)),
      this.authService.isAuthenticated$
    ]).subscribe(([routerEvent, isAuthenticated]) => {
      this.updateLogoutButtonVisibility(routerEvent.urlAfterRedirects, isAuthenticated);
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateLogoutButtonVisibility(currentUrl: string, isAuthenticated: boolean = this.authService.getToken() !== null) {
    this.showLogoutButton = currentUrl.includes('/partner') && isAuthenticated;
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/partner']); // Redirect to partner login page after logout
    this.closeNavbar();
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
