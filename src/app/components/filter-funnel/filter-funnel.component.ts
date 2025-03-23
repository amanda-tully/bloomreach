import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterStepComponent } from '../filter-step/filter-step.component';
import { FilterStateService } from '../../services/filter.service';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-filter-funnel',
  imports: [CommonModule, FilterStepComponent, ButtonComponent],
  templateUrl: './filter-funnel.component.html',
  styleUrl: './filter-funnel.component.scss',
})
export class FilterFunnelComponent {
  private filterStateService = inject(FilterStateService);

  steps = signal<Array<{ id: number; number: number }>>([{ id: 1, number: 1 }]);
  resetSignal = signal(0);

  addStep(previousStep?: { id: number; number: number }, copy = false) {
    const newStepNumber = previousStep ? previousStep.number + 1 : this.steps().length + 1;
    const newStep = { id: Date.now(), number: newStepNumber };

    this.steps.update((currentSteps) => {
      const updatedSteps = currentSteps.map((step) =>
        step.number >= newStepNumber ? { ...step, number: step.number + 1 } : step,
      );

      // Create a new step in the state if it's a completely new step
      if (!copy) {
        this.filterStateService.updateStepEvent(newStepNumber, '');
      } else {
        // If copying, copy the step data from the previous step
        this.copyStepData(previousStep!.number, newStepNumber);
      }

      return [...updatedSteps, newStep].sort((a, b) => a.number - b.number);
    });
  }

  copyStep(step: { id: number; number: number }) {
    this.addStep(step, true);
  }

  removeStep(stepToRemove: { id: number; number: number }) {
    // Remove the step from the state
    this.filterStateService.removeStep(stepToRemove.number);

    // Synchronize the internal step numbers and UI
    this.steps.update((steps) =>
      steps
        .filter((step) => step.id !== stepToRemove.id)
        .map((step, index) => ({ ...step, number: index + 1 })),
    );
  }

  private copyStepData(fromStep: number, toStep: number) {
    const stepData = this.filterStateService.getStep(fromStep);
    if (!stepData) return;

    this.filterStateService.removeStep(toStep);

    this.filterStateService.updateStepEvent(toStep, stepData.eventType);

    if (stepData.attributes) {
      stepData.attributes.forEach(({ name, operator }) => {
        this.filterStateService.updateStepAttribute(
          toStep,
          name,
          operator.type,
          operator.operator,
          [...operator.value],
        );
      });
    }
  }

  applyFilters() {
    const appliedFilters = this.filterStateService.applyFilters();
    console.log('Filters Applied:', appliedFilters);
    return appliedFilters;
  }

  discardFilters() {
    this.filterStateService.resetFilters();
    this.steps.set([{ id: 1, number: 1 }]);
    this.resetSignal.update((count) => count + 1);

    console.log('Filters discarded, state reset:', this.filterStateService.getAllSteps());
  }
}
