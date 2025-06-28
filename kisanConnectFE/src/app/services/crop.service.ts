import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Crop } from '../models/crop.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CropService {
  private apiUrl = 'http://localhost:3000/api/crops';
  private addCropUrl = 'http://localhost:3000/api/crops/add';

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

  createCrop(crop: Crop): Observable<Crop> {
    return this.http.post<Crop>(this.addCropUrl, crop, { headers: this.getHeaders() });
  }
}