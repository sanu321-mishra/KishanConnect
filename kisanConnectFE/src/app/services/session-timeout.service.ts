import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {
  private timeoutId: any;
  private checkInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.startSessionMonitoring();
  }

  startSessionMonitoring(): void {
    // Check token expiration every minute
    this.checkInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, 60000); // 1 minute

    // Also check immediately
    this.checkTokenExpiration();
  }

  stopSessionMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private checkTokenExpiration(): void {
    const token = this.authService.getToken();
    
    if (!token) {
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;

      if (timeUntilExpiration <= 0) {
        // Token has expired
        this.handleSessionTimeout();
      } else if (timeUntilExpiration <= 300000) { // 5 minutes warning
        // Token will expire soon, show warning
        this.showExpirationWarning(timeUntilExpiration);
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
      this.handleSessionTimeout();
    }
  }

  private handleSessionTimeout(): void {
    this.authService.logout();
    this.router.navigate(['/login'], { 
      queryParams: { message: 'session_timeout' } 
    });
  }

  private showExpirationWarning(timeUntilExpiration: number): void {
    const minutes = Math.ceil(timeUntilExpiration / 60000);
    
    // Show a browser notification or alert
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Session Expiring', {
        body: `Your session will expire in ${minutes} minute(s). Please save your work.`,
        icon: '/assets/icon.png'
      });
    } else {
      // Fallback to alert
      alert(`Your session will expire in ${minutes} minute(s). Please save your work.`);
    }
  }

  // Method to be called when user logs in
  onLogin(): void {
    this.startSessionMonitoring();
  }

  // Method to be called when user logs out
  onLogout(): void {
    this.stopSessionMonitoring();
  }
} 