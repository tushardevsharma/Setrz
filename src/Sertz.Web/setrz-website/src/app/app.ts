import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { CommonModule } from '@angular/common'; // Keep CommonModule for other potential uses

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Footer,
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Zeeroni';
}
