import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CropService } from '../services/crop.service';
import { AuthService } from '../services/auth.service';
import { Crop } from '../models/crop.model';

@Component({
  selector: 'app-crop-list',
  templateUrl: './crop-list.component.html',
  styleUrls: ['./crop-list.component.css']
})
export class CropListComponent implements OnInit {
  crops: Crop[] = [];
  cropForm: FormGroup;
  showForm = false;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private cropService: CropService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.cropForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['Crop', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      village: ['', [Validators.required, Validators.minLength(2)]],
      contact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
    });
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCrops();
  }

  loadCrops() {
    this.cropService.getCrops().subscribe({
      next: (data) => this.crops = data,
      error: (err) => {
        console.error('Error fetching crops:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cropForm.reset({ type: 'Crop' });
      this.errorMessage = '';
    }
  }

  onSubmit() {
    if (this.cropForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      const cropData: Crop = this.cropForm.value;
      
      this.cropService.createCrop(cropData).subscribe({
        next: (response) => {
          console.log('Crop created successfully:', response);
          this.crops.unshift(response); // Add to beginning of list
          this.cropForm.reset({ type: 'Crop' });
          this.showForm = false;
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating crop:', error);
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'Error creating crop. Please try again.';
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.cropForm.controls).forEach(key => {
      const control = this.cropForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.cropForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['min']) {
        return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors['min'].min}`;
      }
      if (control.errors['pattern']) {
        return 'Please enter a valid 10-digit phone number';
      }
    }
    return '';
  }
}