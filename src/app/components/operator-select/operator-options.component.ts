import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-operator-options',
  imports: [CommonModule, FormsModule],
  styles: [
    `
      .operator-select-display {
        border: 1px solid #ccc;
        border-radius: 2px;
        padding: 1px 6px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f5f5f5;
        width: 160px;
        font-family: inherit;
        height: 30px;
      }
    `,
  ],
  template: `
    <div class="operator-options" (click)="onComponentClick()">
      @switch (type()) {
        @case ('string') {
          <select
            class="operator-select-display"
            [ngModel]="selectedOperator()"
            (change)="operatorChange.emit($event)"
          >
            @for (op of stringOperators; track op) {
              <option [value]="op.value">{{ op.label }}</option>
            }
          </select>
        }
        @case ('number') {
          <select
            class="operator-select-display"
            [ngModel]="selectedOperator()"
            (change)="operatorChange.emit($event)"
          >
            @for (op of numberOperators; track op) {
              <option [value]="op.value">{{ op.label }}</option>
            }
          </select>
        }
      }
    </div>
  `,
})
export class OperatorOptionsComponent {
  type = input<'string' | 'number'>('string');
  selectedOperator = input<string | null>();

  operatorChange = output<Event>();

  componentClicked = output<void>();

  onComponentClick() {
    this.componentClicked.emit();
  }

  numberOperators = [
    { value: 'equals', label: 'equal to' },
    { value: 'between', label: 'in between' },
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
  ];
  stringOperators = [
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'equals', label: 'equals' },
    { value: 'not_equal', label: 'does not equal' },
  ];
}
