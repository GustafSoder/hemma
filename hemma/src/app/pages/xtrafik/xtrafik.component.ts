import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { XtrafikDeparturesComponent } from '../../features/xtrafik-departures/xtrafik-departures.component';
import { ResrobotService } from '../../core/service/resrobot.service';

@Component({
  selector: 'app-xtrafik',
  standalone: true,
  imports: [FormsModule, XtrafikDeparturesComponent],
  templateUrl: './xtrafik.component.html',
  styleUrl: './xtrafik.component.scss',
})
export class XtrafikComponent {
  private resrobot = inject(ResrobotService);

  fromInput = 'Söderhamn';
  toInput   = 'Hudiksvall';

  stopId       = signal('');
  stationName  = signal('');
  filterDir    = signal('Hudiksvall');

  searching  = signal(false);
  searchError = signal<string | null>(null);

  search(): void {
    if (!this.fromInput.trim()) return;
    this.searching.set(true);
    this.searchError.set(null);

    this.resrobot.findStop(this.fromInput.trim()).subscribe({
      next: (res) => {
        const locations = res.stopLocationOrCoordLocation ?? [];
        const match = locations.find(l => l.StopLocation)?.StopLocation;
        if (!match) {
          this.searchError.set(`Ingen hållplats hittades för "${this.fromInput}".`);
        } else {
          this.stopId.set(match.id);
          this.stationName.set(match.name);
          this.filterDir.set(this.toInput.trim() || '');
        }
        this.searching.set(false);
      },
      error: () => {
        this.searchError.set('Kunde inte söka hållplats. Kontrollera din ResRobot API-nyckel i environments/enironment.ts.');
        this.searching.set(false);
      },
    });
  }
}
