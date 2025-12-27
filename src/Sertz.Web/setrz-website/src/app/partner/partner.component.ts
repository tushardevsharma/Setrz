import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerAuthComponent } from './partner-auth/partner-auth.component';
import { PartnerDashboardComponent } from './partner-dashboard/partner-dashboard.component';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-partner',
  standalone: true,
  imports: [CommonModule, PartnerAuthComponent, PartnerDashboardComponent, AsyncPipe],
  templateUrl: './partner.component.html',
  styleUrl: './partner.component.scss',
})
export class PartnerComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;

  constructor(private authService: AuthService) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.isAuthenticated$.subscribe(isAuth => {
      console.log('PartnerComponent: isAuthenticated$ changed to:', isAuth);
    });
  }

  ngOnInit(): void {
    console.log('PartnerComponent: ngOnInit called.');
  }
}
