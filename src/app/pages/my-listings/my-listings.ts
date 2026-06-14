import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Property } from '../../core/models';
import { DataService } from '../../core/services/data.service';
import { ButtonComponent } from '../../shared/components/button/button';
import { PropertyCardComponent } from '../../shared/components/property-card/property-card';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent, ButtonComponent],
  template: `
    <main class="my-page">
      <section class="page-head">
        <div>
          <p>My Listings</p>
          <h1>ประกาศของฉัน</h1>
          <span>ตัวอย่างรายการประกาศที่เชื่อมต่อกับบัญชีผู้ใช้</span>
        </div>
        <app-button href="/post-property">ลงประกาศใหม่</app-button>
      </section>

      <section *ngIf="myListings.length; else emptyState" class="listing-grid">
        <app-property-card *ngFor="let property of myListings" [property]="property"></app-property-card>
      </section>

      <ng-template #emptyState>
        <section class="empty-state">
          <h2>ยังไม่มีประกาศ</h2>
          <p>เลือกแพ็กเกจและลงประกาศแรกของคุณได้ทันที</p>
          <app-button href="/packages">เลือกแพ็กเกจ</app-button>
        </section>
      </ng-template>
    </main>
  `,
  styles: `
    .my-page { background: #f7faf9; min-height: 100vh; padding: 42px 24px 76px; }
    .page-head, .listing-grid, .empty-state { margin: 0 auto; max-width: 1200px; }
    .page-head { align-items: end; display: flex; gap: 20px; justify-content: space-between; margin-bottom: 28px; }
    .page-head p { color: #0b6f6f; font-weight: 900; margin: 0 0 8px; }
    h1, h2 { color: #073b3a; margin: 0; }
    h1 { font-size: clamp(2rem, 4vw, 3.3rem); }
    .page-head span, .empty-state p { color: #64706f; display: block; line-height: 1.7; margin-top: 8px; }
    .listing-grid { display: grid; gap: 24px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .empty-state { background: #fff; border: 1px solid #e6efed; border-radius: 16px; box-shadow: 0 18px 44px rgba(7,59,58,.1); padding: 56px 24px; text-align: center; }
    @media (max-width: 1000px) { .listing-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 620px) { .page-head { align-items: flex-start; flex-direction: column; } .listing-grid { grid-template-columns: 1fr; } }
  `
})
export class MyListingsComponent implements OnInit {
  myListings: Property[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.getPropertiesFromApi({ sort: 'latest' }).subscribe((properties) => {
      this.myListings = properties.slice(0, 2);
    });
  }
}
