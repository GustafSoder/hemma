import { Routes } from '@angular/router';
import { SlComponent } from './pages/sl/sl.component';
import { XtrafikComponent } from './pages/xtrafik/xtrafik.component';

export const routes: Routes = [
  { path: '', redirectTo: 'sl', pathMatch: 'full' },
  { path: 'sl', component: SlComponent },
  { path: 'xtrafik', component: XtrafikComponent },
  { path: '**', redirectTo: 'sl' },
];
