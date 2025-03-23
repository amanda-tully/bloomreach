import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'button[app-button]',
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  host: {
    class: 'custom-button',
    '[class.primary]': 'appearance === "primary"',
    '[class.link]': 'appearance === "link"',
    '[class.link-danger]': 'appearance === "link-danger"',
    '[class.normal]': 'size === "normal"',
    '[class.large]': 'size === "large"',
    '[attr.type]': 'type',
    '[disabled]': 'disabled',
  },
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() label = '';
  @Input() appearance: 'primary' | 'link' | 'link-danger' = 'primary';
  @Input() size: 'normal' | 'large' = 'normal';
  @Output() buttonClick = new EventEmitter<MouseEvent>();

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.buttonClick.emit(event);
    }
  }
}
