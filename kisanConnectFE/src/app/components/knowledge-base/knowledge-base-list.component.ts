import { Component, OnInit } from '@angular/core';
import { Article, ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-knowledge-base-list',
  templateUrl: './knowledge-base-list.component.html',
  styleUrls: ['./knowledge-base-list.component.css']
})
export class KnowledgeBaseListComponent implements OnInit {
  articles: Article[] = [];
  isAdmin = false;
  isLoading = false;
  error = '';
  searchTerm: string = '';

  constructor(
    private articleService: ArticleService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isBuyer()) {
      this.router.navigate(['/buyer']);
      return;
    }
    if(this.authService.isAdmin()){
      this.isAdmin = true;
    }
    this.loadArticles();
  }

  get filteredArticles(): Article[] {
    if (!this.searchTerm) return this.articles;
    const term = this.searchTerm.toLowerCase();
    return this.articles.filter(article =>
      (article.title && article.title.toLowerCase().includes(term)) ||
      (article.category && article.category.toLowerCase().includes(term))
    );
  }

  public goBack(): void {
    const user = this.authService.getCurrentUserValue();
    if (user) {
      const role = user.role;
      if (role === 'admin') {
        this.router.navigate(['/admin']);
      } else if (role === 'farmer') {
        this.router.navigate(['/farmer']);
      } else if (role === 'buyer') {
        this.router.navigate(['/buyer']);
      }
    }
  }

  loadArticles(): void {
    this.isLoading = true;
    this.articleService.getAllArticles().subscribe({
      next: (articles) => {
        this.articles = articles;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load articles';
        this.isLoading = false;
      }
    });
  }

  viewArticle(article: Article): void {
    this.router.navigate(['/knowledge-base', article.id]);
  }

  editArticle(article: Article): void {
    this.router.navigate(['/knowledge-base/edit', article.id]);
  }

  deleteArticle(article: Article): void {
    if (confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(article.id).subscribe({
        next: () => this.loadArticles(),
        error: () => alert('Failed to delete article')
      });
    }
  }

  addArticle(): void {
    this.router.navigate(['/knowledge-base/add']);
  }
} 