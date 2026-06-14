import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Project } from '../../core/models';
import { DataService } from '../../core/services/data.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <main class="project-page">
      <section class="page-hero">
        <div class="hero-inner">
          <p>New Projects</p>
          <h1>โครงการคอนโดใหม่</h1>
          <span>รวมโครงการใหม่และโครงการพร้อมอยู่จาก Developer ชั้นนำ</span>
        </div>
      </section>

      <section class="project-grid">
        <article *ngFor="let project of projects" class="project-card">
          <img [src]="project.image" [alt]="project.name" />
          <div class="project-body">
            <span class="status">{{ project.status === 'Ready to move' ? 'พร้อมอยู่' : 'กำลังก่อสร้าง' }}</span>
            <h2>{{ project.name }}</h2>
            <p>{{ project.developer }} | {{ project.location }}</p>
            <strong>เริ่ม {{ project.startingPrice | number }} บาท</strong>
            <small>{{ project.description }}</small>
            <app-button [href]="'/projects/' + project.id" variant="outline" className="w-full">ดูโครงการ</app-button>
          </div>
        </article>
      </section>
    </main>
  `,
  styles: `
    .project-page { background: #f7faf9; min-height: 100vh; }
    .page-hero { background: linear-gradient(135deg, rgba(7,59,58,.94), rgba(11,111,111,.72)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80') center/cover; color: #fff; padding: 72px 24px; }
    .hero-inner { margin: 0 auto; max-width: 1200px; }
    .page-hero p, .page-hero h1, .page-hero span { display: block; }
    .page-hero p { color: #d8b95a; font-weight: 800; margin: 0 0 32px; }
    .page-hero h1 { font-size: clamp(2.4rem, 5vw, 4.5rem); line-height: 1.08; margin: 0 0 18px; }
    .page-hero span { color: rgba(255,255,255,.86); font-size: 1.1rem; }
    .project-grid { display: grid; gap: 24px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: 0 auto; max-width: 1200px; padding: 36px 24px 76px; }
    .project-card { background: #fff; border: 1px solid #e6efed; border-radius: 14px; box-shadow: 0 16px 36px rgba(7,59,58,.08); overflow: hidden; }
    .project-card img { height: 240px; object-fit: cover; width: 100%; }
    .project-body { display: grid; gap: 10px; padding: 22px; }
    .status { background: rgba(11,111,111,.1); border-radius: 999px; color: #0b6f6f; font-size: .82rem; font-weight: 800; padding: 6px 10px; width: fit-content; }
    h2 { color: #073b3a; margin: 0; }
    p, small { color: #64706f; line-height: 1.6; }
    p { margin: 0; }
    strong { color: #0b6f6f; font-size: 1.2rem; }
    @media (max-width: 980px) { .project-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 620px) { .page-hero { padding: 52px 18px; } .project-grid { grid-template-columns: 1fr; padding: 24px 18px 56px; } }
  `
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getProjectsFromApi().subscribe((projects) => {
      this.projects = projects;
    });
  }
}

@Component({
  selector: 'app-project-detail-redirect',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <main class="detail-page">
      <article *ngIf="project" class="detail-card">
        <img [src]="project.image" [alt]="project.name" />
        <div class="detail-body">
          <span>{{ project.status === 'Ready to move' ? 'พร้อมอยู่' : 'กำลังก่อสร้าง' }}</span>
          <h1>{{ project.name }}</h1>
          <p>{{ project.developer }} | {{ project.location }}</p>
          <strong>ราคาเริ่มต้น {{ project.startingPrice | number }} บาท</strong>
          <p>{{ project.description }}</p>
          <div class="actions">
            <app-button href="/contact">ติดต่อโครงการ</app-button>
            <app-button href="/projects" variant="outline">กลับไปหน้าโครงการ</app-button>
          </div>
        </div>
      </article>
    </main>
  `,
  styles: `
    .detail-page { background: #f7faf9; padding: 42px 24px 76px; }
    .detail-card { background: #fff; border: 1px solid #e6efed; border-radius: 16px; box-shadow: 0 18px 44px rgba(7,59,58,.1); margin: 0 auto; max-width: 980px; overflow: hidden; }
    img { height: 420px; object-fit: cover; width: 100%; }
    .detail-body { padding: 32px; }
    span { color: #0b6f6f; font-weight: 800; }
    h1 { color: #073b3a; font-size: clamp(2rem, 4vw, 3.4rem); margin: 8px 0; }
    p { color: #64706f; line-height: 1.8; }
    strong { color: #0b6f6f; display: block; font-size: 1.6rem; margin: 22px 0; }
    .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 26px; }
  `
})
export class ProjectDetailRedirectComponent implements OnInit {
  project: Project | undefined;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/projects']);
      return;
    }

    this.dataService.getProjectFromApi(id).subscribe((project) => {
      this.project = project;
      if (!this.project) {
        this.router.navigate(['/projects']);
      }
    });
  }
}
