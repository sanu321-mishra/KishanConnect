import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CropService } from '../../services/crop.service';
import { OrderService, Order } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  crops: any[] = [];
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private cropService: CropService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load crops
    this.cropService.getCrops().subscribe({
      next: (crops) => {
        this.crops = crops;
      },
      error: (error) => {
        console.error('Error loading crops:', error);
        this.errorMessage = 'Failed to load crops';
      }
    });

    // Load orders
    this.orderService.getAdminOrders().subscribe({
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
} 