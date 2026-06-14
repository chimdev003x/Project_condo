import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <main class="contact-page">
      <section class="contact-info">
        <p>Contact</p>
        <h1>ติดต่อเรา</h1>
        <span>ทีม Condo Finder พร้อมช่วยเหลือเรื่องประกาศ ซื้อ เช่า และแพ็กเกจสำหรับเจ้าของห้อง</span>
        <div class="info-list">
          <div><strong>โทรศัพท์</strong><span>02-123-4567</span></div>
          <div><strong>อีเมล</strong><span>info&#64;condofinder.com</span></div>
          <div><strong>Line</strong><span>&#64;condofinder</span></div>
        </div>
      </section>

      <section class="contact-form">
        <h2>ส่งข้อความถึงเรา</h2>
        <form (submit)="submit($event)">
          <label><span>ชื่อ-นามสกุล</span><input [(ngModel)]="name" name="name" /></label>
          <label><span>อีเมล</span><input [(ngModel)]="email" name="email" type="email" /></label>
          <label><span>ข้อความ</span><textarea [(ngModel)]="messageText" name="messageText" rows="5"></textarea></label>
          <div *ngIf="message" class="message">{{ message }}</div>
          <app-button type="submit" className="w-full">ส่งข้อความ</app-button>
        </form>
      </section>
    </main>
  `,
  styles: `
    .contact-page { background: #f7faf9; display: grid; gap: 32px; grid-template-columns: .9fr 1.1fr; margin: 0 auto; max-width: 1200px; min-height: calc(100vh - 80px); padding: 52px 24px 76px; }
    .contact-info { background: linear-gradient(135deg, #073b3a, #0b6f6f); border-radius: 18px; color: #fff; padding: 34px; }
    .contact-info > p { color: #d8b95a; font-weight: 900; margin: 0 0 8px; }
    h1, h2 { margin: 0; }
    h1 { font-size: clamp(2.2rem, 5vw, 4rem); }
    .contact-info > span { color: rgba(255,255,255,.84); display: block; line-height: 1.8; margin-top: 16px; }
    .info-list { display: grid; gap: 14px; margin-top: 34px; }
    .info-list div { background: rgba(255,255,255,.12); border-radius: 12px; padding: 18px; }
    .info-list strong, .info-list span { display: block; }
    .info-list span { color: rgba(255,255,255,.82); margin-top: 4px; }
    .contact-form { background: #fff; border: 1px solid #e6efed; border-radius: 18px; box-shadow: 0 18px 44px rgba(7,59,58,.1); padding: 34px; }
    h2 { color: #073b3a; font-size: 2rem; }
    form { display: grid; gap: 18px; margin-top: 24px; }
    label span { color: #073b3a; display: block; font-weight: 800; margin-bottom: 8px; }
    input, textarea { border: 1px solid #dfe9e6; border-radius: 10px; outline: none; padding: 0 13px; width: 100%; }
    input { height: 46px; }
    textarea { padding-top: 12px; resize: vertical; }
    input:focus, textarea:focus { border-color: #0b6f6f; box-shadow: 0 0 0 4px rgba(11,111,111,.12); }
    .message { background: #ecfdf5; border-radius: 10px; color: #047857; font-weight: 800; padding: 12px; }
    @media (max-width: 860px) { .contact-page { grid-template-columns: 1fr; padding: 24px 18px 56px; } }
  `
})
export class ContactComponent {
  name = '';
  email = '';
  messageText = '';
  message = '';

  submit(event: Event): void {
    event.preventDefault();
    this.message = this.name && this.email && this.messageText ? 'ส่งข้อความสำเร็จ ทีมงานจะติดต่อกลับโดยเร็ว' : 'กรุณากรอกข้อมูลให้ครบ';
  }
}
