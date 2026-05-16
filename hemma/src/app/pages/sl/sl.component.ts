import { Component } from '@angular/core';
import { XtrafikDeparturesComponent } from '../../features/xtrafik-departures/xtrafik-departures.component';

@Component({
  selector: 'app-sl',
  standalone: true,
  imports: [XtrafikDeparturesComponent],
  templateUrl: './sl.component.html',
  styleUrl: './sl.component.scss',
})
export class SlComponent {}
