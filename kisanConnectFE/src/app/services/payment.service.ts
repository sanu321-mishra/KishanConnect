import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentOrder {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: number;
}

export interface PaymentStatus {
  payment_status: string;
  payment_id: string;
  payment_order_id: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:3000/api/payments';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Create payment order
  createPaymentOrder(orderId: number, amount: number): Observable<PaymentOrder> {
    return this.http.post<PaymentOrder>(`${this.apiUrl}/create-order`, {
      order_id: orderId,
      amount: amount
    }, { headers: this.getHeaders() });
  }

  // Verify payment
  verifyPayment(verificationData: PaymentVerification): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify`, verificationData, { headers: this.getHeaders() });
  }

  // Get payment status
  getPaymentStatus(orderId: number): Observable<PaymentStatus> {
    return this.http.get<PaymentStatus>(`${this.apiUrl}/status/${orderId}`, { headers: this.getHeaders() });
  }

  // Load Razorpay script
  loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any)['Razorpay']) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  // Initialize Razorpay payment
  async initializePayment(paymentOrder: PaymentOrder, options: any = {}): Promise<any> {
    await this.loadRazorpayScript();

    const defaultOptions = {
      key: paymentOrder.key_id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: 'KisanConnect',
      description: 'Agricultural Product Purchase',
      order_id: paymentOrder.order_id,
      handler: (response: any) => {
        console.log('Payment successful:', response);
      },
      prefill: {
        name: options.name || '',
        email: options.email || '',
        contact: options.contact || ''
      },
      theme: {
        color: '#3399cc'
      }
    };

    const rzp = new (window as any)['Razorpay'](defaultOptions);
    return rzp;
  }
} 