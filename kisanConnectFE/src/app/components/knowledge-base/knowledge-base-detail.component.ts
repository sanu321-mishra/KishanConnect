import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Article, ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-knowledge-base-detail',
  templateUrl: './knowledge-base-detail.component.html',
  styleUrls: ['./knowledge-base-detail.component.css']
})
export class KnowledgeBaseDetailComponent implements OnInit {
  article: Article | null = null;
  isAdmin = false;
  isLoading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadArticle(id);
    } else {
      this.error = 'Invalid article ID';
    }
  }

  backToKnowledgeBase(): void {
    this.router.navigate(['/knowledge-base']);
  }

  loadArticle(id: number): void {
    this.isLoading = true;
    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        this.article = article;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load article';
        this.isLoading = false;
      }
    });
  }

  editArticle(): void {
    if (this.article) {
      this.router.navigate(['/knowledge-base/edit', this.article.id]);
    }
  }

  deleteArticle(): void {
    if (this.article && confirm('Are you sure you want to delete this article?')) {
      this.articleService.deleteArticle(this.article.id).subscribe({
        next: () => this.router.navigate(['/knowledge-base']),
        error: () => alert('Failed to delete article')
      });
    }
  }
} 