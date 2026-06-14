import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../button/button';
import { CustomSelectComponent } from '../custom-select/custom-select';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, CustomSelectComponent],
  template: `
    <section class="search-panel">
      <div class="tabs" role="tablist">
        <button type="button" [class.active]="type() === 'sell'" (click)="type.set('sell')">ซื้อคอนโด</button>
        <button type="button" [class.active]="type() === 'rent'" (click)="type.set('rent')">เช่าคอนโด</button>
      </div>

      <form class="search-form" (submit)="handleSearch($event)">
        <label class="keyword-field">
          <span class="label-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.2 7-11a7 7 0 0 0-14 0c0 5.8 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            ทำเล / BTS / MRT / ชื่อโครงการ
          </span>
          <input [(ngModel)]="location" name="location" type="text" placeholder="เช่น สุขุมวิท, อารีย์, พระราม 9" />
        </label>

        <label>
          <span class="label-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M6 7v14h12V7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
            ช่วงราคา
          </span>
          <app-custom-select
            [value]="priceRange"
            [options]="priceOptionsWithAll()"
            placeholder="ทุกช่วงราคา"
            (valueChange)="priceRange = $event"
          ></app-custom-select>
        </label>

        <label>
          <span class="label-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4M3 11h18v9H3zM7 11V8h4v3M13 11V8h4v3" /></svg>
            ห้องนอน
          </span>
          <app-custom-select
            [value]="bedrooms"
            [options]="bedroomOptions"
            placeholder="ทั้งหมด"
            (valueChange)="bedrooms = $event"
          ></app-custom-select>
        </label>

        <app-button type="submit" className="search-button">
          <span class="button-icon" aria-hidden="true">⌕</span>
          ค้นหา
        </app-button>
      </form>
    </section>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .search-panel {
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(255, 255, 255, 0.8);
      border-radius: 14px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
      margin: 0 auto;
      max-width: 1040px;
      padding: 14px;
      position: relative;
      text-align: left;
      width: 100%;
      z-index: 10;
    }
    .tabs {
      background: #f1f7f5;
      border-radius: 10px;
      display: inline-flex;
      gap: 6px;
      margin-bottom: 14px;
      padding: 5px;
    }
    .tabs button {
      background: transparent;
      border: 0;
      border-radius: 8px;
      color: #64706f;
      cursor: pointer;
      font-family: inherit;
      font-weight: 800;
      min-height: 38px;
      padding: 0 20px;
    }
    .tabs button.active {
      background: #fff;
      box-shadow: 0 4px 12px rgba(7, 59, 58, 0.1);
      color: #0b6f6f;
    }
    .search-form {
      align-items: end;
      display: grid;
      gap: 12px;
      grid-template-columns: minmax(240px, 1.5fr) minmax(190px, 0.8fr) minmax(150px, 0.6fr) 140px;
    }
    label span {
      color: #0b6f6f;
      display: block;
      font-size: 0.78rem;
      font-weight: 800;
      margin-bottom: 7px;
    }
    .label-icon {
      align-items: center;
      display: inline-flex;
      gap: 6px;
    }
    .label-icon svg {
      fill: none;
      height: 15px;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2;
      width: 15px;
    }
    input {
      background: #fff;
      border: 1px solid #dfe9e6;
      border-radius: 10px;
      color: #1f2937;
      font-family: inherit;
      font-size: 0.95rem;
      height: 48px;
      outline: none;
      padding: 0 13px;
      width: 100%;
    }
    input:focus {
      border-color: #0b6f6f;
      box-shadow: 0 0 0 4px rgba(11, 111, 111, 0.12);
    }
    .button-icon {
      display: inline-block;
      font-size: 1.05rem;
      margin-right: 6px;
      transform: translateY(1px);
    }
    :host ::ng-deep .search-button {
      height: 48px;
      width: 100%;
    }
    @media (max-width: 860px) {
      .search-form {
        grid-template-columns: 1fr 1fr;
      }
      .keyword-field,
      :host ::ng-deep app-button {
        grid-column: 1 / -1;
      }
    }
    @media (max-width: 560px) {
      .search-panel {
        max-width: calc(100vw - 36px);
        padding: 12px;
      }
      .search-form {
        grid-template-columns: 1fr;
      }
      .tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
      }
    }
  `
})
export class SearchBoxComponent {
  type = signal<'sell' | 'rent'>('sell');
  location = '';
  priceRange = '';
  bedrooms = '';
  bedroomOptions = [
    { label: 'ทั้งหมด', value: '' },
    { label: '1 ห้อง', value: '1' },
    { label: '2 ห้อง', value: '2' },
    { label: '3 ห้องขึ้นไป', value: '3' }
  ];

  constructor(private router: Router) {}

  priceOptions() {
    return this.type() === 'sell'
      ? [
          { label: 'ไม่เกิน 2 ล้านบาท', value: '0-2000000' },
          { label: '2 - 5 ล้านบาท', value: '2000000-5000000' },
          { label: '5 - 10 ล้านบาท', value: '5000000-10000000' },
          { label: '10 ล้านบาทขึ้นไป', value: '10000000+' }
        ]
      : [
          { label: 'ไม่เกิน 10,000 บาท/เดือน', value: '0-10000' },
          { label: '10,000 - 20,000 บาท/เดือน', value: '10000-20000' },
          { label: '20,000 - 50,000 บาท/เดือน', value: '20000-50000' },
          { label: '50,000 บาทขึ้นไป', value: '50000+' }
        ];
  }

  priceOptionsWithAll() {
    return [{ label: 'ทุกช่วงราคา', value: '' }, ...this.priceOptions()];
  }

  handleSearch(event: Event): void {
    event.preventDefault();
    const queryParams: Record<string, string> = {};
    if (this.location.trim()) queryParams['location'] = this.location.trim();
    if (this.priceRange) queryParams['priceRange'] = this.priceRange;
    if (this.bedrooms) queryParams['bedrooms'] = this.bedrooms;
    this.router.navigate([this.type() === 'sell' ? '/buy' : '/rent'], { queryParams });
  }
}
