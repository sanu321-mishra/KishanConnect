import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { 
        queryParams: { message: 'login_required' } 
      });
      return false;
    }

    // Check if token is expired
    const token = this.authService.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();

        if (currentTime >= expirationTime) {
          // Token has expired
          this.authService.logout();
          this.router.navigate(['/login'], { 
            queryParams: { message: 'session_timeout' } 
          });
          return false;
        }
      } catch (error) {
        console.error('Error checking token validity:', error);
        this.authService.logout();
        this.router.navigate(['/login'], { 
          queryParams: { message: 'session_timeout' } 
        });
        return false;
      }
    }

    return true;
  }
} 