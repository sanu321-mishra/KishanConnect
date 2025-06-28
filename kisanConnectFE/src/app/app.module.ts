import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { CropListComponent } from './components/crop-list.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, CropListComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  bootstrap: [AppComponent]
})
export class AppModule { }