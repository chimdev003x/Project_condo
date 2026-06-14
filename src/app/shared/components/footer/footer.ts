import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="site-footer">
      <div class="footer-grid">
        <div>
          <a routerLink="/" class="footer-brand">
            <span>CF</span>
            <strong>Condo Finder</strong>
          </a>
          <p>ชี้เป้าคอนโดเด็ด รวมประกาศขายและให้เช่าคอนโดคุณภาพ ค้นหาง่าย เปรียบเทียบสะดวก</p>
        </div>

        <div>
          <h4>เมนูหลัก</h4>
          <a *ngFor="let link of primaryLinks" [routerLink]="link.path">{{ link.label }}</a>
        </div>

        <div>
          <h4>สำหรับเจ้าของประกาศ</h4>
          <a routerLink="/packages">เลือกแพ็กเกจ</a>
          <a routerLink="/post-property">ลงประกาศฟรี</a>
          <a routerLink="/my-listings">ประกาศของฉัน</a>
          <a routerLink="/account">บัญชีของฉัน</a>
        </div>

        <div>
          <h4>ติดต่อเรา</h4>
          <p>Email: info&#64;condofinder.com</p>
          <p>Tel: 02-123-4567</p>
          <p>Line: &#64;condofinder</p>
        </div>
      </div>
      <div class="copyright">© {{ currentYear }} Condo Finder. All rights reserved.</div>
    </footer>
  `,
  styles: `
    .site-footer {
      background: #073b3a;
      color: #fff;
      padding: 52px 24px 26px;
    }
    .footer-grid {
      display: grid;
      gap: 34px;
      grid-template-columns: 1.4fr 1fr 1fr 1fr;
      margin: 0 auto;
      max-width: 1200px;
    }
    .footer-brand {
      align-items: center;
      display: inline-flex;
      gap: 12px;
      margin-bottom: 16px;
      text-decoration: none;
    }
    .footer-brand span {
      background: #fff;
      border-radius: 9px;
      color: #0b6f6f;
      display: grid;
      font-weight: 900;
      height: 42px;
      place-items: center;
      width: 42px;
    }
    h4,
    strong {
      margin: 0 0 14px;
    }
    p,
    a {
      color: rgba(255, 255, 255, 0.72);
      display: block;
      line-height: 1.8;
      margin: 0 0 8px;
      text-decoration: none;
    }
    a:hover {
      color: #fff;
    }
    .copyright {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.58);
      margin: 34px auto 0;
      max-width: 1200px;
      padding-top: 20px;
      text-align: center;
    }
    @media (max-width: 900px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 560px) {
      .footer-grid {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  primaryLinks = [
    { label: 'ซื้อคอนโด', path: '/buy' },
    { label: 'เช่าคอนโด', path: '/rent' },
    { label: 'โครงการใหม่', path: '/projects' },
    { label: 'บทความ', path: '/blog' },
    { label: 'ติดต่อเรา', path: '/contact' }
  ];
}
