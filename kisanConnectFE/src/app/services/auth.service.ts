import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData);
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.decodeAndSetUser(response.token);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      if (currentTime >= expirationTime) {
        // Token has expired, remove it
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking token validity:', error);
      this.logout();
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getTokenExpirationTime(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error getting token expiration:', error);
      return null;
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/me`, { headers: this.getHeaders() });
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    if (token) {
      this.decodeAndSetUser(token);
    }
  }

  private decodeAndSetUser(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        id: payload.id,
        name: payload.name || 'User',
        email: payload.email || '',
        role: payload.role || 'farmer'
      };
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.logout();
    }
  }

  // Role-based helper methods
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'admin';
  }

  isFarmer(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'farmer';
  }

  isBuyer(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'buyer';
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
} 