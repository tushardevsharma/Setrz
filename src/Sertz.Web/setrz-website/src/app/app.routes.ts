import { Routes } from '@angular/router';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { HomeComponent } from './components/home/home.component'
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { PartnerComponent } from './partner/partner.component';

export const routes: Routes = [
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' } // Wildcard route for any unmatched paths
];
