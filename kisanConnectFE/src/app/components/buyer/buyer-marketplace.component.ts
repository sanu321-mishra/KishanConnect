import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CropService } from '../../services/crop.service';
import { OrderService, Order } from '../../services/order.service';
import { PaymentService } from '../../services/payment.service';
import { Router, ActivatedRoute } from '@angular/router';

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

  // Payment success modal
  showPaymentSuccessModal = false;
  successfulOrderDetails: any = null;

  constructor(
    private authService: AuthService,
    private cropService: CropService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (!this.authService.isBuyer()) {
      this.router.navigate(['/login']);
      return;
    }
    this.checkScreenSize();
    this.loadData();
    this.handleReorder();
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
    this.totalOrdersPages = Math.ceil(this.getConfirmedDeliveredOrders().length / this.ordersCardsPerPage);
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
    return this.getConfirmedDeliveredOrders().slice(startIndex, endIndex);
  }

  getConfirmedDeliveredOrders(): Order[] {
    return this.orders.filter(order => 
      order.status === 'confirmed' || order.status === 'delivered'
    );
  }

  getConfirmedDeliveredCount(): number {
    return this.getConfirmedDeliveredOrders().length;
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
        next: (response) => {
          // After placing order, initiate payment
          this.initiatePayment(response.order.id, response.order.total_price);
        },
        error: (error) => {
          console.error('Error placing order:', error);
          this.errorMessage = error.error?.error || 'Failed to place order';
        }
      });
    }
  }

  async initiatePayment(orderId: number, amount: number): Promise<void> {
    try {
      // Create payment order
      this.paymentService.createPaymentOrder(orderId, amount).subscribe({
        next: async (paymentOrder) => {
          try {
            // Initialize Razorpay payment
            const rzp = await this.paymentService.initializePayment(paymentOrder, {
              name: this.authService.getCurrentUserValue()?.name || '',
              email: this.authService.getCurrentUserValue()?.email || ''
            });

            // Handle payment success
            rzp.on('payment.success', async (response: any) => {
              try {
                // Verify payment on backend
                await this.paymentService.verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: orderId
                }).toPromise();

                // Payment successful
                this.successfulOrderDetails = {
                  id: orderId,
                  total_price: amount,
                  payment_id: response.razorpay_payment_id
                };
                this.showPaymentSuccessModal = true;
                this.loadData();
                this.showOrderForm = false;
                this.selectedCrop = null;
                this.newOrder.quantity = 1;
                this.errorMessage = '';
              } catch (error) {
                console.error('Payment verification failed:', error);
                this.errorMessage = 'Payment verification failed. Please contact support.';
              }
            });

            // Handle payment failure
            rzp.on('payment.failed', (response: any) => {
              console.error('Payment failed:', response);
              this.errorMessage = 'Payment failed. Please try again.';
            });

            // Open payment modal
            rzp.open();
          } catch (error) {
            console.error('Error initializing payment:', error);
            this.errorMessage = 'Failed to initialize payment. Please try again.';
          }
        },
        error: (error) => {
          console.error('Error creating payment order:', error);
          this.errorMessage = error.error?.error || 'Failed to create payment order';
        }
      });
    } catch (error) {
      console.error('Error in payment initiation:', error);
      this.errorMessage = 'Failed to initiate payment. Please try again.';
    }
  }

  onPaymentSuccessClose(): void {
    this.showPaymentSuccessModal = false;
    this.successfulOrderDetails = null;
  }

  onViewOrders(): void {
    this.showPaymentSuccessModal = false;
    this.router.navigate(['/buyer/orders']);
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

  handleReorder(): void {
    this.route.queryParams.subscribe(params => {
      if (params['reorder'] === 'true' && params['cropId'] && params['quantity']) {
        const cropId = parseInt(params['cropId']);
        const quantity = parseInt(params['quantity']);
        
        // Find the crop and open order form
        const crop = this.crops.find(c => c.id === cropId);
        if (crop) {
          this.openOrderForm(crop);
          this.newOrder.quantity = quantity;
        }
        
        // Clear the query parameters
        this.router.navigate(['/buyer'], { queryParams: {} });
      }
    });
  }
} 