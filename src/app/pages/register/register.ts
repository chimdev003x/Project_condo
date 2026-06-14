import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
  template: `
    <main class="register-page">
      <section class="register-card">
        <div class="heading">
          <p>Register</p>
          <h1>สมัครสมาชิก</h1>
          <span>สร้างบัญชีเพื่อบันทึกประกาศโปรด เลือกแพ็กเกจ และลงประกาศคอนโด</span>
        </div>

        <form (submit)="onSubmit($event)">
          <label class="wide"><span>ชื่อ-นามสกุล</span><input [(ngModel)]="form.fullName" name="fullName" placeholder="ชื่อ นามสกุล" /></label>
          <label><span>อีเมล</span><input [(ngModel)]="form.email" name="email" type="email" placeholder="example@email.com" /></label>
          <label><span>เบอร์โทรศัพท์</span><input [(ngModel)]="form.phone" name="phone" placeholder="08X-XXX-XXXX" /></label>
          <label><span>รหัสผ่าน</span><input [(ngModel)]="password" name="password" type="password" /></label>
          <label><span>ยืนยันรหัสผ่าน</span><input [(ngModel)]="confirmPassword" name="confirmPassword" type="password" /></label>
          <label class="terms"><input [(ngModel)]="acceptTerms" name="acceptTerms" type="checkbox" /><span>ยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว</span></label>
          <div *ngIf="errorMessage" class="alert wide">{{ errorMessage }}</div>
          <app-button type="submit" className="w-full wide">สมัครสมาชิก</app-button>
        </form>
        <small>มีบัญชีแล้ว? <a routerLink="/login">เข้าสู่ระบบ</a></small>
      </section>
    </main>
  `,
  styles: `
    .register-page { background: radial-gradient(circle at top left, rgba(168,230,209,.55), transparent 34%), #f7faf9; min-height: calc(100vh - 80px); padding: 48px 24px 76px; }
    .register-card { background: #fff; border: 1px solid #e6efed; border-radius: 18px; box-shadow: 0 18px 44px rgba(7,59,58,.1); margin: 0 auto; max-width: 860px; padding: 34px; }
    .heading { text-align: center; }
    .heading p { color: #0b6f6f; font-weight: 900; margin: 0 0 8px; }
    h1 { color: #073b3a; font-size: 2.4rem; margin: 0; }
    .heading span, small { color: #64706f; line-height: 1.7; }
    form { display: grid; gap: 18px; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 28px; }
    .wide, .terms { grid-column: 1 / -1; }
    label span { color: #073b3a; display: block; font-weight: 800; margin-bottom: 8px; }
    input:not([type='checkbox']) { border: 1px solid #dfe9e6; border-radius: 10px; height: 46px; outline: none; padding: 0 13px; width: 100%; }
    input:focus { border-color: #0b6f6f; box-shadow: 0 0 0 4px rgba(11,111,111,.12); }
    .terms { align-items: flex-start; display: flex; gap: 10px; }
    .terms span { color: #1f2937; font-weight: 600; margin: 0; }
    .alert { background: #fff1f2; border-radius: 9px; color: #be123c; font-weight: 800; padding: 12px; }
    small { display: block; margin-top: 22px; text-align: center; }
    a { color: #0b6f6f; font-weight: 900; text-decoration: none; }
    @media (max-width: 680px) { .register-page { padding: 24px 18px 56px; } .register-card { padding: 24px; } form { grid-template-columns: 1fr; } }
  `
})
export class RegisterComponent {
  form = { fullName: '', email: '', phone: '', role: 'Owner' as const };
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    this.errorMessage = '';

    if (!this.form.fullName.trim() || !this.form.email.trim() || !this.form.phone.trim() || !this.password || !this.confirmPassword) {
      this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(this.form.email)) {
      this.errorMessage = 'รูปแบบอีเมลไม่ถูกต้อง';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน';
      return;
    }
    if (!this.acceptTerms) {
      this.errorMessage = 'กรุณายอมรับเงื่อนไขก่อนสมัครสมาชิก';
      return;
    }

    this.authService.register(this.form);
    this.router.navigate(['/packages']);
  }
}
