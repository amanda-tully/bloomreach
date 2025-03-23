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
  `,
})
export class OperatorOptionsComponent {
  type = input<'string' | 'number'>('string');
  selectedOperator = input<string | null>();

  operatorChange = output<Event>();

  numberOperators = [
    { value: 'equal', label: 'Equal' },
    { value: 'not_equal', label: 'Not equal' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
  ];
  stringOperators = [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not contains' },
    { value: 'equal', label: 'Equal' },
    { value: 'not_equal', label: 'Not equal' },
  ];
}
