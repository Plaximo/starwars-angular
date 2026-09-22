import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'people/:id',
    loadComponent: () =>
      import('./features/people/components/people-detail/people-detail').then(m => m.PeopleDetail)
  }
];
