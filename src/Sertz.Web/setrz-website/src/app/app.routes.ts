import { Routes } from '@angular/router';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { HomeComponent } from './components/home/home.component'
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy.component';
import { PartnerComponent } from './partner/partner.component';
import { RootRedirectComponent } from './components/root-redirect/root-redirect.component'; // Import the new component

export const routes: Routes = [
  { path: 'about-us', component: AboutUsComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: '', component: RootRedirectComponent }, // Point root to the new component
  { path: '**', redirectTo: '/home' } // Wildcard route for any unmatched paths
];
