import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Package } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <main class="package-page">
      <section class="page-hero">
        <p>Packages</p>
        <h1>เลือกแพ็กเกจก่อนลงประกาศ</h1>
        <span>จัดการประกาศขายหรือเช่าคอนโดได้ตามจำนวนรายการและระยะเวลาที่ต้องการ</span>
      </section>

      <section class="package-grid">
        <article
          *ngFor="let pkg of packages"
          class="package-card"
          [class.featured]="pkg.isPremium"
          role="button"
          tabindex="0"
          (click)="selectPackage(pkg.id)"
          (keydown.enter)="selectPackage(pkg.id)"
        >
          <div *ngIf="pkg.isPremium" class="ribbon">คุ้มที่สุด</div>
          <h2>{{ pkg.name }}</h2>
          <div class="price">{{ pkg.price | number }} <span>บาท</span></div>
          <p>ลงได้ {{ pkg.listingsLimit }} รายการ | {{ pkg.durationDays }} วัน | รูป {{ pkg.imageLimit }} รูป</p>
          <ul>
            <li *ngFor="let feature of pkg.features">✓ {{ feature }}</li>
          </ul>
          <app-button className="w-full" [variant]="pkg.isPremium ? 'primary' : 'outline'">เลือกแพ็กเกจนี้</app-button>
        </article>
      </section>
    </main>
  `,
  styles: `
    .package-page { background: #f7faf9; min-height: 100vh; }
    .page-hero { background: linear-gradient(135deg, #073b3a, #0b6f6f); color: #fff; padding: 72px 24px 120px; text-align: center; }
    .page-hero p { color: #d8b95a; font-weight: 800; margin: 0 0 10px; }
    .page-hero h1 { font-size: clamp(2.2rem, 5vw, 4rem); line-height: 1.1; margin: 0; }
    .page-hero span { color: rgba(255,255,255,.84); display: block; line-height: 1.8; margin: 16px auto 0; max-width: 720px; }
    .package-grid { display: grid; gap: 24px; grid-template-columns: repeat(3, minmax(0, 1fr)); margin: -72px auto 0; max-width: 1120px; padding: 0 24px 78px; position: relative; }
    .package-card { background: #fff; border: 1px solid #e6efed; border-radius: 16px; box-shadow: 0 18px 44px rgba(7,59,58,.1); cursor: pointer; display: flex; flex-direction: column; padding: 28px; position: relative; transition: transform .24s ease, box-shadow .24s ease, border-color .24s ease, background-color .24s ease; }
    .package-card:hover { background: linear-gradient(180deg, #ffffff 0%, #f7fffc 100%); border-color: #0b6f6f; box-shadow: 0 28px 66px rgba(7,59,58,.18); transform: translateY(-10px); }
    .package-card:focus-visible { outline: 4px solid rgba(216,185,90,.5); outline-offset: 4px; }
    .package-card.featured { border: 2px solid #0b6f6f; transform: translateY(-14px); }
    .package-card.featured:hover { transform: translateY(-24px); }
    .ribbon { background: #d8b95a; border-radius: 999px; color: #073b3a; font-weight: 900; left: 50%; padding: 7px 16px; position: absolute; top: -16px; transform: translateX(-50%); }
    h2 { color: #073b3a; font-size: 1.6rem; margin: 0; }
    .price { color: #0b6f6f; font-size: 3rem; font-weight: 900; margin: 18px 0 4px; transition: transform .22s ease; }
    .package-card:hover .price { transform: scale(1.04); }
    .price span { color: #64706f; font-size: 1rem; }
    p { color: #64706f; line-height: 1.6; margin: 0; }
    ul { display: grid; gap: 12px; list-style: none; margin: 28px 0; padding: 0; }
    li { color: #1f2937; font-weight: 600; transition: transform .18s ease; }
    .package-card:hover li { transform: translateX(3px); }
    app-button { margin-top: auto; }
    @media (max-width: 900px) { .package-grid { grid-template-columns: 1fr; } .package-card.featured { transform: none; } }
  `
})
export class PackagesComponent implements OnInit {
  packages: Package[] = [];

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dataService.getPackagesFromApi().subscribe((packages) => {
      this.packages = packages;
    });
  }

  selectPackage(packageId: string): void {
    if (!this.authService.isLoggedIn()) {
      alert('กรุณาเข้าสู่ระบบก่อนเลือกแพ็กเกจ');
      this.router.navigate(['/login']);
      return;
    }

    this.authService.selectPackage(packageId);
    this.router.navigate(['/post-property']);
  }
}
