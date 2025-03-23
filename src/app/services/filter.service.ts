import { Injectable, signal } from '@angular/core';

export interface Attribute {
  name: string;
  operator: {
    type: 'string' | 'number';
    operator: string;
    value: (string | number)[];
  };
}

interface Step {
  eventType: string;
  attributes: Attribute[];
}

@Injectable({
  providedIn: 'root',
})
export class FilterStateService {
  private steps = signal<Step[]>([]);

  /**
   * Update the eventType of a step.
   */
  updateStepEvent(stepNumber: number, eventType: string) {
    this.steps.update((steps) => {
      const updatedSteps = [...steps];
      const stepIndex = stepNumber - 1;

      // Initialize the step if it doesn't exist
      if (!updatedSteps[stepIndex]) {
        updatedSteps[stepIndex] = { eventType: '', attributes: [] };
      }

      updatedSteps[stepIndex].eventType = eventType;
      return updatedSteps;
    });
  }

  /**
   * Add or update an attribute condition within a step.
   */
  updateStepAttribute(
    stepNumber: number,
    attributeName: string,
    attributeType: string,
    operatorValue: string,
    values: (string | number)[] = [],
  ) {
    this.steps.update((steps) => {
      const updatedSteps = [...steps];
      const stepIndex = stepNumber - 1;
      const step = updatedSteps[stepIndex];

      if (!step) {
        return updatedSteps; // If no step found, return unchanged.
      }

      const existingIndex = step.attributes.findIndex((c) => c.name === attributeName);

      // Create a new attribute condition for this step
      const updatedAttribute = {
        name: attributeName,
        operator: { type: attributeType, operator: operatorValue, value: values },
      };

      // Update or add the attribute
      if (existingIndex >= 0) {
        step.attributes[existingIndex] = <Attribute>updatedAttribute;
      } else {
        step.attributes.push(<Attribute>updatedAttribute);
      }

      return updatedSteps;
    });
  }

  /**
   * Remove a step by its number.
   */
  removeStep(stepNumber: number) {
    this.steps.update((steps) => {
      return steps.filter((_, index) => index !== stepNumber - 1);
    });
  }

  /**
   * Remove an attribute from a step.
   */
  removeAttribute(stepNumber: number, attributeName: string) {
    this.steps.update((steps) => {
      const updatedSteps = [...steps];
      const stepIndex = stepNumber - 1;
      const step = updatedSteps[stepIndex];

      if (step) {
        step.attributes = step.attributes.filter((c) => c.name !== attributeName);
      }

      return updatedSteps;
    });
  }

  /**
   * Get a specific step by its number.
   */
  getStep(stepNumber: number): Step | null {
    return this.steps()[stepNumber - 1] || null;
  }

  /**
   * Get all steps.
   */
  getAllSteps(): Step[] {
    return this.steps();
  }

  /**
   * Apply filters (just a placeholder for now).
   */
  applyFilters() {
    const filterData = this.getAllSteps();
    console.log('Applying Filters:', filterData);
    return filterData;
  }

  /**
   * Reset all filters (clear all steps).
   */
  resetFilters() {
    this.steps.set([]);
  }
}
