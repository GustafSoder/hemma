import {
  Component,
  inject,
  signal,
  computed,
  effect,
  untracked,
  input,
  OnDestroy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { SlTransportService } from '../../core/service/sl-transport.service';
import { Departure, StopDeviation } from '../../core/models/sl-transport.models';

@Component({
  selector: 'app-departures',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './departures.component.html',
  styleUrl: './departures.component.scss',
})
export class DeparturesComponent implements OnDestroy {
  private slTransport = inject(SlTransportService);

  // Configurable inputs — parent (SL page) drives these from the search form
  siteId          = input(9192);
  stationName     = input('Karlaplan');
  filterDestination = input('Norsborg');   // partial match against departure.destination
  filterLine      = input('13');           // empty string = no line filter

  departures = signal<Departure[]>([]);
  deviations = signal<StopDeviation[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);

  filtered = computed(() => {
    const dest = this.filterDestination().toLowerCase();
    const line = this.filterLine();
    return this.departures().filter(d => {
      if (d.line.transport_mode !== 'METRO') return false;
      if (line && d.line.designation !== line) return false;
      if (dest && !d.destination.toLowerCase().includes(dest)) return false;
      return true;
    });
  });

  // Up to 3 trains shown — updated by rolling queue effect below
  displayed = signal<Departure[]>([]);

  private refreshInterval?: ReturnType<typeof setInterval>;

  constructor() {
    // Reload whenever siteId changes (covers initial load too)
    effect(() => {
      this.siteId(); // track input
      untracked(() => {
        clearInterval(this.refreshInterval);
        this.load();
        this.refreshInterval = setInterval(() => this.load(), 60_000);
      });
    });

    // Rolling queue: retain trains still in fresh data, append new ones, cap at 3
    effect(() => {
      const fresh = this.filtered();
      const current = this.displayed();

      const retained = current.filter(c => fresh.some(f => f.journey.id === c.journey.id));
      const added = fresh.filter(f => !retained.some(r => r.journey.id === f.journey.id));
      const next = [...retained, ...added].slice(0, 3);

      const changed =
        next.length !== current.length ||
        next.some((d, i) => d.journey.id !== current[i]?.journey.id);
      if (changed) untracked(() => this.displayed.set(next));
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.slTransport.getDepartures(this.siteId()).subscribe({
      next: (res) => {
        this.departures.set(res.departures ?? []);
        this.deviations.set(res.stop_deviations ?? []);
        this.lastUpdated.set(new Date());
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Kunde inte hämta avgångar. Försök igen.');
        this.loading.set(false);
      },
    });
  }

  isCancelled(dep: Departure): boolean {
    return dep.state === 'CANCELLED';
  }

  isDelayed(dep: Departure): boolean {
    if (!dep.expected || !dep.scheduled) return false;
    return (
      new Date(dep.expected).getTime() - new Date(dep.scheduled).getTime() >
      60_000
    );
  }
}
