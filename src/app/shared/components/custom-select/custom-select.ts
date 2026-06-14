import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output, signal } from '@angular/core';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="select-wrap" [class.open-wrap]="isOpen()" (click)="$event.stopPropagation()">
      <button class="select-trigger" type="button" [class.open]="isOpen()" (click)="toggle()">
        <span class="select-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4 7h16M7 12h10M10 17h4" />
          </svg>
        </span>
        <span class="select-label">{{ selectedLabel }}</span>
        <span class="chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      <div *ngIf="isOpen()" class="select-list" role="listbox">
        <button
          *ngFor="let option of options"
          type="button"
          role="option"
          [class.selected]="option.value === value"
          (click)="choose(option.value)"
        >
          <span>{{ option.label }}</span>
          <svg *ngIf="option.value === value" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m5 12 4 4L19 6" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      width: 100%;
    }
    :host(.is-open) {
      z-index: 300;
    }
    .select-wrap {
      position: relative;
      width: 100%;
      z-index: 1;
    }
    .select-wrap.open-wrap {
      z-index: 300;
    }
    .select-trigger {
      align-items: center;
      background: #fff;
      border: 1px solid #dfe9e6;
      border-radius: 10px;
      color: #1f2937;
      cursor: pointer;
      display: grid;
      gap: 10px;
      grid-template-columns: 24px minmax(0, 1fr) 22px;
      height: 48px;
      padding: 0 12px;
      text-align: left;
      width: 100%;
    }
    .select-trigger:hover,
    .select-trigger.open {
      border-color: rgba(11, 111, 111, 0.55);
      box-shadow: 0 0 0 4px rgba(11, 111, 111, 0.1);
    }
    .select-icon {
      background: rgba(11, 111, 111, 0.1);
      border-radius: 8px;
      color: #0b6f6f;
      display: grid;
      height: 24px;
      place-items: center;
      width: 24px;
    }
    svg {
      display: block;
      fill: none;
      height: 17px;
      stroke: currentColor;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-width: 2.3;
      width: 17px;
    }
    .select-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .chevron {
      color: #0b6f6f;
      display: grid;
      justify-items: end;
      transition: transform 0.18s ease;
    }
    .select-trigger.open .chevron {
      transform: rotate(180deg);
    }
    .select-list {
      animation: select-pop 0.16s ease both;
      background: #fff;
      border: 1px solid rgba(11, 111, 111, 0.18);
      border-radius: 12px;
      box-shadow: 0 22px 44px rgba(7, 59, 58, 0.18);
      display: grid;
      gap: 4px;
      left: 0;
      max-height: 260px;
      overflow: auto;
      padding: 8px;
      position: absolute;
      right: 0;
      top: calc(100% + 8px);
      z-index: 320;
    }
    .select-list button {
      align-items: center;
      background: transparent;
      border: 0;
      border-radius: 9px;
      color: #073b3a;
      cursor: pointer;
      display: flex;
      font-weight: 700;
      justify-content: space-between;
      min-height: 40px;
      padding: 8px 10px;
      text-align: left;
      width: 100%;
    }
    .select-list button:hover,
    .select-list button.selected {
      background: rgba(11, 111, 111, 0.1);
      color: #0b6f6f;
    }
    .select-list button.selected {
      font-weight: 900;
    }
    @keyframes select-pop {
      from {
        opacity: 0;
        transform: translateY(-5px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `
})
export class CustomSelectComponent {
  private static openSelect: CustomSelectComponent | null = null;

  @Input() options: SelectOption[] = [];
  @Input() value = '';
  @Input() placeholder = 'เลือก';
  @Output() valueChange = new EventEmitter<string>();

  isOpen = signal(false);

  @HostBinding('class.is-open')
  get hostOpenClass(): boolean {
    return this.isOpen();
  }

  get selectedLabel(): string {
    return this.options.find((option) => option.value === this.value)?.label || this.placeholder;
  }

  toggle(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }

    CustomSelectComponent.openSelect?.close();
    CustomSelectComponent.openSelect = this;
    this.isOpen.set(true);
  }

  choose(value: string): void {
    this.valueChange.emit(value);
    this.close();
  }

  @HostListener('document:click')
  close(): void {
    if (CustomSelectComponent.openSelect === this) {
      CustomSelectComponent.openSelect = null;
    }
    this.isOpen.set(false);
  }
}
