import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './lead-form.html',
  styleUrl: './lead-form.scss'
})
export class LeadForm {
  private fb = inject(FormBuilder);
  leadForm: FormGroup;

  constructor() {
    this.leadForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      movingDate: [''],
      message: ['']
    });
  }

  onSubmit() {
    if (this.leadForm.valid) {
      console.log('Form Submitted!', this.leadForm.value);
      // Here you would typically send the data to a server
      alert('Thank you for your submission! We will be in touch shortly.');
      this.leadForm.reset();
    }
  }
}
