import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SearchableSelectComponent } from '../searchable-select/searchable-select.component';
import { Component, computed, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { EventsService } from '../../services/event.service';
import { Attribute, FilterStateService } from '../../services/filter.service';
import { ButtonComponent } from '../button/button.component';
import { OperatorSelectComponent } from '../operator-select/operator-select.component';

@Component({
  selector: 'app-filter-step',
  standalone: true,
  imports: [
    CommonModule,
    SearchableSelectComponent,
    NgOptimizedImage,
    ButtonComponent,
    OperatorSelectComponent,
  ],
  templateUrl: './filter-step.component.html',
  styleUrl: './filter-step.component.scss',
})
export class FilterStepComponent implements OnInit {
  private eventsService = inject(EventsService);
  private filterStateService = inject(FilterStateService);

  resetTrigger = input(0);
  stepNumber = input<number>(1);
  copyStep = output<void>();
  removeStep = output<void>();
  selectedEventType = signal<string | null>(null);
  attributeRows = signal<string[]>([]);
  newAttributeSelection = signal<string | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showFirstAttributeSelect = false;

  stepLabel = computed(
    () => `${this.stepNumber()}. Step: ${this.selectedEventType() || 'Unnamed step'}`,
  );

  constructor() {
    effect(() => {
      const resetValue = this.resetTrigger();
      if (resetValue > 0) {
        this.resetStep();
      }
    });
  }

  ngOnInit() {
    this.loading.set(this.eventsService.isLoading()());
    this.error.set(this.eventsService.getError()());

    this.eventsService.areEventsLoaded().subscribe((loaded) => loaded && this.loadStepData());
    this.eventsService.fetchEvents().subscribe();
  }

  resetStep() {
    this.selectedEventType.set(null);
    this.attributeRows.set([]);
    this.newAttributeSelection.set(null);
  }

  retryFetch() {
    this.loading.set(true);
    this.error.set(null);
    this.eventsService.fetchEvents().subscribe({
      next: () => this.loading.set(false),
      error: (err) => this.error.set(err.message || 'Failed to load events'),
    });
  }

  handleShowAttributeSelect() {
    this.showFirstAttributeSelect = !this.showFirstAttributeSelect;
  }

  eventTypeOptions = computed(
    () =>
      this.eventsService
        .getEvents()()
        ?.events.map(({ type }) => ({
          value: type,
          label: type,
        })) || [],
  );

  eventAttributeOptions = computed(() => {
    const selectedType = this.selectedEventType();
    const events = this.eventsService.getEvents()()?.events || [];
    const eventType = events.find((event) => event.type === selectedType);

    const allOptions =
      eventType?.properties.map(({ property, type }) => ({
        value: property,
        label: property,
        type: typeof type === 'string' ? 'string' : 'number',
      })) || [];

    // Ensure currently selected attributes are preserved in the options
    const currentSelections = this.attributeRows().map((attribute) => ({
      value: attribute,
      label: attribute,
      type: this.getAttributeType(attribute),
    }));

    const availableOptions = allOptions.filter(
      ({ value }) => !this.attributeRows().includes(value),
    );

    return [...currentSelections, ...availableOptions];
  });

  getSelectedOperator(attributeName: string): string {
    const attribute = this.getStepAttributes(this.stepNumber()).find(
      (attr) => attr.name === attributeName,
    );

    return attribute?.operator?.operator || '';
  }

  getAttributeType(attributeName: string): 'string' | 'number' {
    const selectedType = this.selectedEventType();
    const events = this.eventsService.getEvents()()?.events || [];
    const eventType = events.find((event) => event.type === selectedType);

    const property = eventType?.properties.find((prop) => prop.property === attributeName);
    return property?.type === 'string' || property?.type === 'number' ? property.type : 'string';
  }

  showCopyButton = computed(() => {
    const totalSteps = this.filterStateService.getAllSteps().length;
    return this.stepNumber() === totalSteps;
  });

  showRemoveButton = computed(() => this.stepNumber() > 1);

  loadStepData() {
    const stepData = this.filterStateService.getStep(this.stepNumber());
    if (stepData) {
      this.selectedEventType.set(stepData.eventType);
      this.attributeRows.set(stepData.attributes.map((attr) => attr.name));
    }
  }

  onEventTypeSelected(event: { value: string }) {
    this.selectedEventType.set(event.value);
    this.attributeRows.set([]);
    this.newAttributeSelection.set(null);
    this.filterStateService.updateStepEvent(this.stepNumber(), event.value);
  }

  onOperatorChange(
    attributeName: string,
    operatorData: {
      type: 'string' | 'number';
      operator: string;
      value: (string | number)[];
    },
  ) {
    this.filterStateService.updateStepAttribute(
      this.stepNumber(),
      attributeName,
      operatorData.type,
      operatorData.operator,
      operatorData.value,
    );
  }

  onAttributeChange(
    event: { value: string; label: string; type?: string },
    originalAttributeName: string,
  ) {
    const newAttributeName = event.value;

    if (originalAttributeName !== newAttributeName) {
      // Remove the old attribute first
      this.filterStateService.removeAttribute(this.stepNumber(), originalAttributeName);

      // Update the attributes list
      this.attributeRows.update((rows) => {
        return rows.map((name) => (name === originalAttributeName ? newAttributeName : name));
      });
    }

    // Get attribute type
    const attributeType = event.type || this.getAttributeType(newAttributeName);

    // Add the new attribute
    this.filterStateService.updateStepAttribute(
      this.stepNumber(),
      newAttributeName,
      attributeType,
      attributeType === 'string' ? 'equals' : 'equals',
      [],
    );
  }

  onNewAttributeSelected(event: { value: string; label: string; type?: string }) {
    const attributeName = event.value;

    this.newAttributeSelection.set(attributeName);

    const attributeType = event.type || this.getAttributeType(attributeName);

    this.filterStateService.updateStepAttribute(
      this.stepNumber(),
      attributeName,
      attributeType,
      attributeType === 'string' ? 'equals' : 'equals',
      [],
    );
  }

  addRow() {
    const attributeName = this.newAttributeSelection();
    if (attributeName) {
      // Add to the attribute rows
      this.attributeRows.update((rows) => [...rows, attributeName]);

      // Clear the selection for the new attribute
      this.newAttributeSelection.set(null);
    }
  }

  removeAttributeRow(attributeName: string) {
    this.attributeRows.update((rows) => rows.filter((r) => r !== attributeName));
    this.filterStateService.removeAttribute(this.stepNumber(), attributeName);
  }

  private getStepAttributes(stepNumber: number): Attribute[] {
    const step = this.filterStateService.getStep(stepNumber);
    return step?.attributes || [];
  }
}
