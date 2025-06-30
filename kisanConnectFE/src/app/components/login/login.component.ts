import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading = false;
          // Fetch user information after successful login
          this.authService.getCurrentUser().subscribe({
            next: (userResponse) => {
              console.log('User logged in:', userResponse.user);
              // Redirect based on user role
              const role = userResponse.user.role;
              if (role === 'admin') {
                this.router.navigate(['/admin']);
              } else if (role === 'farmer') {
                this.router.navigate(['/farmer']);
              } else if (role === 'buyer') {
                this.router.navigate(['/buyer']);
              } else {
                // Default fallback
                this.router.navigate(['/crops']);
              }
            },
            error: (error) => {
              console.error('Error fetching user info:', error);
              this.router.navigate(['/crops']);
            }
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Login failed. Please try again.';
        }
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
} 