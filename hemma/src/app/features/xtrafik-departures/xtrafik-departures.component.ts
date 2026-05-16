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
import { DatePipe, SlicePipe } from '@angular/common';
import { ResrobotService } from '../../core/service/resrobot.service';
import { ResRobotDeparture } from '../../core/models/resrobot.models';

type PredictionStatus = 'ontime' | 'late' | 'cancelled';

@Component({
  selector: 'app-xtrafik-departures',
  standalone: true,
  imports: [DatePipe, SlicePipe],
  templateUrl: './xtrafik-departures.component.html',
  styleUrl: './xtrafik-departures.component.scss',
})
export class XtrafikDeparturesComponent implements OnDestroy {
  private resrobot = inject(ResrobotService);

  stopId          = input('');
  stationName     = input('');
  directionId     = input('');
  filterDirection = input('');  // display label only (e.g. "T-Centralen")
  accentColor     = input('#007dc5');
  duration        = input(60);
  showPrediction  = input(false);

  departures  = signal<ResRobotDeparture[]>([]);
  loading     = signal(false);
  error       = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);

  filtered  = computed(() => this.departures());
  displayed = signal<ResRobotDeparture[]>([]);

  predictionText    = signal<string | null>(null);
  predictionStatus  = signal<PredictionStatus | null>(null);
  predictionLoading = signal(false);

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

    effect(() => {
      const deps = this.displayed();
      const show = this.showPrediction();
      untracked(() => {
        if (show && deps.length > 0) {
          this.fetchPrediction(deps[0]);
        } else if (!show) {
          this.predictionStatus.set(null);
          this.predictionText.set(null);
        }
      });
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

    this.resrobot.getDepartures(id, 20, this.directionId(), this.duration()).subscribe({
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

  private fetchPrediction(dep: ResRobotDeparture): void {
    if (dep.cancelled) {
      this.predictionStatus.set('cancelled');
      this.predictionText.set('Tåget är inställt');
      return;
    }

    const depDelayMins = this.delayMinutes(dep.time, dep.date, dep.rtTime, dep.rtDate);

    this.predictionLoading.set(true);
    this.resrobot.getArrivals(this.stopId(), 10, this.duration()).subscribe({
      next: (res) => {
        const arrivals = res.Arrival ?? [];
        const match = arrivals.find(
          a => a.JourneyDetailRef?.ref === dep.JourneyDetailRef?.ref
        );

        const arrDelayMins = match
          ? this.delayMinutes(match.time, match.date, match.rtTime, match.rtDate)
          : 0;

        const totalDelay = Math.max(depDelayMins, arrDelayMins);
        const hasRtData  = dep.prognosisType === 'PROGNOSED' ||
                           !!dep.rtTime ||
                           (match?.prognosisType === 'PROGNOSED') ||
                           !!match?.rtTime;

        if (!hasRtData) {
          this.predictionStatus.set(null);
          this.predictionText.set(null);
        } else if (totalDelay > 0) {
          this.predictionStatus.set('late');
          this.predictionText.set(`Nästa tåg beräknas vara ca ${totalDelay} min försenat`);
        } else {
          this.predictionStatus.set('ontime');
          this.predictionText.set('Nästa tåg är i tid');
        }
        this.predictionLoading.set(false);
      },
      error: () => {
        // fall back to departure-only data
        if (depDelayMins > 0) {
          this.predictionStatus.set('late');
          this.predictionText.set(`Nästa tåg beräknas vara ca ${depDelayMins} min försenat`);
        } else if (dep.prognosisType === 'PROGNOSED' || dep.rtTime) {
          this.predictionStatus.set('ontime');
          this.predictionText.set('Nästa tåg är i tid');
        } else {
          this.predictionStatus.set(null);
          this.predictionText.set(null);
        }
        this.predictionLoading.set(false);
      },
    });
  }

  private delayMinutes(
    sched: string, schedDate: string,
    rt?: string, rtDate?: string
  ): number {
    if (!rt) return 0;
    const scheduled = new Date(`${schedDate}T${sched}`);
    const realtime  = new Date(`${rtDate ?? schedDate}T${rt}`);
    return Math.max(0, Math.round((realtime.getTime() - scheduled.getTime()) / 60_000));
  }

  minutesUntil(dep: ResRobotDeparture): string {
    const timeStr = dep.rtTime ?? dep.time;
    const dateStr = dep.rtDate ?? dep.date;
    const dt = new Date(`${dateStr}T${timeStr}`);
    const diff = Math.round((dt.getTime() - Date.now()) / 60_000);
    return diff <= 0 ? 'Nu' : `${diff} min`;
  }

  cleanDirection(dir: string): string {
    return dir
      .replace(/\s+T-bana.*/i, '')
      .replace(/\s*\([^)]+kn\)/gi, '')
      .trim();
  }

  isCancelled(dep: ResRobotDeparture): boolean {
    return dep.cancelled === true;
  }

  isDelayed(dep: ResRobotDeparture): boolean {
    if (!dep.rtTime) return false;
    const scheduled = new Date(`${dep.date}T${dep.time}`);
    const realtime  = new Date(`${dep.rtDate ?? dep.date}T${dep.rtTime}`);
    return realtime.getTime() - scheduled.getTime() > 60_000;
  }
}
