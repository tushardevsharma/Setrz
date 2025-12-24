import { Component, ElementRef, inject } from '@angular/core';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [],
  templateUrl: './lead-form.html',
  styleUrl: './lead-form.scss'
})
export class LeadForm {
  private elementRef = inject(ElementRef);

  public scrollIntoView(): void {
    this.elementRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }
}
