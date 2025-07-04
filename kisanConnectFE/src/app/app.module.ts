import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CropListComponent } from './components/crops/crop-list.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NavComponent } from './components/nav/nav.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { FarmerDashboardComponent } from './components/farmer/farmer-dashboard.component';
import { BuyerMarketplaceComponent } from './components/buyer/buyer-marketplace.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'crops', component: CropListComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
  { path: 'farmer', component: FarmerDashboardComponent, canActivate: [AuthGuard] },
  { path: 'buyer', component: BuyerMarketplaceComponent, canActivate: [AuthGuard] }
];

@NgModule({
  declarations: [
    AppComponent, 
    CropListComponent, 
    LoginComponent, 
    RegisterComponent, 
    NavComponent,
    AdminDashboardComponent,
    FarmerDashboardComponent,
    BuyerMarketplaceComponent
  ],
  imports: [
    BrowserModule, 
    HttpClientModule, 
    FormsModule, 
    ReactiveFormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }