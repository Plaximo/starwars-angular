import { Component } from '@angular/core';
import { PeopleList } from '../people/pages/people-list/people-list';

@Component({
  imports: [PeopleList],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {}
