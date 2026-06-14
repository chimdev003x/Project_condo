import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
  template: `
    <main class="auth-page">
      <section class="auth-visual">
        <p>Condo Finder</p>
        <h1>กลับมาจัดการประกาศของคุณ</h1>
        <span>เลือกแพ็กเกจ ลงประกาศ และติดตามรายการคอนโดได้ในที่เดียว</span>
      </section>

      <section class="auth-card">
        <h2>เข้าสู่ระบบ</h2>
        <p>กรอกอีเมลและรหัสผ่านเพื่อใช้งานบัญชีของคุณ</p>
        <form (submit)="onSubmit($event)">
          <label>
            <span>อีเมล</span>
            <input [(ngModel)]="email" name="email" type="email" placeholder="example@email.com" />
          </label>
          <label>
            <span>รหัสผ่าน</span>
            <input [(ngModel)]="password" name="password" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" />
          </label>
          <div *ngIf="errorMessage" class="alert">{{ errorMessage }}</div>
          <app-button type="submit" className="w-full">เข้าสู่ระบบ</app-button>
        </form>
        <small>ยังไม่มีบัญชี? <a routerLink="/register">สมัครสมาชิก</a></small>
      </section>
    </main>
  `,
  styles: `
    .auth-page { background: #f7faf9; display: grid; grid-template-columns: 1fr 480px; min-height: calc(100vh - 80px); }
    .auth-visual { background: linear-gradient(135deg, rgba(7,59,58,.9), rgba(11,111,111,.64)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80') center/cover; color: #fff; display: flex; flex-direction: column; justify-content: center; padding: 64px; }
    .auth-visual p { color: #d8b95a; font-weight: 900; margin: 0 0 12px; }
    .auth-visual h1 { font-size: clamp(2.4rem, 5vw, 4.5rem); line-height: 1.1; margin: 0; max-width: 720px; }
    .auth-visual span { color: rgba(255,255,255,.86); display: block; font-size: 1.1rem; line-height: 1.8; margin-top: 20px; max-width: 620px; }
    .auth-card { align-self: center; background: #fff; border: 1px solid #e6efed; border-radius: 18px; box-shadow: 0 18px 44px rgba(7,59,58,.1); margin: 40px; padding: 34px; }
    h2 { color: #073b3a; font-size: 2rem; margin: 0; }
    .auth-card p, small { color: #64706f; line-height: 1.7; }
    form { display: grid; gap: 18px; margin-top: 26px; }
    label span { color: #073b3a; display: block; font-weight: 800; margin-bottom: 8px; }
    input { border: 1px solid #dfe9e6; border-radius: 10px; height: 46px; outline: none; padding: 0 13px; width: 100%; }
    input:focus { border-color: #0b6f6f; box-shadow: 0 0 0 4px rgba(11,111,111,.12); }
    .alert { background: #fff1f2; border-radius: 9px; color: #be123c; font-weight: 800; padding: 12px; }
    small { display: block; margin-top: 22px; text-align: center; }
    a { color: #0b6f6f; font-weight: 900; text-decoration: none; }
    @media (max-width: 900px) { .auth-page { grid-template-columns: 1fr; } .auth-visual { min-height: 300px; padding: 42px 24px; } .auth-card { margin: 24px; } }
  `
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'กรุณากรอกอีเมลและรหัสผ่าน';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(this.email)) {
      this.errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      return;
    }

    this.authService.login(this.email);
    this.router.navigate(['/packages']);
  }
}
