import {
  Component,
  signal,
  OnInit,
  input,
  output,
  model,
  ElementRef,
  ViewChild,
  effect,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';

@Component({
  selector: 'app-searchable-select',
  imports: [CommonModule, FormsModule, NgOptimizedImage, ClickOutsideDirective],
  templateUrl: './searchable-select.component.html',
  styleUrl: './searchable-select.component.scss',
})
export class SearchableSelectComponent implements OnInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  inputLabel = input<string>();
  placeholder = input<string>('Select...');
  options = input.required<Array<{ value: string; label: string }>>();
  selectedValue = model<string | null>(null);

  selectionChange = output<{ value: string; label: string }>();

  searchTerm = '';
  filteredOptions = signal<Array<{ value: string; label: string }>>([]);
  isOpen = signal(false);
  selectedOption = signal<{ value: string; label: string } | null>(null);

  constructor() {
    // Setup an effect to sync selectedOption with the selectedValue input
    effect(() => {
      const value = this.selectedValue();
      if (value && this.options()) {
        const option = this.options().find((opt) => opt.value === value);
        if (option) {
          this.selectedOption.set(option);
        }
      } else {
        this.selectedOption.set(null);
      }
    });
  }

  ngOnInit() {
    // Initialize filteredOptions with all options
    this.resetFilteredOptions();
  }

  resetFilteredOptions() {
    this.filteredOptions.set(this.options() || []);
    this.searchTerm = '';
  }

  filterOptions() {
    this.filteredOptions.set(
      this.options().filter((option) =>
        option.label.toLowerCase().includes(this.searchTerm.toLowerCase()),
      ),
    );
  }

  toggleDropdown() {
    this.isOpen.update((value) => !value);

    if (this.isOpen()) {
      this.resetFilteredOptions();

      // Focus the search input after the dropdown is opened
      setTimeout(() => {
        if (this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      });
    }
  }

  selectOption(option: { value: string; label: string }) {
    this.selectedValue.set(option.value);
    this.selectedOption.set(option);
    this.selectionChange.emit(option);
    this.isOpen.set(false);
  }
}
