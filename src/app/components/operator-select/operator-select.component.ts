import { CommonModule } from '@angular/common';
import { Component, effect, EventEmitter, input, Output, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OperatorOptionsComponent } from './operator-options.component';

@Component({
  selector: 'app-operator-select',
  imports: [CommonModule, FormsModule, OperatorOptionsComponent],
  templateUrl: './operator-select.component.html',
  styleUrl: './operator-select.component.scss',
})
export class OperatorSelectComponent {
  showTypeSelector = signal(false);

  attributeType = input<'string' | 'number'>('string');
  selectedOperator = input<string | null>(null);

  currentType = signal<'string' | 'number'>('string');
  currentOperator = signal<string | null>(null);
  values = signal<(string | number)[]>([]);

  currentInputValue: string | number | null = null;

  numberOperators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equal', label: 'Not equal' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
  ];

  stringOperators = [
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equal', label: 'Not equal' },
  ];

  toggleTypeSelector(show?: boolean) {
    if (show !== undefined) {
      // If a boolean is provided, use that value
      this.showTypeSelector.set(show);
    } else {
      // If no value provided, toggle current state
      this.showTypeSelector.update((current) => !current);
    }
  }

  selectType(type: 'string' | 'number') {
    this.currentType.set(type);
    // Reset operator when type changes
    this.setDefaultOperator(type);
  }

  @Output() operatorSelected = new EventEmitter<{
    type: 'string' | 'number';
    operator: string;
    value: (string | number)[];
  }>();

  constructor() {
    // Add effect to update the current type when attributeType changes
    effect(() => {
      const type = this.attributeType();
      if (type === 'string' || type === 'number') {
        this.currentType.set(type);
        this.setDefaultOperator(type);
      }
    });

    // Add effect to set operator from input when provided
    effect(() => {
      const operator = this.selectedOperator();

      if (operator) {
        this.currentOperator.set(operator);
      } else {
        // Set default operator if not provided
        this.setDefaultOperator(this.currentType());
      }
    });
  }

  private setDefaultOperator(type: 'string' | 'number') {
    // Set default operator to 'equal' for both types
    const operators = type === 'string' ? this.stringOperators : this.numberOperators;
    const equalOperator = operators.find((op) => op.value === 'equal');

    if (equalOperator) {
      this.currentOperator.set(equalOperator.value);
    } else {
      // Fallback to first operator in the list if 'equal' is not found
      this.currentOperator.set(operators[0]?.value || null);
    }
  }

  onOperatorChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentOperator.set(select.value);
    this.emitOperator();
  }

  onInputChange(value: string) {
    // If the input type is number, convert the value to a number
    const typedValue = this.currentType() === 'number' ? (value ? Number(value) : null) : value;

    // Store the current input value
    this.currentInputValue = typedValue;

    // Update the values and emit on each keystroke
    if (typedValue !== null && typedValue !== '') {
      this.values.update((vals) => {
        const updated = [...vals];
        if (updated.length > 0) {
          updated[updated.length - 1] = typedValue;
        } else {
          updated.push(typedValue);
        }
        return updated;
      });

      this.emitOperator();
    }
  }

  emitOperator() {
    if (this.currentOperator()) {
      this.operatorSelected.emit({
        type: this.currentType(),
        operator: this.currentOperator()!,
        value: this.values(),
      });
    }
  }
}
