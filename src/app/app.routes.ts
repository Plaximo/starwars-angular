import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
  },
  {
    path: 'planets',
    redirectTo: '/?tab=planets',
    pathMatch: 'full'
  },
  {
    path: 'people/:id',
    loadComponent: () =>
      import('./features/people/pages/people-detail/people-detail').then(m => m.PeopleDetail)
  },
  {
    path: 'people-side-by-side',
    loadComponent: () =>
      import('./features/people/pages/people-side-by-side/people-side-by-side').then(
        m => m.PeopleSideBySide
      )
  },
  {
    path: 'people-side-by-side/:id',
    loadComponent: () =>
      import('./features/people/pages/people-side-by-side/people-side-by-side').then(
        m => m.PeopleSideBySide
      )
  },
  {
    path: '**',
    redirectTo: ''
  }
];
