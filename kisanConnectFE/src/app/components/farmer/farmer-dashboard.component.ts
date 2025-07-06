import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CropService } from '../../services/crop.service';
import { OrderService, Order } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-farmer-dashboard',
  templateUrl: './farmer-dashboard.component.html',
  styleUrls: ['./farmer-dashboard.component.css']
})
export class FarmerDashboardComponent implements OnInit {
  crops: any[] = [];
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  showAddCropForm = false;
  showEditCropForm = false;
  editingCrop: any = null;

  // Pagination properties for orders
  currentOrdersPage = 0;
  ordersCardsPerPage = 3; // Default for desktop
  totalOrdersPages = 0;
  isMobile = false;

  // Reactive Forms
  addCropForm!: FormGroup;
  editCropForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private cropService: CropService,
    private orderService: OrderService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.addCropForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      village: ['', [Validators.required, Validators.minLength(2)]],
      contact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      health_status: ['', Validators.required],
      harvest_date: ['', Validators.required]
    });

    this.editCropForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(1)]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      village: ['', [Validators.required, Validators.minLength(2)]],
      contact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      health_status: ['', Validators.required],
      harvest_date: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isFarmer()) {
      this.router.navigate(['/login']);
      return;
    }
    this.checkScreenSize();
    this.loadData();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    this.ordersCardsPerPage = this.isMobile ? 1 : 3;
    this.calculateTotalOrdersPages();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load farmer's crops
    this.cropService.getCrops().subscribe({
      next: (crops) => {
        this.crops = crops;
      },
      error: (error) => {
        console.error('Error loading crops:', error);
        this.errorMessage = 'Failed to load crops';
      }
    });

    // Load orders for farmer's crops
    this.orderService.getFarmerOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.calculateTotalOrdersPages();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Failed to load orders';
        this.isLoading = false;
      }
    });
  }

  // Orders pagination methods
  calculateTotalOrdersPages(): void {
    this.totalOrdersPages = Math.ceil(this.orders.length / this.ordersCardsPerPage);
    // Reset to first page if current page is out of bounds
    if (this.currentOrdersPage >= this.totalOrdersPages && this.totalOrdersPages > 0) {
      this.currentOrdersPage = 0;
    }
  }

  getVisibleOrders(): Order[] {
    const startIndex = this.currentOrdersPage * this.ordersCardsPerPage;
    const endIndex = startIndex + this.ordersCardsPerPage;
    return this.orders.slice(startIndex, endIndex);
  }

  previousOrdersPage(): void {
    if (this.currentOrdersPage > 0) {
      this.currentOrdersPage--;
    }
  }

  nextOrdersPage(): void {
    if (this.currentOrdersPage < this.totalOrdersPages - 1) {
      this.currentOrdersPage++;
    }
  }

  isFirstOrdersPage(): boolean {
    return this.currentOrdersPage === 0;
  }

  isLastOrdersPage(): boolean {
    return this.currentOrdersPage === this.totalOrdersPages - 1;
  }

  addCrop(): void {
    if (this.addCropForm.valid) {
      const cropData = {
        ...this.addCropForm.value,
        price: Number(this.addCropForm.value.price),
        quantity: Number(this.addCropForm.value.quantity)
      };
      
      this.cropService.createCrop(cropData).subscribe({
        next: () => {
          this.loadData();
          this.showAddCropForm = false;
          this.addCropForm.reset();
        },
        error: (error: any) => {
          console.error('Error adding crop:', error);
          this.errorMessage = 'Failed to add crop';
        }
      });
    } else {
      this.markFormGroupTouched(this.addCropForm);
    }
  }

  openEditCropForm(crop: any): void {
    this.editingCrop = crop;
    this.editCropForm.patchValue({
      name: crop.name,
      type: crop.type,
      price: crop.price.toString(),
      quantity: crop.quantity.toString(),
      village: crop.village,
      contact: crop.contact,
      health_status: crop.health_status,
      harvest_date: crop.harvest_date
    });
    this.showEditCropForm = true;
  }

  updateCrop(): void {
    if (this.editCropForm.valid && this.editingCrop) {
      const cropData = {
        ...this.editCropForm.value,
        price: Number(this.editCropForm.value.price),
        quantity: Number(this.editCropForm.value.quantity)
      };
      
      this.cropService.updateCrop(this.editingCrop.id, cropData).subscribe({
        next: () => {
          this.loadData();
          this.showEditCropForm = false;
          this.editingCrop = null;
          this.editCropForm.reset();
        },
        error: (error: any) => {
          console.error('Error updating crop:', error);
          this.errorMessage = 'Failed to update crop';
        }
      });
    } else {
      this.markFormGroupTouched(this.editCropForm);
    }
  }

  cancelEdit(): void {
    this.showEditCropForm = false;
    this.editingCrop = null;
    this.editCropForm.reset();
  }

  updateOrderStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.loadData(); // Reload data
        this.errorMessage = ''; // Clear any previous errors
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.errorMessage = error.error?.error || 'Failed to update order status';
      }
    });
  }

  // Helper method to mark all form controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods to check form control validity
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['min']) return `${fieldName} must be at least ${field.errors['min'].min}`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }

  navigateToSales(): void {
    this.router.navigate(['/farmer/sales']);
  }
} 