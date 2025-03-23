import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventType } from '../models/event.model';
import { catchError, tap, finalize, BehaviorSubject } from 'rxjs';
import { of } from 'rxjs';

interface EventsResponse {
  events: EventType[];
}

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private eventsSignal = signal<EventsResponse>({ events: [] });
  private errorSignal = signal<string | null>(null);
  private loading = signal(false);
  private eventsLoaded = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  fetchEvents() {
    this.loading.set(true);

    return this.http
      .get<EventsResponse>('https://br-fe-assignment.github.io/customer-events/events.json')
      .pipe(
        tap((response) => {
          // Store the entire response object
          this.eventsSignal.set(response);
          this.eventsLoaded.next(true);
        }),
        catchError((error) => {
          this.errorSignal.set('Failed to fetch events');
          return of({ events: [] });
        }),
        finalize(() => {
          this.loading.set(false);
        }),
      );
  }

  getEvents() {
    return this.eventsSignal.asReadonly();
  }

  getError() {
    return this.errorSignal.asReadonly();
  }

  isLoading() {
    return this.loading.asReadonly();
  }

  areEventsLoaded() {
    return this.eventsLoaded.asObservable();
  }
}
