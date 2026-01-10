import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root-redirect',
  standalone: true,
  imports: [CommonModule],
  template: '', // No HTML needed as it just redirects
  styles: [] // No styles needed
})
export class RootRedirectComponent implements OnInit {

  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    // Get all query parameters from the current route
    const queryParams = this.activatedRoute.snapshot.queryParams;

    // Navigate to /home, preserving all query parameters
    this.router.navigate(['/home'], {
      queryParams: queryParams,
      queryParamsHandling: 'merge' // Merge with any existing query params on /home
    });
  }
}
