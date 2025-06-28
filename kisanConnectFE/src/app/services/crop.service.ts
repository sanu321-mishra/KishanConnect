import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Crop } from '../models/crop.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CropService {
  private apiUrl = 'http://localhost:3000/api/crops';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getCrops(): Observable<Crop[]> {
    return this.http.get<Crop[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getCrop(id: number): Observable<Crop> {
    return this.http.get<Crop>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createCrop(crop: Crop): Observable<{ message: string; crop: Crop }> {
    return this.http.post<{ message: string; crop: Crop }>(`${this.apiUrl}/add`, crop, { headers: this.getHeaders() });
  }

  updateCrop(id: number, crop: Crop): Observable<{ message: string; crop: Crop }> {
    return this.http.put<{ message: string; crop: Crop }>(`${this.apiUrl}/${id}`, crop, { headers: this.getHeaders() });
  }

  deleteCrop(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}