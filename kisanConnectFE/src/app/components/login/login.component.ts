import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguagePopupComponent } from '../language-popup/language-popup.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild(LanguagePopupComponent) languagePopup!: LanguagePopupComponent;
  
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
              // Show language popup after successful login
              this.showLanguagePopup();
            },
            error: (error) => {
              console.error('Error fetching user info:', error);
              // Still show language popup even if user info fetch fails
              this.showLanguagePopup();
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

  private showLanguagePopup(): void {
    // Small delay to ensure the popup component is ready
    setTimeout(() => {
      if (this.languagePopup) {
        this.languagePopup.showPopup();
      }
    }, 100);
  }

  onLanguageSelected(languageCode: string): void {
    console.log('Language selected:', languageCode);
    // Navigate based on user role after language selection
    this.navigateBasedOnRole();
  }

  onPopupClosed(): void {
    console.log('Language popup closed');
    // Navigate based on user role if popup is closed without selection
    this.navigateBasedOnRole();
  }

  private navigateBasedOnRole(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      const role = user.role;
      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (role === 'farmer') {
        this.router.navigate(['/farmer']);
      } else if (role === 'buyer') {
        this.router.navigate(['/buyer']);
      }
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
} 