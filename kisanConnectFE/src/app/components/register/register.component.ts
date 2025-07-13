import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MyDialogComponent } from '../dialog/my-dialog.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['farmer', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // If user is already logged in and navigates to /register, log them out
    if (this.authService.isLoggedIn()) {
      this.authService.logout();
    }
  }

  openInfoDialog(): void {
    this.dialog.open(MyDialogComponent, {
      width: '500px',
      data: {
        title: 'About KisanConnect',
        content: `KisanConnect is a platform that allows farmers to manage their crops and livestock. This platform connects farmers and buyers, allowing farmers to list their crops and buyers to purchase directly.<br><br>
        <strong>Key Features:</strong>
        <ul>
          <li>Easy registration for farmers and buyers</li>
          <li>Direct crop listing and purchasing</li>
          <li>Secure and transparent transactions</li>
          <li>Role-based dashboards</li>
          <li>Comprehensive crop and livestock management</li>
          <li>Real-time market updates and pricing</li>
          <li>Secure payment processing</li>
          <li>Mobile-friendly interface</li>
        </ul>
        <br>
        <strong>For Farmers:</strong>
        <ul>
          <li>List and manage your crops and livestock</li>
          <li>Set competitive prices</li>
          <li>Connect directly with buyers</li>
          <li>Track your sales and inventory</li>
        </ul>
        <br>
        <strong>For Buyers:</strong>
        <ul>
          <li>Browse available crops and livestock</li>
          <li>Compare prices from different farmers</li>
          <li>Make secure purchases</li>
          <li>Build relationships with trusted farmers</li>
        </ul>
        <br>
        <div class='text-center'><em>Join KisanConnect today and revolutionize your agricultural business!</em></div>`
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const { confirmPassword, ...userData } = this.registerForm.value;

      this.authService.register(userData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! Please login.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.error || 'Registration failed. Please try again.';
        }
      });
    }
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get role() {
    return this.registerForm.get('role');
  }
} 