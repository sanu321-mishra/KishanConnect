import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id: number;
  crop_id: number;
  buyer_id: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  crop_name?: string;
  crop_type?: string;
  buyer_name?: string;
  farmer_name?: string;
}

export interface PlaceOrderRequest {
  crop_id: number;
  quantity: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all orders (admin only)
  getAdminOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin`, { headers: this.getHeaders() });
  }

  // Get buyer orders
  getBuyerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/buyer`, { headers: this.getHeaders() });
  }

  // Get farmer orders
  getFarmerOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/farmer`, { headers: this.getHeaders() });
  }

  // Place order (buyer only)
  placeOrder(orderData: PlaceOrderRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/place`, orderData, { headers: this.getHeaders() });
  }

  // Update order status
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${orderId}/status`, { status }, { headers: this.getHeaders() });
  }
} 