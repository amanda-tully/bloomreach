export interface EventProperty {
  property: string;
  type: 'string' | 'number';
}

export interface EventType {
  type: string;
  properties: EventProperty[];
}
