import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-farmer-sales',
  templateUrl: './farmer-sales.component.html',
  styleUrls: ['./farmer-sales.component.css']
})
export class FarmerSalesComponent implements OnInit {
  isLoading = false;
  errorMessage = '';
  combinedChartData: any;
  inventory: any[] = [];

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isFarmer()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadSalesData();
  }

  loadSalesData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getFarmerAnalytics().subscribe({
      next: (data) => {
        this.combinedChartData = {
          labels: data.monthlySales.map((d: any) => d.month),
          datasets: [
            { 
              label: 'Sales (kg)', 
              data: data.monthlySales.map((d: any) => d.total_sales), 
              borderColor: '#42A5F5',
              backgroundColor: 'rgba(66, 165, 245, 0.1)',
              tension: 0.4,
              yAxisID: 'y'
            },
            { 
              label: 'Revenue (₹)', 
              data: data.monthlySales.map((d: any) => d.revenue), 
              borderColor: '#66BB6A',
              backgroundColor: 'rgba(102, 187, 106, 0.1)',
              tension: 0.4,
              yAxisID: 'y1'
            }
          ]
        };
        
        this.inventory = data.inventory;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales data:', error);
        this.errorMessage = 'Failed to load sales data';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/farmer']);
  }
} 