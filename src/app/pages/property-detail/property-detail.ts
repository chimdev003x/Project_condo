import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Property } from '../../core/models';
import { DataService } from '../../core/services/data.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <main *ngIf="property" class="detail-page">
      <nav class="breadcrumb">
        <a routerLink="/">หน้าแรก</a><span>/</span>
        <a [routerLink]="property.type === 'sell' ? '/buy' : '/rent'">{{ property.type === 'sell' ? 'ซื้อคอนโด' : 'เช่าคอนโด' }}</a><span>/</span>
        <strong>{{ property.projectName }}</strong>
      </nav>

      <section class="detail-layout">
        <div class="main-column">
          <img [src]="property.images[0]" [alt]="property.title" class="cover" />
          <article class="summary-card">
            <div class="summary-top">
              <div>
                <span class="badge">{{ property.type === 'sell' ? 'ขาย' : 'เช่า' }}</span>
                <h1>{{ property.projectName }}</h1>
                <p>{{ property.title }}</p>
                <strong class="location">ทำเล {{ property.location }}</strong>
              </div>
              <div class="price">{{ property.price | number }} <span>{{ property.type === 'rent' ? 'บาท/เดือน' : 'บาท' }}</span></div>
            </div>
            <div class="facts">
              <div><strong>{{ property.area }}</strong><span>ตร.ม.</span></div>
              <div><strong>{{ property.bedrooms }}</strong><span>ห้องนอน</span></div>
              <div><strong>{{ property.bathrooms }}</strong><span>ห้องน้ำ</span></div>
              <div><strong>{{ property.floor || '-' }}</strong><span>ชั้น</span></div>
            </div>
          </article>

          <article class="info-card">
            <h2>รายละเอียด</h2>
            <p>{{ property.description }}</p>
          </article>

          <article class="info-card">
            <h2>สิ่งอำนวยความสะดวก</h2>
            <div class="chips"><span *ngFor="let amenity of property.amenities">{{ amenity }}</span></div>
          </article>
        </div>

        <aside class="contact-card">
          <h2>ติดต่อเจ้าของประกาศ</h2>
          <div class="avatar">{{ property.contactName.charAt(0) }}</div>
          <strong>{{ property.contactName }}</strong>
          <app-button className="w-full">{{ property.contactPhone }}</app-button>
          <app-button href="/contact" variant="outline" className="w-full">ส่งข้อความ</app-button>
        </aside>
      </section>
    </main>
  `,
  styles: `
    .detail-page { background: #f7faf9; padding: 28px 24px 76px; }
    .breadcrumb, .detail-layout { margin: 0 auto; max-width: 1200px; }
    .breadcrumb { align-items: center; color: #64706f; display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
    .breadcrumb a { color: #0b6f6f; font-weight: 800; text-decoration: none; }
    .breadcrumb strong { color: #073b3a; }
    .detail-layout { display: grid; gap: 28px; grid-template-columns: 1fr 340px; }
    .main-column { display: grid; gap: 22px; }
    .cover { border-radius: 16px; box-shadow: 0 18px 44px rgba(7,59,58,.1); height: 460px; object-fit: cover; width: 100%; }
    .summary-card, .info-card, .contact-card { background: #fff; border: 1px solid #e6efed; border-radius: 16px; box-shadow: 0 16px 36px rgba(7,59,58,.08); padding: 24px; }
    .summary-top { display: flex; gap: 20px; justify-content: space-between; }
    .badge { background: #0b6f6f; border-radius: 6px; color: #fff; display: inline-block; font-weight: 900; padding: 6px 10px; }
    h1, h2 { color: #073b3a; margin: 0; }
    h1 { font-size: clamp(2rem, 4vw, 3.2rem); margin-top: 12px; }
    p { color: #64706f; line-height: 1.8; }
    .location { color: #1f2937; }
    .price { color: #0b6f6f; font-size: 2rem; font-weight: 900; text-align: right; white-space: nowrap; }
    .price span { color: #64706f; font-size: .95rem; }
    .facts { border: 1px solid #e6efed; border-radius: 12px; display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 22px; overflow: hidden; text-align: center; }
    .facts div { padding: 16px 10px; }
    .facts div + div { border-left: 1px solid #e6efed; }
    .facts strong { color: #073b3a; display: block; font-size: 1.4rem; }
    .facts span { color: #64706f; font-weight: 700; }
    .chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
    .chips span { background: rgba(11,111,111,.1); border-radius: 999px; color: #0b6f6f; font-weight: 800; padding: 8px 12px; }
    .contact-card { align-self: start; display: grid; gap: 14px; position: sticky; text-align: center; top: 96px; }
    .avatar { background: rgba(11,111,111,.12); border-radius: 999px; color: #0b6f6f; display: grid; font-size: 2rem; font-weight: 900; height: 74px; margin: 8px auto; place-items: center; width: 74px; }
    @media (max-width: 940px) { .detail-layout { grid-template-columns: 1fr; } .contact-card { position: static; } }
    @media (max-width: 620px) { .detail-page { padding: 22px 18px 56px; } .cover { height: 300px; } .summary-top { flex-direction: column; } .price { text-align: left; } .facts { grid-template-columns: repeat(2, 1fr); } .facts div + div { border-left: 0; } }
  `
})
export class PropertyDetailComponent implements OnInit {
  property: Property | undefined;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/']);
      return;
    }

    this.dataService.getPropertyFromApi(id).subscribe((property) => {
      this.property = property;
      if (!this.property) {
        this.router.navigate(['/']);
      }
    });
  }
}
