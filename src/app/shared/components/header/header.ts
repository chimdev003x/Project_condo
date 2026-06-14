import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  template: `
    <header class="site-header">
      <div class="header-inner">
        <a routerLink="/" class="brand" aria-label="Condo Finder" (click)="closeMenu()">
          <span class="brand-mark">CF</span>
          <span>
            <strong>Condo Finder</strong>
            <small>ชี้เป้าคอนโดเด็ด</small>
          </span>
        </a>

        <nav class="desktop-nav" aria-label="เมนูหลัก">
          <a
            *ngFor="let item of menuItems"
            [routerLink]="item.path"
            routerLinkActive="active"
            [routerLinkActiveOptions]="item.exact ? { exact: true } : { exact: false }"
          >
            <span class="nav-icon" aria-hidden="true">{{ item.icon }}</span>
            {{ item.label }}
          </a>
          <a *ngIf="isLoggedIn()" routerLink="/post-property" routerLinkActive="active">
            <span class="nav-icon" aria-hidden="true">+</span>
            ลงประกาศ
          </a>
        </nav>

        <div class="desktop-actions">
          <ng-container *ngIf="isLoggedIn(); else guestActions">
            <a routerLink="/my-listings">ประกาศของฉัน</a>
            <a routerLink="/account">บัญชี</a>
            <app-button variant="outline" size="sm" (click)="logout()">ออกจากระบบ</app-button>
          </ng-container>
          <ng-template #guestActions>
            <a routerLink="/login">Login</a>
            <app-button href="/register" size="sm">Register</app-button>
          </ng-template>
        </div>

        <button
          class="menu-button"
          type="button"
          [class.open]="isMenuOpen()"
          (click)="toggleMenu()"
          aria-label="เปิดเมนู"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div *ngIf="isMenuOpen()" class="mobile-panel">
        <a *ngFor="let item of menuItems" [routerLink]="item.path" (click)="closeMenu()">
          <span class="mobile-icon" aria-hidden="true">{{ item.icon }}</span>
          {{ item.label }}
        </a>
        <a *ngIf="isLoggedIn()" routerLink="/post-property" (click)="closeMenu()">
          <span class="mobile-icon" aria-hidden="true">+</span>
          ลงประกาศ
        </a>
        <hr />
        <ng-container *ngIf="isLoggedIn(); else guestMobile">
          <a routerLink="/my-listings" (click)="closeMenu()">ประกาศของฉัน</a>
          <a routerLink="/account" (click)="closeMenu()">บัญชี</a>
          <button type="button" (click)="logout()">ออกจากระบบ</button>
        </ng-container>
        <ng-template #guestMobile>
          <a routerLink="/login" (click)="closeMenu()">Login</a>
          <a routerLink="/register" (click)="closeMenu()">Register</a>
        </ng-template>
      </div>
    </header>
  `,
  styles: `
    .site-header {
      background: rgba(255, 255, 255, 0.96);
      border-bottom: 1px solid #e6efed;
      box-shadow: 0 6px 18px rgba(7, 59, 58, 0.06);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .header-inner {
      align-items: center;
      display: flex;
      gap: 24px;
      justify-content: space-between;
      margin: 0 auto;
      max-width: 1200px;
      padding: 14px 24px;
      position: relative;
    }
    .brand {
      align-items: center;
      color: #073b3a;
      display: inline-flex;
      flex: 0 0 auto;
      gap: 12px;
      min-width: 190px;
      text-decoration: none;
    }
    .brand-mark {
      background: #0b6f6f;
      border-radius: 10px;
      box-shadow: 0 12px 22px rgba(11, 111, 111, 0.22);
      color: #fff;
      display: grid;
      font-weight: 900;
      height: 46px;
      place-items: center;
      width: 46px;
    }
    .brand strong,
    .brand small {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .brand strong {
      font-size: 1.15rem;
      line-height: 1.1;
    }
    .brand small {
      color: #0b6f6f;
      font-size: 0.78rem;
      font-weight: 700;
      margin-top: 3px;
    }
    .desktop-nav {
      align-items: center;
      display: flex;
      flex: 1;
      gap: 8px;
      justify-content: center;
    }
    .desktop-nav a,
    .desktop-actions a {
      color: #1f2937;
      font-size: 0.92rem;
      font-weight: 800;
      text-decoration: none;
    }
    .desktop-nav a {
      align-items: center;
      border-radius: 999px;
      display: inline-flex;
      gap: 7px;
      padding: 8px 10px;
      white-space: nowrap;
    }
    .desktop-nav a:hover,
    .desktop-nav a.active,
    .desktop-actions a:hover {
      color: #0b6f6f;
    }
    .desktop-nav a:hover,
    .desktop-nav a.active {
      background: rgba(11, 111, 111, 0.08);
    }
    .nav-icon,
    .mobile-icon {
      align-items: center;
      background: rgba(11, 111, 111, 0.1);
      border-radius: 8px;
      color: #0b6f6f;
      display: inline-flex;
      font-size: 0.74rem;
      font-weight: 900;
      height: 22px;
      justify-content: center;
      min-width: 22px;
    }
    .desktop-actions {
      align-items: center;
      display: flex;
      flex: 0 0 auto;
      gap: 14px;
    }
    .menu-button {
      align-items: center;
      background: #fff;
      border: 1px solid #dfe9e6;
      border-radius: 10px;
      color: #073b3a;
      cursor: pointer;
      display: inline-flex;
      flex-direction: column;
      gap: 4px;
      height: 44px;
      justify-content: center;
      width: 44px;
    }
    .menu-button span {
      background: #073b3a;
      border-radius: 999px;
      display: block;
      height: 2px;
      transition: transform 0.18s ease, opacity 0.18s ease;
      width: 18px;
    }
    .menu-button.open span:nth-child(1) {
      transform: translateY(6px) rotate(45deg);
    }
    .menu-button.open span:nth-child(2) {
      opacity: 0;
    }
    .menu-button.open span:nth-child(3) {
      transform: translateY(-6px) rotate(-45deg);
    }
    .mobile-panel {
      animation: menu-pop 0.18s ease both;
      background: #fff;
      border: 1px solid rgba(11, 111, 111, 0.14);
      border-radius: 14px;
      box-shadow: 0 22px 46px rgba(7, 59, 58, 0.18);
      display: grid;
      gap: 6px;
      max-height: calc(100vh - 92px);
      overflow: auto;
      padding: 10px;
      position: absolute;
      right: max(18px, calc((100vw - 1200px) / 2 + 24px));
      top: 72px;
      width: min(330px, calc(100vw - 36px));
      z-index: 70;
    }
    .mobile-panel a,
    .mobile-panel button {
      align-items: center;
      background: transparent;
      border: 0;
      border-radius: 10px;
      color: #073b3a;
      cursor: pointer;
      display: flex;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 800;
      gap: 10px;
      min-height: 44px;
      padding: 10px 12px;
      text-align: left;
      text-decoration: none;
    }
    .mobile-panel a:hover,
    .mobile-panel button:hover {
      background: rgba(11, 111, 111, 0.08);
      color: #0b6f6f;
    }
    .mobile-panel hr {
      border: 0;
      border-top: 1px solid #e6efed;
      margin: 6px 0;
    }
    @keyframes menu-pop {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    @media (min-width: 1051px) {
      .menu-button {
        display: none;
      }
    }
    @media (max-width: 1120px) {
      .desktop-nav {
        gap: 2px;
      }
      .desktop-nav a {
        padding-inline: 8px;
      }
      .nav-icon {
        display: none;
      }
    }
    @media (max-width: 1050px) {
      .desktop-nav,
      .desktop-actions {
        display: none;
      }
      .menu-button {
        position: fixed;
        left: min(calc(100vw - 62px), 328px);
        right: auto;
        top: 14px;
        z-index: 90;
      }
      .header-inner {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 44px;
        padding-inline: 18px;
        width: 100%;
      }
      .brand {
        min-width: 0;
      }
    }
    @media (max-width: 420px) {
      .brand {
        min-width: 0;
      }
      .brand strong {
        font-size: 1rem;
      }
      .brand small {
        font-size: 0.72rem;
      }
      .brand-mark {
        height: 42px;
        width: 42px;
      }
    }
  `
})
export class HeaderComponent {
  isMenuOpen = signal(false);
  menuItems = [
    { label: 'หน้าแรก', path: '/', exact: true, icon: 'H' },
    { label: 'ซื้อคอนโด', path: '/buy', icon: 'B' },
    { label: 'เช่าคอนโด', path: '/rent', icon: 'R' },
    { label: 'โครงการใหม่', path: '/projects', icon: 'N' },
    { label: 'แพ็กเกจ', path: '/packages', icon: 'P' },
    { label: 'บทความ', path: '/blog', icon: 'A' },
    { label: 'ติดต่อเรา', path: '/contact', icon: 'C' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  @HostListener('window:resize')
  handleResize(): void {
    if (window.innerWidth > 1050) {
      this.closeMenu();
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleMenu(): void {
    this.isMenuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
