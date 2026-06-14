import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button [type]="href ? 'button' : type" [class]="classes" [disabled]="disabled" (click)="handleClick()">
      <ng-content></ng-content>
    </button>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    button {
      align-items: center;
      border-radius: 8px;
      border: 1px solid transparent;
      cursor: pointer;
      display: inline-flex;
      font-family: inherit;
      font-weight: 800;
      justify-content: center;
      line-height: 1.1;
      min-height: 42px;
      text-decoration: none;
      transition: 0.2s ease;
      white-space: nowrap;
    }
    .btn-sm {
      font-size: 0.86rem;
      min-height: 36px;
      padding: 0 14px;
    }
    .btn-md {
      font-size: 0.95rem;
      padding: 0 20px;
    }
    .btn-lg {
      font-size: 1.05rem;
      min-height: 50px;
      padding: 0 26px;
    }
    .btn-primary {
      background: #0b6f6f;
      color: #fff;
      box-shadow: 0 12px 24px rgba(11, 111, 111, 0.18);
    }
    .btn-primary:hover {
      background: #095d5d;
      box-shadow: 0 18px 34px rgba(11, 111, 111, 0.26);
      transform: translateY(-1px);
    }
    .btn-secondary {
      background: #1faf9c;
      color: #fff;
    }
    .btn-outline {
      background: #fff;
      border-color: #0b6f6f;
      color: #0b6f6f;
    }
    .btn-outline:hover {
      background: rgba(11, 111, 111, 0.08);
      box-shadow: 0 10px 24px rgba(11, 111, 111, 0.12);
      transform: translateY(-1px);
    }
    .btn-ghost {
      background: transparent;
      color: #0b6f6f;
    }
    .full {
      width: 100%;
    }
    button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
      transform: none;
    }
  `
})
export class ButtonComponent {
  @Input() href?: string;
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() className = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;

  constructor(private router: Router) {}

  get classes(): string {
    const fullClass = this.className.includes('w-full') ? 'full' : '';
    return `btn-${this.size} btn-${this.variant} ${fullClass} ${this.className}`;
  }

  handleClick(): void {
    if (this.href && !this.disabled) {
      this.router.navigateByUrl(this.href);
    }
  }
}
