import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  currentUser: User | null = null;
  isLoading = false;

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

    // Check if user is logged in on component init
    if (this.authService.isLoggedIn()) {
      this.fetchUserFromBackend();
    }
  }

  private fetchUserFromBackend() {
    this.isLoading = true;
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        this.currentUser = response.user;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
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
    const loggedIn = this.authService.isLoggedIn();
    console.log('isLoggedIn check:', loggedIn);
    return loggedIn;
  }

  getUserDisplayName(): string {
    if (this.currentUser?.name) {
      return this.currentUser.name;
    }
    if (this.isLoading) {
      return 'Loading...';
    }
    return 'User';
  }
} 