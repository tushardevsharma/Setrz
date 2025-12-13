import { Component } from '@angular/core';
import { Hero } from '../hero/hero';
import { Problem } from '../problem/problem';
import { Solution } from '../solution/solution';
import { HowItWorks } from '../how-it-works/how-it-works';
import { Services } from '../services/services';
import { Guarantee } from '../guarantee/guarantee';
import { LeadForm } from '../lead-form/lead-form';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';
import { TechJourney } from '../tech-journey/tech-journey';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Hero,
    Problem,
    Solution,
    HowItWorks,
    Services,
    Guarantee,
    LeadForm,
    ScrollAnimationDirective,
    TechJourney,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  // Any logic specific to the home page can go here
}
