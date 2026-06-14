import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-post-property',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <main class="post-page">
      <section class="post-card">
        <div class="heading">
          <p>Post Property</p>
          <h1>ลงประกาศคอนโด</h1>
          <span>กรอกข้อมูลให้ครบเพื่อสร้างประกาศขายหรือให้เช่าคอนโด</span>
        </div>

        <form (submit)="onSubmit($event)">
          <label class="wide"><span>ประเภทประกาศ</span><select [(ngModel)]="form.type" name="type"><option value="sell">ขายคอนโด</option><option value="rent">เช่าคอนโด</option></select></label>
          <label><span>ชื่อโครงการ</span><input [(ngModel)]="form.projectName" name="projectName" /></label>
          <label><span>ทำเล</span><input [(ngModel)]="form.location" name="location" /></label>
          <label><span>ราคา</span><input [(ngModel)]="form.price" name="price" type="number" /></label>
          <label><span>พื้นที่ใช้สอย (ตร.ม.)</span><input [(ngModel)]="form.area" name="area" type="number" /></label>
          <label><span>ห้องนอน</span><input [(ngModel)]="form.bedrooms" name="bedrooms" type="number" /></label>
          <label><span>ห้องน้ำ</span><input [(ngModel)]="form.bathrooms" name="bathrooms" type="number" /></label>
          <label class="wide"><span>รายละเอียด</span><textarea [(ngModel)]="form.description" name="description" rows="4"></textarea></label>
          <label><span>ลิงก์รูปภาพอย่างน้อย 1 รูป</span><input [(ngModel)]="form.image" name="image" placeholder="https://..." /></label>
          <label><span>เบอร์ติดต่อ</span><input [(ngModel)]="form.phone" name="phone" /></label>
          <div *ngIf="message" class="message wide" [class.error]="messageType === 'error'">{{ message }}</div>
          <app-button type="submit" className="w-full wide">ลงประกาศทันที</app-button>
        </form>
      </section>
    </main>
  `,
  styles: `
    .post-page { background: radial-gradient(circle at top right, rgba(168,230,209,.5), transparent 32%), #f7faf9; padding: 44px 24px 76px; }
    .post-card { background: #fff; border: 1px solid #e6efed; border-radius: 18px; box-shadow: 0 18px 44px rgba(7,59,58,.1); margin: 0 auto; max-width: 920px; padding: 34px; }
    .heading { margin-bottom: 28px; }
    .heading p { color: #0b6f6f; font-weight: 900; margin: 0 0 8px; }
    h1 { color: #073b3a; font-size: clamp(2rem, 4vw, 3rem); margin: 0; }
    .heading span { color: #64706f; display: block; margin-top: 10px; }
    form { display: grid; gap: 18px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .wide { grid-column: 1 / -1; }
    label span { color: #073b3a; display: block; font-weight: 800; margin-bottom: 8px; }
    input, select, textarea { border: 1px solid #dfe9e6; border-radius: 10px; outline: none; padding: 0 13px; width: 100%; }
    input, select { height: 46px; }
    textarea { padding-top: 12px; resize: vertical; }
    input:focus, select:focus, textarea:focus { border-color: #0b6f6f; box-shadow: 0 0 0 4px rgba(11,111,111,.12); }
    .message { background: #ecfdf5; border-radius: 10px; color: #047857; font-weight: 800; padding: 12px; }
    .message.error { background: #fff1f2; color: #be123c; }
    @media (max-width: 680px) { .post-page { padding: 24px 18px 56px; } .post-card { padding: 24px; } form { grid-template-columns: 1fr; } }
  `
})
export class PostPropertyComponent {
  form = {
    type: 'sell',
    projectName: '',
    location: '',
    price: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    image: '',
    phone: ''
  };
  message = '';
  messageType: 'error' | 'success' = 'error';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(event: Event): void {
    event.preventDefault();
    const requiredFields = Object.values(this.form).every((value) => value.toString().trim().length > 0);
    if (!requiredFields) {
      this.messageType = 'error';
      this.message = 'กรุณากรอกข้อมูลประกาศให้ครบถ้วน';
      return;
    }
    this.authService.incrementListingsCount();
    this.messageType = 'success';
    this.message = 'ลงประกาศสำเร็จ ระบบบันทึกข้อมูลตัวอย่างแล้ว';
    setTimeout(() => this.router.navigate(['/my-listings']), 600);
  }
}
