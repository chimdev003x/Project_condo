import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <main class="account-page">
      <section class="profile-card">
        <div class="profile-hero">
          <div class="avatar">{{ authService.user()?.fullName?.charAt(0) }}</div>
          <div>
            <p>My Account</p>
            <h1>{{ authService.user()?.fullName }}</h1>
            <span>{{ authService.user()?.email }}</span>
          </div>
          <app-button variant="outline" (click)="logout()">ออกจากระบบ</app-button>
        </div>

        <div class="stats">
          <div><span>สถานะแพ็กเกจ</span><strong>{{ authService.user()?.packageId || 'ยังไม่ได้เลือก' }}</strong></div>
          <div><span>ประกาศที่ลงแล้ว</span><strong>{{ authService.user()?.listingsCount || 0 }} รายการ</strong></div>
          <div><span>บทบาท</span><strong>{{ authService.user()?.role }}</strong></div>
        </div>

        <div class="actions">
          <app-button href="/packages" variant="outline" className="w-full">เลือกแพ็กเกจ</app-button>
          <app-button href="/post-property" className="w-full">ลงประกาศใหม่</app-button>
          <app-button href="/my-listings" variant="outline" className="w-full">ประกาศของฉัน</app-button>
        </div>
      </section>
    </main>
  `,
  styles: `
    .account-page { background: #f7faf9; padding: 42px 24px 76px; }
    .profile-card { background: #fff; border: 1px solid #e6efed; border-radius: 18px; box-shadow: 0 18px 44px rgba(7,59,58,.1); margin: 0 auto; max-width: 960px; overflow: hidden; }
    .profile-hero { align-items: center; background: linear-gradient(135deg, #073b3a, #0b6f6f); color: #fff; display: flex; gap: 22px; justify-content: space-between; padding: 34px; }
    .avatar { background: rgba(255,255,255,.16); border-radius: 999px; display: grid; flex: 0 0 84px; font-size: 2.4rem; font-weight: 900; height: 84px; place-items: center; width: 84px; }
    .profile-hero p { color: #d8b95a; font-weight: 900; margin: 0 0 6px; }
    h1 { font-size: clamp(1.8rem, 4vw, 3rem); margin: 0; }
    .profile-hero span { color: rgba(255,255,255,.8); }
    .stats { display: grid; gap: 18px; grid-template-columns: repeat(3, 1fr); padding: 28px; }
    .stats div { background: #f7faf9; border-radius: 12px; padding: 22px; }
    .stats span { color: #64706f; display: block; margin-bottom: 8px; }
    .stats strong { color: #073b3a; font-size: 1.3rem; }
    .actions { border-top: 1px solid #e6efed; display: grid; gap: 14px; grid-template-columns: repeat(3, 1fr); padding: 28px; }
    @media (max-width: 760px) { .profile-hero { align-items: flex-start; flex-direction: column; } .stats, .actions { grid-template-columns: 1fr; } }
  `
})
export class AccountComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
