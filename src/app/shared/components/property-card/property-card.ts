import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Property } from '../../../core/models';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <article class="property-card">
      <a [routerLink]="'/property/' + property.id" class="media-link" aria-label="ดูรายละเอียดประกาศ">
        <img [src]="property.images[0]" [alt]="property.title" />
        <div class="badges">
          <span class="badge badge-primary">{{ property.type === 'sell' ? 'ขาย' : 'เช่า' }}</span>
          <span *ngIf="property.badge" class="badge badge-gold">{{ property.badge }}</span>
        </div>
      </a>

      <div class="card-body">
        <div class="price">
          {{ property.price | number }}
          <span>{{ property.type === 'sell' ? 'บาท' : 'บาท/เดือน' }}</span>
        </div>
        <h3>{{ property.projectName }}</h3>
        <p class="subtitle">{{ property.title }}</p>
        <p class="location">ทำเล {{ property.location }}</p>

        <div class="facts">
          <div><strong>{{ property.bedrooms }}</strong><span>นอน</span></div>
          <div><strong>{{ property.bathrooms }}</strong><span>น้ำ</span></div>
          <div><strong>{{ property.area }}</strong><span>ตร.ม.</span></div>
        </div>

        <app-button [href]="'/property/' + property.id" className="w-full">ดูรายละเอียด</app-button>
      </div>
    </article>
  `,
  styles: `
    .property-card {
      background: #fff;
      border: 1px solid #e6efed;
      border-radius: 10px;
      box-shadow: 0 10px 24px rgba(7, 59, 58, 0.07);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .property-card:hover {
      box-shadow: 0 18px 36px rgba(7, 59, 58, 0.13);
      transform: translateY(-4px);
    }
    .media-link {
      aspect-ratio: 16 / 10;
      background: #edf4f2;
      display: block;
      overflow: hidden;
      position: relative;
    }
    img {
      height: 100%;
      object-fit: cover;
      transition: transform 0.35s ease;
      width: 100%;
    }
    .property-card:hover img {
      transform: scale(1.04);
    }
    .badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      left: 12px;
      position: absolute;
      top: 12px;
    }
    .badge {
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 5px 8px;
    }
    .badge-primary {
      background: #0b6f6f;
      color: #fff;
    }
    .badge-gold {
      background: #d8b95a;
      color: #073b3a;
    }
    .card-body {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 18px;
    }
    .price {
      color: #0b6f6f;
      font-size: 1.45rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .price span {
      color: #6b7280;
      font-size: 0.84rem;
      font-weight: 700;
    }
    h3 {
      color: #073b3a;
      font-size: 1.08rem;
      line-height: 1.35;
      margin: 0 0 8px;
      min-height: 2.9em;
    }
    .subtitle,
    .location {
      color: #64706f;
      font-size: 0.92rem;
      line-height: 1.5;
      margin: 0 0 12px;
    }
    .location {
      color: #1f2937;
      font-weight: 700;
    }
    .facts {
      border: 1px solid #e7efed;
      border-radius: 8px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      margin: auto 0 16px;
      overflow: hidden;
      text-align: center;
    }
    .facts div {
      padding: 10px 6px;
    }
    .facts div + div {
      border-left: 1px solid #e7efed;
    }
    .facts strong {
      color: #073b3a;
      display: block;
      font-size: 1rem;
    }
    .facts span {
      color: #6b7280;
      font-size: 0.78rem;
      font-weight: 700;
    }
  `
})
export class PropertyCardComponent {
  @Input({ required: true }) property!: Property;
}
