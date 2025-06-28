import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Crop } from '../models/crop.model';

@Injectable({ providedIn: 'root' })
export class CropService {
  private apiUrl = 'http://localhost:3000/api/crops';
  private addCropUrl = 'http://localhost:3000/api/crops/add';

  constructor(private http: HttpClient) {}

  getCrops(): Observable<Crop[]> {
    return this.http.get<Crop[]>(this.apiUrl);
  }

  createCrop(crop: Crop): Observable<Crop> {
    return this.http.post<Crop>(this.addCropUrl, crop);
  }
}