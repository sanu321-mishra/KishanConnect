import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  sessionTimeoutMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // If user is already logged in and navigates to /login, log them out
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
    }
    // Check for session timeout message in URL parameters
    this.route.queryParams.subscribe(params => {
      if (params['message'] === 'session_timeout') {
        this.sessionTimeoutMessage = 'Your session has timed out. Please log in again.';
      } else if (params['message'] === 'login_required') {
        this.sessionTimeoutMessage = 'Please log in to access this page.';
      }
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
              }
            },
            error: (error) => {
              console.error('Error fetching user info:', error);
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