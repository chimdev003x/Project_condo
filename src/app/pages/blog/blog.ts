import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Blog } from '../../core/models';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="blog-page">
      <section class="page-hero">
        <p>Articles</p>
        <h1>บทความคอนโด</h1>
        <span>ความรู้สำหรับคนซื้อ ขาย เช่า และลงทุนคอนโด</span>
      </section>

      <section class="blog-grid">
        <article *ngFor="let blog of blogs" class="blog-card">
          <img [src]="blog.image" [alt]="blog.title" />
          <div>
            <small>{{ blog.category }} | {{ blog.date }}</small>
            <h2>{{ blog.title }}</h2>
            <p>{{ blog.excerpt }}</p>
          </div>
        </article>
      </section>
    </main>
  `,
  styles: `
    .blog-page { background: #f7faf9; min-height: 100vh; }
    .page-hero { background: linear-gradient(135deg, #073b3a, #0b6f6f); color: #fff; padding: 72px 24px; text-align: center; }
    .page-hero p { color: #d8b95a; font-weight: 900; margin: 0 0 10px; }
    .page-hero h1 { font-size: clamp(2.3rem, 5vw, 4rem); margin: 0; }
    .page-hero span { color: rgba(255,255,255,.84); display: block; margin-top: 14px; }
    .blog-grid { display: grid; gap: 24px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0 auto; max-width: 1200px; padding: 36px 24px 76px; }
    .blog-card { background: #fff; border: 1px solid #e6efed; border-radius: 14px; box-shadow: 0 16px 36px rgba(7,59,58,.08); overflow: hidden; }
    img { height: 220px; object-fit: cover; width: 100%; }
    .blog-card div { padding: 22px; }
    small { color: #0b6f6f; font-weight: 900; }
    h2 { color: #073b3a; line-height: 1.35; margin: 10px 0; }
    p { color: #64706f; line-height: 1.7; }
    @media (max-width: 900px) { .blog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 620px) { .page-hero { padding: 52px 18px; } .blog-grid { grid-template-columns: 1fr; padding: 24px 18px 56px; } }
  `
})
export class BlogComponent implements OnInit {
  blogs: Blog[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getBlogsFromApi().subscribe((blogs) => {
      this.blogs = blogs;
    });
  }
}
