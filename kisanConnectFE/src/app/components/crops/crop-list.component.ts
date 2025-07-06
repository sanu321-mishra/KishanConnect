import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CropService } from '../../services/crop.service';
import { AuthService } from '../../services/auth.service';
import { Crop } from '../../models/crop.model';

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
  successMessage = '';
  editingCrop: Crop | null = null;

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
      contact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      health_status: [''],
      harvest_date: ['']
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
      next: (data) => {
        this.crops = data;
        console.log('Loaded crops:', data);
      },
      error: (err) => {
        console.error('Error fetching crops:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Failed to load crops. Please try again.';
        }
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.cropForm.reset({ type: 'Crop' });
      this.editingCrop = null;
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  editCrop(crop: Crop) {
    this.editingCrop = crop;
    this.cropForm.patchValue({
      name: crop.name,
      type: crop.type,
      price: crop.price,
      quantity: crop.quantity,
      village: crop.village,
      contact: crop.contact,
      health_status: crop.health_status,
      harvest_date: crop.harvest_date
    });
    this.showForm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  deleteCrop(cropId: number) {
    if (confirm('Are you sure you want to delete this crop?')) {
      this.cropService.deleteCrop(cropId).subscribe({
        next: (response) => {
          this.successMessage = response.message;
          this.crops = this.crops.filter(crop => crop.id !== cropId);
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          console.error('Error deleting crop:', error);
          this.errorMessage = error.error?.error || 'Failed to delete crop. Please try again.';
        }
      });
    }
  }

  onSubmit() {
    if (this.cropForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      this.successMessage = '';
      const cropData: Crop = this.cropForm.value;
      
      if (this.editingCrop) {
        // Update existing crop
        this.cropService.updateCrop(this.editingCrop.id!, cropData).subscribe({
          next: (response) => {
            console.log('Crop updated successfully:', response);
            const index = this.crops.findIndex(crop => crop.id === this.editingCrop!.id);
            if (index !== -1) {
              this.crops[index] = { ...this.crops[index], ...cropData };
            }
            this.cropForm.reset({ type: 'Crop' });
            this.showForm = false;
            this.editingCrop = null;
            this.isSubmitting = false;
            this.successMessage = response.message;
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          error: (error) => {
            console.error('Error updating crop:', error);
            this.isSubmitting = false;
            this.errorMessage = error.error?.error || 'Failed to update crop. Please try again.';
          }
        });
      } else {
        // Create new crop
        this.cropService.createCrop(cropData).subscribe({
          next: (response) => {
            console.log('Crop created successfully:', response);
            this.crops.unshift(response.crop); // Add to beginning of list
            this.cropForm.reset({ type: 'Crop' });
            this.showForm = false;
            this.isSubmitting = false;
            this.successMessage = response.message;
            setTimeout(() => {
              this.successMessage = '';
            }, 3000);
          },
          error: (error) => {
            console.error('Error creating crop:', error);
            this.isSubmitting = false;
            this.errorMessage = error.error?.error || 'Failed to create crop. Please try again.';
          }
        });
      }
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}