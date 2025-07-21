import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Article {
  id: number;
  title: string;
  content: string;
  category?: string;
  created_at: string;
  updated_at: string;
  author_id?: number;
}

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private apiUrl = 'http://localhost:3000/api/articles';

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

  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createArticle(article: Partial<Article>): Observable<{ message: string; article: Article }> {
    return this.http.post<{ message: string; article: Article }>(this.apiUrl, article, { headers: this.getHeaders() });
  }

  updateArticle(id: number, article: Partial<Article>): Observable<{ message: string; article: Article }> {
    return this.http.put<{ message: string; article: Article }>(`${this.apiUrl}/${id}`, article, { headers: this.getHeaders() });
  }

  deleteArticle(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
} 