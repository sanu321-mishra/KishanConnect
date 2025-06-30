import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CropService } from '../../services/crop.service';
import { OrderService, Order } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buyer-marketplace',
  templateUrl: './buyer-marketplace.component.html',
  styleUrls: ['./buyer-marketplace.component.css']
})
export class BuyerMarketplaceComponent implements OnInit {
  crops: any[] = [];
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  showOrderForm = false;
  selectedCrop: any = null;

  newOrder = {
    quantity: 1
  };

  constructor(
    private authService: AuthService,
    private cropService: CropService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isBuyer()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load available crops
    this.cropService.getCrops().subscribe({
      next: (crops) => {
        this.crops = crops;
      },
      error: (error) => {
        console.error('Error loading crops:', error);
        this.errorMessage = 'Failed to load crops';
      }
    });

    // Load buyer's orders
    this.orderService.getBuyerOrders().subscribe({
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

  placeOrder(): void {
    if (this.selectedCrop && this.newOrder.quantity > 0) {
      const orderData = {
        crop_id: this.selectedCrop.id,
        quantity: this.newOrder.quantity
      };

      this.orderService.placeOrder(orderData).subscribe({
        next: () => {
          this.loadData();
          this.showOrderForm = false;
          this.selectedCrop = null;
          this.newOrder.quantity = 1;
          this.errorMessage = ''; // Clear any previous errors
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.errorMessage = error.error?.error || 'Failed to place order';
        }
      });
    }
  }

  openOrderForm(crop: any): void {
    this.selectedCrop = crop;
    this.showOrderForm = true;
    this.newOrder.quantity = 1;
  }

  calculateTotalPrice(): number {
    if (this.selectedCrop && this.newOrder.quantity) {
      return this.selectedCrop.price * this.newOrder.quantity;
    }
    return 0;
  }

  deleteOrder(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(orderId).subscribe({
        next: () => {
          this.loadData();
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error deleting order:', error);
          this.errorMessage = error.error?.error || 'Failed to delete order';
        }
      });
    }
  }
} 