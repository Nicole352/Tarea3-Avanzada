import { Routes } from '@angular/router';
import { FormComponent } from './form/form.component';

export const routes: Routes = [
  {path: 'form', component:FormComponent, pathMatch:'full'// redirectTo: 'fromualrio
  },
  { path: '', redirectTo: '/form', pathMatch: 'full' }
];
