import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
  standalone: true,
  imports: [NgFor]
})
export class AboutUsComponent {
  cofounders = [
    {
      name: 'Suja Kunwar',
      title: 'Co-Founder',
      image: '../../LogoLarge.png', // Placeholder image
      linkedin: 'https://www.linkedin.com/in/sujakunwar' // Placeholder LinkedIn
    },
    {
      name: 'Tushar Dev Sharma',
      title: 'Co-Founder',
      image: '../../LogoLarge.png', // Placeholder image
      linkedin: 'https://www.linkedin.com/in/tushardevsharma' // Placeholder LinkedIn
    }
  ];
}
