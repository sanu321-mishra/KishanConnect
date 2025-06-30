import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
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

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'crops', component: CropListComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'farmer', component: FarmerDashboardComponent },
  { path: 'buyer', component: BuyerMarketplaceComponent }
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
  bootstrap: [AppComponent]
})
export class AppModule { }