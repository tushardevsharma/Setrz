import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
  standalone: true,
  imports: [CommonModule] // Use CommonModule here
})
export class AboutUsComponent {
  cofounders = [
    {
      name: 'Suja Kunwar',
      title: 'Co-Founder',
      image: '../../suja.png',
      linkedin: 'https://www.linkedin.com/in/suja-kunwar-4569aa112'
    },
    {
      name: 'Tushar Dev Sharma',
      title: 'Co-Founder',
      image: '../../tushar.png', // Placeholder image
      linkedin: 'https://www.linkedin.com/in/tushardevsharma' // Placeholder LinkedIn
    }
  ];
}
