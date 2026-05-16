import {
  Component,
  inject,
  signal,
  computed,
  effect,
  OnInit,
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
export class DeparturesComponent implements OnInit, OnDestroy {
  private slTransport = inject(SlTransportService);

  private readonly SITE_ID = 9192; // Karlaplan

  departures = signal<Departure[]>([]);
  deviations = signal<StopDeviation[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);

  tcentralen = computed(() =>
    this.departures().filter(
      (d) =>
        d.line.transport_mode === 'METRO' &&
        d.line.designation === '13' &&
        d.destination === 'Norsborg',
    ),
  );

  // Up to 3 trains shown at a time. Updated by the effect below.
  displayed = signal<Departure[]>([]);

  constructor() {
    effect(() => {
      const fresh = this.tcentralen();
      const current = this.displayed();

      // Keep trains still present in fresh data (not yet departed)
      const retained = current.filter(c =>
        fresh.some(f => f.journey.id === c.journey.id)
      );
      // Fill remaining slots with new trains not already shown
      const added = fresh.filter(f =>
        !retained.some(r => r.journey.id === f.journey.id)
      );
      const next = [...retained, ...added].slice(0, 3);

      // Only write signal if trains actually changed — keeps animation alive
      const changed =
        next.length !== current.length ||
        next.some((d, i) => d.journey.id !== current[i]?.journey.id);
      if (changed) this.displayed.set(next);
    });
  }

  private refreshInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.load();
    this.refreshInterval = setInterval(() => this.load(), 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.slTransport.getDepartures(this.SITE_ID).subscribe({
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
