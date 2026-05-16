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
import { ResrobotService } from '../../core/service/resrobot.service';
import { ResRobotDeparture } from '../../core/models/resrobot.models';

@Component({
  selector: 'app-xtrafik-departures',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './xtrafik-departures.component.html',
  styleUrl: './xtrafik-departures.component.scss',
})
export class XtrafikDeparturesComponent implements OnDestroy {
  private resrobot = inject(ResrobotService);

  stopId          = input('');
  stationName     = input('Söderhamn');
  filterDirection = input('Hudiksvall');  // partial match on direction field

  departures = signal<ResRobotDeparture[]>([]);
  loading    = signal(false);
  error      = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);

  filtered = computed(() => {
    const dir = this.filterDirection().toLowerCase();
    return this.departures().filter(d =>
      !dir || d.direction.toLowerCase().includes(dir)
    );
  });

  displayed = signal<ResRobotDeparture[]>([]);

  private refreshInterval?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => {
      const id = this.stopId();
      untracked(() => {
        clearInterval(this.refreshInterval);
        if (id) {
          this.load();
          this.refreshInterval = setInterval(() => this.load(), 60_000);
        }
      });
    });

    effect(() => {
      const fresh = this.filtered();
      const current = this.displayed();

      const retained = current.filter(c =>
        fresh.some(f => f.time === c.time && f.date === c.date && f.name === c.name)
      );
      const added = fresh.filter(f =>
        !retained.some(r => r.time === f.time && r.date === f.date && r.name === f.name)
      );
      const next = [...retained, ...added].slice(0, 3);

      const changed =
        next.length !== current.length ||
        next.some((d, i) => d.time !== current[i]?.time || d.name !== current[i]?.name);
      if (changed) untracked(() => this.displayed.set(next));
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
  }

  load(): void {
    const id = this.stopId();
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);

    this.resrobot.getDepartures(id).subscribe({
      next: (res) => {
        this.departures.set(res.Departure ?? []);
        this.lastUpdated.set(new Date());
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Kunde inte hämta avgångar. Kontrollera din API-nyckel.');
        this.loading.set(false);
      },
    });
  }

  minutesUntil(dep: ResRobotDeparture): string {
    const timeStr = dep.rtTime ?? dep.time;
    const dateStr = dep.rtDate ?? dep.date;
    const dt = new Date(`${dateStr}T${timeStr}`);
    const diff = Math.round((dt.getTime() - Date.now()) / 60_000);
    return diff <= 0 ? 'Nu' : `${diff} min`;
  }

  isCancelled(dep: ResRobotDeparture): boolean {
    return dep.cancelled === true;
  }

  isDelayed(dep: ResRobotDeparture): boolean {
    if (!dep.rtTime) return false;
    const scheduled = new Date(`${dep.date}T${dep.time}`);
    const realtime = new Date(`${dep.rtDate ?? dep.date}T${dep.rtTime}`);
    return realtime.getTime() - scheduled.getTime() > 60_000;
  }
}
