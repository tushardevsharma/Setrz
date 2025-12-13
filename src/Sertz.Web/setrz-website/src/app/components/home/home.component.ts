import { Component, OnInit } from '@angular/core';
import { Hero } from '../hero/hero';
import { Problem } from '../problem/problem';
import { Solution } from '../solution/solution';
import { HowItWorks } from '../how-it-works/how-it-works';
import { Services } from '../services/services';
import { Guarantee } from '../guarantee/guarantee';
import { LeadForm } from '../lead-form/lead-form';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';
import { TechJourney } from '../tech-journey/tech-journey';
import { ViewportScroller } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

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
export class HomeComponent implements OnInit {
  private fragmentSubscription: Subscription | undefined;

  constructor(private scroller: ViewportScroller, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.fragmentSubscription = this.route.fragment.subscribe(fragment => {
      if (fragment) {
        // Use a timeout to ensure the element is rendered before attempting to scroll
        setTimeout(() => {
          this.scroller.scrollToAnchor(fragment);
        }, 100); // Small delay
      }
    });
  }

  ngOnDestroy(): void {
    if (this.fragmentSubscription) {
      this.fragmentSubscription.unsubscribe();
    }
  }
}
