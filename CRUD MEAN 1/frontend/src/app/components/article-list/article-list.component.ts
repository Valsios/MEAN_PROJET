
import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.css'
})
export class ArticleListComponent implements OnInit {
  newArticle = { title: '', content: '' };
  articles: any[] = [];
  constructor(private articleService: ArticleService) {}
  ngOnInit(): void {
    this.loadArticles();
  }
  loadArticles(): void {
    this.articleService.getArticles().subscribe(data => this.articles =
    data);
  }
  deleteArticle(id: string): void {
    this.articleService.deleteArticle(id).subscribe(() =>
    this.loadArticles());
  }

  addArticle(): void {
    if (this.newArticle.title && this.newArticle.content) {
        this.articleService.addArticle(this.newArticle).subscribe(() => {
        this.loadArticles(); // Recharge la liste après ajout
        this.newArticle = { title: '', content: '' }; // Réinitialise le formulaire
      });
    }
  }
}
