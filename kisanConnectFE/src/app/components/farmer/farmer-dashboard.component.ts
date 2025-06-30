import { Component, OnInit } from '@angular/core';
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

  newCrop = {
    name: '',
    type: '',
    price: '',
    quantity: '',
    village: '',
    contact: ''
  };

  editCrop = {
    name: '',
    type: '',
    price: '',
    quantity: '',
    village: '',
    contact: ''
  };

  constructor(
    private authService: AuthService,
    private cropService: CropService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isFarmer()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadData();
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
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Failed to load orders';
        this.isLoading = false;
      }
    });
  }

  addCrop(): void {
    if (this.newCrop.name && this.newCrop.type && this.newCrop.price && this.newCrop.quantity) {
      const cropData = {
        ...this.newCrop,
        price: Number(this.newCrop.price),
        quantity: Number(this.newCrop.quantity)
      };
      
      this.cropService.createCrop(cropData).subscribe({
        next: () => {
          this.loadData();
          this.showAddCropForm = false;
          this.resetNewCropForm();
        },
        error: (error: any) => {
          console.error('Error adding crop:', error);
          this.errorMessage = 'Failed to add crop';
        }
      });
    }
  }

  openEditCropForm(crop: any): void {
    this.editingCrop = crop;
    this.editCrop = {
      name: crop.name,
      type: crop.type,
      price: crop.price.toString(),
      quantity: crop.quantity.toString(),
      village: crop.village,
      contact: crop.contact
    };
    this.showEditCropForm = true;
  }

  updateCrop(): void {
    if (this.editCrop.name && this.editCrop.type && this.editCrop.price && this.editCrop.quantity && this.editingCrop) {
      const cropData = {
        ...this.editCrop,
        price: Number(this.editCrop.price),
        quantity: Number(this.editCrop.quantity)
      };
      
      this.cropService.updateCrop(this.editingCrop.id, cropData).subscribe({
        next: () => {
          this.loadData();
          this.showEditCropForm = false;
          this.editingCrop = null;
          this.resetEditCropForm();
        },
        error: (error: any) => {
          console.error('Error updating crop:', error);
          this.errorMessage = 'Failed to update crop';
        }
      });
    }
  }

  cancelEdit(): void {
    this.showEditCropForm = false;
    this.editingCrop = null;
    this.resetEditCropForm();
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

  resetNewCropForm(): void {
    this.newCrop = {
      name: '',
      type: '',
      price: '',
      quantity: '',
      village: '',
      contact: ''
    };
  }

  resetEditCropForm(): void {
    this.editCrop = {
      name: '',
      type: '',
      price: '',
      quantity: '',
      village: '',
      contact: ''
    };
  }
} 