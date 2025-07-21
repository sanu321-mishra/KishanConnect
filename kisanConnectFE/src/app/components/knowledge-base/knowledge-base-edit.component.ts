import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-knowledge-base-edit',
  templateUrl: './knowledge-base-edit.component.html',
  styleUrls: ['./knowledge-base-edit.component.css']
})
export class KnowledgeBaseEditComponent implements OnInit {
  articleForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  error = '';
  articleId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private authService: AuthService
  ) {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      category: ['']
    });
  }

  ngOnInit(): void {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/knowledge-base']);
      return;
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.articleId = Number(id);
      this.loadArticle(this.articleId);
    }
  }

  loadArticle(id: number): void {
    this.isLoading = true;
    this.articleService.getArticleById(id).subscribe({
      next: (article) => {
        this.articleForm.patchValue(article);
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load article';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.articleForm.invalid) return;
    this.isLoading = true;
    const articleData = this.articleForm.value;
    if (this.isEditMode && this.articleId) {
      this.articleService.updateArticle(this.articleId, articleData).subscribe({
        next: () => this.router.navigate(['/knowledge-base']),
        error: () => {
          this.error = 'Failed to update article';
          this.isLoading = false;
        }
      });
    } else {
      this.articleService.createArticle(articleData).subscribe({
        next: (res) => this.router.navigate(['/knowledge-base']),
        error: () => {
          this.error = 'Failed to create article';
          this.isLoading = false;
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.articleId) {
      this.router.navigate(['/knowledge-base']);
    } else {
      this.router.navigate(['/knowledge-base']);
    }
  }
} 