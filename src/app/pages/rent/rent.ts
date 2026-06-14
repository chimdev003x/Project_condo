import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Property } from '../../core/models';
import { DataService } from '../../core/services/data.service';
import { CustomSelectComponent } from '../../shared/components/custom-select/custom-select';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card';

@Component({
  selector: 'app-rent',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyCardComponent, CustomSelectComponent],
  template: `
    <main class="listing-page">
      <section class="page-hero">
        <div>
          <p>Rent Condo</p>
          <h1>เช่าคอนโด</h1>
          <span>ค้นหาคอนโดให้เช่าพร้อมเข้าอยู่ ใกล้รถไฟฟ้าและทำเลยอดนิยม</span>
        </div>
      </section>

      <section class="content-shell">
        <aside class="filter-card">
          <div class="filter-head">
            <h2><span aria-hidden="true">⌕</span> ตัวกรอง</h2>
            <button type="button" (click)="clearFilters()">ล้างทั้งหมด</button>
          </div>
          <label>
            <span>ทำเล / โครงการ</span>
            <input [(ngModel)]="location" (ngModelChange)="applyFilters()" placeholder="เช่น สาทร" />
          </label>
          <label>
            <span>ช่วงราคาเช่า</span>
            <app-custom-select [value]="priceRange" [options]="priceOptions" (valueChange)="priceRange = $event; applyFilters()"></app-custom-select>
          </label>
          <label>
            <span>ห้องนอน</span>
            <app-custom-select [value]="bedrooms" [options]="bedroomOptions" (valueChange)="bedrooms = $event; applyFilters()"></app-custom-select>
          </label>
        </aside>

        <section class="results">
          <div class="result-toolbar">
            <div>
              <strong>พบ {{ filteredProperties.length }} รายการ</strong>
              <span>ประกาศเช่าคอนโดพร้อมเข้าอยู่</span>
            </div>
            <app-custom-select [value]="sort" [options]="sortOptions" (valueChange)="sort = $event; applyFilters()"></app-custom-select>
          </div>

          <div *ngIf="filteredProperties.length; else noResults" class="result-grid">
            <app-property-card *ngFor="let property of filteredProperties" [property]="property"></app-property-card>
          </div>
          <ng-template #noResults>
            <div class="empty-state">
              <h3>ไม่พบประกาศที่ตรงกับการค้นหา</h3>
              <button type="button" (click)="clearFilters()">ล้างตัวกรอง</button>
            </div>
          </ng-template>
        </section>
      </section>
    </main>
  `,
  styles: `
    .listing-page { background: #f7faf9; min-height: 100vh; }
    .page-hero { background: linear-gradient(135deg, rgba(7,59,58,.96), rgba(11,111,111,.72)), url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80') center/cover; color: #fff; padding: 72px 24px; }
    .page-hero > div, .content-shell { margin: 0 auto; max-width: 1200px; }
    .page-hero p { color: #d8b95a; font-weight: 800; margin: 0 0 26px; }
    .page-hero h1 { font-size: clamp(2.4rem, 5vw, 4.5rem); line-height: 1.14; margin: 0; }
    .page-hero span { color: rgba(255,255,255,.86); display: block; font-size: 1.12rem; line-height: 1.8; margin-top: 16px; max-width: 720px; }
    .content-shell { display: grid; gap: 28px; grid-template-columns: 300px 1fr; padding: 34px 24px 76px; }
    .filter-card, .result-toolbar, .empty-state { background: #fff; border: 1px solid #e6efed; border-radius: 14px; box-shadow: 0 16px 36px rgba(7,59,58,.08); }
    .filter-card { align-self: start; display: grid; gap: 18px; padding: 22px; position: sticky; top: 96px; }
    .filter-head { align-items: center; display: flex; gap: 14px; justify-content: space-between; }
    h2 { align-items: center; color: #073b3a; display: inline-flex; gap: 8px; margin: 0; }
    .filter-head button, .empty-state button { background: transparent; border: 0; color: #0b6f6f; cursor: pointer; font-weight: 800; }
    label span { color: #073b3a; display: block; font-size: .92rem; font-weight: 800; margin-bottom: 8px; }
    input { background: #fff; border: 1px solid #dfe9e6; border-radius: 10px; height: 48px; outline: none; padding: 0 12px; width: 100%; }
    input:focus { border-color: #0b6f6f; box-shadow: 0 0 0 4px rgba(11,111,111,.12); }
    .result-toolbar { align-items: center; display: grid; gap: 18px; grid-template-columns: 1fr 240px; margin-bottom: 22px; padding: 18px; }
    .result-toolbar strong, .result-toolbar span { display: block; }
    .result-toolbar strong { color: #073b3a; font-size: 1.15rem; }
    .result-toolbar span { color: #64706f; margin-top: 3px; }
    .result-grid { display: grid; gap: 22px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .empty-state { padding: 54px 24px; text-align: center; }
    .empty-state h3 { color: #073b3a; margin: 0 0 12px; }
    @media (max-width: 1020px) { .content-shell { grid-template-columns: 1fr; } .filter-card { position: static; } .result-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 640px) { .page-hero { padding: 52px 18px; } .content-shell { padding: 24px 18px 56px; } .result-toolbar { grid-template-columns: 1fr; } .result-grid { grid-template-columns: 1fr; } }
  `
})
export class RentComponent implements OnInit {
  filteredProperties: Property[] = [];
  location = '';
  priceRange = '';
  bedrooms = '';
  sort = 'latest';
  priceOptions = [
    { label: 'ทั้งหมด', value: '' },
    { label: 'ไม่เกิน 10,000 บาท', value: '0-10000' },
    { label: '10,000 - 20,000 บาท', value: '10000-20000' },
    { label: '20,000 - 50,000 บาท', value: '20000-50000' },
    { label: '50,000 บาทขึ้นไป', value: '50000+' }
  ];
  bedroomOptions = [
    { label: 'ทั้งหมด', value: '' },
    { label: '1 ห้องนอน', value: '1' },
    { label: '2 ห้องนอน', value: '2' },
    { label: '3 ห้องนอนขึ้นไป', value: '3' }
  ];
  sortOptions = [
    { label: 'ล่าสุด', value: 'latest' },
    { label: 'ราคา: ต่ำไปสูง', value: 'price-low' },
    { label: 'ราคา: สูงไปต่ำ', value: 'price-high' }
  ];

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.location = params['location'] || '';
      this.priceRange = params['priceRange'] || '';
      this.bedrooms = params['bedrooms'] || '';
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.dataService.getPropertiesFromApi({
      type: 'rent',
      location: this.location,
      priceRange: this.priceRange,
      bedrooms: this.bedrooms,
      sort: this.sort
    }).subscribe((properties) => {
      this.filteredProperties = properties;
    });
  }

  clearFilters(): void {
    this.location = '';
    this.priceRange = '';
    this.bedrooms = '';
    this.sort = 'latest';
    this.applyFilters();
  }
}
