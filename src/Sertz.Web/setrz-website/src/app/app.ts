import { Component } from '@angular/core';
import { Header } from './components/header/header';
import { Hero } from './components/hero/hero';
import { Problem } from './components/problem/problem';
import { Solution } from './components/solution/solution';
import { HowItWorks } from './components/how-it-works/how-it-works';
import { Services } from './components/services/services';
import { Guarantee } from './components/guarantee/guarantee';
import { LeadForm } from './components/lead-form/lead-form';
import { Footer } from './components/footer/footer';
import { ScrollAnimationDirective } from './directives/scroll-animation.directive';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    Header,
    Hero,
    Problem,
    Solution,
    HowItWorks,
    Services,
    Guarantee,
    LeadForm,
    Footer,
    ScrollAnimationDirective,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Zeeroni';
}
