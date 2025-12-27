import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-partner-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './partner-auth.component.html',
  styleUrl: './partner-auth.component.scss',
})
export class PartnerAuthComponent {
  @Output() loggedIn = new EventEmitter<void>();
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    console.log('PartnerAuthComponent: Initialized login form.');
  }

  async onSubmit() {
    this.errorMessage = null;
    this.isLoading = true;
    console.log('PartnerAuthComponent: onSubmit called. Form valid:', this.loginForm.valid);

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const result = await this.authService.login({ email, password });

      if (result.success) {
        console.log('PartnerAuthComponent: Login successful, emitting loggedIn.');
        this.loggedIn.emit();
      } else {
        this.errorMessage = result.error;
        console.error('PartnerAuthComponent: Login failed with error:', result.error);
      }
    } else {
      this.errorMessage = 'Please enter valid email and password.';
      console.error('PartnerAuthComponent: Form is invalid.');
    }
    this.isLoading = false;
  }
}
