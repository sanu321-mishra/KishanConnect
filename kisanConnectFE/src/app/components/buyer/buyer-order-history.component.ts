import { Component, OnInit, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OrderService, Order } from '../../services/order.service';
import { CropService } from '../../services/crop.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-buyer-order-history',
  templateUrl: './buyer-order-history.component.html',
  styleUrls: ['./buyer-order-history.component.css']
})
export class BuyerOrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Filter properties
  statusFilter = 'all';
  dateFilter = 'all';
  searchTerm = '';

  // Pagination properties
  currentPage = 0;
  itemsPerPage = 10;
  totalPages = 0;
  ordersCardsPerPage = 3; // Default for desktop
  isMobile = false;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private cropService: CropService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isBuyer()) {
      this.router.navigate(['/login']);
      return;
    }
    this.checkScreenSize();
    this.loadOrderHistory();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;
    this.ordersCardsPerPage = this.isMobile ? 1 : 3;
    this.calculateTotalPages();
  }

  loadOrderHistory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getBuyerOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        console.log(this.orders);
        this.calculateTotalPages();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading order history:', error);
        this.errorMessage = 'Failed to load order history';
        this.isLoading = false;
      }
    });
  }

  get filteredOrders(): Order[] {
    let filtered = this.orders;

    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Filter by date
    if (this.dateFilter !== 'all') {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      switch (this.dateFilter) {
        case 'last30':
          filtered = filtered.filter(order => new Date(order.created_at) >= thirtyDaysAgo);
          break;
        case 'last90':
          filtered = filtered.filter(order => new Date(order.created_at) >= ninetyDaysAgo);
          break;
        case 'thisYear':
          filtered = filtered.filter(order => new Date(order.created_at).getFullYear() === now.getFullYear());
          break;
      }
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.crop_name?.toLowerCase().includes(term) ||
        order.farmer_name?.toLowerCase().includes(term) ||
        order.crop_type?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  get paginatedOrders(): Order[] {
    const startIndex = this.currentPage * this.ordersCardsPerPage;
    const endIndex = startIndex + this.ordersCardsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.ordersCardsPerPage);
    if (this.currentPage >= this.totalPages && this.totalPages > 0) {
      this.currentPage = 0;
    }
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.calculateTotalPages();
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

  isFirstPage(): boolean {
    return this.currentPage === 0;
  }

  isLastPage(): boolean {
    return this.currentPage === this.totalPages - 1;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  downloadInvoice(order: Order): void {
    // Create invoice content
    const invoiceContent = this.generateInvoiceContent(order);
    
    // Create blob and download
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice_order_${order.id}_${new Date(order.created_at).toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  generateInvoiceContent(order: Order): string {
    const orderDate = new Date(order.created_at);
    const invoiceNumber = `INV-${order.id.toString().padStart(6, '0')}`;
    const currentUser = this.authService.getCurrentUserValue();
    
    return `
KISANCONNECT - INVOICE
========================

Invoice Number: ${invoiceNumber}
Order Date: ${orderDate.toLocaleDateString()}
Order Time: ${orderDate.toLocaleTimeString()}

BUYER DETAILS:
--------------
Name: ${currentUser?.name || 'N/A'}
Email: ${currentUser?.email || 'N/A'}

FARMER DETAILS:
---------------
Name: ${order.farmer_name}
Crop: ${order.crop_name} (${order.crop_type})

ORDER DETAILS:
--------------
Quantity: ${order.quantity} kg
Price per kg: ₹${(order.total_price / order.quantity).toFixed(2)}
Total Amount: ₹${order.total_price}
Status: ${order.status.toUpperCase()}

Thank you for using KisanConnect!
===============================
    `.trim();
  }

  reorder(order: Order): void {
    // Navigate to buyer marketplace with pre-filled crop selection
    this.router.navigate(['/buyer'], { 
      queryParams: { 
        reorder: 'true',
        cropId: order.crop_id,
        quantity: order.quantity
      }
    });
  }

  canReorder(order: Order): boolean {
    // Can reorder if order was delivered
    return order.status === 'delivered'
  }

  getTotalOrders(): number {
    return this.filteredOrders.length;
  }

  getTotalSpent(): number {
    return this.filteredOrders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + order.total_price, 0);
  }

  clearFilters(): void {
    this.statusFilter = 'all';
    this.dateFilter = 'all';
    this.searchTerm = '';
    this.onFilterChange();
  }

  getDeliveredOrdersCount(): number {
    return this.filteredOrders.filter(o => o.status === 'delivered').length;
  }
} 