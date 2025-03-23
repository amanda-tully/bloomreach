import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterFunnelComponent } from './components/filter-funnel/filter-funnel.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FilterFunnelComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'filter-funnel-app';
}
