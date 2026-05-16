import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeparturesComponent } from '../../features/departures/departures.component';
import { SlTransportService } from '../../core/service/sl-transport.service';

@Component({
  selector: 'app-sl',
  standalone: true,
  imports: [FormsModule, DeparturesComponent],
  templateUrl: './sl.component.html',
  styleUrl: './sl.component.scss',
})
export class SlComponent {
  private slService = inject(SlTransportService);

  // Form fields
  fromInput = '';
  toInput = '';

  // Resolved values passed to the departures ticker
  siteId        = signal(9192);
  stationName   = signal('Karlaplan');
  filterDest    = signal('Norsborg');

  searching = signal(false);
  searchError = signal<string | null>(null);

  search(): void {
    if (!this.fromInput.trim()) return;
    this.searching.set(true);
    this.searchError.set(null);

    this.slService.findSite(this.fromInput.trim()).subscribe({
      next: (sites: any[]) => {
        const match = sites?.[0];
        if (!match) {
          this.searchError.set(`Ingen hållplats hittades för "${this.fromInput}".`);
        } else {
          this.siteId.set(match.id);
          this.stationName.set(match.name);
          this.filterDest.set(this.toInput.trim() || '');
        }
        this.searching.set(false);
      },
      error: () => {
        this.searchError.set('Kunde inte söka hållplats. Kontrollera din nätverksanslutning.');
        this.searching.set(false);
      },
    });
  }
}
