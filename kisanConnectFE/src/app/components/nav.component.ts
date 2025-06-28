import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      // If we have a token but no user data, fetch from backend
      if (this.authService.isLoggedIn() && !user) {
        this.fetchUserFromBackend();
      }
    });
  }

  private fetchUserFromBackend() {
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        this.currentUser = response.user;
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
} 