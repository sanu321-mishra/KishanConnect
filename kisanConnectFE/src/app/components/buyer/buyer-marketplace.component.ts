import { Component, OnInit, HostListener } from '@angular/core';
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

  // Pagination properties
  currentPage = 0;
  cardsPerPage = 3; // Default for desktop
  totalPages = 0;
  isMobile = false;

  // Orders pagination properties
  currentOrdersPage = 0;
  ordersCardsPerPage = 3; // Default for desktop
  totalOrdersPages = 0;

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
    this.checkScreenSize();
    this.loadData();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    this.cardsPerPage = this.isMobile ? 1 : 3;
    this.ordersCardsPerPage = this.isMobile ? 1 : 3;
    this.calculateTotalPages();
    this.calculateTotalOrdersPages();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load available crops
    this.cropService.getCrops().subscribe({
      next: (crops) => {
        this.crops = crops;
        this.calculateTotalPages();
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

  // Pagination methods
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.crops.length / this.cardsPerPage);
    // Reset to first page if current page is out of bounds
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = 0;
    }
  }

  calculateTotalOrdersPages(): void {
    this.totalOrdersPages = Math.ceil(this.orders.length / this.ordersCardsPerPage);
    // Reset to first page if current page is out of bounds
    if (this.currentOrdersPage >= this.totalOrdersPages && this.totalOrdersPages > 0) {
      this.currentOrdersPage = 0;
    }
  }

  getVisibleCrops(): any[] {
    const startIndex = this.currentPage * this.cardsPerPage;
    const endIndex = startIndex + this.cardsPerPage;
    return this.crops.slice(startIndex, endIndex);
  }

  getVisibleOrders(): Order[] {
    const startIndex = this.currentOrdersPage * this.ordersCardsPerPage;
    const endIndex = startIndex + this.ordersCardsPerPage;
    return this.orders.slice(startIndex, endIndex);
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
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

  isFirstPage(): boolean {
    return this.currentPage === 0;
  }

  isLastPage(): boolean {
    return this.currentPage === this.totalPages - 1;
  }

  isFirstOrdersPage(): boolean {
    return this.currentOrdersPage === 0;
  }

  isLastOrdersPage(): boolean {
    return this.currentOrdersPage === this.totalOrdersPages - 1;
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