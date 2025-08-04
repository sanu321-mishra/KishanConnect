import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-payment-success-modal',
  template: `
    <div class="payment-success-modal" *ngIf="show">
      <div class="modal-content">
        <div class="success-icon">✅</div>
        <h3>Payment Successful!</h3>
        <p>Your order has been confirmed and payment has been processed successfully.</p>
        <div class="order-details" *ngIf="orderDetails">
          <p><strong>Order ID:</strong> #{{ orderDetails.id }}</p>
          <p><strong>Amount Paid:</strong> ₹{{ orderDetails.total_price }}</p>
          <p><strong>Payment ID:</strong> {{ orderDetails.payment_id }}</p>
        </div>
        <div class="modal-actions">
          <button class="close-btn" (click)="onClose()">Close</button>
          <button class="view-orders-btn" (click)="onViewOrders()">View My Orders</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-success-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      text-align: center;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .success-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    h3 {
      color: #28a745;
      margin-bottom: 1rem;
    }

    .order-details {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 5px;
      margin: 1rem 0;
      text-align: left;
    }

    .order-details p {
      margin: 0.5rem 0;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 1.5rem;
    }

    .close-btn, .view-orders-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .close-btn {
      background: #6c757d;
      color: white;
    }

    .close-btn:hover {
      background: #5a6268;
    }

    .view-orders-btn {
      background: #007bff;
      color: white;
    }

    .view-orders-btn:hover {
      background: #0056b3;
    }
  `]
})
export class PaymentSuccessModalComponent {
  @Input() show: boolean = false;
  @Input() orderDetails: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() viewOrders = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onViewOrders(): void {
    this.viewOrders.emit();
  }
} 