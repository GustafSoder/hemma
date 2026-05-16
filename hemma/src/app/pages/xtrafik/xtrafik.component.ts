import { Component } from '@angular/core';
import { XtrafikDeparturesComponent } from '../../features/xtrafik-departures/xtrafik-departures.component';

@Component({
  selector: 'app-xtrafik',
  standalone: true,
  imports: [XtrafikDeparturesComponent],
  templateUrl: './xtrafik.component.html',
  styleUrl: './xtrafik.component.scss',
})
export class XtrafikComponent {}
