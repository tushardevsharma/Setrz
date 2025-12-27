import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service'; // Import NotificationService

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
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService // Inject NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    console.log('PartnerAuthComponent: Initialized login form.');
  }

  async onSubmit() {
    this.isLoading = true;
    console.log('PartnerAuthComponent: onSubmit called. Form valid:', this.loginForm.valid);

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      const result = await this.authService.login({ email, password });

      if (result.success) {
        console.log('PartnerAuthComponent: Login successful, emitting loggedIn.');
        this.notificationService.showSuccess('Login successful!');
        this.loggedIn.emit();
      } else {
        this.notificationService.showError(result.error || 'Login failed. Please check your credentials.');
        console.error('PartnerAuthComponent: Login failed with error:', result.error);
      }
    } else {
      this.notificationService.showError('Please enter valid email and password.');
      console.error('PartnerAuthComponent: Form is invalid.');
    }
    this.isLoading = false;
  }
}
