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

  newCrop = {
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

  updateOrderStatus(orderId: number, status: string): void {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.loadData(); // Reload data
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.errorMessage = 'Failed to update order status';
      }
    });
  }

  deleteCrop(cropId: number): void {
    if (confirm('Are you sure you want to delete this crop?')) {
      this.cropService.deleteCrop(cropId).subscribe({
        next: () => {
          this.loadData(); // Reload data
        },
        error: (error) => {
          console.error('Error deleting crop:', error);
          this.errorMessage = 'Failed to delete crop';
        }
      });
    }
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
} 